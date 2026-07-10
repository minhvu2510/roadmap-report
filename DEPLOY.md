# Deploy

## Mô hình

Bản deploy là **chỉ đọc**. Không có admin, không có kéo/sửa, không ghi DB.
Bạn sửa roadmap ở **máy local**, Publish, rồi đẩy file `data/roadmap.db` lên cùng deploy.

```
local (admin, ghi DB)  ──  npm run db:pack  ──  git push  ──  prod (customer, chỉ đọc)
```

Vì prod không bao giờ ghi, filesystem ephemeral của serverless không thành vấn đề —
đó là lý do không cần Turso/Postgres.

## Biến môi trường trên host

| Biến | Giá trị | Bắt buộc |
|---|---|---|
| `ROADMAP_READONLY` | `1` | **Có.** Thiếu nó → email trong `ADMIN_EMAILS` vẫn thành admin, và app sẽ cố ghi vào đĩa read-only rồi crash. |
| `SESSION_SECRET` | chuỗi ngẫu nhiên dài | **Có.** Thiếu → dùng secret mặc định public trong source. |

Sinh secret: `openssl rand -base64 32`

## Quy trình cập nhật roadmap

```bash
npm run dev                  # sửa ở http://localhost:3100, login email admin
                             # → bấm Publish trong app (bắt buộc, khách chỉ thấy bản published)
npm run db:pack              # gộp WAL vào roadmap.db, chặn nếu còn dirty
git add data/roadmap.db && git commit -m "roadmap: cập nhật Mosa"
git push                     # host tự build & deploy
```

`db:pack` sẽ **từ chối chạy** nếu DB còn `dirty` (có sửa chưa Publish) — để tránh
deploy ra bản mà khách hàng không thấy thay đổi.

## Kiểm tra trước khi push

Chạy đúng như prod:

```bash
npm run build
ROADMAP_READONLY=1 SESSION_SECRET=test npx next start -p 3200
```

Login bằng email admin → phải ra `role: customer`, và `POST /api/items` phải trả `403`.

## Host

- **Vercel Hobby** — free, dễ nhất. Lưu ý: ToS cấm dùng cho mục đích thương mại;
  roadmap sản phẩm nội bộ có thể vi phạm. Cần `outputFileTracingIncludes` trong
  `next.config.js` (đã thêm) để `data/roadmap.db` được đóng gói vào lambda.
- **Oracle Cloud always-free VM** — free thật, không vướng ToS, nhưng tự dựng
  Node + nginx + TLS. Ở đây có thể bỏ luôn `ROADMAP_READONLY` và cho admin sửa
  trực tiếp trên server nếu muốn.
