# VN Legal 360° Intelligence & Compliance Skills Suite (`vn-legal-360-skills`)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by api-anything](https://img.shields.io/badge/Powered%20by-api--anything-10b981.svg)](https://github.com/goodnight000/api-anything)
[![Data Source: vbpl.vn](https://img.shields.io/badge/Data%20Source-vbpl.vn-ef4444.svg)](https://vbpl.vn)

Bộ **5 Agent Skills** và **CLI Engine** chuyên sâu giúp AI Agent rà soát toàn diện **360° tất cả văn bản quy phạm pháp luật hiện hành tại Việt Nam** (Trung ương & Địa phương) trực tiếp từ **Cơ sở dữ liệu Quốc gia về văn bản pháp luật (`https://vbpl.vn`)** thông qua [`api-anything`](https://github.com/goodnight000/api-anything), tự động leo Lược đồ hiệu lực, kiểm toán chất lượng pháp chế 2 lớp (6 cổng kiểm chứng định lượng & đối chiếu nguyên văn từng Điều/Khoản), theo dõi biến động định kỳ hàng tuần, trực quan hóa bằng Bảng điều khiển HTML tương tác và xuất trọn bộ hồ sơ hành chính chuẩn thể thức Microsoft Word (`.docx`) theo **Nghị định số 30/2020/NĐ-CP**.

---

## 🌟 Điểm Khác Biệt Cốt Lõi (Out-of-the-Box Architecture)

1. **Ma trận Pháp lý 8 Trụ cột 360° (`8-Pillar 360° Legal Matrix`)**:
   - Không chỉ tìm kiếm từ khóa đơn lẻ mà tự động phân rã mọi câu hỏi/ngành nghề kinh doanh thành **8 trụ cột bắt buộc**:
     - `P1_ENTITY_LICENSING`: Chủ thể, Đăng ký kinh doanh, Đầu tư, Quy hoạch & Đất đai (bao gồm cơ chế *sử dụng đất kết hợp đa mục đích* theo Điều 218 Luật Đất đai 2024).
     - `P2_SECTOR_CONDITIONS`: Giấy phép con, điều kiện kinh doanh chuyên ngành & thẩm quyền cấp phép (chính quyền địa phương 2 cấp Tỉnh – Xã/Phường).
     - `P3_PREMISES_TECH_PCCC`: Cơ sở vật chất, xây dựng, quy chuẩn kỹ thuật (`QCVN`), đấu nối giao thông & Phòng cháy chữa cháy (`PCCC & CNCH`).
     - `P4_MEASUREMENT_QUALITY_DATA`: Đo lường, kiểm định, niêm yết giá & thời gian hoạt động.
     - `P5_TAX_INVOICE_FINANCE`: Thuế, phí, lệ phí & hóa đơn điện tử từng lần bán / khởi tạo từ máy tính tiền.
     - `P6_LABOR_INSURANCE_TRAINING`: Lao động, BHXH, ATVSLĐ & chứng chỉ huấn luyện nghiệp vụ bắt buộc (PCCC, bảo vệ môi trường...).
     - `P7_ENVIRONMENT_ANCILLARY_LOCAL`: Giấy phép/Đăng ký môi trường, dịch vụ phụ trợ & Văn bản QPPL đặc thù của HĐND/UBND tỉnh (kèm quy tắc chuyển tiếp hiệu lực không gian sau sáp nhập tỉnh/xã).
     - `P8_PENALTIES_INSPECTION`: Chế tài xử phạt vi phạm hành chính & Danh mục hồ sơ chuẩn bị đón đoàn kiểm tra liên ngành.
2. **Đọc Toàn văn Không Cắt cụt & Định vị Cây Cấu trúc `Chương > Điều > Khoản` (`Omnibus Decree Protection`)**:
   - Tải trọn vẹn luồng Next.js Flight của `vbpl.vn` cho cả các bộ luật/nghị định dài trên `500KB+` (bao gồm cả Phụ lục, Biểu mẫu và Điều khoản thi hành cuối văn bản), chuẩn hóa Unicode tiếng Việt (`NFC`).
   - Tự động phân tích cấu trúc `Chương -> Mục -> Điều -> Khoản -> Điểm` và xác định văn bản đích của từng Điều trong các Nghị định sửa đổi nhiều nghị định (*Omnibus Decrees*), ngăn chặn triệt để lỗi trích nhầm số Điều hoặc nhầm Chương giữa các lĩnh vực.
3. **Kiểm toán Pháp chế 2 Lớp & 6 Cổng Kỹ thuật Cứng (`Dual-Layer 6-Gate QC Auditor`)**:
   - **Lớp 1 (`scripts/vbpl-qc-audit.mjs`)**: Kiểm tra tự động 6 cổng: (1) Độ phủ 8 trụ cột, (2) Xác thực ID & hiệu lực trực tiếp trên `vbpl.vn`, (3) Toàn vẹn Lược đồ sửa đổi/bổ sung (`HHL1P`), (4) Chặn trích dẫn văn bản hết hiệu lực (`HHL`), (5) Phân tích hiệu lực chuyển tiếp sau sáp nhập đơn vị hành chính, và (6) **Đối chiếu nguyên văn từng trích dẫn `Điểm / Khoản / Điều` & kiểm tra chéo mục tiêu của điều khoản Omnibus (`verify-file`)**.
   - **Lớp 2 (Subagent Red-Team Audit)**: Đóng vai *"Đoàn Thanh tra Liên ngành Ảo"* kiểm tra chéo định mức kỹ thuật, thời hạn giải quyết (*ngày* vs. *ngày làm việc*), số hiệu biểu mẫu và điều khoản bãi bỏ một phần ở cuối văn bản mới.
4. **Radar Theo dõi Biến động Pháp luật 3 Chiều (`3-Way Legal Watch Radar`)**:
   - Quét định kỳ hàng tuần (qua Scheduled Automation Sidecar) trên 3 kênh: (1) Thay đổi trạng thái hiệu lực & Lược đồ của các văn bản đang theo dõi, (2) Văn bản Trung ương & Địa phương mới ban hành (`changesOnly`), (3) Cảnh báo sớm 90 ngày đối với văn bản sắp có hiệu lực (`CCHL`), từ đó phân tích rõ: **Làm thêm gì / Bớt được gì / Thay đổi gì / Quy định chuyển tiếp**.
5. **Xuất Bộ Hồ sơ Hành chính Chuẩn Microsoft Word `.docx` (`Nghị định 30/2020/NĐ-CP`)**:
   - Công cụ `scripts/docx-drafter.py` (không phụ thuộc thư viện ngoài) xuất trực tiếp các mẫu Đơn đề nghị, Phương án thuyết minh (khớp 1:1 từng điểm `a, b, c, d, đ, e, g` của điều luật), Công văn giải trình & bảo lưu pháp lý, Bảng kê giấy tờ cần chuẩn bị và Hướng dẫn nơi nộp thành file `.docx` chuẩn thể thức hành chính.

---

## 📦 Cấu Trúc Repository

```text
.
├── .agents/
│   └── skills/
│       ├── vn-legal-exhaustive-research/SKILL.md   # Skill 1: Rà soát toàn diện 360° (8 Trụ cột & Lược đồ)
│       ├── vn-legal-qc-auditor/SKILL.md            # Skill 2: Kiểm toán pháp chế 2 lớp (6 Gates & Verbatim Audit)
│       ├── vn-legal-watch-monitor/SKILL.md         # Skill 3: Theo dõi biến động định kỳ & Phân tích tác động
│       ├── vn-legal-visualizer/SKILL.md            # Skill 4: Trực quan hóa Mermaid & HTML Compliance Cockpit
│       └── vn-legal-dossier-drafter/SKILL.md       # Skill 5: Soạn thảo bộ hồ sơ hành chính chuẩn .docx
├── specs/
│   └── vbpl.json                                   # Đặc tả Tier-1 (11 operations) cho https://vbpl.vn trên api-anything
├── scripts/
│   ├── setup.mjs                                   # Script cài đặt tự động 1 lệnh (api-anything + spec + skills)
│   ├── vbpl-engine.mjs                             # Engine khám phá đồ thị Lược đồ, đọc toàn văn & định vị Điều/Khoản
│   ├── vbpl-qc-audit.mjs                           # Công cụ kiểm toán 6 cổng & đối chiếu trích dẫn nguyên văn
│   ├── vbpl-watch.mjs                              # Engine quét biến động pháp luật 3 chiều
│   └── docx-drafter.py                             # Engine xuất file Word (.docx) chuẩn Nghị định 30/2020/NĐ-CP
├── examples/
│   ├── profile.template.json                       # Mẫu cấu hình chủ đề 8 trụ cột
│   └── dossier_docx_spec.template.json             # Mẫu đặc tả xuất bộ hồ sơ Word (.docx)
├── dossiers/
│   └── .gitkeep                                    # Thư mục lưu các hồ sơ chủ đề của người dùng (được gitignore)
├── package.json
├── LICENSE                                         # Giấy phép nguồn mở MIT
└── README.md
```

---

## 🚀 Cài Đặt Nhanh (Quick Start)

### Yêu cầu hệ thống
- **Node.js** `>= 20.0.0`
- **Python 3** `>= 3.8` (chỉ dùng thư viện chuẩn có sẵn của Python để xuất file `.docx`)
- **Git**

### Cài đặt trong 1 lệnh
```bash
git clone https://github.com/sotacom/vn-legal-360-skills.git
cd vn-legal-360-skills
npm run setup
```
Lệnh `npm run setup` sẽ tự động:
1. Tải và biên dịch [`api-anything`](https://github.com/goodnight000/api-anything) vào `./api-anything` (nếu chưa có);
2. Cài đặt đặc tả `specs/vbpl.json` vào `~/.api-anything/sites/vbpl.json`;
3. Liên kết (symlink) cả **5 skills** vào `~/.gemini/config/skills/` để bạn có thể gọi từ bất kỳ workspace nào.

---

## 🛠️ Hướng Dẫn Sử Dụng CLI & Skills

### 1. Khởi tạo và khám phá đồ thị pháp luật 360° cho một chủ đề mới
```bash
# Tạo file cấu hình từ mẫu examples/profile.template.json
node scripts/vbpl-engine.mjs init-dossier --config examples/profile.template.json --slug kinh-doanh-quan-net

# Tự động truy vấn vbpl.vn, mở rộng Lược đồ và lập đồ thị 8 trụ cột
node scripts/vbpl-engine.mjs discover --slug kinh-doanh-quan-net --update-snapshot
```

### 2. Đọc toàn văn và định vị chính xác `Chương > Điều > Khoản` trên `vbpl.vn`
```bash
# Đọc toàn văn văn bản (không bị cắt cụt với văn bản >500KB) kèm danh sách tiêu đề các Điều:
node scripts/vbpl-engine.mjs read-doc --id 187157

# Định vị chính xác Chương > Điều > Khoản chứa từ khóa hoặc điều luật cần trích dẫn:
node scripts/vbpl-engine.mjs locate-citation --id 187157 --query "Điều 99"
```

### 3. Chạy Kiểm toán Chất lượng Pháp chế & Kiểm chứng Nguyên văn Trích dẫn (`Gate 1 -> Gate 6`)
```bash
# Kiểm toán toàn bộ hồ sơ chủ đề kèm đối chiếu nguyên văn Điều/Khoản:
node scripts/vbpl-qc-audit.mjs audit --slug <slug> --live-recheck --verify-citations

# Kiểm chứng nguyên văn từng trích dẫn Điều/Khoản trong một dự thảo đơn từ / công văn bất kỳ:
node scripts/vbpl-qc-audit.mjs verify-file --slug <slug> --file <duong-dan-file-du-thao>
```

### 4. Quét biến động pháp luật định kỳ (Watch Radar)
```bash
node scripts/vbpl-watch.mjs scan --slug <slug>
```

### 5. Xuất bộ hồ sơ thủ tục hành chính ra file Microsoft Word (`.docx`) chuẩn Nghị định 30/2020/NĐ-CP
```bash
python3 scripts/docx-drafter.py --spec examples/dossier_docx_spec.template.json --out-dir ./output_docx
```

---

## 🔒 Quyền Riêng Tư & Loại Trừ Dữ Liệu Case Cá Nhân

Repository này được cấu hình `.gitignore` để **tuyệt đối không đưa dữ liệu các hồ sơ/case hỏi đáp cá nhân lên GitHub**:
- Mọi hồ sơ trong `dossiers/*` (trừ `dossiers/.gitkeep`), các thư mục hồ sơ riêng và mọi tệp `*.docx` sinh ra trong quá trình tư vấn đều được loại trừ khỏi Git.

---

## 📄 Giấy Phép Nguồn Mở (License) & Ghi Nhận (Credits)

- Dự án này được phát hành dưới giấy phép **[MIT License](LICENSE)** — hoàn toàn tương thích với giấy phép MIT của [`api-anything`](https://github.com/goodnight000/api-anything).
- **Credits**:
  - Công cụ nền tảng Web-to-API: [`api-anything`](https://github.com/goodnight000/api-anything) bởi [`goodnight000`](https://github.com/goodnight000) (MIT License).
  - Nguồn dữ liệu văn bản quy phạm pháp luật chính thức: [Cơ sở dữ liệu Quốc gia về văn bản pháp luật (`https://vbpl.vn`)](https://vbpl.vn) – Bộ Tư pháp.
