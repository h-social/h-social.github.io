// Favorites Management
class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
    }

    // Load favorites from localStorage
    loadFavorites() {
        const stored = localStorage.getItem('favorites');
        return stored ? JSON.parse(stored) : [];
    }

    // Save favorites to localStorage
    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    // Add image to favorites
    addToFavorites(imagePath, imageUrl, imageName, folder) {
        const favorite = {
            path: imagePath,
            url: imageUrl,
            name: imageName,
            folder: folder,
            addedAt: new Date().toISOString()
        };

        if (!this.isFavorite(imagePath)) {
            this.favorites.push(favorite);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Remove image from favorites
    removeFromFavorites(imagePath) {
        const index = this.favorites.findIndex(fav => fav.path === imagePath);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Check if image is favorite
    isFavorite(imagePath) {
        return this.favorites.some(fav => fav.path === imagePath);
    }

    // Get all favorites
    getFavorites() {
        return this.favorites;
    }

    // Get favorites count
    getFavoritesCount() {
        return this.favorites.length;
    }

    // Clear all favorites
    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
    }
}

// Image Preview Modal
class ImagePreviewModal {
    constructor() {
        this.modal = null;
        this.currentImage = null;
        this.favoritesManager = new FavoritesManager();
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="imagePreviewModal" class="image-preview-modal">
                <div class="image-preview-overlay"></div>
                <div class="image-preview-container">
                    <div class="image-preview-header">
                        <div class="image-preview-info">
                            <h3 id="previewImageName"></h3>
                            <span id="previewImageFolder"></span>
                        </div>
                        <div class="image-preview-actions">
                            <button id="previewFavoriteBtn" class="btn btn-sm btn-outline">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button id="previewDownloadBtn" class="btn btn-sm btn-primary">
                                <i class="fas fa-download"></i> Tải về
                            </button>
                            <button id="previewCloseBtn" class="btn btn-sm btn-secondary">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="image-preview-content">
                        <img id="previewImage" src="" alt="">
                        <button class="image-preview-nav image-preview-prev" id="previewPrevBtn">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="image-preview-nav image-preview-next" id="previewNextBtn">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('imagePreviewModal');
    }

    setupEventListeners() {
        // Close modal
        document.getElementById('previewCloseBtn').addEventListener('click', () => this.close());
        document.querySelector('.image-preview-overlay').addEventListener('click', () => this.close());

        // Favorite button
        document.getElementById('previewFavoriteBtn').addEventListener('click', () => this.toggleFavorite());

        // Download button
        document.getElementById('previewDownloadBtn').addEventListener('click', () => this.downloadImage());

        // Navigation buttons
        document.getElementById('previewPrevBtn').addEventListener('click', () => this.showPrevious());
        document.getElementById('previewNextBtn').addEventListener('click', () => this.showNext());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('show')) return;

            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.showPrevious();
                    break;
                case 'ArrowRight':
                    this.showNext();
                    break;
                case 'f':
                case 'F':
                    this.toggleFavorite();
                    break;
            }
        });
    }

    async show(imageData, allImages = []) {
        this.currentImage = imageData;
        this.allImages = allImages;
        this.currentIndex = allImages.findIndex(img => img.path === imageData.path);
        const imageurl = imageData.path;
        // Update modal content
        document.getElementById('previewImage').src = imageurl;
        document.getElementById('previewImageName').textContent = imageData.name;
        document.getElementById('previewImageFolder').textContent = `📁 ${imageData.folder || 'images'}/`;

        // Update favorite button
        this.updateFavoriteButton();

        // Show/hide navigation buttons
        this.updateNavigationButtons();

        // Show modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        this.currentImage = null;
        this.allImages = [];
    }

    updateFavoriteButton() {
        const btn = document.getElementById('previewFavoriteBtn');
        const isFavorite = this.favoritesManager.isFavorite(this.currentImage.path);

        if (isFavorite) {
            btn.classList.add('btn-danger');
            btn.classList.remove('btn-outline');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-outline');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('previewPrevBtn');
        const nextBtn = document.getElementById('previewNextBtn');

        prevBtn.style.display = this.currentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = this.currentIndex < this.allImages.length - 1 ? 'block' : 'none';
    }

    toggleFavorite() {
        if (!this.currentImage) return;

        const isFavorite = this.favoritesManager.isFavorite(this.currentImage.path);

        if (isFavorite) {
            this.favoritesManager.removeFromFavorites(this.currentImage.path);
            showSuccess('Đã xóa khỏi yêu thích');
        } else {
            this.favoritesManager.addToFavorites(
                this.currentImage.path,
                this.currentImage.download_url,
                this.currentImage.name,
                this.currentImage.folder || 'images'
            );
            showSuccess('Đã thêm vào yêu thích');
        }

        this.updateFavoriteButton();

        // Update gallery if on favorites page
        if (currentPage === 'favorites') {
            loadFavoritesGallery();
        }
    }

    downloadImage() {
        if (!this.currentImage) return;
        downloadImage(this.currentImage.download_url, this.currentImage.name);
    }

    showPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.show(this.allImages[this.currentIndex], this.allImages);
        }
    }

    showNext() {
        if (this.currentIndex < this.allImages.length - 1) {
            this.currentIndex++;
            this.show(this.allImages[this.currentIndex], this.allImages);
        }
    }
}

// Global instances
const favoritesManager = new FavoritesManager();
const imagePreviewModal = new ImagePreviewModal();

// Favorites Gallery Functions
function loadFavoritesGallery() {
    const favorites = favoritesManager.getFavorites();
    displayFavoritesGallery(favorites);
}

function displayFavoritesGallery(favorites) {
    const gallery = document.getElementById('favoritesGallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    if (favorites.length === 0) {
        gallery.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-heart-broken"></i>
                <h3>Chưa có ảnh yêu thích</h3>
                <p>Bạn chưa yêu thích ảnh nào. Hãy khám phá thư viện và yêu thích những ảnh đẹp!</p>
                <button class="btn btn-primary" onclick="navigateToGallery()">
                    <i class="fas fa-images"></i> Xem thư viện
                </button>
            </div>
        `;
        return;
    }

    favorites.forEach(favorite => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        galleryItem.innerHTML = `
            <img src="${favorite.url}" alt="${favorite.name}" loading="lazy">
            <div class="gallery-item-info">
                <h4>${favorite.name}</h4>
                <div class="gallery-item-folder">📁 ${favorite.folder}/</div>
                <div class="gallery-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="previewImage(${JSON.stringify(favorite).replace(/"/g, '&quot;')})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="removeFromFavorites('${favorite.path}')">
                        <i class="fas fa-heart-broken"></i> Bỏ yêu thích
                    </button>
                </div>
            </div>
        `;

        gallery.appendChild(galleryItem);
    });
}

// Global functions for HTML onclick
function previewImage(imageData) {
    // Convert string back to object if needed
    if (typeof imageData === 'string') {
        imageData = JSON.parse(imageData);
    }

    // Get all images for navigation
    let allImages = [];
    if (currentPage === 'gallery') {
        // Get current gallery images
        const galleryItems = document.querySelectorAll('#gallery .gallery-item');
        allImages = Array.from(galleryItems).map(item => {
            const img = item.querySelector('img');
            const name = item.querySelector('h4').textContent;
            const folder = item.querySelector('.gallery-item-folder').textContent.replace('📁 ', '').replace('/', '');
            return {
                path: `${folder}/${name}`,
                download_url: img.src,
                name: name,
                folder: folder
            };
        });
    } else if (currentPage === 'favorites') {
        // Get favorites for navigation
        allImages = favoritesManager.getFavorites();
    }

    imagePreviewModal.show(imageData, allImages);
}

function toggleFavorite(imagePath, imageUrl, imageName, folder) {
    const isFavorite = favoritesManager.isFavorite(imagePath);

    if (isFavorite) {
        favoritesManager.removeFromFavorites(imagePath);
        showSuccess('Đã xóa khỏi yêu thích');
    } else {
        favoritesManager.addToFavorites(imagePath, imageUrl, imageName, folder);
        showSuccess('Đã thêm vào yêu thích');
    }

    // Update favorite button in gallery
    updateFavoriteButtonInGallery(imagePath);
}

function removeFromFavorites(imagePath) {
    if (confirm('Bạn có chắc muốn xóa ảnh này khỏi yêu thích?')) {
        favoritesManager.removeFromFavorites(imagePath);
        showSuccess('Đã xóa khỏi yêu thích');
        loadFavoritesGallery();
    }
}

function updateFavoriteButtonInGallery(imagePath) {
    const favoriteBtn = document.querySelector(`[data-image-path="${imagePath}"] .favorite-btn`);
    if (favoriteBtn) {
        const isFavorite = favoritesManager.isFavorite(imagePath);
        if (isFavorite) {
            favoriteBtn.classList.add('btn-danger');
            favoriteBtn.classList.remove('btn-outline');
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            favoriteBtn.classList.remove('btn-danger');
            favoriteBtn.classList.add('btn-outline');
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        }
    }
}

function clearAllFavorites() {
    if (confirm('Bạn có chắc muốn xóa tất cả ảnh yêu thích?')) {
        favoritesManager.clearFavorites();
        showSuccess('Đã xóa tất cả ảnh yêu thích');
        loadFavoritesGallery();
    }
}

// Update displayGallery function to include favorite buttons
function updateDisplayGalleryFunction() {
    // Override the displayGallery function in script.js
    window.displayGallery = async function (files) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        if (files.length === 0) {
            gallery.innerHTML = '<p>Chưa có hình ảnh nào</p>';
            return;
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            const downloadUrl = file.download_url;
            const url = await convertHeicFromUrl(downloadUrl);
            const filename = file.name;
            const size = formatFileSize(file.size);
            const folder = file.folder || 'images';
            galleryItem.innerHTML = `
                    <img src="${url}" alt="${filename}" loading="lazy">
                    <div class="gallery-item-info">
                        <h4>${filename}</h4>
                        <small>${size}</small>
                        <div class="gallery-item-folder">📁 ${folder}/</div>
                        <div class="gallery-item-actions">
                            <button class="btn btn-sm btn-primary" onclick="downloadImage('${downloadUrl}', '${filename}')">
                                <i class="fas fa-download"></i> Tải về
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteImage('${file.path}', '${file.sha}')">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                `;

            gallery.appendChild(galleryItem);

        }
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    updateDisplayGalleryFunction();
}); 