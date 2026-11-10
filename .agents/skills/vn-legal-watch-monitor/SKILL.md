---
name: vn-legal-watch-monitor
description: >-
  Theo dõi tự động định kỳ (hàng tuần, hàng ngày hoặc tùy chỉnh) một chủ đề/hồ sơ
  pháp luật trên https://vbpl.vn; tự động phát hiện văn bản mới ban hành, văn bản
  sắp có hiệu lực hoặc sự thay đổi hiệu lực/lược đồ của các văn bản đang theo dõi,
  phân tích tác động tuân thủ (làm thêm gì, bớt được gì, thay đổi gì) và đưa ra khuyến cáo.
---

# Hệ thống Radar Theo dõi & Phân tích Biến động Pháp luật (`vn-legal-watch-monitor`)

Skill này vận hành quy trình **Continuous Legal Compliance Monitoring** cho bất kỳ hồ sơ chủ đề (`dossiers/<slug>/`) nào đã được khởi tạo, giúp người dùng luôn biết trước và thích ứng kịp thời khi pháp luật thay đổi.

---

## Cơ chế Quét Biến động 3 Chiều (3-Way Legal Radar)

Mỗi lần chạy kiểm tra định kỳ qua script `scripts/vbpl-watch.mjs`, hệ thống thực hiện đồng thời 3 kênh quét trên `https://vbpl.vn`:

```sh
node scripts/vbpl-watch.mjs scan --slug <slug>
```

1. **Kênh 1 — Rà soát Biến động Trực tiếp trên Lược đồ & Thuộc tính (`Direct Status & Lược đồ Scan`)**:
   - Truy vấn lại `getDocumentAttributes` và `getDocumentDiagram` cho các văn bản cốt lõi trong `dossiers/<slug>/legal_graph.json` và đối chiếu với bản chụp chuẩn (`snapshots/latest.json`).
   - Phát hiện tức thì nếu một văn bản đang áp dụng chuyển trạng thái (ví dụ từ *"Còn hiệu lực"* sang *"Hết hiệu lực một phần"* hoặc *"Hết hiệu lực toàn bộ"*), hoặc có thêm một văn bản mới xuất hiện trong mục *"Văn bản sửa đổi, bổ sung"* (`10`), *"Văn bản thay thế"* (`12`), hay *"Văn bản quy định chi tiết/hướng dẫn"* (`9`) trên Lược đồ!
2. **Kênh 2 — Quét Văn bản Mới theo Từ khóa 8 Trụ cột & Địa phương (`changesOnly` Watch)**:
   - Sử dụng tính năng `changesOnly: true` và `watch` của `api-anything` trên `searchDocuments` (Trung ương) và `searchLocalDocuments` (UBND/HĐND tỉnh) để chỉ lọc ra các văn bản **mới xuất hiện kể từ lần quét trước**.
3. **Kênh 3 — Cảnh báo Sớm Văn bản Sắp Có Hiệu Lực (`Upcoming Effective Date Horizon`)**:
   - Rà soát tất cả các văn bản trong hồ sơ có trạng thái `"Chưa có hiệu lực"` (`CCHL`) hoặc có ngày hiệu lực (`effFrom`) nằm trong khoảng 90 ngày tới / 30 ngày vừa qua để nhắc nhở người dùng chuẩn bị trước ngày luật có hiệu lực.

---

## Quy trình Phân tích & Khuyến nghị Khi Có Văn bản Mới (Compliance Delta Protocol)

Khi báo cáo `dossiers/<slug>/reports/latest_delta.json` ghi nhận biến động (`hasMaterialChanges: true` hoặc có cảnh báo `upcomingEffectiveAlerts`):

### Bước 1: Đọc Toàn văn & Định vị Điều/Khoản Văn bản Mới
```sh
node scripts/vbpl-engine.mjs read-doc --id <newDocumentId>
node scripts/vbpl-engine.mjs locate-citation --id <newDocumentId> --query "<từ khóa>"
```
> **Lưu ý quan trọng**: Luôn kiểm tra kỹ điều khoản **Hiệu lực thi hành** và **Quy định chuyển tiếp** ở cuối văn bản mới để xem văn bản mới có bãi bỏ một phần các điều, khoản, điểm hoặc Phụ lục/Biểu mẫu của các văn bản đang theo dõi hay không.

### Bước 2: Phân tích Ma trận Tác động Tuân thủ (4 Nhóm Khuyến nghị)
Bắt buộc bóc tách sự thay đổi thành 4 nhóm hành động rõ ràng cho người dùng:
1. ➕ **LÀM THÊM ĐIỀU GÌ (New Obligations / Stricter Rules)**:
   - Phát sinh giấy phép mới, hồ sơ mới, thiết bị kỹ thuật mới, hay nghĩa vụ báo cáo/kết nối dữ liệu mới nào?
   - Thời hạn cuối cùng phải hoàn thành là ngày nào?
2. ➖ **BỚT ĐƯỢC ĐIỀU GÌ (Removed / Simplified Rules)**:
   - Điều kiện kinh doanh, thủ tục hành chính, giấy tờ hoặc tần suất báo cáo nào đã được bãi bỏ/cắt giảm?
3. 🔄 **THAY ĐỔI QUY TRÌNH / THẨM QUYỀN / MỨC PHẠT (Modified Rules)**:
   - Có sự thay đổi về cơ quan tiếp nhận hồ sơ (ví dụ: phân cấp từ Bộ về UBND tỉnh/Sở, hoặc từ UBND tỉnh về Chủ tịch UBND cấp xã) không?
   - Khung xử phạt vi phạm hành chính tăng hay giảm?
4. ⏳ **QUY ĐỊNH CHUYỂP TIẾP (Transitional Provisions)**:
   - Cơ sở đang hoạt động hợp pháp hoặc đã được cấp Giấy chứng nhận trước ngày văn bản mới có hiệu lực thì được tiếp tục sử dụng Giấy chứng nhận cũ đến hết thời hạn ghi trên giấy hay phải làm thủ tục cấp đổi ngay?

### Bước 3: Cập nhật Hồ sơ Chủ đề & Kiểm toán QC
- Cập nhật `dossiers/<slug>/legal_graph.json` và `dossiers/<slug>/compliance_playbook.md`.
- Chạy `node scripts/vbpl-watch.mjs scan --slug <slug> --commit-snapshot` để lưu mốc snapshot mới.
- Chạy `node scripts/vbpl-qc-audit.mjs audit --slug <slug> --verify-citations` để kiểm chứng lại toàn bộ trích dẫn trước khi báo cáo người dùng.

---

## Thiết lập Lịch Tự động Định kỳ (Scheduled Automation Sidecar)

Để thiết lập lịch tự động chạy hàng tuần (mặc định **08:30 sáng Thứ Hai hàng tuần theo giờ Việt Nam — `CRON_TZ=Asia/Ho_Chi_Minh 30 8 * * 1`** hoặc theo tần suất người dùng yêu cầu), tạo cấu hình Scheduled Automation theo chuẩn skill `automation` tại:

`~/.gemini/config/sidecars/vn-legal-watch-<slug>/sidecar.json`

Mẫu cấu hình chuẩn (thay `<REPO_ROOT>` bằng đường dẫn tuyệt đối tới thư mục repository trên máy người dùng):
```json
{
  "builtin": "schedule",
  "args": [
    "CRON_TZ=Asia/Ho_Chi_Minh 30 8 * * 1",
    "agentapi",
    "new-conversation",
    "--",
    "Sử dụng skill vn-legal-watch-monitor để quét biến động văn bản pháp luật hàng tuần cho hồ sơ '<slug>' bằng lệnh: node '<REPO_ROOT>/scripts/vbpl-watch.mjs' scan --slug <slug>. Nếu phát hiện văn bản mới, thay đổi hiệu lực trên Lược đồ hoặc văn bản sắp có hiệu lực, hãy đọc toàn văn, phân tích rõ: (1) Cần làm thêm điều gì, (2) Bớt được điều gì, (3) Thay đổi thủ tục/mức phạt gì, (4) Quy định chuyển tiếp, kiểm tra QC bằng vn-legal-qc-auditor (--verify-citations) và cập nhật báo cáo cho người dùng."
  ],
  "restart_policy": "always",
  "display_name": "Theo dõi Pháp luật Hàng tuần: <Tên Chủ đề>",
  "description": "Mỗi sáng Thứ Hai lúc 08:30 (Asia/Ho_Chi_Minh), tự động rà soát vbpl.vn để phát hiện văn bản pháp luật mới hoặc thay đổi hiệu lực liên quan đến hồ sơ <slug> và đưa ra khuyến nghị tuân thủ.",
  "agent_permissions": {
    "workspace_uris": [
      "file://<REPO_ROOT>"
    ],
    "access_grants": [
      "command(node <REPO_ROOT>/scripts/vbpl-watch.mjs)",
      "command(node <REPO_ROOT>/scripts/vbpl-engine.mjs)",
      "command(node <REPO_ROOT>/scripts/vbpl-qc-audit.mjs)",
      "mcp(api-anything/call_operation)",
      "read_file(<REPO_ROOT>/dossiers)",
      "write_file(<REPO_ROOT>/dossiers)"
    ]
  }
}
```
> [!IMPORTANT]
> Sau khi tạo tệp `sidecar.json`, luôn hướng dẫn người dùng bật tự động hóa trong bảng điều khiển bằng liên kết: `[Open Automations Dashboard](sidecar://dashboard)` (không tự ý sửa `user_config.json`).
