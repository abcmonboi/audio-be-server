/* Services là nơi đặt logic xử lý có thể gọi độc lập với HTTP.
Đây chỉ là cách tổ chức code, không phải thành phần bắt buộc của
Express và không tự làm hệ thống nhanh hơn hay an toàn hơn.

Với project này, việc thêm service (dịch vụ) có ý nghĩa rõ nhất ở
đăng ký và gửi lại email và worker cần 1 logic chung.

Luồng hiện tại:
Client → Router → Middleware → Controller → Model → MongoDB
                                   ↓
                              HTTP response

Controller thường làm cả hai việc:
- Xử lý HTTP: đọc res.locals.body, chọn status code, trả JSON.
- Xử lý nghiệp vụ: hash password, tạo user, sinh token, lưu công việc gửi email.


Khi thêm service:
Client → Router → Middleware → Controller → Service → Model → MongoDB
                                   ↑           |
                                   └── kết quả ┘
                                   ↓
                              HTTP response

Service trả dữ liệu hoặc ném lỗi; controller chuyển kết quả đó thành HTTP response.

| Thành phần | Trách nhiệm |
|---|---|
| Router | Nối URL với middleware/controller |
| Middleware | Validate request, xác thực, kiểm tra quyền |
| Controller | Nhận dữ liệu đã validate, gọi xử lý, trả HTTP response |
| Service | Thực hiện nghiệp vụ hoặc cung cấp chức năng dùng chung |
| Model | Định nghĩa dữ liệu, ràng buộc và thao tác lưu/truy vấn |

Ví dụ ngay trong luồng đăng ký
Nếu chưa tách service, controller có thể chứa:
const register = async (_req, res) => {
  const input = res.locals.body;

  // Hash password
  // Mở transaction
  // Tạo user
  // Sinh token và mã hóa
  // Lưu công việc gửi email
  // Commit

  return sendCreated(res, result);
};
Cách này vẫn hợp lý khi logic còn ngắn và chỉ dùng tại đây.
Nhưng khi thêm resend:
register controller ──┐
                      ├── Cần logic tạo token + lưu công việc
resend controller ────┘
Nếu copy logic sang hai controller, khi đổi hạn token hoặc cách mã hóa, bạn phải sửa nhiều nơi. Nếu controller resend gọi controller register thì lại vướng req, res và hành vi tạo user.
Service giải quyết chỗ đó:

Service giải quyết chỗ đó:
// Không nhận req/res; caller truyền dữ liệu cần thiết.
await enqueueEmailVerification({
  user,
  session,
  now,
});
Cả register và resend gọi cùng hàm. Worker cũng có thể gọi các service giải mã token/gửi email mà không cần giả lập HTTP request.
Riêng services/password.ts ở bước 4 có cần thiết không?
File này chỉ bao bọc thư viện hash:
export const hashPassword = (password: string) =>
  argon2.hash(password, { type: argon2.argon2id });

export const verifyPassword = (hash: string, password: string) =>
  argon2.verify(hash, password);
Giá trị thực tế là:
- Register, login và reset password sau này dùng chung cách hash/verify.
- Cấu hình Argon2 tập trung ở một chỗ.
- Controller không phải biết chi tiết thư viện hash.
Tuy nhiên, hàm này không bắt buộc phải nằm trong thư mục services. Đặt ở utils/password.ts cũng được. Tên thư mục là quy ước; trách nhiệm và cách dùng mới quan trọng.
Tôi phân biệt như sau:
Ví dụ	Nơi phù hợp
Format ngày, tạo slug	utils
Hash/verify password với cấu hình chung của ứng dụng	services/password.ts hoặc module chuyên biệt
Tạo/tái sử dụng token, kiểm tra trạng thái và lưu công việc	services/email-verification.ts
Chọn HTTP 201 và gọi res.json()	Controller


Có cần chuyển tất cả controller sang service không?
Không cần. Với các API danh mục hiện tại chỉ validate rồi tạo/sửa một document, giữ controller → model là hợp lý. Thêm một service chỉ để chuyển tiếp Model.create() thường chưa mang lại lợi ích.
Nên tách khi:
- Nhiều controller hoặc worker dùng chung logic.
- Một thao tác phối hợp nhiều model và transaction.
- Controller dài vì chứa nhiều quy tắc nghiệp vụ.
- Muốn kiểm thử nghiệp vụ mà không cần tạo req/res.
Với plan này, tôi đề xuất giữ kiến trúc hiện tại cho CRUD đơn giản, thêm service có chọn lọc cho password và email verification. Controller vẫn có thể quản lý transaction như plan đang mô tả rồi truyền session vào service; nếu sau này tách toàn bộ nghiệp vụ đăng ký thành registerUser(), lúc đó chuyển quyền quản lý transaction vào service đó.


hiểu ngắn gọn: service là hàm xử lý một công việc cụ thể chịu trách nhiệm thực hiện một công việc của ứng dụng, nhận dữ liệu cần thiết, trả kết quả hoặc lỗi; không nhận req/res.
Controller lấy dữ liệu từ request → gọi service → gửi response.
*/
