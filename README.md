# H-Social Image Manager

Ứng dụng quản lý hình ảnh thông minh với hỗ trợ GitHub và Cloudinary.

## Cấu trúc dự án (Refactored)

### 📁 Cấu trúc thư mục

```
h-social.github.io/
├── index.html              # File HTML chính
├── style.css               # CSS styles
├── config.js               # Cấu hình toàn bộ ứng dụng
├── utils.js                # Các hàm tiện ích
├── app.js                  # Class chính quản lý ứng dụng
├── favorites.js            # Quản lý favorites
├── services/               # Thư mục chứa các service
│   ├── githubService.js    # Service cho GitHub API
│   └── cloudinaryService.js # Service cho Cloudinary API
└── components/             # Thư mục chứa các component
    ├── uploadManager.js    # Component quản lý upload
    ├── galleryManager.js   # Component quản lý gallery
    └── imagePreview.js     # Component preview ảnh
```

### 🔧 Các module chính

#### 1. **config.js** - Cấu hình toàn bộ ứng dụng
- Chứa tất cả constants và cấu hình
- Dễ dàng thay đổi các giá trị như giới hạn file, kích thước gallery, etc.
- Quản lý storage keys và default settings

#### 2. **utils.js** - Các hàm tiện ích
- File utilities (format size, base64 conversion)
- Storage utilities (localStorage wrapper)
- Validation utilities
- DOM utilities
- Error handling
- Debounce/throttle functions

#### 3. **services/** - Các service API
- **githubService.js**: Xử lý tất cả tương tác với GitHub API
- **cloudinaryService.js**: Xử lý tất cả tương tác với Cloudinary API
- Mỗi service có interface thống nhất (init, upload, delete, etc.)

#### 4. **components/** - Các component UI
- **uploadManager.js**: Quản lý upload với queue, progress, retry
- **galleryManager.js**: Quản lý gallery với pagination, filtering
- **imagePreview.js**: Modal preview ảnh với navigation

#### 5. **app.js** - Class chính
- Khởi tạo và quản lý toàn bộ ứng dụng
- Điều hướng giữa các trang
- Quản lý state và services
- Khởi tạo các components

### 🚀 Lợi ích của cấu trúc mới

#### ✅ **Dễ maintain**
- Code được tách thành các module riêng biệt
- Mỗi file có trách nhiệm rõ ràng
- Dễ dàng tìm và sửa lỗi

#### ✅ **Dễ mở rộng**
- Thêm service mới chỉ cần tạo file trong `services/`
- Thêm component mới chỉ cần tạo file trong `components/`
- Interface thống nhất giữa các service

#### ✅ **Tái sử dụng**
- Các utility functions có thể dùng ở nhiều nơi
- Components có thể tái sử dụng
- Services có thể dùng cho các dự án khác

#### ✅ **Performance**
- Code được load theo thứ tự đúng
- Lazy loading cho các component
- Tối ưu memory usage

### 🔄 Cách thêm tính năng mới

#### Thêm service mới:
1. Tạo file `services/newService.js`
2. Implement interface giống GitHub/Cloudinary service
3. Thêm vào `app.js` trong `initializeComponents()`

#### Thêm component mới:
1. Tạo file `components/newComponent.js`
2. Extend từ base component hoặc tạo class riêng
3. Thêm vào HTML và khởi tạo trong `app.js`

#### Thêm utility mới:
1. Thêm function vào `utils.js`
2. Export để sử dụng ở các module khác

### 📱 Responsive Design
- Mobile-first approach
- CSS Grid và Flexbox
- Touch-friendly interface
- Optimized cho iPhone và Android

### 🎨 UI/UX Features
- Modern design với gradient và blur effects
- Smooth animations và transitions
- Drag & drop upload
- Image preview với navigation
- Favorites system
- Progress tracking
- Error handling với user-friendly messages

### 🔒 Security
- Token validation
- File type validation
- Size limits
- Secure storage handling

### 📊 Performance Features
- Lazy loading images
- Pagination cho gallery
- Queue system cho upload
- Retry mechanism
- Cache management

## Cách sử dụng

1. **Clone repository**
2. **Mở `index.html` trong browser**
3. **Chọn service (GitHub hoặc Cloudinary)**
4. **Cấu hình thông tin cần thiết**
5. **Bắt đầu upload và quản lý ảnh**

## Dependencies

- Font Awesome 6.0.0 (CDN)
- Modern browser với ES6+ support

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License