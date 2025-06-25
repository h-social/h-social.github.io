# H-Social Image Manager

Ứng dụng quản lý hình ảnh thông minh với GitHub, cho phép upload, xem và tải về hình ảnh từ repository GitHub Pages của bạn.

## ✨ Tính năng chính

### 🔐 Xác thực thông minh
- **Tự động phát hiện username**: Ứng dụng sẽ tự động kiểm tra và lấy thông tin user từ GitHub token
- **Hỗ trợ nhiều tài khoản**: Có thể sử dụng token của bất kỳ tài khoản GitHub nào
- **Tự động cấu hình repository**: Sử dụng repository `username.github.io` của tài khoản tương ứng
- **Hiển thị thông tin tài khoản**: Avatar, tên và thông tin chi tiết của user

### 🏗️ Tự động tạo repository
- **Tự động tạo repository**: Nếu repository `username.github.io` chưa tồn tại, ứng dụng sẽ tự động tạo
- **Khởi tạo GitHub Pages**: Repository được tạo với cấu hình GitHub Pages sẵn sàng
- **Không cần cấu hình thủ công**: Tất cả được xử lý tự động

### 📁 Quản lý thư mục
- **Thư mục mặc định**: Upload vào thư mục `images/`
- **Thư mục có sẵn**: Chọn từ các thư mục đã tồn tại
- **Tạo thư mục mới**: Tự động tạo thư mục mới khi upload
- **Lọc theo thư mục**: Xem hình ảnh theo từng thư mục cụ thể

### 🖼️ Quản lý hình ảnh
- **Upload nhiều file**: Hỗ trợ upload nhiều hình ảnh cùng lúc
- **Drag & Drop**: Kéo thả file trực tiếp vào ứng dụng
- **Xem thư viện**: Gallery với preview hình ảnh
- **Tải về**: Tải từng hình ảnh hoặc tất cả
- **Xóa hình ảnh**: Xóa hình ảnh không cần thiết

### 🎨 Giao diện hiện đại
- **Multi-page SPA**: 3 trang chính: Cấu hình, Upload, Gallery
- **Responsive design**: Tương thích với mọi thiết bị
- **Avatar dropdown**: Menu người dùng với thông tin chi tiết
- **Loading states**: Hiển thị trạng thái xử lý
- **Animations**: Hiệu ứng mượt mà

## 🚀 Cách sử dụng

### 1. Tạo GitHub Personal Access Token
1. Truy cập [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Chọn quyền:
   - `repo` (Full control of private repositories)
   - `user` (Update ALL user data)
4. Copy token và lưu lại

### 2. Sử dụng ứng dụng
1. **Mở ứng dụng**: Mở file `index.html` trong trình duyệt
2. **Đăng nhập**: Nhập GitHub token và click "Đăng Nhập"
   - Ứng dụng sẽ tự động kiểm tra token
   - Phát hiện username và repository
   - **Tự động tạo repository nếu chưa tồn tại**
   - Hiển thị thông tin tài khoản
3. **Upload hình ảnh**:
   - Chọn trang "Upload hình ảnh" từ menu
   - Chọn thư mục (mặc định/có sẵn/mới)
   - Kéo thả hoặc chọn file
   - Click "Upload Lên GitHub"
4. **Xem thư viện**:
   - Chọn trang "Thư viện hình ảnh"
   - Lọc theo thư mục nếu cần
   - Tải về hoặc xóa hình ảnh

## 📋 Yêu cầu hệ thống

- **Trình duyệt hiện đại**: Chrome, Firefox, Safari, Edge
- **Kết nối internet**: Để tương tác với GitHub API
- **GitHub account**: Token với quyền `repo` và `user`

## 🔧 Cấu trúc dự án

```
h-social.github.io/
├── index.html          # Trang chính của ứng dụng
├── styles.css          # CSS styles
├── script.js           # JavaScript logic
├── README.md           # Tài liệu hướng dẫn
├── demo.html           # Trang demo
└── .gitignore          # Git ignore file
```

## 🎯 Tính năng nổi bật

### Tự động phát hiện tài khoản
```javascript
// Tự động lấy thông tin user từ token
const userInfo = await fetch('https://api.github.com/user', {
    headers: { 'Authorization': `token ${token}` }
});

// Tự động cấu hình repository
owner = userInfo.login;
repository = `${userInfo.login}.github.io`;
```

### Tự động tạo repository
```javascript
// Kiểm tra và tạo repository nếu chưa tồn tại
async function ensureRepositoryExists() {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repository}`);
    if (response.status === 404) {
        // Tự động tạo repository với GitHub Pages
        await createRepository();
    }
}
```

### Hỗ trợ nhiều tài khoản
- Mỗi token sẽ tự động sử dụng repository của tài khoản tương ứng
- Có thể đăng xuất và đăng nhập với tài khoản khác
- Thông tin tài khoản được hiển thị rõ ràng

### Quản lý thư mục thông minh
- Tự động tạo thư mục mới bằng file `.gitkeep`
- Lọc hình ảnh theo thư mục
- Hiển thị đường dẫn thư mục cho mỗi hình ảnh

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: GitHub REST API v3
- **UI Framework**: Font Awesome Icons
- **Storage**: LocalStorage cho token và user info

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với breakpoints:
- **Desktop**: > 768px
- **Tablet**: 480px - 768px  
- **Mobile**: < 480px

## 🔒 Bảo mật

- Token được lưu trong LocalStorage (chỉ local)
- Không có backend, tất cả xử lý ở client-side
- Token chỉ được sử dụng để gọi GitHub API
- Có thể đăng xuất để xóa token

## 🎨 Customization

Có thể tùy chỉnh:
- **Màu sắc**: Chỉnh sửa CSS variables
- **Repository**: Thay đổi tên repository mặc định
- **Thư mục**: Thay đổi thư mục mặc định
- **UI**: Tùy chỉnh giao diện trong `styles.css`

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra token có đúng quyền không
2. Đảm bảo có quyền tạo repository
3. Kiểm tra kết nối internet
4. Tạo issue trên GitHub

## 🔧 Troubleshooting

### Lỗi 404 Not Found
- **Nguyên nhân**: Repository hoặc thư mục chưa tồn tại
- **Giải pháp**: Ứng dụng sẽ tự động tạo repository và thư mục cần thiết

### Lỗi "Repository not found"
- **Nguyên nhân**: Repository chưa được tạo
- **Giải pháp**: Ứng dụng sẽ tự động tạo repository `username.github.io`

### Lỗi "Folder not found"
- **Nguyên nhân**: Thư mục chưa tồn tại
- **Giải pháp**: Ứng dụng sẽ tự động tạo thư mục bằng file `.gitkeep`

---

**H-Social Image Manager** - Quản lý hình ảnh thông minh với GitHub! 🚀