---
name: vn-legal-exhaustive-research
description: >-
  Hệ thống hóa toàn diện 360° tất cả văn bản quy phạm pháp luật hiện hành tại Việt Nam
  liên quan đến một chủ đề, câu hỏi hoặc ngành nghề kinh doanh dựa trên CSDL Quốc gia
  về pháp luật (https://vbpl.vn) và api-anything. Sử dụng khi người dùng hỏi cần tuân thủ
  những quy định nào khi kinh doanh/thực hiện một hoạt động tại Việt Nam, hoặc yêu cầu
  rà soát "tất tần tật" quy định pháp luật Trung ương và Địa phương.
---

# Rà soát Toàn diện Pháp luật Việt Nam 360° (`vn-legal-exhaustive-research`)

Skill này thiết lập quy trình chuẩn để rà soát **không sót bất kỳ góc khuất pháp lý nào** cho một chủ đề, câu hỏi hoặc mô hình kinh doanh tại Việt Nam dựa trên cổng chính thức `https://vbpl.vn` (thông qua MCP/CLI `api-anything` site `vbpl` và engine `scripts/vbpl-engine.mjs`).

---

## Nguyên tắc Cốt lõi ("Không chỉ tìm từ khóa đơn lẻ")

Khi người dùng hỏi về một hoạt động thực tế (ví dụ: *mở cửa hàng bán lẻ xăng dầu*, *kinh doanh quán net*, *mở phòng khám*), **tuyệt đối không chỉ tìm 1 từ khóa chuyên ngành**. Bạn BẮT BUỘC phải phân rã bài toán thành **Ma trận Pháp lý 8 Trụ cột (8-Pillar 360° Legal Matrix)** và dùng **Lược đồ văn bản (`getDocumentDiagram`)** để leo theo phả hệ pháp lý.

### Ma trận 8 Trụ cột Pháp lý Bắt buộc

| Mã Trụ cột | Tên Trụ cột | Các khía cạnh bắt buộc phải rà soát |
| :--- | :--- | :--- |
| `P1_ENTITY_LICENSING` | **1. Chủ thể, Đăng ký KD, Đầu tư, Quy hoạch & Đất đai** | Loại hình chủ thể (bắt buộc lập Doanh nghiệp hay được lập Hộ kinh doanh?), mã ngành kinh tế Việt Nam (VSIC), ngành nghề đầu tư kinh doanh có điều kiện, quy hoạch tỉnh/đô thị/sử dụng đất, loại đất và cơ chế **sử dụng đất kết hợp đa mục đích** (Điều 218 Luật Đất đai 2024). |
| `P2_SECTOR_CONDITIONS` | **2. Giấy phép con & Điều kiện Chuyên ngành** | Giấy chứng nhận đủ điều kiện, quyền và nghĩa vụ theo từng nấc thương nhân, quy trình cấp mới/cấp lại/thu hồi, biểu mẫu đơn pháp định và thẩm quyền cấp phép (Bộ / Sở / UBND cấp tỉnh / UBND cấp xã). |
| `P3_PREMISES_TECH_PCCC` | **3. Cơ sở vật chất, Xây dựng, Quy chuẩn (QCVN), PCCC & Giao thông** | Quy chuẩn kỹ thuật quốc gia (QCVN/TCVN) về thiết kế, xây dựng, khoảng cách an toàn; Giấy phép xây dựng/cải tạo; đấu nối giao thông đường bộ/quốc lộ; thẩm duyệt thiết kế, nghiệm thu và phương án Phòng cháy chữa cháy & Cứu nạn cứu hộ (PCCC & CNCH). |
| `P4_MEASUREMENT_QUALITY_DATA` | **4. Đo lường, Chất lượng, Niêm yết & Thời gian hoạt động** | Kiểm định phương tiện đo (cột đo, cân...), kẹp chì, lưu mẫu, công bố/tiêu chuẩn chất lượng, biển hiệu, niêm yết giá công khai, đăng ký giờ mở/đóng cửa và quy trình thông báo tạm dừng hoạt động. |
| `P5_TAX_INVOICE_FINANCE` | **5. Thuế, Phí, Lệ phí & Hóa đơn Điện tử** | Thuế GTGT, TNDN/TNCN, TTĐB, Thuế Bảo vệ môi trường, phí/lệ phí thẩm định; quy định bắt buộc về **hóa đơn điện tử từng lần bán hàng / khởi tạo từ máy tính tiền kết nối dữ liệu với cơ quan thuế**. |
| `P6_LABOR_INSURANCE_TRAINING` | **6. Lao động, BHXH, ATVSLĐ & Chứng chỉ Nghiệp vụ** | Hợp đồng lao động, làm ca đêm/ngày lễ, BHXH bắt buộc, trang bị phương tiện bảo hộ lao động, và **chứng chỉ/huấn luyện nghiệp vụ bắt buộc** (huấn luyện nghiệp vụ PCCC, nghiệp vụ bảo vệ môi trường, an toàn thực phẩm...) cho cán bộ quản lý và nhân viên trực tiếp. |
| `P7_ENVIRONMENT_ANCILLARY_LOCAL` | **7. Môi trường, Dịch vụ Phụ trợ & Đặc thù Địa phương** | Giấy phép môi trường / Đăng ký môi trường, quản lý chất thải nguy hại, ứng phó sự cố; dịch vụ phụ trợ đi kèm; và **Văn bản QPPL của HĐND/UBND tỉnh**. |
| `P8_PENALTIES_INSPECTION` | **8. Chế tài Xử phạt VPHC & Hồ sơ Đón Đoàn Kiểm tra** | Toàn bộ các Nghị định xử phạt vi phạm hành chính tương ứng với 7 trụ cột trên (mức phạt tiền đối với cá nhân/tổ chức, hình thức phạt bổ sung như tước Giấy chứng nhận, đình chỉ hoạt động) và bộ danh mục hồ sơ chuẩn bị sẵn tại cơ sở. |

---

## 4 Quy tắc Vàng Rút Kinh nghiệm Thực chiến (Hard-Won Rules)

### 1. Quy tắc Chống Nhầm Điều/Khoản Khi Đọc "Omnibus Decrees / Laws" (Nghị định/Luật sửa đổi nhiều văn bản)
- Các Nghị định sửa đổi nhiều nghị định (ví dụ: `Nghị định 49/2026/NĐ-CP` sửa đổi các NĐ 71/2024, 88/2024, 101/2024 tại Điều 12, 102/2024 tại Điều 13; hoặc `Nghị định 08/2018/NĐ-CP` sửa đổi 8 lĩnh vực theo từng Chương) thường lặp lại cấu trúc khoản (`"11. Bãi bỏ..."`, `"12. Sửa đổi, bổ sung..."`).
- **TUYỆT ĐỐI KHÔNG đọc đoạn cắt rời (snippet) mà không kiểm tra tiêu đề Chương và Điều bao ngoài (`Parent Article Header`)**.
- Bắt buộc dùng lệnh `locate-citation` của `scripts/vbpl-engine.mjs` để lấy đường dẫn phân cấp đầy đủ (`Chương > Điều > Khoản`) trước khi trích dẫn:
  ```sh
  node scripts/vbpl-engine.mjs locate-citation --id <documentId> --query "<Điều hoặc từ khóa>"
  ```

### 2. Quy tắc Kiểm tra "Điều khoản Thi hành / Hiệu lực Thi hành" ở Cuối Văn bản Mới
- Khi một Luật hoặc Nghị định mới ban hành, luôn phải đọc kỹ điều khoản **Hiệu lực thi hành** và **Quy định chuyển tiếp** ở cuối văn bản (trước phần Phụ lục).
- Kiểm tra xem điều khoản thi hành đó có **bãi bỏ một phần các điều, khoản, điểm hoặc Phụ lục / Biểu mẫu** của văn bản trước đó hay không, và có giao quyền cho UBND cấp tỉnh ban hành quy định phân cấp / trình tự thủ tục hành chính mới hay không.

### 3. Quy tắc Xử lý Địa bàn Vừa Sáp nhập / Sắp xếp Đơn vị Hành chính & Chính quyền 2 Cấp
- **Tra cứu mã đơn vị hành chính trên `vbpl.vn`**: Gọi `listProvinces` để lấy `id` (UUID) của tỉnh mới sau sáp nhập.
- **Nguyên tắc áp dụng văn bản QPPL của địa phương sau sáp nhập** (căn cứ Luật Ban hành văn bản quy phạm pháp luật năm 2025):
  - Nếu HĐND/UBND tỉnh mới **đã ban hành văn bản QPPL mới** điều chỉnh lĩnh vực đó trên toàn tỉnh mới -> **Áp dụng thống nhất văn bản mới của tỉnh mới**.
  - Đối với các vấn đề mà HĐND/UBND tỉnh mới **chưa ban hành văn bản thay thế**, các văn bản QPPL của HĐND/UBND tỉnh trước khi sáp nhập **tiếp tục có hiệu lực trong phạm vi địa giới hành chính cũ** cho đến khi bị sửa đổi, bổ sung, thay thế hoặc bãi bỏ.
- **Mô hình chính quyền địa phương 2 cấp (cấp Tỉnh và cấp Xã/Phường, không còn cấp Huyện)** theo Luật Tổ chức chính quyền địa phương số `72/2025/QH15`: kiểm tra kỹ Quyết định phân cấp của UBND tỉnh xem thủ tục đối với **cá nhân** đã được phân cấp về **Chủ tịch UBND cấp xã (xã, phường)** hay chưa, và thủ tục đối với **tổ chức** thuộc **UBND tỉnh / Sở chuyên ngành**.

### 4. Quy tắc Bảo lưu / Bất hồi tố Đối với Cơ sở Kinh doanh Hiện hữu Lâu năm
- Khi người dùng hỏi về một cơ sở đã xây dựng và vận hành hợp pháp từ nhiều năm trước (trước khi có quy hoạch mới hoặc luật đất đai mới):
  1. Kiểm tra ngay xem điều kiện quy hoạch cũ đã bị bãi bỏ chưa và có quy định **miễn nộp tài liệu chứng minh tính hợp pháp về xây dựng khi đề nghị cấp lại giấy phép** (nếu không xây mới hoặc cải tạo mở rộng) hay không.
  2. Phân biệt rõ giữa **tính hợp pháp về xây dựng & an toàn đưa vào sử dụng** (được chứng minh bằng *Giấy phép xây dựng/cải tạo + Văn bản nghiệm thu PCCC*) và **thủ tục hành chính đăng ký bổ sung quyền sở hữu công trình lên Sổ đỏ**.
  3. Ưu tiên giải pháp **Đăng ký sử dụng đất kết hợp đa mục đích** (ví dụ: Đất ở kết hợp thương mại, dịch vụ theo Điều 218 Luật Đất đai 2024, Điều 99 Nghị định 102/2024/NĐ-CP và Điểm a Khoản 12 Điều 13 Nghị định 49/2026/NĐ-CP) để vừa giữ nguyên loại đất chính lâu dài trên Sổ đỏ, vừa đồng bộ hóa mục đích thương mại dịch vụ hiện hữu.

---

## Quy trình Thực thi Từng bước (Step-by-Step Workflow)

### Bước 1: Thiết kế Cấu hình Hồ sơ Chủ đề (`profile.json`)
Tạo tệp cấu hình cho chủ đề tại `dossiers/<slug>/profile.json` (tham khảo mẫu `examples/profile.template.json`) và chạy lệnh khởi tạo:
```sh
node scripts/vbpl-engine.mjs init-dossier --config dossiers/<slug>/profile.json
```

### Bước 2: Chạy Khám phá & Mở rộng Đồ thị Lược đồ (`discover`)
```sh
node scripts/vbpl-engine.mjs discover --slug <slug> --update-snapshot
```

### Bước 3: Đọc Toàn văn & Định vị Chính xác Điều/Khoản (`read-doc` & `locate-citation`)
```sh
# Đọc toàn văn không bị cắt cụt (kể cả văn bản >500KB và Phụ lục cuối văn bản):
node scripts/vbpl-engine.mjs read-doc --id <documentId>

# Định vị chính xác Chương > Điều > Khoản cho từ khóa/điều luật:
node scripts/vbpl-engine.mjs locate-citation --id <documentId> --query "<từ khóa>"
```

### Bước 4: Biên soạn Cẩm nang Tuân thủ Toàn diện (`dossiers/<slug>/compliance_playbook.md`)
Soạn thảo tài liệu `compliance_playbook.md` gồm:
1. Tổng quan & Bối cảnh Địa giới Pháp lý (chính quyền 2 cấp Tỉnh - Xã/Phường & quy định chuyển tiếp).
2. Chi tiết 8 Trụ cột Pháp lý (kèm link `https://vbpl.vn/van-ban/chi-tiet/<id>` và trích dẫn chính xác Điểm, Khoản, Điều).
3. Lộ trình Thực hiện Theo Vòng đời (Lifecycle Roadmap).
4. Bảng Đối chiếu Hành vi Vi phạm & Mức phạt VPHC (Risk & Penalty Matrix).
5. Danh mục Hồ sơ Pháp lý Chuẩn bị Đón Đoàn Kiểm tra Liên ngành (Inspection Binder).

### Bước 5: Kiểm toán Pháp chế (`vn-legal-qc-auditor`), Trực quan hóa (`vn-legal-visualizer`) & Soạn Hồ sơ (`.docx`)
- **Bắt buộc** kích hoạt skill `vn-legal-qc-auditor` (bao gồm `--verify-citations`) để kiểm tra tự động và đối chiếu chéo từng Điều/Khoản trước khi bàn giao kết quả.
- Kích hoạt skill `vn-legal-visualizer` để tạo sơ đồ Mermaid và Bảng điều khiển Tương tác HTML.
- Khi người dùng cần bộ hồ sơ/đơn từ đi nộp, kích hoạt skill `vn-legal-dossier-drafter` để xuất bộ file Word (`.docx`) chuẩn Nghị định 30/2020/NĐ-CP.
