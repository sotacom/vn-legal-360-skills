---
name: vn-legal-dossier-drafter
description: >-
  Soạn thảo trọn bộ hồ sơ thủ tục hành chính, đơn đề nghị theo biểu mẫu pháp định,
  phương án sử dụng đất/kinh doanh, công văn giải trình & bảo lưu điều kiện pháp lý
  kèm bảng kê giấy tờ cần chuẩn bị và hướng dẫn nơi nộp theo chuẩn thể thức văn bản
  hành chính Nghị định 30/2020/NĐ-CP (xuất trực tiếp ra file Microsoft Word .docx).
  Sử dụng khi người dùng yêu cầu soạn hồ sơ đi nộp, làm đơn, lập phương án hoặc
  soạn công văn giải trình với cơ quan nhà nước.
---

# Soạn thảo Hồ sơ Thủ tục Hành chính & Công văn Giải trình Chuẩn `.docx` (`vn-legal-dossier-drafter`)

Skill này biến kết quả rà soát pháp luật thành **bộ hồ sơ hành chính thực chiến sẵn sàng in và điền thông tin để nộp ngay** dưới định dạng Microsoft Word (`.docx`) tuân thủ đúng chuẩn thể thức của **Nghị định số 30/2020/NĐ-CP** (khổ giấy A4, lề trên 20mm, lề dưới 20mm, lề trái 30mm, lề phải 15mm, phông chữ `Times New Roman` cỡ 13pt, Quốc hiệu - Tiêu ngữ chuẩn).

---

## 5 Nguyên tắc Thực chiến Bắt buộc Khi Soạn Hồ sơ Đi Nộp (Lessons Learned)

### 1. Truy xuất Nguyên văn Biểu mẫu Pháp định & Điều khoản Thi hành Cuối Văn bản
- Luôn dùng lệnh `read-doc` hoặc `locate-citation` của `scripts/vbpl-engine.mjs` để đọc đến tận phần **Phụ lục / Biểu mẫu** và **Điều khoản thi hành / Hiệu lực thi hành** ở cuối văn bản mới nhất.
- **Cảnh giác cao độ với sự thay đổi số hiệu Biểu mẫu và sự bãi bỏ một phần Phụ lục**:
  - Ví dụ: Một Nghị định mới (như `Nghị định 49/2026/NĐ-CP` tại `Khoản 3 Điều 16`) có thể bãi bỏ một số điểm/phụ lục của Nghị định trước đó (`Nghị định 151/2025/NĐ-CP`) và giao quyền cho UBND cấp tỉnh quy định trình tự, thủ tục hành chính (`Khoản 1 Điều 15`). Trong trường hợp giao thời, tiêu đề Đơn nên dẫn chiếu **song hành** cả mẫu theo Nghị định chuyên ngành và điều khoản chuyển tiếp của Nghị định mới nhất để không bộ phận Một cửa nào bắt bẻ về số hiệu mẫu đơn.

### 2. Cấu trúc Hóa Nội dung Phương án Khớp 1:1 Với Các Điểm `a, b, c, d, đ, e, g` Trong Điều Luật
- Khi luật hoặc nghị định quy định *"Nội dung phương án bao gồm: a)...; b)...; c)...; d)...; đ)...; e)...; g)..."*, tuyệt đối **không gộp chung các điểm với nhau**.
- Phải tách các mục lớn trong văn bản Phương án **khớp đúng thứ tự từng điểm `a, b, c, d, đ, e, g`** và mở ngoặc ghi rõ `(Điểm ... Khoản ... Điều ... Nghị định số ...)` ngay trên tiêu đề từng mục để chuyên viên thẩm định đối chiếu 1:1.

### 3. Phân biệt Rõ "Tính Hợp pháp Về Xây dựng" và "Đăng ký Quyền Sở hữu Tài sản Trên Sổ Đỏ"
- Đối với các cơ sở kinh doanh đã tồn tại lâu năm:
  - Phân biệt rõ giữa **(i) tính hợp pháp về xây dựng và an toàn đưa vào sử dụng** (được chứng minh bằng *Giấy phép xây dựng / cải tạo* + *Bản vẽ thiết kế được duyệt* + *Văn bản thẩm duyệt và nghiệm thu về PCCC*) với **(ii) thủ tục đăng ký bổ sung quyền sở hữu công trình xây dựng lên Giấy chứng nhận quyền sử dụng đất** (thủ tục đăng ký tài sản theo pháp luật đất đai).
  - Kiểm tra kỹ quy định **bảo lưu / miễn nộp tài liệu chứng minh tính hợp pháp về xây dựng khi đề nghị cấp lại giấy phép** đối với cơ sở hiện hữu không xây mới hoặc cải tạo mở rộng.
  - Nếu chủ cơ sở chưa làm thủ tục ghi nhận công trình lên Sổ đỏ hoặc thất lạc biên bản nghiệm thu nội bộ, soạn kèm **Báo cáo & Xác nhận hoàn thành thi công xây dựng công trình đưa vào sử dụng (nội bộ Chủ đầu tư)** kẹp chung với Giấy phép xây dựng và Văn bản nghiệm thu PCCC.

### 4. Kiểm tra Chéo Nguyên văn Từng Trích dẫn Điều / Khoản / Điểm Trước Khi Xuất File Word (`Gate 6`)
- **Tuyệt đối không trích dẫn theo trí nhớ** đối với các Nghị định sửa đổi nhiều văn bản (*Omnibus Decrees*).
- Trước khi xuất file `.docx`, BẮT BUỘC chạy lệnh định vị và kiểm chứng trích dẫn tự động:
  ```sh
  # 1. Định vị chính xác Chương > Điều > Khoản trong văn bản trên vbpl.vn:
  node scripts/vbpl-engine.mjs locate-citation --id <documentId> --query "<từ khóa hoặc điều khoản>"

  # 2. Kiểm toán tự động toàn bộ trích dẫn Điều/Khoản trong bản thảo:
  node scripts/vbpl-qc-audit.mjs verify-file --slug <slug> --file <path-to-draft.md-or-json>
  ```

### 5. Hướng dẫn "Nộp ở đâu" Chính xác Theo Mô hình Chính quyền Địa phương 2 Cấp (Tỉnh – Xã/Phường)
- Luôn phân tách rõ nơi nộp hồ sơ và cơ quan có thẩm quyền giải quyết theo 2 trường hợp chủ thể đứng tên trên Giấy chứng nhận:
  - **Trường hợp Cá nhân / Hộ gia đình**: Nộp tại **Trung tâm Phục vụ hành chính công cấp xã (UBND xã, phường nơi có đất/cơ sở)** theo Quyết định phân cấp của UBND tỉnh.
  - **Trường hợp Tổ chức kinh tế / Doanh nghiệp**: Nộp tại **Trung tâm Phục vụ hành chính công cấp tỉnh (Quầy tiếp nhận của Sở chuyên ngành)**.

---

## Quy trình Xuất Bộ Hồ sơ Word (`.docx`) Bằng `scripts/docx-drafter.py`

1. Tạo tệp đặc tả JSON cho bộ hồ sơ (tham khảo mẫu `examples/dossier_docx_spec.template.json`) bao gồm:
   - `01_Don_De_Nghi_...docx` (Đơn theo biểu mẫu pháp định);
   - `02_Phuong_An_...docx` (Phương án thuyết minh khớp từng điểm `a, b, c, d, đ, e, g`);
   - `03_Cong_Van_Giai_Trinh_...docx` (Công văn giải trình & bảo lưu điều kiện pháp lý gửi Sở chuyên ngành);
   - `04_Bien_Ban_Xac_Nhan_...docx` (Biên bản/Báo cáo xác nhận bổ trợ hồ sơ hoàn thành công trình, nếu cần);
   - `05_Bang_Ke_Ho_So_Va_Huong_Dan_Nop_Ho_So.docx` (Bảng kê Checklist giấy tờ cần chuẩn bị thêm & Hướng dẫn nộp ở đâu).
2. Chạy lệnh kiểm chứng trích dẫn `verify-file`:
   ```sh
   node scripts/vbpl-qc-audit.mjs verify-file --slug <slug> --file <path-to-spec.json>
   ```
3. Xuất ra các tệp Microsoft Word (`.docx`) chuẩn Nghị định 30/2020/NĐ-CP:
   ```sh
   python3 scripts/docx-drafter.py --spec <path-to-spec.json> --out-dir <target-subfolder>
   ```
