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
        const modal = Utils.createElement('div', 'image-preview-modal', `
            <div class="modal-overlay" id="previewOverlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="previewTitle">Image Preview</h3>
                        <button class="close-btn" id="closePreview">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="image-container">
                            <button class="nav-btn prev-btn" id="prevBtn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            
                            <div class="image-wrapper">
                                <img id="previewImage" src="" alt="">
                            </div>
                            
                            <button class="nav-btn next-btn" id="nextBtn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        
                        <div class="image-info">
                            <span id="imageName"></span>
                            <span id="imageIndex"></span>
                        </div>
                        
                        <div class="image-actions">
                            <button class="btn btn-primary" id="downloadBtn">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn btn-secondary" id="favoriteBtn">
                                <i class="fas fa-heart"></i> Favorite
                            </button>
                            <button class="btn btn-danger" id="deleteBtn">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    bindEvents() {
        const overlay = document.getElementById('previewOverlay');
        const closeBtn = document.getElementById('closePreview');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const favoriteBtn = document.getElementById('favoriteBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        // Close modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });
        
        closeBtn.addEventListener('click', () => this.hide());

        // Navigation
        prevBtn.addEventListener('click', () => this.showPrevious());
        nextBtn.addEventListener('click', () => this.showNext());

        // Actions
        downloadBtn.addEventListener('click', () => this.downloadCurrent());
        favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        deleteBtn.addEventListener('click', () => this.deleteCurrent());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            switch (e.key) {
                case 'Escape':
                    this.hide();
                    break;
                case 'ArrowLeft':
                    this.showPrevious();
                    break;
                case 'ArrowRight':
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
        const currentImage = this.images[this.currentIndex] || { url: '', name: '' };
        const isFavorite = window.favoritesManager && window.favoritesManager.isFavorite(currentImage.url);
        
        // Update image
        const previewImage = document.getElementById('previewImage');
        previewImage.src = currentImage.url;
        previewImage.alt = currentImage.name;
        
        // Update title and info
        document.getElementById('previewTitle').textContent = currentImage.name;
        document.getElementById('imageName').textContent = currentImage.name;
        document.getElementById('imageIndex').textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        
        // Update favorite button
        const favoriteBtn = document.getElementById('favoriteBtn');
        favoriteBtn.className = `btn ${isFavorite ? 'btn-danger' : 'btn-secondary'}`;
        favoriteBtn.innerHTML = `<i class="fas fa-heart"></i> ${isFavorite ? 'Unfavorite' : 'Favorite'}`;
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.style.display = this.currentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = this.currentIndex < this.images.length - 1 ? 'block' : 'none';
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
        
        // Restore body scroll
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