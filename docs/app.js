const AGENT_INSTALL_CONFIGS = {
  antigravity: {
    title: "Cài đặt tự động trên Google Antigravity (Khuyên dùng)",
    subtitle:
      "Mở Antigravity ở một thư mục/workspace trống mới → Bấm nút Sao chép Prompt bên phải → Dán vào khung chat.",
    prompt: `Hãy tải bộ công cụ pháp luật Việt Nam 360° từ https://github.com/sotacom/vn-legal-360-skills.git về thư mục hiện tại (nếu thư mục trống thì clone thẳng nội dung hoặc clone vào ./vn-legal-360-skills) và thiết lập trọn gói cho tôi theo đúng các bước sau:

1. Chạy lệnh \`npm run setup\` để tự động tải/build \`api-anything\`, cài đặt đặc tả \`specs/vbpl.json\` vào \`~/.api-anything/sites/vbpl.json\` và liên kết (symlink) cả 5 skills (\`vn-legal-exhaustive-research\`, \`vn-legal-qc-auditor\`, \`vn-legal-watch-monitor\`, \`vn-legal-visualizer\`, \`vn-legal-dossier-drafter\`) vào \`~/.gemini/config/skills/\`.
2. Kiểm tra xem MCP server \`api-anything\` đã được cấu hình trong Antigravity (\`~/.gemini/config/mcp_config.json\`) trỏ tới \`node <đường-dẫn-tuyệt-đối>/api-anything/dist/index.js\` chưa; nếu chưa có thì hướng dẫn hoặc thêm cấu hình chuẩn cho tôi.
3. Chạy thử kiểm tra nhanh kết nối \`vbpl.vn\` và xác nhận cả 5 skills đã sẵn sàng hoạt động, sau đó gợi ý 3 câu hỏi pháp lý thực tế để tôi bắt đầu ngay!`,
    highlights: [
      { code: "5 Global Skills", desc: "Tự động gắn vào ~/.gemini/config/skills/ dùng cho mọi workspace." },
      { code: "vbpl.json (11 APIs)", desc: "Nạp trực tiếp đặc tả CSDL Quốc gia vbpl.vn vào ~/.api-anything/sites/." },
      { code: "Generative UI + Sidecar", desc: "Hỗ trợ đầy đủ HTML Compliance Cockpit & Lịch quét sáng Thứ Hai." }
    ]
  },
  claude: {
    title: "Cài đặt tự động trên Claude Code (CLI / VS Code / Desktop)",
    subtitle:
      "Tạo thư mục mới (VD: mkdir phap-che-ai && cd phap-che-ai), chạy `claude` rồi dán nguyên văn Prompt này.",
    prompt: `Hãy tải và cài đặt bộ kỹ năng Pháp luật Việt Nam 360° từ https://github.com/sotacom/vn-legal-360-skills.git cho Claude Code theo các bước sau:

1. Clone repository \`https://github.com/sotacom/vn-legal-360-skills.git\` vào thư mục hiện tại (hoặc \`./vn-legal-360-skills\`) và chạy \`npm run setup -- --claude\` để tự động build \`api-anything\`, nạp \`~/.api-anything/sites/vbpl.json\` và liên kết trọn bộ 5 skills vào \`~/.claude/skills/\` (đồng thời liên kết vào \`.claude/skills/\` của project nếu cần).
2. Đăng ký MCP server \`api-anything\` cho project này (tạo file \`.mcp.json\` hoặc chạy \`claude mcp add api-anything -- node <đường-dẫn-tuyệt-đối>/api-anything/dist/index.js\`).
3. Tạo file \`CLAUDE.md\` tóm tắt quy trình phối hợp 5 skills (Rà soát 8 trụ cột -> Kiểm toán 6 cổng \`vbpl-qc-audit.mjs\` -> Trực quan hóa HTML -> Xuất hồ sơ Word \`.docx\` chuẩn Nghị định 30/2020/NĐ-CP).
4. Kiểm tra thử lệnh \`node scripts/vbpl-engine.mjs --help\` và báo cho tôi biết khi hệ thống đã sẵn sàng!`,
    highlights: [
      { code: "~/.claude/skills/*", desc: "Tự động symlink cả 5 SKILL.md chuẩn định dạng của Claude Code." },
      { code: ".mcp.json Ready", desc: "Tự động kết nối MCP api-anything để truy vấn trực tiếp vbpl.vn." },
      { code: "Subagent Red-Team", desc: "Tương thích hoàn hảo với cơ chế Subagent kiểm toán pháp chế Lớp 2." }
    ]
  },
  cursor: {
    title: "Cài đặt tự động trên Cursor IDE",
    subtitle:
      "Mở một folder mới trong Cursor → Mở khung Agent Chat (Cmd+I / Ctrl+I) → Dán Prompt dưới đây.",
    prompt: `Hãy thiết lập trọn bộ hệ thống rà soát Pháp luật Việt Nam 360° từ repo https://github.com/sotacom/vn-legal-360-skills.git vào workspace Cursor này:

1. Clone \`https://github.com/sotacom/vn-legal-360-skills.git\` và chạy \`npm run setup\` để build \`api-anything\` cùng đặc tả \`~/.api-anything/sites/vbpl.json\`.
2. Tạo cấu hình \`.cursor/mcp.json\` khai báo MCP server \`api-anything\` chạy lệnh \`node <đường-dẫn-tuyệt-đối>/api-anything/dist/index.js\`.
3. Tạo rule điều phối tại \`.cursor/rules/vn-legal-360.mdc\` (\`alwaysApply: true\`) tham chiếu trực tiếp tới 5 file \`SKILL.md\` trong \`.agents/skills/\` để mọi câu hỏi pháp luật Việt Nam đều tuân thủ Ma trận 8 Trụ cột, Kiểm toán 6 Cổng (\`scripts/vbpl-qc-audit.mjs\`) và xuất file Word \`.docx\` chuẩn Nghị định 30/2020/NĐ-CP.
4. Kiểm tra cài đặt và thông báo khi hoàn tất!`,
    highlights: [
      { code: ".cursor/mcp.json", desc: "Tích hợp MCP api-anything ngay trong Cursor Agent." },
      { code: ".cursor/rules/*.mdc", desc: "Tự động kích hoạt quy tắc 8 trụ cột & chống nhầm Omnibus Decree." },
      { code: "Zero Dependencies .docx", desc: "Xuất bộ hồ sơ hành chính Word ngay trong thư mục dự án." }
    ]
  },
  codex: {
    title: "Cài đặt trên OpenAI Codex CLI / Gemini CLI / Windsurf",
    subtitle:
      "Mở terminal hoặc khung chat của Agent trong thư mục mới → Copy & Paste đoạn Prompt sau.",
    prompt: `Hãy clone https://github.com/sotacom/vn-legal-360-skills.git về máy và cài đặt đầy đủ cho môi trường Agent hiện tại:

1. Chạy \`npm run setup -- --all-agents\` để tự động tải và build \`api-anything\`, cài đặt \`~/.api-anything/sites/vbpl.json\`, đồng thời liên kết 5 skills pháp luật Việt Nam vào \`~/.codex/skills/\`, \`~/.gemini/config/skills/\` và \`~/.claude/skills/\`.
2. Cấu hình MCP server \`api-anything\` (\`node <đường-dẫn-tuyệt-đối>/api-anything/dist/index.js\`) vào file cấu hình MCP của công cụ đang dùng (\`~/.codex/config.toml\` hoặc \`~/.gemini/settings.json\`).
3. Tạo file \`AGENTS.md\` ở thư mục gốc hướng dẫn Agent sử dụng các CLI \`scripts/vbpl-engine.mjs\`, \`scripts/vbpl-qc-audit.mjs\`, \`scripts/vbpl-watch.mjs\` và \`scripts/docx-drafter.py\`, sau đó xác nhận sẵn sàng!`,
    highlights: [
      { code: "--all-agents Flag", desc: "Liên kết đồng thời cho Codex, Gemini CLI & Claude trong 1 lần chạy." },
      { code: "CLI-First Fallback", desc: "Hoạt động mượt cả qua MCP lẫn gọi trực tiếp Node/Python CLI." },
      { code: "AGENTS.md Standard", desc: "Tuân thủ chuẩn mở AGENTS.md & .agents/skills/ đa nền tảng." }
    ]
  },
  cli: {
    title: "Cài đặt thủ công qua Terminal (Chỉ 3 dòng lệnh)",
    subtitle:
      "Dành cho lập trình viên muốn tự chạy trực tiếp bằng dòng lệnh (Yêu cầu: Node.js >= 20, Python >= 3.8, Git).",
    prompt: `git clone https://github.com/sotacom/vn-legal-360-skills.git
cd vn-legal-360-skills
npm run setup -- --all-agents`,
    highlights: [
      { code: "Bước 1/3 Tự động", desc: "Clone & biên dịch api-anything vào ./api-anything/dist/index.js." },
      { code: "Bước 2/3 Tự động", desc: "Cài đặt đặc tả specs/vbpl.json vào ~/.api-anything/sites/vbpl.json." },
      { code: "Bước 3/3 Tự động", desc: "Symlink trọn bộ 5 skills vào thư mục cấu hình của các AI Agents." }
    ]
  }
};

const PILLARS_DATA = [
  {
    code: "P1_ENTITY_LICENSING",
    short: "1. Chủ thể, Đầu tư & Đất đai",
    title: "Trụ cột 1: Chủ thể Kinh doanh, Đầu tư, Quy hoạch & Đất đai Đa mục đích",
    desc: "Xác định loại hình pháp nhân bắt buộc (Doanh nghiệp vs. Hộ kinh doanh), mã ngành VSIC, điều kiện đầu tư và tính tương thích của thửa đất/mặt bằng kinh doanh.",
    seeds: ["Luật DN 59/2020/QH14", "Luật Đầu tư 61/2020/QH14", "Luật Đất đai 31/2024/QH15 (Điều 218)", "NĐ 102/2024/NĐ-CP", "NĐ 49/2026/NĐ-CP"],
    checks: [
      "Ngành nghề này bắt buộc thành lập Doanh nghiệp hay được phép đăng ký Hộ kinh doanh cá thể?",
      "Thửa đất đang là Đất ở (ONT/ODT) có được lập Phương án sử dụng đất kết hợp thương mại dịch vụ theo Điều 218 Luật Đất đai 2024 không?",
      "Cơ sở hiện hữu lâu năm có thuộc diện bảo lưu quy hoạch / miễn nộp lại hồ sơ xây dựng khi cấp lại giấy phép không?"
    ]
  },
  {
    code: "P2_SECTOR_CONDITIONS",
    short: "2. Giấy phép con & Thẩm quyền",
    title: "Trụ cột 2: Giấy phép Đủ điều kiện Chuyên ngành & Phân cấp 2 Cấp",
    desc: "Rà soát toàn bộ điều kiện kinh doanh chuyên ngành, biểu mẫu đơn pháp định và cơ quan tiếp nhận theo mô hình chính quyền địa phương 2 cấp (Tỉnh – Xã/Phường).",
    seeds: ["Phụ lục IV Luật Đầu tư", "Nghị định chuyên ngành", "Luật TCCQĐP 72/2025/QH15", "QĐ phân cấp UBND Tỉnh"],
    checks: [
      "Trình tự, thủ tục cấp mới / cấp sửa đổi bổ sung / cấp lại Giấy chứng nhận đủ điều kiện gồm những biểu mẫu nào?",
      "Thẩm quyền tiếp nhận thuộc Sở chuyên ngành (Trung tâm PVHCC cấp tỉnh) hay đã phân cấp về Chủ tịch UBND cấp xã?",
      "Các điều khoản bãi bỏ một phần điều kiện kinh doanh ở cuối các Nghị định sửa đổi mới nhất nói gì?"
    ]
  },
  {
    code: "P3_PREMISES_TECH_PCCC",
    short: "3. Xây dựng, QCVN & PCCC",
    title: "Trụ cột 3: Cơ sở Vật chất, Quy chuẩn Kỹ thuật (QCVN), Giao thông & PCCC",
    desc: "Kiểm tra các chỉ tiêu kỹ thuật cứng (diện tích, khoảng cách an toàn), Giấy phép xây dựng, đấu nối giao thông và thẩm duyệt/nghiệm thu PCCC & CNCH.",
    seeds: ["Luật PCCC & CNCH 55/2024/QH15", "NĐ 105/2025/NĐ-CP", "Hệ thống QCVN / TCVN", "Luật Xây dựng"],
    checks: [
      "Quy mô cơ sở (diện tích, khối tích, số tầng, mặt hàng) có thuộc diện phải Thẩm duyệt thiết kế & Nghiệm thu PCCC không?",
      "Khoảng cách an toàn từ cơ sở tới trường học, bệnh viện, đường dây điện, nút giao thông theo QCVN là bao nhiêu mét?",
      "Phân biệt rõ chứng từ chứng minh tính hợp pháp xây dựng (GPXD + Nghiệm thu PCCC) và đăng ký tài sản trên Sổ đỏ."
    ]
  },
  {
    code: "P4_MEASUREMENT_QUALITY_DATA",
    short: "4. Đo lường, Giá & Giờ mở cửa",
    title: "Trụ cột 4: Đo lường, Kiểm định, Niêm yết Giá & Thời gian Hoạt động",
    desc: "Đảm bảo tuân thủ các nghĩa vụ vận hành hàng ngày thường xuyên bị kiểm tra đột xuất: kẹp chì đo lường, lưu mẫu, biển hiệu, niêm yết giá và khung giờ được phép hoạt động.",
    seeds: ["Luật Đo lường", "Luật Giá 16/2023/QH15", "Quy chuẩn thiết bị đo", "Quy định giờ hoạt động"],
    checks: [
      "Thiết bị cân, đong, cột đo, máy chuyên dụng có bắt buộc kiểm định định kỳ và còn nguyên niêm phong kẹp chì không?",
      "Biển hiệu cơ sở, bảng niêm yết giá công khai và thông báo khung giờ đóng/mở cửa cần trình bày những thông tin bắt buộc nào?",
      "Khi tạm ngừng hoạt động để sửa chữa hoặc nghỉ lễ thì phải thông báo trước bao nhiêu ngày cho cơ quan quản lý?"
    ]
  },
  {
    code: "P5_TAX_INVOICE_FINANCE",
    short: "5. Thuế & Hóa đơn Điện tử",
    title: "Trụ cột 5: Thuế, Phí Thẩm định & Hóa đơn Điện tử Khởi tạo từ Máy tính tiền",
    desc: "Rà soát nghĩa vụ thuế GTGT, TNDN/TNCN, TTĐB, thuế BVMT và quy định bắt buộc xuất hóa đơn điện tử từng lần bán / kết nối máy tính tiền với cơ quan thuế.",
    seeds: ["NĐ 123/2020/NĐ-CP", "NĐ 70/2025/NĐ-CP", "Luật Quản lý thuế", "Thông tư Phí & Lệ phí"],
    checks: [
      "Ngành nghề này có bắt buộc xuất hóa đơn điện tử theo từng lần bán hàng hoặc hóa đơn khởi tạo từ máy tính tiền kết nối dữ liệu thuế không?",
      "Mức phí thẩm định điều kiện kinh doanh và lệ phí cấp giấy phép tại địa phương hiện hành là bao nhiêu?",
      "Rủi ro bị xử phạt hoặc tước giấy phép nếu không lập hóa đơn đúng thời điểm cho khách lẻ là gì?"
    ]
  },
  {
    code: "P6_LABOR_INSURANCE_TRAINING",
    short: "6. Lao động & Chứng chỉ",
    title: "Trụ cột 6: Lao động, BHXH, ATVSLĐ & Chứng chỉ Huấn luyện Bắt buộc",
    desc: "Kiểm soát hợp đồng lao động, làm ca đêm, BHXH bắt buộc, khám sức khỏe định kỳ và các chứng chỉ nghiệp vụ bắt buộc cho quản lý lẫn nhân viên trực tiếp.",
    seeds: ["Bộ luật Lao động 45/2019/QH14", "Luật BHXH 41/2024/QH15", "Luật ATVSLĐ", "Huấn luyện PCCC / BVMT / ATTP"],
    checks: [
      "Người đứng đầu cơ sở và nhân viên trực tiếp phải có những giấy chứng nhận huấn luyện nghiệp vụ nào (PCCC, BVMT, ATTP, Chứng chỉ hành nghề)?",
      "Thời hạn hiệu lực của từng loại giấy chứng nhận huấn luyện là bao nhiêu năm và ai có thẩm quyền cấp?",
      "Quy định đóng BHXH bắt buộc cho chủ hộ kinh doanh / người quản lý từ khi Luật BHXH 2024 có hiệu lực."
    ]
  },
  {
    code: "P7_ENVIRONMENT_ANCILLARY_LOCAL",
    short: "7. Môi trường & Đặc thù Tỉnh",
    title: "Trụ cột 7: Môi trường, Dịch vụ Phụ trợ & Văn bản Đặc thù UBND/HĐND Tỉnh",
    desc: "Rà soát Giấy phép/Đăng ký môi trường, hợp đồng thu gom chất thải nguy hại và truy vấn trực tiếp kho văn bản QPPL địa phương (kèm quy tắc chuyển tiếp sau sáp nhập tỉnh).",
    seeds: ["Luật BVMT 72/2020/QH14", "NĐ 08/2022/NĐ-CP", "NĐ 05/2025/NĐ-CP", "Luật BHVBQPPL 2025", "VB UBND/HĐND Tỉnh"],
    checks: [
      "Cơ sở thuộc diện phải xin Giấy phép môi trường, Đăng ký môi trường cấp xã hay được miễn đăng ký môi trường?",
      "Hợp đồng chuyển giao chất thải nguy hại (giẻ lau dính dầu, rác thải y tế, bóng đèn huỳnh quang...) cần lưu chứng từ gì?",
      "Tại tỉnh vừa sáp nhập: tỉnh mới đã ban hành Quyết định mới chưa hay tiếp tục áp dụng Quyết định của tỉnh cũ theo địa giới cũ?"
    ]
  },
  {
    code: "P8_PENALTIES_INSPECTION",
    short: "8. Xử phạt VPHC & Thanh tra",
    title: "Trụ cột 8: Chế tài Xử phạt VPHC & Hồ sơ Đón Đoàn Kiểm tra Liên ngành",
    desc: "Đối chiếu toàn bộ khung tiền phạt (cá nhân vs. tổ chức), hình thức phạt bổ sung (tước giấy phép, đình chỉ) của cả 7 trụ cột trên và đóng gói Bìa Hồ sơ Thanh tra.",
    seeds: ["NĐ 125/2020/NĐ-CP", "NĐ 122/2021/NĐ-CP", "NĐ 45/2022/NĐ-CP", "NĐ 123/2024/NĐ-CP", "NĐ xử phạt chuyên ngành"],
    checks: [
      "Mức phạt tiền đối với Tổ chức gấp đôi Cá nhân được tính cụ thể ra sao cho từng hành vi vi phạm phổ biến?",
      "Những lỗi nào dẫn tới hình thức phạt bổ sung 'Tước quyền sử dụng Giấy chứng nhận từ 01–06 tháng' hoặc 'Đình chỉ hoạt động'?",
      "Danh mục 15–20 đầu mục tài liệu phải kẹp sẵn trong Bìa Hồ sơ Pháp lý đặt tại cơ sở để xuất trình trong 5 phút khi đoàn kiểm tra tới."
    ]
  }
];

const COCKPIT_DEMO_ITEMS = [
  {
    id: "chk_license",
    title: "Giấy chứng nhận đủ điều kiện kinh doanh chuyên ngành còn hiệu lực tại cơ sở",
    law: "Nghị định xử phạt chuyên ngành (Mức phạt Tổ chức)",
    fine: 50000000,
    supp: "Đình chỉ hoạt động / Tịch thu thu lợi bất hợp pháp",
    checked: true
  },
  {
    id: "chk_pccc",
    title: "Văn bản nghiệm thu PCCC & Hồ sơ phương án chữa cháy, CNCH tại chỗ",
    law: "Luật PCCC & CNCH 55/2024/QH15 · NĐ xử phạt PCCC",
    fine: 80000000,
    supp: "Đình chỉ hoạt động cơ sở cho đến khi khắc phục",
    checked: true
  },
  {
    id: "chk_land",
    title: "Phê duyệt Phương án sử dụng đất kết hợp đa mục đích (nếu kinh doanh trên Đất ở)",
    law: "Điều 218 Luật Đất đai 2024 · NĐ 123/2024/NĐ-CP",
    fine: 30000000,
    supp: "Buộc khôi phục / Hoàn thiện thủ tục đăng ký đất đai",
    checked: false
  },
  {
    id: "chk_einvoice",
    title: "Xuất hóa đơn điện tử từng lần bán / Khởi tạo từ máy tính tiền kết nối Thuế",
    law: "NĐ 123/2020/NĐ-CP (sửa đổi bởi NĐ 70/2025/NĐ-CP) · NĐ 125/2020/NĐ-CP",
    fine: 20000000,
    supp: "Nguy cơ thu hồi giấy phép chuyên ngành nếu tái phạm",
    checked: true
  },
  {
    id: "chk_measure",
    title: "Tem kiểm định phương tiện đo còn hạn & Hồ sơ huấn luyện nghiệp vụ PCCC/BVMT",
    law: "Luật Đo lường · Luật BVMT 2020",
    fine: 25000000,
    supp: "Tước quyền sử dụng chứng nhận từ 01 - 03 tháng",
    checked: false
  },
  {
    id: "chk_env",
    title: "Đăng ký môi trường & Hợp đồng thu gom, xử lý chất thải nguy hại định kỳ",
    law: "Luật BVMT 72/2020/QH14 · NĐ 45/2022/NĐ-CP",
    fine: 35000000,
    supp: "Buộc thực hiện biện pháp khắc phục ô nhiễm",
    checked: true
  }
];

const CASE_STUDIES_DATA = {
  case1: {
    badge: "Case Study #01 · Đất đai Đa mục đích + Omnibus Decree + Địa bàn Sau Sáp nhập",
    title: "Gỡ 'Nút thắt kép' Đất ở kết hợp Thương mại & Gia hạn Giấy phép Cửa hàng Xăng dầu Hiện hữu Lâu năm",
    problem:
      "Một doanh nghiệp bán lẻ xăng dầu có cửa hàng đã xây dựng đúng GPXD, nghiệm thu PCCC và vận hành hợp pháp hơn 15 năm, nhưng thửa đất trên Sổ đỏ vẫn ghi mục đích chính là 'Đất ở'. Khi chuẩn bị hồ sơ cấp lại Giấy chứng nhận đủ điều kiện tại một tỉnh vừa thực hiện sáp nhập đơn vị hành chính và vận hành chính quyền 2 cấp (Tỉnh – Xã), doanh nghiệp đứng trước nguy cơ bị trả hồ sơ hoặc phải chuyển mục đích sử dụng đất tốn hàng tỷ đồng.",
    whyHard:
      "Nếu hỏi AI thông thường, AI thường khuyên 'phải chuyển mục đích sang đất TMDV', bỏ sót cơ chế đất đa mục đích mới, và đặc biệt dễ trích nhầm giữa Điều 12 (sửa NĐ 101/2024) và Điều 13 (sửa NĐ 102/2024) trong Nghị định Omnibus 49/2026/NĐ-CP, hoặc nhầm Khoản 11 Điều 4 (lĩnh vực thuốc lá) với Khoản 1 Điều 2 (lĩnh vực xăng dầu) trong Nghị định 08/2018/NĐ-CP.",
    metrics: [
      { label: "Văn bản rà soát trên vbpl.vn", value: "38+ VB" },
      { label: "Lỗi Omnibus bị Gate 6 chặn", value: "100% (0 lỗi)" },
      { label: "Bộ hồ sơ .docx xuất tự động", value: "05 File chuẩn" }
    ],
    steps: [
      {
        title: "Bước 1 · Khám phá Lược đồ 8 Trụ cột & Mở khóa Điều 218 Luật Đất đai 2024",
        detail:
          "Skill `vn-legal-exhaustive-research` leo Lược đồ trên vbpl.vn, xác lập lộ trình 'Đăng ký sử dụng đất ở kết hợp thương mại, dịch vụ' theo Điều 218 Luật Đất đai 2024, Điều 99 Nghị định 102/2024/NĐ-CP và Điểm a Khoản 12 Điều 13 Nghị định 49/2026/NĐ-CP — giữ nguyên đất ở lâu dài trên Sổ đỏ mà vẫn hợp thức hóa hoàn toàn mục đích kinh doanh."
      },
      {
        title: "Bước 2 · Gate 6 (`vbpl-qc-audit.mjs`) Bắt sống Bẫy Nghị định Omnibus & Biểu mẫu Giao thời",
        detail:
          "Engine đọc toàn văn không cắt cụt (>500KB), phân tích cây `Chương > Điều > Khoản` và phát hiện Khoản 3 Điều 16 Nghị định 49/2026/NĐ-CP đã bãi bỏ một phần phụ lục cũ, giao UBND cấp tỉnh quy định thủ tục. Hồ sơ đơn lập tức được thiết kế dẫn chiếu song hành cả Mẫu số 13 và điều khoản chuyển tiếp để không bộ phận Một cửa nào bắt bẻ."
      },
      {
        title: "Bước 3 · Phân định Chính quyền 2 Cấp (Tỉnh – Xã) & Bảo lưu Công trình Hiện hữu",
        detail:
          "Tách bạch rõ thẩm quyền: Cá nhân đứng tên Sổ đỏ nộp Phương án đất đa mục đích tại Trung tâm PVHCC cấp xã (Chủ tịch UBND xã/phường giải quyết); Doanh nghiệp nộp hồ sơ chuyên ngành tại Trung tâm PVHCC cấp tỉnh (Sở Công Thương), kèm Công văn giải trình bảo lưu điều kiện xây dựng hiện hữu."
      },
      {
        title: "Bước 4 · Xuất Trọn bộ 05 File Word (.docx) Chuẩn Nghị định 30/2020/NĐ-CP",
        detail:
          "`scripts/docx-drafter.py` sinh tự động: (01) Đơn đề nghị sử dụng đất kết hợp đa mục đích, (02) Phương án thuyết minh khớp 1:1 từng điểm `a, b, c, d, đ, e, g`, (03) Công văn giải trình gửi Sở chuyên ngành, (04) Biên bản xác nhận hoàn thành công trình theo GPXD & PCCC, và (05) Bảng kê giấy tờ & hướng dẫn nơi nộp."
      }
    ]
  },
  case2: {
    badge: "Case Study #02 · Rà soát 360° Ngành Y tế + HTML Compliance Cockpit + Watch Radar",
    title: "Thiết lập Ma trận Tuân thủ 360° & Máy tính Rủi ro Thanh tra cho Phòng khám Chuyên khoa Da liễu",
    problem:
      "Một nhóm bác sĩ và nhà đầu tư chuẩn bị khai trương Phòng khám chuyên khoa Da liễu & Thẩm mỹ nội khoa tại đô thị lớn. Họ cần biết 'tất tần tật' quy định từ lúc chọn mặt bằng, xin Giấy phép hoạt động KBCB, trang thiết bị laser, xử lý rác thải y tế lây nhiễm, hóa đơn điện tử đến khung phạt của Đoàn kiểm tra Sở Y tế & Liên ngành.",
    whyHard:
      "Pháp luật y tế có hàng loạt Thông tư cũ của Bộ Y tế đã hết hiệu lực toàn bộ hoặc một phần sau khi Luật Khám bệnh, chữa bệnh 2023 và Nghị định 96/2023/NĐ-CP ban hành. Chỉ cần trích nhầm một Thông tư cũ về danh mục kỹ thuật hoặc bỏ sót hợp đồng chất thải y tế nguy hại là cơ sở có thể bị đình chỉ hoạt động.",
    metrics: [
      { label: "Độ phủ Trụ cột Pháp lý", value: "8 / 8 Trụ cột" },
      { label: "Kiểm tra Hiệu lực Live vbpl.vn", value: "PASS (Gate 1-6)" },
      { label: "Giám sát Biến động Tự động", value: "08:30 Thứ Hai" }
    ],
    steps: [
      {
        title: "Bước 1 · Phân rã 8 Trụ cột Không Góc Khuất (`discover`)",
        detail:
          "Tự động quét từ P1 (Doanh nghiệp vs. Hộ KD, quy hoạch mặt bằng), P2 (Người chịu trách nhiệm chuyên môn kỹ thuật, phạm vi hoạt động chuyên môn theo Luật KBCB 2023 & NĐ 96/2023/NĐ-CP), P3 (Cơ sở vật chất, diện tích buồng thủ thuật, an toàn bức xạ/laser & PCCC), đến P7 (Phân loại, thu gom chất thải y tế lây nhiễm sắc nhọn)."
      },
      {
        title: "Bước 2 · Kiểm toán 2 Lớp Loại bỏ Văn bản Hết hiệu lực (`HHL`)",
        detail:
          "Gate 2 & Gate 4 đối chiếu trực tiếp mã `ItemID` trên `vbpl.vn`, tự động gắn cờ cảnh báo và loại bỏ các Thông tư cấp phép cũ đã hết hiệu lực, đồng thời Subagent Lớp 2 kiểm tra chéo các quy định về quảng cáo dịch vụ khám bệnh, chữa bệnh và niêm yết giá kỹ thuật."
      },
      {
        title: "Bước 3 · Dựng Bảng Điều khiển HTML Tương tác (`visual_cockpit.html`)",
        detail:
          "Skill `vn-legal-visualizer` xuất file HTML độc lập cho phép chủ phòng khám tick chọn từng hạng mục trước ngày đón Đoàn thẩm định Sở Y tế, tự động cộng tổng rủi ro tiền phạt (VNĐ) và cảnh báo các lỗi dẫn tới tước chứng chỉ hành nghề / đình chỉ phòng khám."
      },
      {
        title: "Bước 4 · Kích hoạt Radar Quét Biến động Sáng Thứ Hai Hàng Tuần",
        detail:
          "Cài đặt `vn-legal-watch-monitor` quét 3 chiều (`Lược đồ`, `changesOnly` Trung ương & UBND thành phố, cảnh báo sớm 90 ngày văn bản `CCHL`) để báo cáo ngay khi Bộ Y tế hoặc cơ quan thuế ban hành thông tư/nghị định mới."
      }
    ]
  }
};

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

async function copyText(text, successMsg = "✓ Đã sao chép vào Clipboard!") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(successMsg);
  }
}

function initInstallerTabs() {
  const tabs = document.querySelectorAll("[data-agent-tab]");
  const titleEl = document.getElementById("install-title");
  const subEl = document.getElementById("install-subtitle");
  const promptEl = document.getElementById("install-prompt-text");
  const highlightsEl = document.getElementById("install-highlights");
  const copyBtn = document.getElementById("copy-install-prompt-btn");

  let currentAgent = "antigravity";

  function renderAgent(agentKey) {
    currentAgent = agentKey;
    const cfg = AGENT_INSTALL_CONFIGS[agentKey];
    if (!cfg) return;

    tabs.forEach((btn) => {
      const active = btn.getAttribute("data-agent-tab") === agentKey;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    titleEl.textContent = cfg.title;
    subEl.textContent = cfg.subtitle;
    promptEl.textContent = cfg.prompt;
    copyBtn.innerHTML =
      agentKey === "cli"
        ? `<span>📋 Sao chép Lệnh Terminal</span>`
        : `<span>📋 Sao chép Prompt Cài đặt</span>`;

    highlightsEl.innerHTML = cfg.highlights
      .map(
        (h) => `
        <div class="what-card">
          <strong>✓ ${h.code}</strong>
          <span>${h.desc}</span>
        </div>
      `
      )
      .join("");
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      renderAgent(btn.getAttribute("data-agent-tab"));
    });
  });

  copyBtn.addEventListener("click", () => {
    const cfg = AGENT_INSTALL_CONFIGS[currentAgent];
    copyText(
      cfg.prompt,
      currentAgent === "cli"
        ? "✓ Đã sao chép lệnh Terminal! Hãy dán vào cửa sổ dòng lệnh."
        : "✓ Đã sao chép Prompt! Hãy mở Project mới trong AI Agent và dán vào khung chat."
    );
  });

  renderAgent("antigravity");
}

function initPillarMatrix() {
  const btnContainer = document.getElementById("pillar-buttons");
  const detailContainer = document.getElementById("pillar-detail");
  if (!btnContainer || !detailContainer) return;

  btnContainer.innerHTML = PILLARS_DATA.map(
    (p, idx) => `
      <button type="button" class="pillar-btn ${idx === 0 ? "active" : ""}" data-pillar-idx="${idx}">
        <span class="pillar-code">${p.code}</span>
        <span class="pillar-name">${p.short}</span>
      </button>
    `
  ).join("");

  function renderPillar(idx) {
    const p = PILLARS_DATA[idx];
    btnContainer.querySelectorAll(".pillar-btn").forEach((b, i) => {
      b.classList.toggle("active", i === idx);
    });

    detailContainer.innerHTML = `
      <div class="pillar-detail-head">
        <span class="pill pill-gold">${p.code}</span>
        <span class="pill pill-emerald"><span class="pill-dot"></span>Bắt buộc kiểm tra trên vbpl.vn</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="seed-chips">
        ${p.seeds.map((s) => `<span class="seed-chip">${s}</span>`).join("")}
      </div>
      <ul class="pillar-checks">
        ${p.checks.map((c) => `<li>🔎 ${c}</li>`).join("")}
      </ul>
    `;
  }

  btnContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pillar-idx]");
    if (!btn) return;
    renderPillar(Number(btn.getAttribute("data-pillar-idx")));
  });

  renderPillar(0);
}

function formatVND(num) {
  if (num === 0) return "0 ₫ (An toàn)";
  return new Intl.NumberFormat("vi-VN").format(num) + " ₫";
}

function initCockpitDemo() {
  const listEl = document.getElementById("cockpit-items");
  const scoreEl = document.getElementById("cockpit-score");
  const riskEl = document.getElementById("cockpit-risk");
  const barEl = document.getElementById("cockpit-progress");
  if (!listEl) return;

  const state = COCKPIT_DEMO_ITEMS.map((item) => ({ ...item }));

  function render() {
    const total = state.length;
    const completed = state.filter((i) => i.checked).length;
    const pct = Math.round((completed / total) * 100);
    const totalRisk = state.filter((i) => !i.checked).reduce((acc, cur) => acc + cur.fine, 0);

    scoreEl.textContent = `${pct}% (${completed}/${total})`;
    scoreEl.style.color = pct === 100 ? "var(--emerald-text)" : "var(--gold-text)";

    riskEl.textContent = formatVND(totalRisk);
    riskEl.style.color = totalRisk === 0 ? "var(--emerald-text)" : "var(--danger-text)";

    barEl.style.width = `${pct}%`;

    listEl.innerHTML = state
      .map(
        (item, idx) => `
        <label class="check-row ${item.checked ? "checked" : ""}">
          <input type="checkbox" data-check-idx="${idx}" ${item.checked ? "checked" : ""} />
          <span class="check-row-body">
            <span class="check-row-title">${item.title}</span>
            <span class="check-row-fine">
              ${
                item.checked
                  ? `✓ Đã tuân thủ (${item.law})`
                  : `⚠ Rủi ro phạt dự kiến: ${formatVND(item.fine)} · ${item.supp}`
              }
            </span>
          </span>
        </label>
      `
      )
      .join("");
  }

  listEl.addEventListener("change", (e) => {
    const input = e.target.closest("[data-check-idx]");
    if (!input) return;
    const idx = Number(input.getAttribute("data-check-idx"));
    state[idx].checked = input.checked;
    render();
  });

  render();
}

function initCaseStudies() {
  const tabs = document.querySelectorAll("[data-case-tab]");
  const container = document.getElementById("case-study-content");
  if (!container) return;

  function renderCase(key) {
    const c = CASE_STUDIES_DATA[key];
    if (!c) return;

    tabs.forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-case-tab") === key);
    });

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-gold" style="margin-bottom: 10px;">${c.badge}</span>
        <h3 style="margin: 6px 0 0; font-size: 1.4rem; line-height: 1.3;">${c.title}</h3>
      </div>
      <div class="case-grid">
        <div>
          <div class="case-context-box">
            <h4>📌 Bối cảnh & Bài toán Thực tế</h4>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-soft);">${c.problem}</p>
          </div>
          <div class="case-context-box" style="border-color: rgba(239, 68, 68, 0.3);">
            <h4 style="color: var(--danger-text);">⚠️ Vì sao AI thông thường thất bại ở ca này?</h4>
            <p style="margin: 0; font-size: 0.88rem; color: var(--text-muted);">${c.whyHard}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${c.metrics
              .map(
                (m) => `
              <div style="padding: 12px; border-radius: 10px; background: var(--bg-elevated); border: 1px solid var(--border); text-align: center;">
                <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.05rem; color: var(--emerald-text);">${m.value}</div>
                <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 3px;">${m.label}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="case-timeline">
          ${c.steps
            .map(
              (s) => `
            <div class="timeline-step">
              <strong>${s.title}</strong>
              <p>${s.detail}</p>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      renderCase(btn.getAttribute("data-case-tab"));
    });
  });

  renderCase("case1");
}

function initExampleCopyButtons() {
  document.querySelectorAll("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy-target");
      const el = document.getElementById(targetId);
      if (el) {
        copyText(el.textContent.trim(), "✓ Đã sao chép Prompt ví dụ! Dán vào AI Agent để chạy ngay.");
      }
    });
  });
}

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("vn-legal-theme");
  if (saved === "light" || saved === "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  }

  function updateIcon() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (btn) {
      btn.textContent = isLight ? "🌙" : "☀️";
      btn.title = isLight ? "Chuyển sang giao diện Tối" : "Chuyển sang giao diện Sáng";
    }
  }

  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("vn-legal-theme", next);
      updateIcon();
    });
  }

  updateIcon();
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initInstallerTabs();
  initPillarMatrix();
  initCockpitDemo();
  initCaseStudies();
  initExampleCopyButtons();
});
