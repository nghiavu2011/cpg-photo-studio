# CPG Photo Studio (Photoshop CC 2020 Edition)

> **Bộ công cụ thiết kế & biên tập đồ họa trực tuyến chuyên nghiệp mang giao diện chuẩn Adobe Photoshop CC 2020 & PhotoCraft.**
> Phát triển độc quyền cho hệ sinh thái **CPG**, tích hợp tính năng đóng dấu bản quyền Watermark 1-Click, xử lý 100% Client-side siêu tốc và bảo mật dữ liệu tuyệt đối.

---

## 🌟 Tính Năng Nổi Bật

- **Chuẩn giao diện Adobe Photoshop CC 2020 & PhotoCraft:**
  - 10 Menu chức năng chuẩn (File, Edit, Image, Layer, Type, Select, Filter, View, Window, Help).
  - Thanh tùy chọn công cụ (Options Bar) đồng bộ theo từng công cụ active.
  - Vùng làm việc Canvas trung tâm với thước đo Ruler và tab tài liệu đa nhiệm.
  - Bảng Dock 2 tầng bên phải: Card trên (Properties / Đồ thị Curves chuyên sâu) & Card dưới (Layers / Channels / Paths).
- **Hỗ trợ 2 Theme chuẩn Pro:**
  - 🌙 **Pro Dark:** Giao diện tối chuyên nghiệp chống mỏi mắt khi làm việc ban đêm.
  - ☀️ **Studio Light:** Giao diện xám sáng chuẩn Studio với nền Canvas xám trung tính 50% (`#b0b0b0`) cho độ chuẩn màu tối ưu.
- **Tính năng độc quyền CPG:**
  - ⭐ **Gắn Logo CPG 1-Click:** Tự động căn góc và đóng dấu watermark bản quyền sắc nét lên ảnh sản phẩm/phối cảnh.
  - 🇻🇳 **Đa ngôn ngữ [ Tiếng Việt | English ]:** Chuyển đổi ngôn ngữ tức thì chỉ với 1 click.
- **Bảo mật & Hiệu năng Zero-bloat:**
  - 100% xử lý cục bộ trên RAM/Canvas của trình duyệt. Không tải ảnh lên bất kỳ máy chủ nào.
  - Hỗ trợ chạy Offline hoàn toàn không cần Internet.
  - Chạy mượt mà trên mọi thiết bị: PC, Laptop, MacBook, iPad, máy tính bảng.

---

## 🚀 Triển Khai Nhanh Trên Vercel

Dự án đã được cấu hình sẵn file `vercel.json` tối ưu cho việc deploy 1-click:

1. Đăng nhập vào [Vercel](https://vercel.com).
2. Bấm **Add New...** -> **Project**.
3. Chọn repo `cpg-photo-studio` và bấm **Deploy**.
4. Website sẽ tự động online tại tên miền `https://cpg-photo-studio.vercel.app` (hoặc gắn domain riêng `https://psd.cpg.vn`).

---

## 💻 Chạy Cục Bộ (Local & Portable Desktop)

### Cách 1: Chạy Desktop App 1-Click
Click đúp chuột vào file:
```
CPG-Photo-Studio-App.bat
```
Ứng dụng sẽ tự động mở ở chế độ cửa sổ độc lập (**App Window mode**) không có thanh URL, mang lại trải nghiệm như phần mềm Photoshop cài trong máy.

### Cách 2: Chạy Web Server phát triển
```bash
npm install
npm run build
python -m http.server 8088
```
Mở trình duyệt truy cập: `http://localhost:8088`

---

## 📜 Bản Quyền & Giấy Phép
Phát triển trên nền tảng mã nguồn mở miniPaint & PhotoCraft UI. Phát hành theo giấy phép [MIT License](LICENSE).
© 2026 CPG Photo Studio.
