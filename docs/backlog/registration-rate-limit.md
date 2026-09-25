# Backlog — Giới hạn request đăng ký và gửi email

**Trạng thái:** tạm hoãn theo yêu cầu, đã gỡ khỏi code đợt A để tập trung vào đăng ký/xác thực email.

## Phạm vi tạm bỏ

- Middleware giới hạn request register/verify theo IP.
- Collection `rate_limit_buckets`, model và bước tạo index lúc startup.
- Service đếm lượt, cooldown và hạn mức gửi email/user trong enqueue.
- Các kiểm thử cho bộ đếm và response 429 tương ứng.

Luồng hiện tại: client → router → validateBody → controller → model/service. Đăng ký và verify vẫn dùng transaction; worker vẫn giữ retry tối đa 3 lần/đợt, nextAttemptAt, leaseId, leaseUntil. Giới hạn hai tác vụ hash password đồng thời/process vẫn giữ: đây là giới hạn tài nguyên đồng thời, không phải bộ đếm request theo IP.

## Thiết kế cũ để tham khảo khi làm lại

Fixed-window rate limiting dùng MongoDB lưu bộ đếm chung cho nhiều API instance. Mỗi document gồm:

| Field         | Ý nghĩa                                                       |
| ------------- | ------------------------------------------------------------- |
| key           | scope + IP hash (hoặc userId) + thời điểm bắt đầu cửa sổ      |
| count         | Số lượt đã được phép đi tiếp trong cửa sổ                     |
| windowEndsAt  | Thời điểm kết thúc cửa sổ                                     |
| nextAllowedAt | Thời điểm được nhận lượt tiếp theo nếu có cooldown            |
| expiresAt     | TTL dọn document bộ đếm cũ; không quyết định hiệu lực hạn mức |

Luồng: middleware xác định IP/scope → service tính cửa sổ → tìm/tạo bộ đếm → update nguyên tử với điều kiện count < limit và đã qua cooldown → next() hoặc 429 kèm Retry-After. Request được tính trước validation/controller, kể cả nếu đăng ký thất bại. Lượt vượt hạn mức không tăng count.

Ngưỡng cũ: register 10 request/IP/giờ, verify 30 request/IP/15 phút, gửi email 3 đợt/user/giờ và cooldown 60 giây. Đây là cấu hình tham khảo, **không còn được áp dụng** và cần đánh giá lại trước khi khôi phục.

## Việc cần chốt trước khi triển khai lại

- Tách ngân sách request thử đăng ký khỏi ngân sách tạo tài khoản/gửi email; xác định lỗi nào được tính.
- Chọn ngưỡng tránh ảnh hưởng người dùng chung IP; cân nhắc burst sát ranh giới cửa sổ cố định.
- Xác định kho bộ đếm và thuật toán phù hợp; MongoDB/fixed window không phải lựa chọn bắt buộc.
- Cấu hình trust proxy theo topology thật, không tin tùy ý X-Forwarded-For.
- Thể hiện model, query, thứ tự middleware và response bằng ví dụ trong plan trước khi viết code.
- Kiểm thử đồng thời, reset cửa sổ, TTL trễ, cooldown, Retry-After và nhiều instance dùng chung bộ đếm.

Trước khi mở đăng ký công khai cần đánh giá/bổ sung cơ chế chống lạm dụng: hiện không có hạn mức request theo IP hoặc đợt gửi theo user. Không tự drop collection đã tồn tại ở môi trường chạy; code mới không đọc/ghi collection đó, TTL cũ (nếu có) vẫn có thể dọn dữ liệu theo cấu hình DB.
