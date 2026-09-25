# Chạy đăng ký và xác thực email — đợt A

Đã triển khai `POST /api/user/register` và `POST /api/user/email-verification/verify`. Login, refresh token, `/current`, API resend và phân quyền thuộc đợt B, chưa có endpoint trong bản này.

## Cấu hình

1. Cài dependency bằng `npm install` (Node.js 22 trở lên; môi trường đã kiểm thử dùng Node.js 26).
2. Điền các biến trong `.env.example` vào `.env`. Giữ nguyên secret riêng của môi trường, không commit `.env`.
3. `MONGODB_URI` phải trỏ tới replica set hoặc sharded cluster. MongoDB standalone không được hỗ trợ. API/worker kiểm tra cấu hình DB và tạo index trước khi nhận việc, không tự chuyển sang ghi không transaction.
4. Sinh khóa bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`, đặt vào `EMAIL_TOKEN_KEY`; đặt `EMAIL_TOKEN_KEY_ID=v1`. API và worker phải dùng cùng khóa. Bản này hỗ trợ một khóa hiện hành; thay khóa khi vẫn có job cũ sẽ làm các job đó không giải mã được. Không thay khóa tùy tiện khi còn công việc đang chờ.
5. `FRONTEND_URL` là origin frontend tin cậy, dùng HTTPS khi triển khai, HTTP chỉ cho localhost. Email mở `/email-verification#token=...` tại origin này.
6. Cấu hình SMTP_HOST/PORT/USER/PASSWORD/FROM. Port 465 dùng TLS ngay; các port khác bắt buộc STARTTLS. Không bỏ kiểm tra chứng chỉ trên môi trường thật.

API và worker không tự gửi thông tin cho địa chỉ có sẵn trong repository. Email chỉ được gửi cho tài khoản đăng ký khi worker được chạy với SMTP cấu hình của bạn.

## Chạy

Chạy API: `npm run dev`.

Trong terminal/process khác: `npm run worker:email`.

API lưu User và công việc gửi email trong cùng transaction, trả 201 sau commit. Worker poll mỗi giây, gửi tuần tự, claim bằng lease 60 giây; mỗi lần SMTP có deadline 20 giây và đóng kết nối thật khi hết hạn. Mailer dùng SMTPConnection và MailComposer của Nodemailer để kiểm soát việc hủy kết nối.

Worker được dừng bằng SIGINT/SIGTERM: dừng nhận thêm việc và chờ lượt hiện tại kết thúc. Nếu process chết đột ngột, worker khác nhận lại khi lease hết hạn. Tối đa ba lần thử trong một đợt, retry sau 30 giây rồi 2 phút; email có thể được gửi trùng nếu process chết sau khi SMTP đã nhận.

Log chỉ chứa sự kiện/mã lỗi đã lọc và attempts/ageMs, không chứa token hoặc link email. Theo dõi số job queued/sending/failed và nextAttemptAt để phát hiện worker ngừng chạy. `sent` chỉ có nghĩa SMTP đã chấp nhận, không cam kết vào inbox.

## Request mẫu

`dateOfBirth` được gửi và lưu dưới dạng ngày ISO `YYYY-MM-DD`, không có giờ/múi giờ. FE chuyển ngày được chọn trên datepicker sang định dạng này; không chuyển qua UTC bằng `toISOString()` vì có thể lệch ngày. Có thể bỏ field, nhưng không gửi chuỗi rỗng hoặc null.

Backend dùng Day.js để xác định hôm nay theo `APP_TIMEZONE` trong `.env`, mặc định `Asia/Ho_Chi_Minh`. Timezone chỉ áp dụng cho ngày hiện tại khi kiểm tra ngày sinh không ở tương lai; không chuyển đổi ngày sinh. Cấu hình timezone sai/rỗng sẽ báo lỗi khi nạp cấu hình. Thay `.env` cần khởi động lại process.

`POST /api/user/register`, Content-Type application/json:

```json
{
  "firstname": "An",
  "lastname": "Nguyen",
  "email": "an@example.com",
  "mobile": "0901234567",
  "password": "a sufficiently long password",
  "dateOfBirth": "1998-05-20"
}
```

Frontend đọc token từ fragment, xóa fragment bằng history.replaceState; chỉ khi người dùng bấm xác nhận mới gọi `POST /api/user/email-verification/verify` với `{ "token": "<token từ email>" }`. GET/link preview không xác thực tài khoản. Endpoint verify trả 200 và emailVerifiedAt, không tạo phiên đăng nhập.

201 chứa `emailVerification.status = queued`, không chứa thông tin user, hash/token/secret. Payload sai trả 400, email/mobile trùng trả 409, token sai/hết hạn/đã dùng trả 400. Rate limit theo IP và hạn mức/cooldown gửi email theo user đã tạm bỏ, xem [backlog](backlog/registration-rate-limit.md).

Khi khôi phục rate limit theo IP, cần cấu hình trust proxy theo topology thực tế; yêu cầu này được ghi trong backlog.

Collection token riêng có TTL, không xóa User. `tokenHash` dùng để tra cứu lúc verify; `delivery.encryptedToken` là bản mã để worker lấy lại token gốc. Các field này có comment tại `src/models/email-verification-token.ts`. Hiện service chỉ tạo token mới khi đăng ký; resend sẽ được bổ sung sau khi có auth.

## Kiểm thử

- `npm run typecheck`
- `npm run lint`
- `npm test`: chạy các test CRUD đã có trước đó.

Các file test đăng ký/crypto/DTO và integration test MongoDB/SMTP đã tạm gỡ theo yêu cầu; script `test:integration` cũng đã gỡ. Khi bổ sung lại, cần kiểm tra transaction rollback, đăng ký/verify đồng thời, token hết hạn hoặc không khớp User, lease recovery, retry, verify trong lúc gửi, tái sử dụng token và đóng SMTP quá hạn. SMTP thật và trang xác nhận frontend cần được kiểm tra thêm trên môi trường triển khai.
