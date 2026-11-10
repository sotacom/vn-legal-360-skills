#!/usr/bin/env node
/**
 * VBPL Legal QC & Double-Check Auditor (Deterministic Gate)
 *
 * Verifies:
 * 1. 8-Pillar Completeness Coverage (every pillar must have active legal basis)
 * 2. Live VBPL ID & Validity Verification (no hallucinated IDs, no silent expired laws)
 * 3. Lược đồ Amendment Completeness (if a partially-expired law is cited, its amending laws must be tracked)
 * 4. Provincial / Merged Administrative Unit Transitional Compliance (when applicable)
 * 5. Playbook Citation & Quantitative Rigor Check
 *
 * Usage:
 *   node scripts/vbpl-qc-audit.mjs audit --slug <slug> [--live-recheck]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { shutdown } from "../api-anything/dist/index.js";
import {
  callVbpl,
  fetchFullDocumentStream,
  parseDocumentStructure,
  PILLAR_DEFINITIONS
} from "./vbpl-engine.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const DOSSIERS_DIR = join(ROOT_DIR, "dossiers");

/**
 * Gate 6: Verbatim Article & Clause Citation Cross-Check
 * Extracts citations like "điểm a khoản 12 Điều 13 Nghị định số 49/2026/NĐ-CP"
 * and verifies against live VBPL full-text structure that:
 * 1. The cited Điều exists in that document.
 * 2. The cited Khoản exists under that Điều.
 * 3. If the cited Điều is an Omnibus amendment article ("Sửa đổi, bổ sung... của Nghị định X"),
 *    any target document number mentioned in the same sentence matches the Omnibus article's target.
 */
export async function verifyCitationsInText(text, graph) {
  const normalizedText = text.normalize("NFC");
  const citationRegex =
    /(?:điểm\s+([a-zđ])\s+)?(?:khoản\s+(\d+)\s+)?Điều\s+(\d+[a-zđ]?)\s+(?:của\s+)?(?:Luật|Bộ luật|Nghị quyết|Nghị định|Thông tư|Quyết định)(?:[^,;.()\n]{0,65}?số\s+)?(\d+\/\d{4}\/[A-ZĐ0-9-]+)/gi;

  const matches = [...normalizedText.matchAll(citationRegex)];
  const docsByNum = {};
  for (const d of Object.values(graph.documents || {})) {
    const numMatch = (d.docNum || d.title || "").match(/(\d+\/\d{4}\/[A-ZĐ0-9-]+)/i);
    if (numMatch) {
      docsByNum[numMatch[1].toUpperCase()] = d;
    }
  }

  const structureCache = {};
  const verifiedCitations = [];
  const citationErrors = [];

  for (const m of matches) {
    const fullMatch = m[0];
    const point = m[1] || null;
    const clause = m[2] || null;
    const article = m[3];
    const docNum = m[4].toUpperCase();
    const matchIndex = m.index || 0;
    const contextSnippet = normalizedText.slice(
      Math.max(0, matchIndex - 240),
      Math.min(normalizedText.length, matchIndex + fullMatch.length + 180)
    );

    let doc = docsByNum[docNum];
    if (!doc) {
      const searchRes = await callVbpl("searchByNumber", { docNumber: docNum, page: "1", limit: "5" });
      const items = searchRes.data?.items || [];
      const exact = items.find((it) => (it.docNum || it.title || "").toUpperCase().includes(docNum)) || items[0];
      if (exact?.id) {
        doc = { id: String(exact.id), docNum };
        docsByNum[docNum] = doc;
      }
    }
    if (!doc) continue;

    if (!structureCache[doc.id]) {
      const paragraphs = await fetchFullDocumentStream(doc.id);
      structureCache[doc.id] = parseDocumentStructure(paragraphs);
    }
    const { articles } = structureCache[doc.id];
    if (Object.keys(articles).length === 0) continue;

    const artObj = articles[article];
    if (!artObj) {
      citationErrors.push({
        severity: "CRITICAL",
        code: "NONEXISTENT_ARTICLE_CITATION",
        citation: fullMatch,
        docNum,
        documentId: doc.id,
        message: `Trích dẫn '${fullMatch}' không khớp: Không tồn tại Điều ${article} trong văn bản ${docNum} (${doc.id}).`
      });
      continue;
    }

    if (clause && Object.keys(artObj.clauses).length > 0 && !artObj.clauses[clause]) {
      citationErrors.push({
        severity: "CRITICAL",
        code: "NONEXISTENT_CLAUSE_CITATION",
        citation: fullMatch,
        docNum,
        documentId: doc.id,
        articleHeader: artObj.articleHeader,
        message: `Trích dẫn '${fullMatch}' không khớp: Điều ${article} (${artObj.articleHeader}) của ${docNum} không có Khoản ${clause}.`
      });
      continue;
    }

    // Omnibus target cross-check
    if (artObj.isOmnibusAmendment && artObj.omnibusTarget) {
      const targetNumMatch = artObj.omnibusTarget.match(/(\d+\/\d{4}\/[A-ZĐ0-9-]+)/i);
      const actualTargetNum = targetNumMatch ? targetNumMatch[1].toUpperCase() : null;
      const allNumsInContext = [...contextSnippet.matchAll(/(\d+\/\d{4}\/[A-ZĐ0-9-]+)/gi)].map((x) =>
        x[1].toUpperCase()
      );
      const otherNumsInContext = allNumsInContext.filter((n) => n !== docNum);

      if (actualTargetNum && otherNumsInContext.length > 0 && !otherNumsInContext.includes(actualTargetNum)) {
        citationErrors.push({
          severity: "CRITICAL",
          code: "MISMATCHED_OMNIBUS_ARTICLE",
          citation: fullMatch,
          docNum,
          documentId: doc.id,
          articleHeader: artObj.articleHeader,
          message: `Lệch điều khoản Omnibus: '${fullMatch}' thuộc '${artObj.articleHeader}' (sửa đổi/bãi bỏ ${actualTargetNum}), nhưng câu văn đang dẫn chiếu tới ${otherNumsInContext.join(", ")}.`
        });
        continue;
      }
    }

    verifiedCitations.push({
      citation: fullMatch,
      docNum,
      documentId: doc.id,
      articleHeader: artObj.articleHeader,
      clause,
      point,
      status: "VERIFIED"
    });
  }

  return { verifiedCitations, citationErrors };
}

export async function runQcAudit(slug, { liveRecheck = false, verifyCitations = false } = {}) {
  const dossierDir = join(DOSSIERS_DIR, slug);
  const profilePath = join(dossierDir, "profile.json");
  const graphPath = join(dossierDir, "legal_graph.json");
  const playbookPath = join(dossierDir, "compliance_playbook.md");

  if (!existsSync(profilePath) || !existsSync(graphPath)) {
    throw new Error(`Missing profile.json or legal_graph.json in ${dossierDir}`);
  }

  const profile = JSON.parse(readFileSync(profilePath, "utf8"));
  const graph = JSON.parse(readFileSync(graphPath, "utf8"));
  const playbookText = existsSync(playbookPath) ? readFileSync(playbookPath, "utf8") : "";

  const findings = [];
  const checks = [];

  // 1. 8-Pillar Completeness Check
  let coveredPillars = 0;
  const totalPillars = Object.keys(PILLAR_DEFINITIONS).length;
  for (const [pCode, pDef] of Object.entries(PILLAR_DEFINITIONS)) {
    const cov = graph.pillarCoverage?.[pCode];
    const activeCount = cov?.activeDocs || 0;
    if (activeCount > 0) {
      coveredPillars++;
      checks.push({
        id: `PILLAR_${pCode}`,
        category: "8-Pillar Coverage",
        status: "PASS",
        detail: `${pDef.name}: ${activeCount} văn bản đang có hiệu lực (${cov.totalDocs} tổng số)`
      });
    } else {
      findings.push({
        severity: "CRITICAL",
        code: "MISSING_PILLAR_COVERAGE",
        pillar: pCode,
        message: `Trụ cột '${pDef.name}' chưa có văn bản pháp luật đang còn hiệu lực trong hồ sơ.`,
        remediation: `Bổ sung từ khóa hoặc số hiệu văn bản cho trụ cột ${pCode} trong profile.json và chạy lại discover.`
      });
      checks.push({
        id: `PILLAR_${pCode}`,
        category: "8-Pillar Coverage",
        status: "FAIL",
        detail: `${pDef.name}: 0 văn bản còn hiệu lực`
      });
    }
  }

  // 2. Live Recheck / Validity & Lược đồ Amendment Integrity
  const docs = Object.values(graph.documents || {});
  let amendmentWarnings = 0;
  let silentExpiredErrors = 0;

  for (const doc of docs) {
    if (liveRecheck) {
      const liveAttr = await callVbpl("getDocumentAttributes", { documentId: doc.id });
      if (!liveAttr.ok || !liveAttr.data?.id) {
        findings.push({
          severity: "CRITICAL",
          code: "INVALID_VBPL_ID",
          documentId: doc.id,
          message: `Không thể xác thực trực tiếp ID '${doc.id}' (${doc.docNum}) trên vbpl.vn.`
        });
      } else if (liveAttr.data.effStatusCode !== doc.effStatusCode) {
        findings.push({
          severity: "WARNING",
          code: "STATUS_DRIFT_DETECTED",
          documentId: doc.id,
          message: `Trạng thái hiệu lực của ${doc.docNum} (${doc.id}) trên vbpl.vn là '${liveAttr.data.effStatus}' (khác với hồ sơ: '${doc.effStatus}').`
        });
      }
    }

    // Check if document is partially invalidated (HHL1P) and has incoming amending docs (10, 13, 16)
    if (doc.effStatusCode === "HHL1P") {
      const inc = doc.incomingRelations || {};
      const amendingItems = [
        ...(inc["10"]?.items || []),
        ...(inc["13"]?.items || []),
        ...(inc["16"]?.items || [])
      ];
      const domainFilter = profile.graphExpansionFilter
        ? new RegExp(profile.graphExpansionFilter, "i")
        : null;
      const relevantAmending = amendingItems.filter((item) => {
        if (/QĐ-UBND|NQ-HĐND/i.test(item.name) && !/QĐ-UBND|NQ-HĐND/i.test(doc.docNum || "")) {
          return false; // Local provincial decisions/resolutions cannot amend central decrees/laws
        }
        return !domainFilter || domainFilter.test(item.name) || !["Lu", "BL"].includes(doc.docTypeCode);
      });
      const missingInGraph = relevantAmending.filter((item) => !graph.documents[item.id]);
      const hasConsolidatedTracked = (doc.consolidatedGroups || []).length > 0;
      if (missingInGraph.length > 0 && !hasConsolidatedTracked) {
        amendmentWarnings++;
        findings.push({
          severity: "WARNING",
          code: "UNTRACKED_AMENDMENTS",
          documentId: doc.id,
          docNum: doc.docNum,
          message: `Văn bản ${doc.docNum || doc.title} (${doc.id}) đang 'Hết hiệu lực một phần' và có ${missingInGraph.length} văn bản sửa đổi/bổ sung chuyên ngành trên Lược đồ chưa nạp vào đồ thị: ${missingInGraph.map((x) => `${x.name} [${x.id}]`).join("; ")}`,
          remediation: `Kiểm tra xem các văn bản sửa đổi này có thuộc phạm vi chủ đề không và cập nhật nếu cần.`
        });
      }
    }

    // Check if document is completely expired (HHL)
    if (doc.effStatusCode === "HHL" && playbookText) {
      // If cited in playbook, ensure playbook warns it is expired/replaced
      const citedById = playbookText.includes(`/chi-tiet/${doc.id}`);
      const citedByNum = doc.docNum && playbookText.includes(doc.docNum);
      if (citedById || citedByNum) {
        // Check if context mentions hết hiệu lực / thay thế / bãi bỏ / lịch sử
        const escaped = (doc.docNum || doc.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const ctxRegex = new RegExp(`.{0,180}${escaped}.{0,180}`, "gi");
        const matches = [...playbookText.matchAll(ctxRegex)].map((m) => m[0]);
        const properlyCaveated = matches.some((m) =>
          /hết hiệu lực|thay thế|bãi bỏ|cũ|trước đây|lịch sử/i.test(m)
        );
        if (!properlyCaveated) {
          silentExpiredErrors++;
          findings.push({
            severity: "CRITICAL",
            code: "SILENT_EXPIRED_CITATION",
            documentId: doc.id,
            docNum: doc.docNum,
            message: `Văn bản ${doc.docNum} (${doc.id}) đã 'Hết hiệu lực toàn bộ' nhưng được trích dẫn trong compliance_playbook.md mà không có cảnh báo hết hiệu lực/thay thế.`,
            remediation: `Ghi rõ văn bản đã hết hiệu lực và dẫn chiếu sang văn bản thay thế tương ứng.`
          });
        }
      }
    }
  }

  checks.push({
    id: "AMENDMENT_GRAPH_INTEGRITY",
    category: "Lược đồ & Sửa đổi Bổ sung",
    status: amendmentWarnings === 0 ? "PASS" : "WARN",
    detail: `Đã kiểm tra Lược đồ sửa đổi/bổ sung cho ${docs.length} văn bản (${amendmentWarnings} cảnh báo mở rộng)`
  });

  checks.push({
    id: "EXPIRED_LAW_GATE",
    category: "Hiệu lực Văn bản",
    status: silentExpiredErrors === 0 ? "PASS" : "FAIL",
    detail:
      silentExpiredErrors === 0
        ? "Không có văn bản hết hiệu lực nào bị trích dẫn nhầm làm căn cứ hiện hành"
        : `Phát hiện ${silentExpiredErrors} văn bản hết hiệu lực chưa ghi chú rõ`
  });

  // 3. Playbook Citation & Quantitative Rigor Verification
  if (!playbookText) {
    findings.push({
      severity: "WARNING",
      code: "MISSING_PLAYBOOK",
      message: "Chưa tạo file compliance_playbook.md trong hồ sơ chủ đề.",
      remediation: "Soạn thảo compliance_playbook.md đầy đủ 8 trụ cột kèm trích dẫn link vbpl.vn."
    });
    checks.push({
      id: "PLAYBOOK_COMPLETENESS",
      category: "Playbook Quality",
      status: "WARN",
      detail: "Chưa có compliance_playbook.md"
    });
  } else {
    const citedLinks = [...playbookText.matchAll(/https:\/\/vbpl\.vn\/van-ban\/chi-tiet\/([a-zA-Z0-9-]+)/g)].map(
      (m) => m[1]
    );
    const uniqueCitedIds = [...new Set(citedLinks)];
    const unknownIds = uniqueCitedIds.filter((id) => !graph.documents[id]);

    if (unknownIds.length > 0) {
      findings.push({
        severity: "WARNING",
        code: "UNCACHED_PLAYBOOK_CITATIONS",
        message: `Playbook có trích dẫn ${unknownIds.length} ID văn bản chưa nằm trong legal_graph.json: ${unknownIds.join(", ")}`,
        remediation: "Nạp các ID này vào legal_graph.json để hệ thống Watch theo dõi tự động."
      });
    }

    const hasLocalMergerAnalysis =
      !profile.requiresMergerAnalysis ||
      (/sáp nhập|hợp nhất|đơn vị hành chính|Tiền Giang|Đồng Tháp/i.test(playbookText) &&
        /Luật Ban hành văn bản quy phạm pháp luật|hiệu lực không gian|chuyển tiếp/i.test(playbookText));

    checks.push({
      id: "PLAYBOOK_CITATIONS",
      category: "Playbook Quality",
      status: uniqueCitedIds.length >= 8 && unknownIds.length === 0 ? "PASS" : "WARN",
      detail: `Playbook trích dẫn ${uniqueCitedIds.length} link trực tiếp vbpl.vn (${unknownIds.length} ID ngoài đồ thị)`
    });

    if (profile.requiresMergerAnalysis) {
      checks.push({
        id: "MERGER_TRANSITIONAL_ANALYSIS",
        category: "Local Merger & Transitional Law",
        status: hasLocalMergerAnalysis ? "PASS" : "FAIL",
        detail: hasLocalMergerAnalysis
          ? "Đã phân tích quy tắc hiệu lực chuyển tiếp VBQPPL địa phương sau sáp nhập tỉnh (Tiền Giang cũ -> Đồng Tháp mới)"
          : "Thiếu phân tích hiệu lực chuyển tiếp VBQPPL sau sáp nhập đơn vị hành chính cấp tỉnh"
      });
      if (!hasLocalMergerAnalysis) {
        findings.push({
          severity: "CRITICAL",
          code: "MISSING_MERGER_TRANSITIONAL_ANALYSIS",
          message:
            "Chủ đề có yếu tố địa phương sau sáp nhập tỉnh nhưng Playbook chưa phân tích quy định chuyển tiếp hiệu lực không gian của VBQPPL cấp tỉnh.",
          remediation:
            "Bổ sung mục phân tích hiệu lực áp dụng văn bản của UBND tỉnh Đồng Tháp mới và tỉnh Tiền Giang cũ theo Luật Ban hành VBQPPL 2025."
        });
      }
    }

    if (verifyCitations) {
      const { verifiedCitations, citationErrors } = await verifyCitationsInText(playbookText, graph);
      findings.push(...citationErrors);
      checks.push({
        id: "VERBATIM_CITATION_CROSSCHECK",
        category: "Verbatim Clause & Omnibus Audit",
        status: citationErrors.length === 0 ? "PASS" : "FAIL",
        detail: `Đã đối chiếu nguyên văn ${verifiedCitations.length} trích dẫn Điều/Khoản (${citationErrors.length} lỗi lệch Điều/Khoản)`
      });
    }
  }

  // Compute score
  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const warningCount = findings.filter((f) => f.severity === "WARNING").length;
  const rawScore = 100 - criticalCount * 20 - warningCount * 4;
  const score = Math.max(0, Math.min(100, rawScore));
  const status = criticalCount > 0 ? "FAIL" : warningCount > 0 ? "PASS_WITH_WARNINGS" : "PASS";

  const report = {
    slug,
    auditedAt: new Date().toISOString(),
    status,
    score,
    summary: {
      coveredPillars: `${coveredPillars}/${totalPillars}`,
      totalDocumentsInGraph: docs.length,
      activeDocumentsInGraph: graph.stats?.activeDocuments || 0,
      criticalFindings: criticalCount,
      warningFindings: warningCount
    },
    checks,
    findings
  };

  mkdirSync(join(dossierDir, "reports"), { recursive: true });
  const reportPath = join(dossierDir, "reports", "qc_audit_report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  return report;
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      slug: { type: "string" },
      file: { type: "string" },
      "live-recheck": { type: "boolean", default: false },
      "verify-citations": { type: "boolean", default: false }
    }
  });
  const cmd = positionals[0];
  try {
    if (cmd === "audit") {
      if (!values.slug) throw new Error("--slug <slug> is required");
      const report = await runQcAudit(values.slug, {
        liveRecheck: values["live-recheck"],
        verifyCitations: values["verify-citations"]
      });
      console.log(JSON.stringify(report, null, 2));
      if (report.status === "FAIL") process.exitCode = 1;
    } else if (cmd === "verify-file") {
      if (!values.slug || !values.file) {
        throw new Error("--slug <slug> and --file <path> are required");
      }
      const graphPath = join(DOSSIERS_DIR, values.slug, "legal_graph.json");
      const graph = JSON.parse(readFileSync(graphPath, "utf8"));
      const fileText = readFileSync(resolve(values.file), "utf8");
      const result = await verifyCitationsInText(fileText, graph);
      console.log(
        JSON.stringify(
          {
            ok: result.citationErrors.length === 0,
            file: resolve(values.file),
            verifiedCount: result.verifiedCitations.length,
            errorCount: result.citationErrors.length,
            verifiedCitations: result.verifiedCitations,
            citationErrors: result.citationErrors
          },
          null,
          2
        )
      );
      if (result.citationErrors.length > 0) process.exitCode = 1;
    } else {
      console.error(
        "Usage: vbpl-qc-audit.mjs <audit|verify-file> --slug <slug> [--live-recheck] [--verify-citations] [--file <path>]"
      );
      process.exitCode = 1;
    }
  } finally {
    await shutdown();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
