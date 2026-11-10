#!/usr/bin/env node
/**
 * VBPL Legal Intelligence & Graph Discovery Engine
 * Powered by api-anything (site: vbpl)
 *
 * Usage:
 *   node scripts/vbpl-engine.mjs init-dossier --config <path-to-profile.json>
 *   node scripts/vbpl-engine.mjs discover --slug <slug>
 *   node scripts/vbpl-engine.mjs read-doc --id <documentId>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { call, shutdown } from "../api-anything/dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const DOSSIERS_DIR = join(ROOT_DIR, "dossiers");

export const PILLAR_DEFINITIONS = {
  P1_ENTITY_LICENSING: {
    code: "P1_ENTITY_LICENSING",
    name: "1. Chủ thể, Đăng ký Kinh doanh, Đầu tư & Quy hoạch",
    description: "Loại hình doanh nghiệp/hộ kinh doanh/hợp tác xã, mã ngành VSIC, điều kiện đầu tư, quy hoạch sử dụng đất và địa giới hành chính."
  },
  P2_SECTOR_CONDITIONS: {
    code: "P2_SECTOR_CONDITIONS",
    name: "2. Giấy phép con & Điều kiện Kinh doanh Chuyên ngành",
    description: "Giấy chứng nhận đủ điều kiện, quyền và nghĩa vụ của thương nhân/đại lý/nhượng quyền, nguồn cung, hợp đồng đại lý, quy trình vận hành."
  },
  P3_PREMISES_TECH_PCCC: {
    code: "P3_PREMISES_TECH_PCCC",
    name: "3. Cơ sở vật chất, Quy chuẩn Kỹ thuật (QCVN), PCCC & Đấu nối Giao thông",
    description: "Thiết kế xây dựng, khoảng cách an toàn, đấu nối đường bộ/quốc lộ, thẩm duyệt & nghiệm thu Phòng cháy chữa cháy và Cứu nạn cứu hộ (PCCC & CNCH)."
  },
  P4_MEASUREMENT_QUALITY_DATA: {
    code: "P4_MEASUREMENT_QUALITY_DATA",
    name: "4. Đo lường, Chất lượng, Niêm yết Giá, Giờ hoạt động & Dữ liệu",
    description: "Kiểm định phương tiện đo, kẹp chì, tiêu chuẩn chất lượng hàng hóa/dịch vụ, lưu mẫu, biển hiệu, niêm yết giá và đăng ký giờ bán hàng."
  },
  P5_TAX_INVOICE_FINANCE: {
    code: "P5_TAX_INVOICE_FINANCE",
    name: "5. Thuế, Phí, Lệ phí & Hóa đơn Điện tử",
    description: "Thuế GTGT, TNDN/TNCN, TTĐB, thuế Bảo vệ môi trường, lệ phí, và quy định bắt buộc về hóa đơn điện tử khởi tạo từ máy tính tiền / xuất theo từng lần bán."
  },
  P6_LABOR_INSURANCE_TRAINING: {
    code: "P6_LABOR_INSURANCE_TRAINING",
    name: "6. Lao động, BHXH, An toàn Vệ sinh Lao động & Chứng chỉ Nghiệp vụ",
    description: "Hợp đồng lao động, lương tối thiểu vùng, BHXH bắt buộc, trang bị bảo hộ lao động, và huấn luyện nghiệp vụ bắt buộc (PCCC, BVMT) cho quản lý và nhân viên."
  },
  P7_ENVIRONMENT_ANCILLARY_LOCAL: {
    code: "P7_ENVIRONMENT_ANCILLARY_LOCAL",
    name: "7. Môi trường, Dịch vụ Phụ trợ & Quy định Đặc thù Địa phương",
    description: "Giấy phép/Đăng ký môi trường, thu gom chất thải nguy hại, ứng phó sự cố tràn dầu, dịch vụ phụ trợ đi kèm, và các Quyết định/Nghị quyết của HĐND/UBND tỉnh (bao gồm quy định chuyển tiếp sau sáp nhập tỉnh)."
  },
  P8_PENALTIES_INSPECTION: {
    code: "P8_PENALTIES_INSPECTION",
    name: "8. Chế tài Xử phạt VPHC & Hồ sơ Đón Đoàn Kiểm tra Liên ngành",
    description: "Các Nghị định xử phạt vi phạm hành chính trong từng lĩnh vực, mức phạt tiền, hình thức phạt bổ sung (tước giấy phép, đình chỉ) và danh mục hồ sơ thanh tra."
  }
};

export const RELATION_LABELS = {
  "1": "Bãi bỏ",
  "2": "Bản dịch",
  "3": "Căn cứ",
  "4": "Dẫn chiếu",
  "5": "Đình chỉ thi hành",
  "6": "Đính chính",
  "7": "Hợp nhất",
  "8": "Hướng dẫn áp dụng",
  "9": "Quy định chi tiết, hướng dẫn thi hành",
  "10": "Sửa đổi, bổ sung",
  "11": "Tạm ngưng hiệu lực",
  "12": "Thay thế",
  "13": "Bổ sung",
  "14": "Giải thích",
  "15": "Công bố",
  "16": "Sửa đổi",
  "17": "Gia hạn hiệu lực",
  "18": "Tiếp tục còn hiệu lực"
};

export const HIERARCHY_RANK = {
  HP: 1, // Hiến pháp
  BL: 2, // Bộ luật
  Lu: 3, // Luật
  NQ: 4, // Nghị quyết (QH/UBTVQH/CP/HĐND)
  PL: 5, // Pháp lệnh
  "NĐ": 6, // Nghị định
  "QĐ": 7, // Quyết định (TTg / Bộ trưởng / UBND)
  TTLT_TW: 8, // Thông tư liên tịch
  TT1: 9, // Thông tư
  VBHN: 10 // Văn bản hợp nhất
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function callVbpl(op, args) {
  const res = await call("vbpl", op, args, { maxTier: 1 });
  await sleep(180);
  return res;
}

/**
 * Fetches the complete, untruncated Next.js Flight stream for a VBPL document (including multi-chunk 500KB+ laws,
 * appendices, forms, and final repeal/transitional clauses).
 */
export async function fetchFullDocumentStream(documentId) {
  const res = await fetch("https://vbpl.vn/", {
    method: "POST",
    headers: {
      "Next-Action": "0fb12b3561faa05adec51a82efb3e4f4f427f07b",
      "Content-Type": "text/plain;charset=UTF-8"
    },
    body: JSON.stringify([String(documentId)])
  });
  const raw = await res.text();
  const pMatches = [...raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  let paragraphs = pMatches
    .map((m) =>
      m[1]
        .replace(/\\n|\\r|\\t/g, " ")
        .replace(/\\"/g, '"')
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .normalize("NFC")
    )
    .filter(Boolean);

  if (paragraphs.length === 0) {
    const fallback = await callVbpl("getDocumentFullText", { documentId: String(documentId) });
    paragraphs = fallback.data?.[0]?.paragraphs || [];
  }
  return paragraphs;
}

/**
 * Parses paragraphs of a Vietnamese legal document into a structured hierarchy:
 * Chương -> Mục -> Điều -> Khoản -> Điểm, tracking Omnibus amendment targets.
 */
export function parseDocumentStructure(paragraphs) {
  let currentChapter = null;
  let currentSection = null;
  let currentArticle = null;
  let currentClause = null;
  const articles = {};
  const structuredParagraphs = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];

    if (/^Chương\s+[IVXLCDM0-9]+\b/i.test(p)) {
      currentChapter = p;
      currentSection = null;
    } else if (/^Mục\s+[0-9IVXLCDM]+\b/i.test(p)) {
      currentSection = p;
    }

    const artMatch = p.match(/^Điều\s+(\d+[a-zđ]?)\.\s*(.*)$/i);
    if (artMatch) {
      const artNum = artMatch[1];
      let artTitle = artMatch[2] || "";
      if (!artTitle && i + 1 < paragraphs.length && !/^(Điều|Chương|Mục|\d+\.)/i.test(paragraphs[i + 1])) {
        artTitle = paragraphs[i + 1];
      }
      const fullHeader = `Điều ${artNum}. ${artTitle}`.trim();
      const omnibusMatch = fullHeader.match(
        /(?:Sửa đổi, bổ sung|Bãi bỏ).*?(?:của|tại)\s+((?:Luật|Nghị định|Thông tư|Quyết định)[^.;:]+)/i
      );
      currentArticle = {
        articleNumber: artNum,
        articleHeader: fullHeader,
        chapter: currentChapter,
        section: currentSection,
        isOmnibusAmendment: Boolean(omnibusMatch),
        omnibusTarget: omnibusMatch ? omnibusMatch[1].trim() : null,
        clauses: {},
        paragraphs: [p]
      };
      if (!articles[artNum]) {
        articles[artNum] = currentArticle;
      }
      currentClause = null;
    } else if (currentArticle) {
      currentArticle.paragraphs.push(p);
      const clauseMatch = p.match(/^(\d+)\.\s+(.*)$/);
      if (clauseMatch) {
        currentClause = clauseMatch[1];
        currentArticle.clauses[currentClause] = currentArticle.clauses[currentClause] || [];
        currentArticle.clauses[currentClause].push(p);
      } else if (currentClause) {
        currentArticle.clauses[currentClause] = currentArticle.clauses[currentClause] || [];
        currentArticle.clauses[currentClause].push(p);
      }
    }

    structuredParagraphs.push({
      index: i,
      text: p,
      chapter: currentChapter,
      section: currentSection,
      articleNumber: currentArticle?.articleNumber || null,
      articleHeader: currentArticle?.articleHeader || null,
      omnibusTarget: currentArticle?.omnibusTarget || null,
      clauseNumber: currentClause
    });
  }

  return { articles, structuredParagraphs };
}

/**
 * Searches inside a document and returns exact hierarchical breadcrumbs (Chương -> Điều -> Khoản)
 * so Omnibus Decrees/Laws are never mis-cited by article or chapter number.
 */
export async function locateInDocument(documentId, query) {
  const [attrRes, paragraphs] = await Promise.all([
    callVbpl("getDocumentAttributes", { documentId: String(documentId) }),
    fetchFullDocumentStream(documentId)
  ]);
  const { articles, structuredParagraphs } = parseDocumentStructure(paragraphs);
  const qLower = query.toLowerCase();
  const matches = structuredParagraphs
    .filter((sp) => sp.text.toLowerCase().includes(qLower))
    .map((sp) => ({
      paragraphIndex: sp.index,
      breadcrumb: [sp.chapter, sp.section, sp.articleHeader, sp.clauseNumber ? `Khoản ${sp.clauseNumber}` : null]
        .filter(Boolean)
        .join(" > "),
      articleNumber: sp.articleNumber,
      articleHeader: sp.articleHeader,
      omnibusTarget: sp.omnibusTarget,
      clauseNumber: sp.clauseNumber,
      text: sp.text
    }));

  return {
    documentId: String(documentId),
    attributes: attrRes.data || {},
    totalParagraphs: paragraphs.length,
    totalArticlesParsed: Object.keys(articles).length,
    query,
    matchCount: matches.length,
    matches
  };
}

/**
 * Fetches rich metadata + diagram + history + consolidated info for a single documentId
 */
export async function enrichDocument(documentId, metaHint = {}) {
  const [attrRes, diagRes, histRes, consolRes] = await Promise.all([
    callVbpl("getDocumentAttributes", { documentId: String(documentId) }),
    callVbpl("getDocumentDiagram", { documentId: String(documentId) }),
    callVbpl("getDocumentHistory", { documentId: String(documentId) }),
    callVbpl("getConsolidatedGroups", { documentId: String(documentId) })
  ]);

  const attr = attrRes.ok && attrRes.data ? attrRes.data : {};
  const diag = diagRes.ok && diagRes.data ? diagRes.data : { documentNamesByType: {}, documentNamesBySource: {} };
  const hist = histRes.ok && Array.isArray(histRes.data) ? histRes.data : [];
  const consol = consolRes.ok && Array.isArray(consolRes.data) ? consolRes.data : [];

  const outgoingRelations = {};
  for (const [relCode, list] of Object.entries(diag.documentNamesByType ?? {})) {
    if (Array.isArray(list) && list.length > 0) {
      outgoingRelations[relCode] = {
        label: RELATION_LABELS[relCode] || `Quan hệ ${relCode}`,
        items: list.map((x) => ({ id: String(x.id), name: x.name, effectAllType: x.effectAllType }))
      };
    }
  }

  const incomingRelations = {};
  for (const [relCode, list] of Object.entries(diag.documentNamesBySource ?? {})) {
    if (Array.isArray(list) && list.length > 0) {
      incomingRelations[relCode] = {
        label: RELATION_LABELS[relCode] || `Quan hệ ${relCode}`,
        items: list.map((x) => ({ id: String(x.id), name: x.name, effectAllType: x.effectAllType }))
      };
    }
  }

  const id = String(attr.id || metaHint.id || documentId);
  const docNum = attr.docNum || metaHint.docNum || "";
  const title = attr.title || metaHint.title || "";
  const docType = attr.docType || metaHint.docType || "";
  const docTypeCode = attr.docTypeCode || metaHint.docTypeCode || "";
  const effStatus = attr.effStatus || metaHint.effStatus || "Chưa xác định";
  const effStatusCode = attr.effStatusCode || metaHint.effStatusCode || "";

  return {
    id,
    docNum,
    title,
    docType,
    docTypeCode,
    hierarchyRank: HIERARCHY_RANK[docTypeCode] || 99,
    issueDate: attr.issueDate || metaHint.issueDate || null,
    effFrom: attr.effFrom || metaHint.effFrom || null,
    effTo: attr.effTo || metaHint.effTo || null,
    effStatus,
    effStatusCode,
    agencyName: attr.agencyName || metaHint.agencyName || null,
    organization: attr.organization || metaHint.organization || null,
    url: `https://vbpl.vn/van-ban/chi-tiet/${id}`,
    isConsolidatedDocument: !!attr.isConsolidatedDocument,
    pillars: metaHint.pillars ? [...new Set(metaHint.pillars)] : [],
    discoveryReason: metaHint.discoveryReason || "seed",
    outgoingRelations,
    incomingRelations,
    history: hist,
    consolidatedGroups: consol.map((g) => ({
      vbhnId: g.vbhnDocument?.id ? String(g.vbhnDocument.id) : null,
      vbhnDocNum: g.vbhnDocument?.docNum || null,
      vbhnTitle: g.vbhnDocument?.title || null,
      vbhnIssueDate: g.vbhnDocument?.issueDate || null
    })),
    lastVerifiedAt: new Date().toISOString()
  };
}

/**
 * Discovers and builds the full 8-pillar Legal Knowledge Graph for a topic dossier
 */
export async function discoverDossier(slug) {
  const dossierDir = join(DOSSIERS_DIR, slug);
  const profilePath = join(dossierDir, "profile.json");
  if (!existsSync(profilePath)) {
    throw new Error(`Profile not found at ${profilePath}`);
  }
  const profile = JSON.parse(readFileSync(profilePath, "utf8"));
  const candidateMap = new Map(); // id -> { id, docNum, title, ..., pillars: Set, reasons: Set }

  const registerCandidate = (item, pillarCode, reason) => {
    if (!item || !item.id) return;
    const id = String(item.id);
    const existing = candidateMap.get(id);
    if (existing) {
      if (pillarCode) existing.pillars.add(pillarCode);
      if (reason) existing.reasons.add(reason);
      if (!existing.docNum && item.docNum) existing.docNum = item.docNum;
      if (!existing.title && (item.title || item.name)) existing.title = item.title || item.name;
      if (!existing.effStatus && item.effStatus) existing.effStatus = item.effStatus;
    } else {
      candidateMap.set(id, {
        id,
        docNum: item.docNum || "",
        title: item.title || item.name || "",
        issueDate: item.issueDate || null,
        effFrom: item.effFrom || null,
        effTo: item.effTo || null,
        effStatus: item.effStatus || null,
        effStatusCode: item.effStatusCode || null,
        docType: item.docType || null,
        docTypeCode: item.docTypeCode || null,
        pillars: new Set(pillarCode ? [pillarCode] : []),
        reasons: new Set(reason ? [reason] : [])
      });
    }
  };

  // Step 1: Search across all 8 pillars (exact IDs, exact numbers, title keywords, local province queries)
  for (const [pillarCode, pillarCfg] of Object.entries(profile.pillars || {})) {
    // 1a-0. Direct seed document IDs
    for (const docId of pillarCfg.seedIds || []) {
      registerCandidate({ id: String(docId) }, pillarCode, `seedId:${docId}`);
    }

    // 1a. Exact seed numbers (docNum)
    for (const docNum of pillarCfg.seedNumbers || []) {
      const res = await callVbpl("searchDocuments", {
        keyword: docNum,
        optionDoc: "number",
        matchMode: "exact_phrase",
        pageNumber: 1,
        pageSize: 5
      });
      if (res.ok && Array.isArray(res.data)) {
        // Prefer exact docNum match
        const exact = res.data.filter(
          (d) => (d.docNum || "").trim().toLowerCase() === docNum.trim().toLowerCase()
        );
        const picked = exact.length > 0 ? exact : res.data.slice(0, 2);
        for (const item of picked) {
          registerCandidate(item, pillarCode, `seedNumber:${docNum}`);
        }
      }
    }

    // 1b. Title keyword searches (Central)
    for (const kw of pillarCfg.keywords || []) {
      const res = await callVbpl("searchDocuments", {
        keyword: kw,
        optionDoc: "title",
        matchMode: "exact_phrase",
        pageNumber: 1,
        pageSize: pillarCfg.maxPerKeyword || 6
      });
      if (res.ok && Array.isArray(res.data)) {
        for (const item of res.data) {
          if (item.effStatusCode === "HHL" && !pillarCfg.includeExpired) continue;
          registerCandidate(item, pillarCode, `keyword:${kw}`);
        }
      }
    }

    // 1c. Local Provincial searches (if provinceIds are specified in profile or pillar)
    const provinceIds = pillarCfg.provinceIds || profile.provinceIds || [];
    for (const provId of provinceIds) {
      for (const kw of pillarCfg.localKeywords || []) {
        const res = await callVbpl("searchLocalDocuments", {
          keyword: kw,
          administrativeUnit: provId,
          optionDoc: "title",
          matchMode: "exact_phrase",
          pageNumber: 1,
          pageSize: 10
        });
        if (res.ok && Array.isArray(res.data)) {
          for (const item of res.data) {
            registerCandidate(item, pillarCode, `local:${provId}:${kw}`);
          }
        }
      }
    }
  }

  // Step 2: Enrich all primary candidates with full attributes, diagrams, history, and VBHN
  const documents = {};
  const primaryIds = [...candidateMap.keys()];
  for (const id of primaryIds) {
    const c = candidateMap.get(id);
    const enriched = await enrichDocument(id, {
      ...c,
      pillars: [...c.pillars],
      discoveryReason: [...c.reasons].join(", ")
    });
    documents[id] = enriched;
  }

  // Step 3: Graph Expansion (Leo Lược đồ văn bản)
  // Automatically pull in:
  // - Amending/supplementing documents (incomingRelations["10"], ["13"], ["16"])
  // - Replacing/repealing documents (incomingRelations["12"], ["1"]) when status is HHL/HHL1P
  // - Consolidated documents (incomingRelations["7"])
  // - Implementing/guiding regulations (incomingRelations["9"], ["8"]) matching domain keywords
  const domainFilterRegex = profile.graphExpansionFilter
    ? new RegExp(profile.graphExpansionFilter, "i")
    : null;

  const expansionQueue = [];
  for (const doc of Object.values(documents)) {
    const inc = doc.incomingRelations || {};
    // Always expand amending/supplementing (10, 13, 16), replacing (12), and consolidated (7)
    for (const relCode of ["10", "12", "13", "16", "7"]) {
      for (const relItem of inc[relCode]?.items || []) {
        if (!documents[relItem.id]) {
          expansionQueue.push({
            id: relItem.id,
            name: relItem.name,
            pillars: doc.pillars,
            reason: `graph:${RELATION_LABELS[relCode]}(of:${doc.docNum || doc.id})`
          });
        }
      }
    }
    // Expand guiding documents (9, 8) and basis-citing local documents (3) if they match domain filter
    for (const relCode of ["9", "8", "3"]) {
      for (const relItem of inc[relCode]?.items || []) {
        if (!documents[relItem.id] && (!domainFilterRegex || domainFilterRegex.test(relItem.name))) {
          expansionQueue.push({
            id: relItem.id,
            name: relItem.name,
            pillars: doc.pillars,
            reason: `graph:${RELATION_LABELS[relCode]}(of:${doc.docNum || doc.id})`
          });
        }
      }
    }
  }

  // Deduplicate expansion queue and cap to keep traffic light & fast
  const seenExpand = new Set(Object.keys(documents));
  const maxExpand = profile.maxGraphExpansion || 25;
  let expandedCount = 0;
  for (const item of expansionQueue) {
    if (seenExpand.has(item.id)) {
      // Merge pillars into existing document
      const existing = documents[item.id];
      if (existing) {
        existing.pillars = [...new Set([...existing.pillars, ...item.pillars])];
      }
      continue;
    }
    if (expandedCount >= maxExpand) break;
    seenExpand.add(item.id);
    expandedCount++;
    const enriched = await enrichDocument(item.id, {
      id: item.id,
      title: item.name,
      pillars: item.pillars,
      discoveryReason: item.reason
    });
    documents[item.id] = enriched;
  }

  // Step 4: Build Graph Edges and Pillar Summary
  const edges = [];
  for (const doc of Object.values(documents)) {
    for (const [relCode, group] of Object.entries(doc.incomingRelations || {})) {
      for (const target of group.items || []) {
        if (documents[target.id]) {
          edges.push({
            fromId: target.id,
            fromDocNum: documents[target.id].docNum || target.name,
            toId: doc.id,
            toDocNum: doc.docNum || doc.title,
            relationCode: relCode,
            relationLabel: group.label
          });
        }
      }
    }
  }

  const pillarCoverage = {};
  for (const [pCode, pDef] of Object.entries(PILLAR_DEFINITIONS)) {
    const docsInPillar = Object.values(documents).filter((d) => d.pillars.includes(pCode));
    const activeDocs = docsInPillar.filter(
      (d) =>
        d.effStatusCode === "CHL" ||
        d.effStatusCode === "HHL1P" ||
        d.docTypeCode === "VBHN" ||
        /còn hiệu lực|hết hiệu lực một phần/i.test(d.effStatus || "")
    );
    pillarCoverage[pCode] = {
      name: pDef.name,
      totalDocs: docsInPillar.length,
      activeDocs: activeDocs.length,
      documentIds: docsInPillar.map((d) => d.id)
    };
  }

  const graphData = {
    slug: profile.slug,
    title: profile.title,
    location: profile.location || null,
    generatedAt: new Date().toISOString(),
    stats: {
      totalDocuments: Object.keys(documents).length,
      activeDocuments: Object.values(documents).filter((d) =>
        ["CHL", "HHL1P"].includes(d.effStatusCode)
      ).length,
      upcomingDocuments: Object.values(documents).filter((d) => d.effStatusCode === "CCHL").length,
      consolidatedDocuments: Object.values(documents).filter((d) => d.docTypeCode === "VBHN").length,
      expiredOrSupersededDocuments: Object.values(documents).filter((d) => d.effStatusCode === "HHL").length,
      totalGraphEdges: edges.length
    },
    pillarCoverage,
    documents,
    edges
  };

  mkdirSync(join(dossierDir, "snapshots"), { recursive: true });
  mkdirSync(join(dossierDir, "reports"), { recursive: true });

  const graphPath = join(dossierDir, "legal_graph.json");
  writeFileSync(graphPath, JSON.stringify(graphData, null, 2) + "\n");

  const snapPath = join(dossierDir, "snapshots", "latest.json");
  if (!existsSync(snapPath)) {
    writeFileSync(snapPath, JSON.stringify(graphData, null, 2) + "\n");
  }

  return graphData;
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      slug: { type: "string" },
      config: { type: "string" },
      id: { type: "string" },
      query: { type: "string" },
      "update-snapshot": { type: "boolean", default: false }
    }
  });

  const cmd = positionals[0];
  try {
    if (cmd === "init-dossier") {
      if (!values.config) throw new Error("--config <path-to-profile.json> is required");
      const raw = JSON.parse(readFileSync(resolve(values.config), "utf8"));
      const slug = values.slug || raw.slug;
      if (!slug) throw new Error("slug is required in profile or --slug");
      const dossierDir = join(DOSSIERS_DIR, slug);
      mkdirSync(join(dossierDir, "snapshots"), { recursive: true });
      mkdirSync(join(dossierDir, "reports"), { recursive: true });
      const profilePath = join(dossierDir, "profile.json");
      writeFileSync(profilePath, JSON.stringify({ ...raw, slug, updatedAt: new Date().toISOString() }, null, 2) + "\n");
      console.log(JSON.stringify({ ok: true, slug, dossierDir, profilePath }, null, 2));
    } else if (cmd === "discover") {
      if (!values.slug) throw new Error("--slug <slug> is required");
      const graph = await discoverDossier(values.slug);
      if (values["update-snapshot"]) {
        const snapPath = join(DOSSIERS_DIR, values.slug, "snapshots", "latest.json");
        writeFileSync(snapPath, JSON.stringify(graph, null, 2) + "\n");
      }
      console.log(
        JSON.stringify(
          {
            ok: true,
            slug: graph.slug,
            stats: graph.stats,
            pillarCoverage: Object.fromEntries(
              Object.entries(graph.pillarCoverage).map(([k, v]) => [k, { total: v.totalDocs, active: v.activeDocs }])
            )
          },
          null,
          2
        )
      );
    } else if (cmd === "read-doc") {
      if (!values.id) throw new Error("--id <documentId> is required");
      const [attr, paragraphs] = await Promise.all([
        callVbpl("getDocumentAttributes", { documentId: values.id }),
        fetchFullDocumentStream(values.id)
      ]);
      const { articles } = parseDocumentStructure(paragraphs);
      console.log(
        JSON.stringify(
          {
            ok: attr.ok && paragraphs.length > 0,
            attributes: attr.data,
            totalParagraphs: paragraphs.length,
            articleHeaders: Object.values(articles).map((a) => ({
              articleNumber: a.articleNumber,
              articleHeader: a.articleHeader,
              chapter: a.chapter,
              omnibusTarget: a.omnibusTarget
            })),
            paragraphs
          },
          null,
          2
        )
      );
    } else if (cmd === "locate-citation") {
      if (!values.id || !values.query) {
        throw new Error("--id <documentId> and --query <text> are required");
      }
      const res = await locateInDocument(values.id, values.query);
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.error("Usage: vbpl-engine.mjs <init-dossier|discover|read-doc|locate-citation> [options]");
      process.exitCode = 1;
    }
  } finally {
    await shutdown();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
