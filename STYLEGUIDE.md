# OpenLib Design System & Style Guide v1.0

Tài liệu này đóng vai trò là "Single Source of Truth" cho toàn bộ UI Toolkit, Design Tokens, và các quy ước phát triển Frontend (React, CSS) của dự án OpenLibrary.

## 1. Design Philosophy
Hệ thống kết hợp sự tinh gọn của **Minimal Design** và chiều sâu của **Glassmorphism** (kế thừa triết lý giao diện tương đồng Material 3.0 nhưng nhẹ và mượt mà hơn), tập trung vào:
- **Depth & Layers:** Các lớp nền mờ tương tác với ánh sáng, background động.
- **Micro-interactions:** Hiệu ứng hover nổi (pop-up effect), glow viền mượt mà (Cubic-bezier timing).
- **Legibility:** Typographic contrast cao, thông tin được phân tầng thị giác (Visual Hierarchy) từ nhạt tới đậm.

## 2. Design Tokens
Tất cả token thiết kế cốt lõi được định nghĩa ở mức `:root` trong `App.css` và map thẳng vào từng Class `body.theme-*`:

### Core Palettes (WCAG 2.1 AAA Contrast Target)
- `--c-primary`: `#4f46e5` (Tím chàm - Nút Lệnh Chính)
- `--c-secondary`: `#ec4899` (Hồng rực - Trạng thái nổi bật)
- `--c-success`: `#10b981` (Lục bảo - Thành công/Còn sách/Active)
- `--c-warning`: `#f59e0b` (Cam - Cảnh báo, Đợi, Tồn thấp)
- `--c-danger`: `#ef4444` (Đỏ mâm xôi - Xóa/Báo lỗi)

### Breakpoints & Layouts Responsive
Sử dụng chuẩn hóa Media Query:
- **Mobile (`max-width: 768px`):** Stack 1 cột, Sidebar thu gọn thành Component điều hướng ngang.
- **Tablet (`max-width: 1024px`):** Thu gọn độ lớn Sidebar, dàn khung 2 cột Dashboard.
- **Desktop/Ultra-wide (`max-width: 1400px`):** Mở rộng Fluid 4-5 cột, hiển thị chi tiết mọi field của Bảng dữ liệu.

## 3. Theming System
Giao diện sở hữu 3 cấu hình tích hợp sẵn, tùy chỉnh dựa trên hệ biến `var(--bg-color)` và `var(--card-bg)`:
1. **Light Theme:** Trắng nền xám, background động bắt mắt, tối ưu cho ban ngày.
2. **Dark Theme:** Kế thừa tone nền sẫm hoàng gia `#0f172a`. Giao diện bảo vệ mắt 100%, ánh sáng tập trung ở các cụm Text Primary.
3. **Ocean Blue:** Vận dụng màu Cyan/Sky Blue nhạt để mang lại cảm giác thư thái, chuyên biệt và sạch sẽ của lĩnh vực y tế, giáo dục.

## 4. Accessibility (a11y) & WCAG 2.1
- **Semantic HTML & Screen Reader Support:** Mã nguồn HTML tại `index.html` đã được cấu hình ngôn ngữ quốc gia `lang="vi"` kết hợp Meta Description chuẩn. Các component mang tính nút bấm đều tích hợp Hover Cursor và padding đủ rộng (44px) hỗ trợ Fat-finger trên Touch Devices. Tương phản text luôn duy trì để Text dễ đọc trên bất kỳ Theme nào.
- Mọi hình ảnh có fallback và Link out đều trang bị `href`.

## 5. Caching & Performance
- **Tối ưu hình ảnh/Icon:** Sử dụng 100% tài nguyên biểu tượng từ thư viện Vector `lucide-react`. Dung lượng nạp cực thấp, chống vỡ hạt 100%.
- **Zero-Layout-Shift:** Các Modal, Tables, Pagination tuân thủ cấu trúc tĩnh, không gây hiện tượng nhảy Layout, đảm bảo độ êm mượt tối cao bằng Animation GPU qua CSS Hardware Acceleration (`translateY`, `opacity`).
