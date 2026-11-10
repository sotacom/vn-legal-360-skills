#!/usr/bin/env node
/**
 * VBPL 3-Way Continuous Legal Watch & Compliance Delta Engine
 *
 * Scans a topic dossier across 3 channels:
 * 1. Direct Status & Lược đồ Mutation Scan (detects if any watched law was amended, replaced, or expired)
 * 2. 8-Pillar & Local Province Keyword Radar (using api-anything's native changesOnly + watch state)
 * 3. Upcoming Effective Date Horizon Radar (alerts on laws approaching or crossing their effective date)
 *
 * Usage:
 *   node scripts/vbpl-watch.mjs scan --slug <slug> [--commit-snapshot] [--simulate-change <json>]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { call, shutdown } from "../api-anything/dist/index.js";
import { callVbpl, RELATION_LABELS } from "./vbpl-engine.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const DOSSIERS_DIR = join(ROOT_DIR, "dossiers");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scanDossierChanges(slug, { commitSnapshot = false, simulateChange = null } = {}) {
  const dossierDir = join(DOSSIERS_DIR, slug);
  const profilePath = join(dossierDir, "profile.json");
  const graphPath = join(dossierDir, "legal_graph.json");
  const snapPath = join(dossierDir, "snapshots", "latest.json");

  if (!existsSync(profilePath) || !existsSync(graphPath)) {
    throw new Error(`Missing profile.json or legal_graph.json in ${dossierDir}`);
  }

  const profile = JSON.parse(readFileSync(profilePath, "utf8"));
  const currentGraph = JSON.parse(readFileSync(graphPath, "utf8"));
  const baseline = existsSync(snapPath) ? JSON.parse(readFileSync(snapPath, "utf8")) : currentGraph;

  const statusChanges = [];
  const diagramAdditions = [];
  const keywordNewDocs = [];
  const upcomingEffectiveAlerts = [];

  // Channel 1: Direct Status & Lược đồ Re-Verification on Core Watched Documents
  // Check core documents (seedNumbers or priority documents) live against vbpl.vn
  const allDocs = Object.values(currentGraph.documents || {});
  const coreDocs = allDocs.filter(
    (d) =>
      (d.discoveryReason || "").includes("seedNumber") ||
      (d.discoveryReason || "").includes("local:") ||
      d.hierarchyRank <= 6
  );

  for (const doc of coreDocs.slice(0, 20)) {
    const baseDoc = baseline.documents?.[doc.id] || doc;
    const [attrRes, diagRes] = await Promise.all([
      callVbpl("getDocumentAttributes", { documentId: doc.id }),
      callVbpl("getDocumentDiagram", { documentId: doc.id })
    ]);

    if (attrRes.ok && attrRes.data) {
      const liveStatus = attrRes.data.effStatus;
      const liveStatusCode = attrRes.data.effStatusCode;
      if (liveStatusCode && baseDoc.effStatusCode && liveStatusCode !== baseDoc.effStatusCode) {
        statusChanges.push({
          documentId: doc.id,
          docNum: doc.docNum,
          title: doc.title,
          previousStatus: baseDoc.effStatus,
          previousStatusCode: baseDoc.effStatusCode,
          currentStatus: liveStatus,
          currentStatusCode: liveStatusCode,
          pillars: doc.pillars
        });
      }
    }

    if (diagRes.ok && diagRes.data?.documentNamesBySource) {
      for (const [relCode, items] of Object.entries(diagRes.data.documentNamesBySource)) {
        if (!["1", "7", "8", "9", "10", "11", "12", "13", "16"].includes(relCode)) continue;
        const oldIds = new Set(
          (baseDoc.incomingRelations?.[relCode]?.items || []).map((x) => String(x.id))
        );
        for (const item of items || []) {
          if (!oldIds.has(String(item.id))) {
            diagramAdditions.push({
              targetDocumentId: doc.id,
              targetDocNum: doc.docNum,
              targetTitle: doc.title,
              relationCode: relCode,
              relationLabel: RELATION_LABELS[relCode] || `Quan hệ ${relCode}`,
              newDocumentId: String(item.id),
              newDocumentTitle: item.name,
              newDocumentUrl: `https://vbpl.vn/van-ban/chi-tiet/${item.id}`,
              pillars: doc.pillars
            });
          }
        }
      }
    }
  }

  // Channel 2: Keyword & Local Provincial Radar using api-anything changesOnly
  for (const [pillarCode, pillarCfg] of Object.entries(profile.pillars || {})) {
    for (const kw of (pillarCfg.keywords || []).slice(0, 2)) {
      const watchKey = `${slug}-${pillarCode}-${kw}`.replace(/[^\w.-]+/g, "_").slice(0, 60);
      const res = await call(
        "vbpl",
        "searchDocuments",
        { keyword: kw, optionDoc: "title", matchMode: "exact_phrase", pageNumber: 1, pageSize: 10 },
        { maxTier: 1, changesOnly: true, watch: watchKey }
      );
      await sleep(180);
      if (res.ok && res.changes && !res.changes.first && Array.isArray(res.changes.added)) {
        for (const added of res.changes.added) {
          if (!currentGraph.documents?.[added.id]) {
            keywordNewDocs.push({
              pillar: pillarCode,
              keyword: kw,
              scope: "TW",
              document: added,
              url: `https://vbpl.vn/van-ban/chi-tiet/${added.id}`
            });
          }
        }
      }
    }

    const provinceIds = pillarCfg.provinceIds || profile.provinceIds || [];
    for (const provId of provinceIds) {
      for (const kw of pillarCfg.localKeywords || []) {
        const watchKey = `${slug}-local-${provId}-${kw}`.replace(/[^\w.-]+/g, "_").slice(0, 60);
        const res = await call(
          "vbpl",
          "searchLocalDocuments",
          {
            keyword: kw,
            administrativeUnit: provId,
            optionDoc: "title",
            matchMode: "exact_phrase",
            pageNumber: 1,
            pageSize: 10
          },
          { maxTier: 1, changesOnly: true, watch: watchKey }
        );
        await sleep(180);
        if (res.ok && res.changes && !res.changes.first && Array.isArray(res.changes.added)) {
          for (const added of res.changes.added) {
            if (!currentGraph.documents?.[added.id]) {
              keywordNewDocs.push({
                pillar: pillarCode,
                keyword: kw,
                scope: `DP:${provId}`,
                document: added,
                url: `https://vbpl.vn/van-ban/chi-tiet/${added.id}`
              });
            }
          }
        }
      }
    }
  }

  // Channel 3: Upcoming Effective Date Horizon Radar (CCHL or effFrom within recent/upcoming 90 days)
  const now = new Date();
  for (const doc of allDocs) {
    if (doc.effStatusCode === "CCHL") {
      upcomingEffectiveAlerts.push({
        documentId: doc.id,
        docNum: doc.docNum,
        title: doc.title,
        effFrom: doc.effFrom,
        effStatus: doc.effStatus,
        pillars: doc.pillars,
        note: "Văn bản đang ở trạng thái 'Chưa có hiệu lực' — cần chuẩn bị tuân thủ trước ngày có hiệu lực."
      });
    } else if (doc.effFrom) {
      const effDate = new Date(doc.effFrom);
      const diffDays = Math.round((effDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= -30 && diffDays <= 90) {
        upcomingEffectiveAlerts.push({
          documentId: doc.id,
          docNum: doc.docNum,
          title: doc.title,
          effFrom: doc.effFrom,
          diffDays,
          effStatus: doc.effStatus,
          pillars: doc.pillars,
          note:
            diffDays > 0
              ? `Sắp có hiệu lực sau ${diffDays} ngày (${doc.effFrom.slice(0, 10)})`
              : `Vừa mới có hiệu lực cách đây ${Math.abs(diffDays)} ngày (${doc.effFrom.slice(0, 10)})`
        });
      }
    }
  }

  // Optional simulation hook for testing Watch & Delta workflows
  if (simulateChange) {
    const sim = JSON.parse(simulateChange);
    if (sim.statusChange) statusChanges.push(sim.statusChange);
    if (sim.diagramAddition) diagramAdditions.push(sim.diagramAddition);
    if (sim.keywordNewDoc) keywordNewDocs.push(sim.keywordNewDoc);
  }

  const hasMaterialChanges =
    statusChanges.length > 0 || diagramAdditions.length > 0 || keywordNewDocs.length > 0;

  const deltaReport = {
    slug,
    title: profile.title,
    scannedAt: new Date().toISOString(),
    baselineTimestamp: baseline.generatedAt || null,
    hasMaterialChanges,
    summaryCounts: {
      statusChanges: statusChanges.length,
      diagramAdditions: diagramAdditions.length,
      keywordNewDocs: keywordNewDocs.length,
      upcomingEffectiveAlerts: upcomingEffectiveAlerts.length
    },
    channels: {
      statusChanges,
      diagramAdditions,
      keywordNewDocs,
      upcomingEffectiveAlerts
    },
    complianceActionFramework: {
      instructions:
        "Khi hasMaterialChanges = true, Agent phải đọc toàn văn (getDocumentFullText) các văn bản mới/sửa đổi và phân loại khuyến nghị theo 4 nhóm:",
      categories: [
        "1. [LÀM THÊM / SIẾT CHẶT (ADD)]: Nghĩa vụ, giấy phép, tiêu chuẩn kỹ thuật, biểu mẫu báo cáo mới phát sinh.",
        "2. [BỚT ĐƯỢC / ĐƠN GIẢN HÓA (REMOVE/RELAX)]: Điều kiện kinh doanh, thủ tục hành chính hoặc nghĩa vụ được bãi bỏ/cắt giảm.",
        "3. [THAY ĐỔI QUY TRÌNH / MỨC PHẠT (MODIFY)]: Thay đổi cơ quan có thẩm quyền (VD: phân cấp về UBND tỉnh/Sở/UBND cấp xã), thay đổi thời hạn, mức thuế/phí hoặc khung tiền phạt.",
        "4. [ĐIỀU KHOẢN CHUYỂN TIẾP (TRANSITIONAL)]: Cơ sở đã được cấp phép trước ngày văn bản mới có hiệu lực thì được tiếp tục theo giấy phép cũ đến khi hết hạn hay phải làm thủ tục cấp lại ngay?"
      ]
    }
  };

  mkdirSync(join(dossierDir, "reports"), { recursive: true });
  const dateTag = new Date().toISOString().slice(0, 10);
  const deltaPath = join(dossierDir, "reports", `delta-${dateTag}.json`);
  const latestDeltaPath = join(dossierDir, "reports", "latest_delta.json");
  writeFileSync(deltaPath, JSON.stringify(deltaReport, null, 2) + "\n");
  writeFileSync(latestDeltaPath, JSON.stringify(deltaReport, null, 2) + "\n");

  if (commitSnapshot) {
    writeFileSync(snapPath, JSON.stringify(currentGraph, null, 2) + "\n");
  }

  return deltaReport;
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      slug: { type: "string" },
      "commit-snapshot": { type: "boolean", default: false },
      "simulate-change": { type: "string" }
    }
  });
  const cmd = positionals[0];
  try {
    if (cmd === "scan") {
      if (!values.slug) throw new Error("--slug <slug> is required");
      const report = await scanDossierChanges(values.slug, {
        commitSnapshot: values["commit-snapshot"],
        simulateChange: values["simulate-change"] || null
      });
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.error("Usage: vbpl-watch.mjs scan --slug <slug> [--commit-snapshot] [--simulate-change <json>]");
      process.exitCode = 1;
    }
  } finally {
    await shutdown();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
