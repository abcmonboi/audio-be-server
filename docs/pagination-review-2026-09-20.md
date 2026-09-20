# Ghi chú rà soát API phân trang

Ngày: 2026-09-20. Đây là bản tóm tắt cuộc trao đổi và công việc cần tiếp tục, không phải bản chép nguyên văn hội thoại.

## Luồng hiện tại

```text
GET /api/genre
→ validatePagination
→ getGenreList
→ fetchPaginatedList(Genre, req.query)
→ sendPaginatedList
```

- Middleware kiểm tra page/pageSize nếu được gửi: chuỗi chuyển được thành số nguyên dương an toàn; pageSize không vượt quá 100.
- Helper áp dụng mặc định page = 1, pageSize = 10.
- Loại đúng bốn tham số page, pageSize, sort, fields; giữ nguyên tất cả query param còn lại làm bộ lọc.
- find và countDocuments dùng cùng bộ lọc, chạy song song qua Promise.all.
- Sort mặc định là -createdAt; thêm _id cuối nếu chưa có _id, -_id hoặc +_id. Sort rỗng cũng dùng mặc định.
- fields phân cách bằng dấu phẩy được chuyển thành chuỗi projection.
- Offset = (page - 1) * pageSize; helper trả { data, total, page, pageSize }.
- Response hiện tại: { success, data, total, page, pageSize, msg }.

## Các thay đổi đã hoàn thành

- Đổi sendList thành sendPaginatedList và bổ sung comment.
- Giữ tên page/pageSize cho API phân trang theo số trang.
- Tạo DEFAULT_PAGE = 1, DEFAULT_PAGE_SIZE = 10, MAX_PAGE_SIZE = 100 trong src/constants/pagination.ts.
- Gom đọc query params và thực thi truy vấn vào fetchPaginatedList, thay buildListQuery.
- Bỏ tham số filters riêng theo yêu cầu; bộ lọc lấy từ query params.
- Tạo excludedFields và DEFAULT_SORT = "-createdAt" trong src/constants/list-query.ts.
- Trả HTTP 400 khi pageSize vượt MAX_PAGE_SIZE.
- Bổ sung sort mặc định và _id để phân định khi giá trị sort trùng nhau. Cách này không ngăn trang dịch chuyển nếu dữ liệu thêm/xóa giữa các request.

## Issue còn lại

Mức độ dưới đây là đánh giá theo mã nguồn và phạm vi API genre hiện tại, chưa phải kết quả kiểm thử bảo mật hoặc đo tải. Chưa có đủ bằng chứng để xếp issue nào là Critical.

| ID | Issue | Mức độ | Ảnh hưởng và hướng xử lý |
| --- | --- | --- | --- |
| PAG-01 | Filter nhận trực tiếp query params | Medium; có thể High với dữ liệu có phân quyền | Điều kiện lọc ngoài dự kiến hoặc truy vấn tốn tài nguyên. Xác định trường, kiểu giá trị và toán tử được phép; giữ điều kiện phân quyền bắt buộc phía server khi có. Khả năng khai thác cụ thể phụ thuộc query parser và cấu hình database. |
| PAG-02 | fields chưa giới hạn trường được đọc | Medium với genre; có thể High với model có dữ liệu nhạy cảm | Cần quy định trường được trả về theo API/quyền truy cập trước khi tái sử dụng helper cho model khác. |
| PAG-03 | sort/fields chưa validate | Medium | Query lặp thành mảng bị bỏ qua; projection không hợp lệ có thể gây lỗi; sort không phù hợp có thể chậm. Validate kiểu, trường và tổ hợp hợp lệ. |
| PAG-04 | Lỗi query chưa chuẩn hóa | Medium | Ví dụ _id không hợp lệ có thể phát sinh CastError và đi vào bộ xử lý lỗi mặc định. Trả 400 JSON nhất quán cho lỗi đầu vào; giữ 500 cho lỗi hệ thống. |
| PAG-05 | Chưa kiểm tra offset là số nguyên an toàn | Low | page và pageSize riêng lẻ hợp lệ nhưng tích tính offset có thể vượt giới hạn. Kiểm tra Number.isSafeInteger(offset). |
| PAG-06 | skip sâu và đếm total mỗi request | Low hiện tại; Medium khi dữ liệu/lưu lượng lớn | Đo truy vấn thực tế, xem xét index theo filter/sort; cân nhắc cursor hoặc cơ chế đếm phù hợp khi cần. |
| PAG-07 | data và total không đảm bảo cùng thời điểm đọc | Low | Hai truy vấn độc lập có thể lệch khi dữ liệu thay đổi. Thường chấp nhận được với genre; chỉ bổ sung yêu cầu nhất quán mạnh khi nghiệp vụ cần. |

## Thứ tự xử lý đề xuất

1. Chốt quy tắc filter và quyền đọc fields cho từng API.
2. Validate sort/fields và chuẩn hóa lỗi query.
3. Kiểm tra offset an toàn.
4. Đo hiệu năng và quyết định yêu cầu nhất quán dữ liệu theo thực tế.

Việc giữ nguyên mọi query param ngoài bốn trường đặc biệt là yêu cầu đã được người dùng chọn. Các đề xuất giới hạn filter ở trên là công việc để xem xét sau, chưa được triển khai.

## Các file liên quan

- [Route genre](../src/routes/genre.ts)
- [Middleware phân trang](../src/middlewares/validate-pagination.ts)
- [Controller genre](../src/controllers/genre.ts)
- [Helper truy vấn](../src/utils/list-query.ts)
- [Helper response](../src/utils/response.ts)
- [Hằng số phân trang](../src/constants/pagination.ts)
- [Hằng số query](../src/constants/list-query.ts)
- [Middleware lỗi](../src/middlewares/error-handler.ts)

## Kiểm chứng và việc cần kiểm thử sau

Các lần kiểm tra git diff --check đã đạt. Chưa chạy được typecheck hoặc kiểm thử runtime vì shell của phiên làm việc không tìm thấy node/npm; điều này không khẳng định máy chưa cài Node.js.

Khi môi trường sẵn sàng, chạy npm run typecheck và kiểm thử các trường hợp:

- Thiếu page/pageSize: dùng 1 và 10.
- pageSize = 100 được chấp nhận; 101 bị từ chối với 400.
- Page/pageSize bằng 0, âm, thập phân, chuỗi rỗng hoặc query lặp bị từ chối.
- Filter title được áp dụng cho cả data và total.
- Không có sort: -createdAt rồi _id; có sort: giữ ưu tiên của client và thêm _id khi thiếu.
- Dữ liệu trùng title/createdAt có thứ tự xác định khi tập dữ liệu không thay đổi.
- Trang vượt số trang hiện có: data rỗng nhưng total vẫn phản ánh bộ lọc.
- Kiểm thử lỗi đầu vào và quyền đọc trường sau khi triển khai các issue tương ứng.

## Tài liệu đã tham khảo trong cuộc trao đổi

- [MongoDB: skip, sort ổn định và chi phí offset lớn](https://www.mongodb.com/docs/manual/reference/method/cursor.skip/)
- [Mongoose: Query API, sanitizeFilter và sanitizeProjection](https://mongoosejs.com/docs/api/query.html)
- [Mongoose: Query casting](https://mongoosejs.com/docs/tutorials/query_casting.html)

## Gợi ý mở đầu phiên làm việc tiếp theo

> Đọc docs/pagination-review-2026-09-20.md và đối chiếu mã nguồn hiện tại. Tiếp tục xử lý issue PAG-XX; chỉ sửa trong phạm vi issue được chọn và kiểm thử hành vi liên quan.
