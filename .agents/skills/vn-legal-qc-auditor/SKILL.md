---
name: vn-legal-qc-auditor
description: >-
  Kiểm toán chất lượng pháp chế (QC Audit) và kiểm chứng chéo 2 lớp (Double-Check)
  đối với mọi hồ sơ, khuyến nghị, đơn từ và báo cáo cập nhật pháp luật Việt Nam dựa trên
  CSDL quốc gia https://vbpl.vn. Sử dụng bắt buộc sau khi lập hồ sơ pháp lý, soạn đơn từ
  hoặc báo cáo biến động để đảm bảo không trích dẫn văn bản hết hiệu lực, không lệch
  số Điều/Khoản trong văn bản sửa đổi nhiều nghị định (Omnibus) và đủ 8 trụ cột tuân thủ.
---

# Kiểm toán Pháp chế & Double-Check 2 Lớp (`vn-legal-qc-auditor`)

Skill này đóng vai trò là **Cổng Kiểm soát Chất lượng Pháp chế Độc lập (Legal Quality Assurance Gate)**. Không một bản tư vấn pháp lý, bộ hồ sơ `.docx` đi nộp hay báo cáo cập nhật nào được phép gửi tới người dùng nếu chưa vượt qua quy trình kiểm toán 2 lớp dưới đây.

---

## Kiến trúc Kiểm toán 2 Lớp (Dual-Layer Verification)

### Lớp 1: Kiểm chứng Định lượng & Đối chiếu Điều/Khoản Tự động (`vbpl-qc-audit.mjs`)

Chạy công cụ kiểm chứng tự động trực tiếp trên hồ sơ `dossiers/<slug>/` và các văn bản/mẫu đơn đã soạn:

```sh
# Kiểm toán toàn bộ hồ sơ chủ đề kèm đối chiếu nguyên văn Điều/Khoản (Gate 1 -> Gate 6):
node scripts/vbpl-qc-audit.mjs audit --slug <slug> --live-recheck --verify-citations

# Kiểm toán nguyên văn từng trích dẫn Điều/Khoản trong một file bất kỳ (đơn từ, công văn, phương án):
node scripts/vbpl-qc-audit.mjs verify-file --slug <slug> --file <path-to-file>
```

Công cụ này tự động kiểm tra **6 cổng kỹ thuật cứng (6 Deterministic Gates)**:
1. **Gate 1 — Độ phủ 8 Trụ cột Pháp lý (`8-Pillar Coverage`)**: Đảm bảo cả 8 trụ cột (`P1_ENTITY_LICENSING` đến `P8_PENALTIES_INSPECTION`) đều có văn bản pháp luật đang có hiệu lực (`CHL`, `HHL1P`, hoặc `VBHN`).
2. **Gate 2 — Kiểm tra Thực tế Mã `ItemID` & Tình trạng Hiệu lực (`Live Validity Gate`)**: Đối chiếu trực tiếp với `https://vbpl.vn` qua `getDocumentAttributes` để đảm bảo không có văn bản "ảo" (hallucinated law) và phát hiện ngay nếu một văn bản đã chuyển sang trạng thái `"Hết hiệu lực toàn bộ"` (`HHL`).
3. **Gate 3 — Kiểm tra Tính Toàn vẹn Lược đồ Sửa đổi / Bổ sung (`Amendment Graph Integrity`)**: Nếu một văn bản trong hồ sơ có trạng thái `"Hết hiệu lực một phần"` (`HHL1P`), script kiểm tra `incomingRelations` (`10`: Sửa đổi, bổ sung; `13`: Bổ sung; `16`: Sửa đổi) để cảnh báo nếu có văn bản sửa đổi/bổ sung chuyên ngành chưa được đưa vào đồ thị.
4. **Gate 4 — Kiểm tra Trích dẫn Văn bản Hết hiệu lực (`Expired Law Gate`)**: Quét toàn bộ `compliance_playbook.md`; nếu phát hiện trích dẫn một văn bản có mã `HHL` mà không kèm ghi chú rõ ràng (`"đã hết hiệu lực"`, `"được thay thế bởi..."`), cổng QC lập tức báo lỗi `CRITICAL` (`FAIL`).
5. **Gate 5 — Kiểm tra Phân tích Hiệu lực Chuyển tiếp Sau Sáp nhập Tỉnh/Xã (`Merger Transitional Analysis`)**: Khi hồ sơ có cờ `requiresMergerAnalysis: true`, kiểm tra việc phân tích hiệu lực không gian của văn bản QPPL địa phương giữa đơn vị hành chính cũ và mới.
6. **Gate 6 — Đối chiếu Nguyên văn Từng Trích dẫn Điều / Khoản / Điểm & Chống Lệch Điều Omnibus (`Verbatim Clause & Omnibus Target Cross-Check`)**:
   - Tự động bóc tách mọi cụm trích dẫn dạng `Điểm ... Khoản ... Điều ... Nghị định/Luật/Thông tư/Quyết định số ...` trong Playbook hoặc hồ sơ đơn từ.
   - Tải toàn văn văn bản từ `vbpl.vn` (đã chuẩn hóa Unicode `NFC`), phân tích cây cấu trúc `Chương -> Điều -> Khoản` và kiểm tra:
     - `Điều X` có tồn tại thực sự trong văn bản đó không? (`NONEXISTENT_ARTICLE_CITATION`)
     - `Khoản Y` có tồn tại dưới `Điều X` đó không? (`NONEXISTENT_CLAUSE_CITATION`)
     - Nếu `Điều X` là điều khoản sửa đổi nhiều văn bản (*Omnibus Amendment Article*, ví dụ: *"Điều 12. Sửa đổi, bổ sung một số điều của Nghị định số 101/2024/NĐ-CP"* trong khi *"Điều 13. Sửa đổi, bổ sung một số điều của Nghị định số 102/2024/NĐ-CP"*), script tự động kiểm tra số hiệu văn bản đích được nhắc tới trong cùng câu văn. Nếu phát hiện trích nhầm sang Điều sửa đổi văn bản khác (ví dụ ghi `Khoản 12 Điều 12` thay vì `Khoản 12 Điều 13`, hoặc ghi `Khoản 11 Điều 4` lĩnh vực thuốc lá thay vì `Khoản 1 Điều 2` lĩnh vực xăng dầu), script lập tức báo lỗi `CRITICAL: MISMATCHED_OMNIBUS_ARTICLE`!

---

### Lớp 2: Phản biện Độc lập bằng Subagent ("Đoàn Thanh tra Liên ngành Ảo")

Sau khi Lớp 1 đạt kết quả (`PASS` hoặc `PASS_WITH_WARNINGS`), khởi chạy một subagent độc lập (`invoke_subagent` với `TypeName: "research"`, `Role: "Legal QC Auditor & Inter-agency Inspector"`) để thực hiện **Red-Team Audit**:

#### Nhiệm vụ giao cho Subagent Kiểm toán:
1. Đọc độc lập `dossiers/<slug>/compliance_playbook.md`, `dossiers/<slug>/legal_graph.json`, `dossiers/<slug>/reports/qc_audit_report.json` và các dự thảo đơn từ/hồ sơ hành chính (nếu có).
2. Đóng vai **Đoàn Kiểm tra Liên ngành** để kiểm tra:
   - Các con số định lượng (giờ đóng/mở cửa, diện tích, khoảng cách an toàn, thời hạn nộp hồ sơ là *ngày* hay *ngày làm việc*, số hiệu Mẫu đơn tại Phụ lục, mức phạt tiền, thuế suất) có khớp 100% với văn bản gốc không?
   - Kiểm tra điều khoản **Hiệu lực thi hành / Bãi bỏ một phần** ở cuối các Nghị định mới ban hành xem có làm hết hiệu lực điểm/phụ lục nào của Nghị định trước đó không.
   - Có mâu thuẫn nào giữa văn bản cấp dưới (Thông tư, Quyết định UBND tỉnh) với văn bản cấp trên mới ban hành (Luật, Nghị định mới) không?
3. Trả về **Biên bản Phản biện Pháp chế (Red-Team Audit Verdict)**.

---

## Quy tắc Chốt Chất lượng (Sign-Off Rule)

- Nếu Lớp 1 trả về `FAIL` (hoặc `errorCount > 0` khi chạy `verify-file`) hoặc Subagent Lớp 2 phát hiện sai sót về trích dẫn Điều/Khoản, số hiệu biểu mẫu, hiệu lực văn bản: **Bắt buộc hiệu chỉnh ngay và chạy lại `vbpl-qc-audit.mjs` cho đến khi đạt `PASS` với `0` lỗi trích dẫn**.
