// Image Preview Component
class ImagePreview {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.isVisible = false;
        
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modal = Utils.createElement('div', 'image-preview-modal tiktok-style', `
            <div class="modal-overlay" id="previewOverlay">
                <div class="tiktok-preview-content">
                    <img id="previewImage" class="tiktok-preview-img" src="" alt="">
                    <div class="tiktok-actions">
                        <button class="tiktok-action-btn" id="favoriteBtn">
                            <i class="fas fa-heart"></i>
                            <span id="likeCount">0</span>
                        </button>
                        <button class="tiktok-action-btn" id="bookmarkBtn">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="tiktok-action-btn" id="shareBtn">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="tiktok-action-btn" id="deleteBtn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="tiktok-info">
                        <div class="tiktok-username" id="previewTitle">USERNAME</div>
                        <div class="tiktok-desc" id="imageName">Description #hashtag</div>
                        <div class="tiktok-music"><i class="fas fa-music"></i> <span id="musicInfo">Original Sound</span></div>
                        <div class="tiktok-index" id="imageIndex"></div>
                    </div>
                    <div class="tiktok-navbar">
                        <button class="nav-btn-tiktok"><i class="fas fa-home"></i></button>
                        <button class="nav-btn-tiktok"><i class="fas fa-user-friends"></i></button>
                        <button class="nav-btn-tiktok nav-btn-add"><i class="fas fa-plus"></i></button>
                        <button class="nav-btn-tiktok"><i class="fas fa-inbox"></i></button>
                        <button class="nav-btn-tiktok"><i class="fas fa-user"></i></button>
                    </div>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    bindEvents() {
        const overlay = document.getElementById('previewOverlay');
        const favoriteBtn = document.getElementById('favoriteBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        const shareBtn = document.getElementById('shareBtn');

        // Close modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });

        // Actions
        favoriteBtn.addEventListener('click', () => {
            const currentImage = this.images[this.currentIndex];
            if (currentImage && window.app && window.app.components && window.app.components.galleryManager) {
                window.app.components.galleryManager.toggleFavorite(currentImage.url, currentImage.name);
                this.updateDisplay();
            }
        });
        deleteBtn.addEventListener('click', () => this.deleteCurrent());
        bookmarkBtn.addEventListener('click', () => this.bookmarkCurrent && this.bookmarkCurrent());
        shareBtn.addEventListener('click', () => this.shareCurrent && this.shareCurrent());

        // Vertical swipe (touch events)
        let startY = null;
        const img = document.getElementById('previewImage');
        img.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startY = e.touches[0].clientY;
            }
        });
        img.addEventListener('touchend', (e) => {
            if (startY === null) return;
            const endY = e.changedTouches[0].clientY;
            const deltaY = endY - startY;
            if (Math.abs(deltaY) > 50) {
                if (deltaY < 0) this.showNext(); // swipe up
                else this.showPrevious(); // swipe down
            }
            startY = null;
        });

        // Mouse wheel for desktop vertical navigation
        img.addEventListener('wheel', (e) => {
            if (e.deltaY > 0) this.showNext();
            else if (e.deltaY < 0) this.showPrevious();
        });

        // Keyboard navigation (up/down)
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            switch (e.key) {
                case 'Escape':
                    this.hide();
                    break;
                case 'ArrowUp':
                    this.showPrevious();
                    break;
                case 'ArrowDown':
                    this.showNext();
                    break;
            }
        });
    }

    show(url, name, images = []) {
        this.images = images;
        this.currentIndex = this.images.findIndex(img => img.url === url);
        
        if (this.currentIndex === -1) {
            this.currentIndex = 0;
        }
        
        this.updateDisplay();
        this.showModal();
    }

    updateDisplay() {
        const currentImage = this.images[this.currentIndex] || { url: '', name: '', html_url: '', likeCount: 0 };
        const isFavorite = window.favoritesManager && window.favoritesManager.isFavorite(currentImage.url);
        const previewImage = document.getElementById('previewImage');
        const urlImage = currentImage.html_url ? currentImage.html_url.replace('/blob/','/refs/heads/').replace('https://github.com/','https://raw.githubusercontent.com/') : currentImage.url;
        previewImage.src = urlImage;
        previewImage.alt = currentImage.name;
        document.getElementById('previewTitle').textContent = currentImage.username || 'USERNAME';
        document.getElementById('imageName').textContent = currentImage.name || '';
        document.getElementById('musicInfo').textContent = currentImage.music || 'Original Sound';
        document.getElementById('imageIndex').textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        const favoriteBtn = document.getElementById('favoriteBtn');
        favoriteBtn.className = `tiktok-action-btn ${isFavorite ? 'liked' : ''}`;
        document.getElementById('likeCount').textContent = currentImage.likeCount || 0;
    }

    showModal() {
        const modal = document.getElementById('previewOverlay');
        modal.style.display = 'flex';
        this.isVisible = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    hide() {
        const modal = document.getElementById('previewOverlay');
        modal.style.display = 'none';
        this.isVisible = false;
        // $('.image-preview-modal').remove();
        // Restore body scroll
        imagePreviewModal.init();
        document.body.style.overflow = '';
    }

    showPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateDisplay();
        }
    }

    showNext() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.updateDisplay();
        }
    }

    downloadCurrent() {
        const currentImage = this.images[this.currentIndex];
        if (currentImage) {
            const link = document.createElement('a');
            link.href = currentImage.url;
            link.download = currentImage.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    toggleFavorite() {
        const currentImage = this.images[this.currentIndex];
        if (currentImage && window.favoritesManager) {
            window.favoritesManager.toggleFavorite(currentImage.url, currentImage.name);
            this.updateDisplay();
        }
    }

    async deleteCurrent() {
        const currentImage = this.images[this.currentIndex];
        if (!currentImage) return;
        
        if (!confirm(`Are you sure you want to delete "${currentImage.name}"?`)) {
            return;
        }
        
        try {
            // Find the service to use for deletion
            let service = null;
            if (window.githubService && window.githubService.getUserInfo()) {
                service = window.githubService;
            } else if (window.cloudinaryService && window.cloudinaryService.isInitialized()) {
                service = window.cloudinaryService;
            }
            
            if (!service) {
                this.showMessage('No service available for deletion', 'error');
                return;
            }
            
            const result = await service.deleteFile(currentImage.path || currentImage.cloudinaryId);
            
            if (result.success) {
                this.showMessage(`Deleted: ${currentImage.name}`, 'success');
                
                // Remove from images array
                this.images.splice(this.currentIndex, 1);
                
                // Update display or close if no images left
                if (this.images.length === 0) {
                    this.hide();
                } else {
                    if (this.currentIndex >= this.images.length) {
                        this.currentIndex = this.images.length - 1;
                    }
                    this.updateDisplay();
                }
                
                // Refresh gallery if available
                if (window.galleryManager) {
                    window.galleryManager.refresh();
                }
                if (!window.imagePreview) {
                    window.imagePreview = new ImagePreview();
                }

            } else {
                this.showMessage(`Failed to delete: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showMessage(`Error deleting image: ${error.message}`, 'error');
        }
    }

    showMessage(message, type = 'info') {
        const messageEl = Utils.createElement('div', `message message-${type}`, message);
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImagePreview;
} else {
    window.ImagePreview = ImagePreview;
} 