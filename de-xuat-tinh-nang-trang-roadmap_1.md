# Đề xuất tính năng — Trang Roadmap theo dõi tiến độ cho khách hàng

**Mục đích trang:** cho khách hàng tự theo dõi tiến độ phát triển (Mrag, Mosa, MultiContentBuilder, SmartBI) mà không cần hỏi lại đội ngũ; cho admin (bạn) toàn quyền cập nhật nội dung mà không cần sửa code mỗi lần.

**Cập nhật:** đăng nhập bằng Google đã được cài vào trang (mục 1.1-#1) — 2 email `vunm07@hdc-flowtech.com` và `hungnv01@hdc-flowtech.com` là admin, còn lại là khách hàng chỉ xem. Chi tiết và giới hạn của cách làm này ở phần *Ghi chú kỹ thuật* cuối tài liệu.

Tài liệu chia làm 2 góc nhìn — **Khách hàng xem gì** và **Admin cần công cụ gì** — vì hai vai trò dùng chung một trang nhưng cần quyền và giao diện khác nhau. Mỗi mục có mức ưu tiên để bạn chọn làm trước.

`P0` = cần có trước khi đưa cho khách hàng · `P1` = nên có sớm sau đó · `P2` = làm khi có thời gian

---

## Phần 1 — Tính năng phía Khách hàng (Customer View)

### 1.1 Truy cập & bảo mật

| # | Tính năng | Vì sao cần | Trạng thái |
|---|---|---|---|
| 1 | **Đăng nhập bằng Google (Gmail công ty)** | Đã chốt phương án: đăng nhập bằng tài khoản Google thay vì link kèm token. Phân quyền theo email:<br>• `vunm07@hdc-flowtech.com`, `hungnv01@hdc-flowtech.com` → **Admin** (toàn quyền chỉnh sửa)<br>• Mọi email còn lại đăng nhập được → **Khách hàng** (chỉ xem) | ✅ **Đã cài vào `roadmap.html`** — cần dán Google Client ID thật để chạy (xem *Ghi chú kỹ thuật*) |
| 2 | **Chế độ xem theo gói/hợp đồng** | Nếu mỗi khách hàng chỉ quan tâm 1–2 sản phẩm (vd. chỉ dùng Mrag + SmartBI), cho phép ẩn bớt sản phẩm không liên quan để đỡ rối. Hiện mọi tài khoản "Khách hàng" đang thấy **tất cả 4 sản phẩm** như nhau — chưa phân biệt từng khách. | P1 |
| 3 | **Watermark / nhãn "Bản dự kiến, có thể thay đổi"** | Tránh khách hàng hiểu nhầm ngày là cam kết hợp đồng. Nên hiện rõ ràng, không chỉ ở footer. | P0 |
| 3b | **Danh sách admin quản lý được** | Hiện danh sách email admin đang **hard-code trong code** (`ADMIN_EMAILS`). Khi cần thêm/bớt admin phải sửa file. Nên có màn hình quản lý danh sách này (chỉ admin thấy) thay vì sửa code mỗi lần. | P1 |

### 1.2 Theo dõi tiến độ (phần lõi)

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 4 | **Trạng thái từng hạng mục** (Chưa bắt đầu / Đang làm / Hoàn thành / Trễ tiến độ / Tạm hoãn) | Hiện tại Gantt chỉ có vị trí trên timeline — khách hàng không biết việc đó **thực sự đến đâu**. Đây là thông tin quan trọng nhất họ cần. Gợi ý màu: xám / xanh dương / xanh lá / đỏ / vàng. | **P0** |
| 5 | **% hoàn thành trên mỗi thanh** | Trực quan hoá nhanh hơn là phải đọc trạng thái chữ. Có thể hiện dạng thanh fill bên trong bar. | P1 |
| 6 | **"Đang làm gì tuần này" / Cập nhật mới nhất** | Khách hàng thường hỏi "tuần này có gì mới" — nên có một khối tóm tắt ngắn thay vì bắt họ tự soi Gantt. | **P0** |
| 7 | **Nhật ký thay đổi (Changelog) khi dời lịch** | Khi admin kéo dời một hạng mục, khách hàng nên thấy **lịch sử**: "Dời từ 15/08 → 25/08, lý do: chờ Google verify". Tránh mất niềm tin khi ngày âm thầm đổi. | **P0** |
| 8 | **Đánh dấu hạng mục vừa hoàn thành / vừa phát hành** | Badge "Mới hoàn thành" trong 7–14 ngày gần nhất, để họ thấy tiến độ tích cực mà không cần lục lại. | P1 |
| 9 | **Bộ lọc theo trạng thái** (chỉ xem "Đang làm", chỉ xem "Trễ tiến độ"…) | Với roadmap nhiều hạng mục, khách hàng bận rộn cần lọc nhanh việc quan trọng với họ. | P1 |

### 1.3 Giao tiếp hai chiều

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 10 | **Đăng ký nhận thông báo** (email khi có cập nhật trạng thái / dời lịch của các hạng mục họ quan tâm) | Giảm việc khách hàng phải tự vào kiểm tra định kỳ; chủ động giữ họ cập nhật. | P1 |
| 11 | **Bình luận / phản hồi theo từng hạng mục** | Cho khách hàng đặt câu hỏi hoặc yêu cầu ưu tiên ngay tại đúng ngữ cảnh, thay vì nhắn rời rạc qua email/Slack. | P2 |
| 12 | **Nút "Đề xuất tính năng"** | Thu thập nhu cầu trực tiếp từ khách hàng, đưa vào backlog xem xét. | P2 |

### 1.4 Trải nghiệm & định dạng

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 13 | **Xuất PDF / ảnh của roadmap hiện tại** | Khách hàng thường cần đưa vào slide nội bộ để báo cáo sếp họ. | P1 |
| 14 | **Xem trên di động** | Khách hàng có thể kiểm tra nhanh trên điện thoại; bản Gantt kéo ngang hiện tại cần tối ưu để dùng một tay được. | P1 |
| 15 | **Song ngữ VI ⇄ 日本語** | Đã có sẵn ở bản Gantt hiện tại — giữ nguyên và đảm bảo áp dụng cho toàn bộ tính năng mới (trạng thái, changelog, thông báo…). | Đã có |
| 16 | **Trang "Câu hỏi thường gặp về roadmap"** | Giải thích sẵn: "Vì sao ngày có thể đổi?", "Trạng thái nghĩa là gì?" — giảm số câu hỏi lặp lại gửi tới bạn. | P2 |

---

## Phần 2 — Công cụ phía Admin (Admin View)

### 2.1 Quản lý nội dung không cần sửa code

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 1 | **Form thêm/sửa/xoá hạng mục** (tên, ngày, sản phẩm, giai đoạn, mô tả) | Hiện tại mọi thay đổi phải sửa trực tiếp trong code. Cần giao diện quản trị để bạn (hoặc người không biết code) thao tác. | **P0** |
| 2 | **Cập nhật trạng thái hạng mục** (gắn với mục 1.2-#4 bên trên) | Đây là thao tác admin sẽ làm **thường xuyên nhất** — cần nhanh, ít bước (vd. đổi ngay từ Gantt bằng menu chuột phải). | **P0** |
| 3 | **Ghi chú lý do khi dời lịch** | Khi kéo–thả dời ngày, hệ thống hỏi lý do → tự động ghi vào changelog cho khách hàng xem (mục 1.2-#7). | **P0** |
| 4 | **Lưu trên server / database dùng chung**, không chỉ lưu trên trình duyệt (localStorage) | Bản hiện tại mỗi người mở trên máy riêng sẽ thấy dữ liệu khác nhau vì lưu local. Khách hàng và admin **phải thấy cùng một dữ liệu** — đây là thay đổi kỹ thuật bắt buộc trước khi đưa cho khách dùng thật. | **P0 — chặn triển khai** |

### 2.2 Kiểm soát những gì khách hàng thấy

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 5 | **Bản nháp / Xuất bản (Draft vs Published)** | Admin cần chỉnh sửa, sắp xếp lại kế hoạch **trước khi khách hàng thấy** thay đổi. Tránh khách hàng thấy timeline "nhấp nháy" giữa lúc bạn đang chỉnh. | **P0** |
| 6 | **Ẩn/hiện hạng mục nội bộ** | Có những việc engineering không muốn lộ ra ngoài (vd. nợ kỹ thuật, refactor nội bộ) — cần cờ "chỉ nội bộ / công khai" trên từng hạng mục. | **P0** |
| 7 | **Roadmap riêng theo từng khách hàng / nhóm khách hàng** | Nếu các khách hàng có gói khác nhau, admin cần chọn hạng mục nào hiện cho khách nào (liên kết với mục 1.1-#2). | P1 |
| 8 | **Lên lịch tự động chuyển trạng thái** (vd. tự chuyển "Đang làm" khi tới ngày bắt đầu) | Giảm việc admin phải nhớ cập nhật thủ công mỗi ngày; trạng thái mặc định gợi ý theo ngày, admin xác nhận lại. | P2 |

### 2.3 Vận hành & an toàn dữ liệu

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 9 | **Lịch sử chỉnh sửa & khôi phục (undo)** | Kéo nhầm, xoá nhầm là rủi ro thật khi thao tác trực tiếp trên Gantt — cần có "hoàn tác" hoặc xem lại phiên bản trước. | **P0** |
| 10 | **Phân quyền nhiều admin** (ai được sửa, ai chỉ được xem) | Nếu về sau có thêm người trong team cùng cập nhật, cần tránh chỉnh chồng chéo hoặc sai sót không rõ ai gây ra. | P1 |
| 11 | **Nhật ký hoạt động admin** (ai đổi gì, lúc nào) | Cùng mục đích với #10 — minh bạch nội bộ, dễ truy vết khi có sai lệch. | P1 |
| 12 | **Xuất / nhập dữ liệu (CSV, JSON)** | Để đồng bộ nhanh với công cụ quản lý dự án nội bộ (Jira, sheet kế hoạch…) thay vì nhập tay lại từ đầu. | P1 |

### 2.4 Thông tin & báo cáo cho chính admin

| # | Tính năng | Vì sao cần | Ưu tiên |
|---|---|---|---|
| 13 | **Bảng chỉ số**: số hạng mục trễ tiến độ, sắp tới hạn trong 7 ngày, vừa hoàn thành | Giúp admin nắm nhanh tình trạng tổng thể mỗi khi mở trang quản trị, không cần dò từng sản phẩm. | P1 |
| 14 | **Thống kê khách hàng xem trang** (ai vào, xem gì nhiều, có phản hồi gì) | Đo được mức độ khách hàng thực sự dùng trang roadmap, làm căn cứ đầu tư tiếp tính năng nào. | P2 |
| 15 | **Nhắc hạn tự động cho admin** (email/Slack khi có hạng mục sắp trễ) | Chủ động xử lý trước khi khách hàng phải hỏi. | P2 |

---

## Đề xuất thứ tự triển khai

Nhóm theo đợt, ưu tiên những gì **chặn việc đưa trang cho khách hàng dùng thật**:

**Đợt 1 — Điều kiện tối thiểu để đưa cho khách hàng (P0 bắt buộc)**
- Lưu dữ liệu trên server/database dùng chung *(bắt buộc kỹ thuật, làm trước tiên)*
- ~~Đăng nhập / link riêng theo khách hàng~~ → **✅ Đã làm**: đăng nhập Google + phân quyền admin theo email (cần dán Client ID thật để chạy)
- Trạng thái từng hạng mục + nhãn "bản dự kiến"
- Form quản trị thêm/sửa/xoá hạng mục + cập nhật trạng thái
- Bản nháp / Xuất bản, ẩn hạng mục nội bộ
- Changelog khi dời lịch (kèm lý do)
- Lịch sử chỉnh sửa / khôi phục
- Khối "Cập nhật mới nhất" ở đầu trang

**Đợt 2 — Nâng trải nghiệm (P1)**
- Đăng ký nhận thông báo qua email
- Xuất PDF, tối ưu di động
- Roadmap riêng theo khách hàng, bộ lọc trạng thái
- Phân quyền nhiều admin + nhật ký hoạt động
- Xuất/nhập CSV, bảng chỉ số cho admin

**Đợt 3 — Mở rộng (P2)**
- Bình luận theo hạng mục, nút đề xuất tính năng
- Trang FAQ
- Thống kê hành vi khách hàng, nhắc hạn tự động

---

## Ghi chú kỹ thuật quan trọng

Bản Gantt hiện tại (`roadmap.html`) đang **lưu dữ liệu trên trình duyệt (localStorage)** — phù hợp để nội bộ chỉnh nháp, nhưng **chưa dùng được cho khách hàng thật**, vì:
- Mỗi người mở trên máy/trình duyệt riêng sẽ thấy một bản dữ liệu khác nhau.
- Không có khái niệm "ai được sửa, ai chỉ được xem" ở tầng dữ liệu.
- Không lưu được lịch sử thay đổi để hiển thị changelog.

→ Cần chuyển sang lưu trên **server có database** (có thể dùng backend nhẹ + một bảng dữ liệu) trước khi triển khai các tính năng ở Đợt 1. Đây là thay đổi nền tảng, nên làm sớm nhất để các tính năng còn lại xây dựng lên trên đó thay vì phải làm lại.

### Đăng nhập Google — cần làm gì để chạy được

Đã cài nút đăng nhập Google vào `roadmap.html`, nhưng cần 2 bước cấu hình trước khi hoạt động thật:

1. Vào **Google Cloud Console → Credentials** → tạo **OAuth client ID** loại **Web application**.
2. Thêm domain sẽ host trang này vào **Authorized JavaScript origins** (test cục bộ dùng `http://localhost` được luôn).
3. Dán Client ID vào biến `GOOGLE_CLIENT_ID` trong file. Trước khi làm bước này, màn hình đăng nhập sẽ báo "Chưa cấu hình Google Client ID".

### ⚠️ Giới hạn bảo mật của cách làm hiện tại

Vì trang vẫn là **file tĩnh, chưa có backend**, việc phân quyền admin theo email hiện chỉ được **kiểm tra ở phía trình duyệt** (đọc email từ token Google, so với danh sách `ADMIN_EMAILS` ngay trong JavaScript). Điều này:
- ✅ Đủ để ngăn khách hàng thông thường vô tình chỉnh sửa lịch trình.
- ❌ **Không phải hàng rào bảo mật thật sự** — người rành kỹ thuật có thể sửa code phía trình duyệt để tự nhận mình là admin, vì không có server nào xác minh lại.

Với mục đích hiện tại (khách hàng theo dõi tiến độ, không phải dữ liệu tối mật), mức này **tạm chấp nhận được** để dùng thử. Nhưng nó chính là lý do mục *"Lưu trên server/database dùng chung"* ở Đợt 1 vẫn là điều kiện bắt buộc — chỉ khi có backend, hệ thống mới **xác minh chữ ký token Google phía server** và thực sự khoá được quyền chỉnh sửa, thay vì chỉ ẩn nút trên giao diện.

---

*Tài liệu này là đề xuất khởi điểm để thảo luận và chốt phạm vi — chưa phải quyết định cuối cùng. Đánh dấu ưu tiên P0/P1/P2 dựa trên giả định "mục tiêu là khách hàng dùng thật càng sớm càng tốt"; nếu mục tiêu khác (vd. chỉ demo nội bộ trước), thứ tự ưu tiên có thể đổi.*
