# TikTok Style Image Viewer Component

Component hiển thị ảnh dạng TikTok-style với vertical swipe navigation sử dụng Swiper.js.

## Tính năng chính

- ✅ **Vertical Swipe Navigation**: Lướt dọc để chuyển ảnh
- ✅ **Preload Optimization**: Tự động preload 5 ảnh tiếp theo
- ✅ **Responsive Design**: Tương thích mọi thiết bị với TailwindCSS
- ✅ **Keyboard Navigation**: Hỗ trợ phím mũi tên và Escape
- ✅ **Touch/Mouse Support**: Hỗ trợ touch và mouse wheel
- ✅ **Progress Indicator**: Hiển thị vị trí hiện tại
- ✅ **Interactive Buttons**: Favorite, Share, Download
- ✅ **Smooth Animations**: Transitions mượt mà

## Cài đặt

### 1. Thêm dependencies

```html
<!-- Swiper.js -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>

<!-- TailwindCSS (nếu chưa có) -->
<script src="https://cdn.tailwindcss.com"></script>
```

### 2. Import component

```javascript
import { TikTokViewer } from './components/tiktok-viewer/tiktok-viewer.js';
```

## Cách sử dụng

### 1. Chuẩn bị dữ liệu

```javascript
const data = [
    { 
        name: "Tên ảnh 1", 
        imagePath: "/path/to/image1.jpg", 
        favorite: false 
    },
    { 
        name: "Tên ảnh 2", 
        imagePath: "/path/to/image2.jpg", 
        favorite: true 
    },
    // ...
];
```

### 2. Tạo container HTML

```html
<div id="tiktok-viewer-container" class="fixed inset-0 z-40"></div>
```

### 3. Khởi tạo component

```javascript
const viewer = new TikTokViewer('tiktok-viewer-container', data);

// Hoặc khởi tạo với ảnh cụ thể
const viewer = new TikTokViewer('tiktok-viewer-container', data, {
    startImagePath: '/path/to/specific-image.jpg'
});
```

### 4. Lắng nghe events (tùy chọn)

```javascript
// Khi user toggle favorite
document.addEventListener('favoriteToggled', (e) => {
    console.log('Favorite toggled:', e.detail);
    // e.detail = { index, item, isFavorite }
});

// Khi viewer đóng
document.addEventListener('viewerClosed', (e) => {
    console.log('Viewer closed at index:', e.detail.currentIndex);
});
```

## API Reference

### Constructor

```javascript
new TikTokViewer(containerId, data, options)
```

**Parameters:**
- `containerId` (string): ID của container element
- `data` (array): Mảng dữ liệu ảnh
- `options` (object): Các tùy chọn bổ sung
  - `startImagePath` (string): Đường dẫn ảnh để hiển thị trực tiếp

### Methods

#### `updateData(newData)`
Cập nhật dữ liệu mới cho viewer

```javascript
viewer.updateData(newDataArray);
```

#### `goToSlide(index)`
Chuyển đến slide cụ thể

```javascript
viewer.goToSlide(2); // Chuyển đến slide thứ 3
```

#### `getCurrentSlide()`
Lấy thông tin slide hiện tại

```javascript
const currentSlide = viewer.getCurrentSlide();
```

#### `getFavorites()`
Lấy danh sách ảnh yêu thích

```javascript
const favorites = viewer.getFavorites();
```

#### `close()`
Đóng viewer

```javascript
viewer.close();
```

#### `openWithImage(imagePath, data)`
Mở viewer với ảnh cụ thể

```javascript
viewer.openWithImage('/path/to/specific-image.jpg', newDataArray);
```

## Events

### `favoriteToggled`
Được trigger khi user toggle favorite

```javascript
document.addEventListener('favoriteToggled', (e) => {
    const { index, item, isFavorite } = e.detail;
    // Xử lý logic favorite
});
```

### `viewerClosed`
Được trigger khi viewer đóng

```javascript
document.addEventListener('viewerClosed', (e) => {
    const { currentIndex } = e.detail;
    // Xử lý logic khi đóng viewer
});
```

## Keyboard Shortcuts

- **↑**: Chuyển ảnh trước
- **↓**: Chuyển ảnh tiếp theo  
- **Esc**: Đóng viewer

## Touch/Mouse Controls

- **Swipe Up**: Chuyển ảnh tiếp theo
- **Swipe Down**: Chuyển ảnh trước
- **Mouse Wheel**: Cuộn để chuyển ảnh

## Customization

### CSS Classes có thể override

```css
.tiktok-viewer-container {
    /* Container styles */
}

.tiktok-swiper {
    /* Swiper container styles */
}

.progress-dot {
    /* Progress indicator dots */
}

.favorite-btn, .share-btn, .download-btn {
    /* Button styles */
}
```

### Swiper Options

Bạn có thể customize Swiper options trong method `initSwiper()`:

```javascript
this.swiper = new Swiper('.tiktok-swiper', {
    direction: 'vertical',
    slidesPerView: 1,
    spaceBetween: 0,
    mousewheel: true,
    keyboard: {
        enabled: true,
        onlyInViewport: true,
    },
    // Thêm options khác...
});
```

## Performance Tips

1. **Optimize Images**: Sử dụng ảnh có kích thước phù hợp
2. **Lazy Loading**: Component tự động lazy load ảnh
3. **Preload**: Tự động preload 5 ảnh tiếp theo
4. **Compression**: Nén ảnh để giảm kích thước file

## Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## License

MIT License 