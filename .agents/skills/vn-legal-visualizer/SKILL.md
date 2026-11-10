---
name: vn-legal-visualizer
description: >-
  Trực quan hóa và hình ảnh hóa hệ thống văn bản quy phạm pháp luật Việt Nam,
  lược đồ hiệu lực, lộ trình xin cấp phép và ma trận tuân thủ 8 trụ cột bằng sơ đồ
  Mermaid và Bảng điều khiển HTML tương tác (Generative UI). Sử dụng khi cần minh họa
  hệ thống quy định pháp luật phức tạp, sơ đồ quan hệ văn bản hoặc tạo công cụ
  checklist tự kiểm tra tuân thủ và tính toán rủi ro mức phạt.
---

# Trực quan hóa Hệ thống Pháp luật & Bảng Điều khiển Tuân thủ (`vn-legal-visualizer`)

Skill này chuyển hóa các văn bản pháp luật khô khan và đồ thị `dossiers/<slug>/legal_graph.json` thành **2 tầng trực quan hóa**:
1. **Hệ thống Sơ đồ Mermaid Chuẩn hóa** (nhúng trong Artifact / Báo cáo Markdown).
2. **Bảng Điều khiển Tuân thủ Tương tác (Interactive Legal Compliance Cockpit - HTML Artifact)** theo chuẩn `generative_ui`.

---

## Tầng 1: Bộ 3 Sơ đồ Mermaid Chuẩn hóa

Trong mỗi hồ sơ chủ đề hoặc báo cáo tư vấn, luôn xây dựng tối thiểu 2 trong 3 sơ đồ Mermaid sau:

### 1. Sơ đồ Lược đồ & Thứ bậc Pháp lý (`flowchart TD` / `flowchart LR`)
- Minh họa rõ thứ bậc hiệu lực từ **Luật / Nghị quyết QH** → **Nghị định Chính phủ (Gốc & Sửa đổi, bổ sung / VBHN)** → **Thông tư Bộ chuyên ngành / Quy chuẩn QCVN** → **Quyết định UBND Tỉnh / Văn bản chuyển tiếp địa phương** → **Nghị định Xử phạt VPHC**.
- Quy ước nhãn trạng thái:
  - `[Còn hiệu lực]` hoặc `[Hết hiệu lực 1 phần - Đã sửa đổi bởi ...]`
  - `[Sắp có hiệu lực]`
  - `[Văn bản hợp nhất]`
- Lưu ý cú pháp Mermaid: Luôn đặt nhãn nút có dấu ngoặc đơn hoặc ký tự đặc biệt trong dấu ngoặc kép `id["Nhãn (Chi tiết)"]`, không dùng thẻ HTML trong nhãn.

### 2. Lưu đồ Quy trình Cấp phép & Vận hành Theo Vòng đời (`flowchart TD`)
- Minh họa thứ tự trước-sau của các thủ tục: *Thành lập doanh nghiệp & Đăng ký địa điểm / Đất đai → Thẩm duyệt/Nghiệm thu PCCC & Môi trường & Đấu nối → Kiểm định đo lường & Huấn luyện nghiệp vụ → Xin cấp Giấy chứng nhận đủ điều kiện → Vận hành hàng ngày (Giờ mở cửa, Hóa đơn điện tử từng lần bán)*.

### 3. Sơ đồ Tác động Khi Có Văn bản Mới (`flowchart LR` - dùng cho Watch/Delta)
- So sánh trực quan **Trước khi có văn bản mới** và **Sau khi có văn bản mới** (Làm thêm gì / Bớt được gì / Thay đổi cơ quan hoặc mức phạt nào).

---

## Tầng 2: Bảng Điều khiển HTML Tương tác (Interactive Legal Compliance Cockpit)

Sử dụng kỹ thuật của skill `generative_ui` để tạo một tệp HTML độc lập (`.html`) trong thư mục Artifact (`<appDataDir>/brain/<conversation-id>/<slug>_compliance_cockpit.html` và bản lưu tại `dossiers/<slug>/visual_cockpit.html`), sử dụng:
- `<script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>`
- Các biến màu ngữ nghĩa của Antigravity (`bg-[var(--background)]`, `bg-[var(--card)]`, `text-[var(--foreground)]`, `text-[var(--muted-foreground)]`, `border-[var(--border)]`, không khai báo `:root` fallback, không dùng cỡ chữ dưới `12px`/`text-xs`).

### 4 Phân hệ Tương tác Bắt buộc trong HTML Cockpit:
1. **Thanh Tổng quan & Bộ lọc 8 Trụ cột (8-Pillar Explorer)**:
   - Hiển thị 8 thẻ trụ cột kèm số lượng văn bản hiệu lực; bấm vào từng trụ cột để lọc danh sách văn bản và nghĩa vụ tương ứng.
   - Tìm kiếm tức thì (instant search) theo số hiệu văn bản, từ khóa, hoặc hành vi vi phạm.
2. **Sơ đồ Phả hệ & Lược đồ Văn bản Tương tác (Interactive Legal Graph)**:
   - Hiển thị các thẻ văn bản phân màu theo trạng thái hiệu lực (`Còn hiệu lực`, `Hết hiệu lực một phần`, `Văn bản hợp nhất`, `Văn bản địa phương`), hiển thị rõ mối quan hệ *Sửa đổi, bổ sung / Hướng dẫn / Căn cứ* và nút bấm mở trực tiếp `https://vbpl.vn/van-ban/chi-tiet/<id>`.
3. **Checklist Tự Kiểm tra Tuân thủ & Máy tính Rủi ro Thanh tra (Interactive Compliance & Penalty Calculator)**:
   - Danh sách các hạng mục tuân thủ thực tế chia theo giai đoạn (Trước khi mở cửa / Khi vận hành hàng ngày / Định kỳ).
   - Mỗi hạng mục gắn với **mức phạt tiền dự kiến (VNĐ)** và **hình thức phạt bổ sung (tước giấy phép/đình chỉ)** theo Nghị định xử phạt VPHC.
   - Khi người dùng đánh dấu (check/uncheck) các mục đã hoàn thành, bảng điều khiển **tự động tính toán Điểm Tuân thủ (%) và Tổng mức rủi ro tiền phạt tiềm ẩn (VNĐ)** nếu đoàn kiểm tra liên ngành kiểm tra ngay lúc đó!
4. **Hộp cảnh báo Địa phương & Lịch sử Kiểm toán QC (Local Merger & QC Badge)**:
   - Hiển thị rõ quy tắc áp dụng văn bản tại địa phương (ví dụ: thẩm quyền chính quyền 2 cấp Tỉnh - Xã/Phường và quy tắc chuyển tiếp sau sáp nhập tỉnh) cùng kết quả điểm số từ `vn-legal-qc-auditor`.
