import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'


export class TikTokViewer {
    constructor(containerId, data = [], options = {}) {
        this.containerId = containerId;
        this.data = data;
        this.currentIndex = 0;
        this.swiper = null;
        this.options = {
            startImagePath: null,
            ...options
        };
        this.init();
    }

    init() {
        this.loadView();
        this.initSwiper();
        this.bindEvents();
        this.handleStartImage();
    }


    loadView() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id "${this.containerId}" not found`);
            return;
        }

        container.innerHTML = this.render();
    }

    render() {
        return `
            <div class="tiktok-viewer-container w-full h-screen bg-black">
                <div class="swiper tiktok-swiper h-full">
                    <div class="swiper-wrapper">
                        ${this.data.map((item, index) => this.renderSlide(item, index)).join('')}
                    </div>
                </div>
                
                <!-- Navigation Controls -->
                <div class="absolute top-4 left-4 z-10">
                    <button id="close-viewer" class="text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">
                        ×
                    </button>
                </div>
            </div>
        `;
    }

    renderSlide(item, index) {
        const urlImage = item.imagePath.replace('/blob/', '/refs/heads/').replace('https://github.com/', 'https://raw.githubusercontent.com/')
        const previewImage = `https://images.weserv.nl/?url=${urlImage.replace('https://', '')}&w=800`
        return `
            <div class="swiper-slide model relative h-full">
                <div class="w-full h-full flex items-center justify-center">
                    <img 
                        src="${previewImage}" 
                        alt="${item.name}"
                        class="w-full h-full object-cover"
                        loading="${index < 5 ? 'eager' : 'lazy'}"
                        onload="this.style.opacity='1'"
                        style="opacity: 0; transition: opacity 0.3s ease;"
                    />
                </div>
                
                <!-- Slide Info Overlay -->
                <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <h3 class="text-white text-xl font-semibold mb-2">${item.name}</h3>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <button class="favorite-btn text-2xl transition-transform hover:scale-110 ${item.favorite ? 'text-red-500' : 'text-white'}" data-index="${index}">
                                ${item.favorite ? '❤️' : '🤍'}
                            </button>
                            <button class="share-btn text-white text-2xl transition-transform hover:scale-110">
                                📤
                            </button>
                            <button href="${urlImage}" class="download-btn text-white text-2xl transition-transform hover:scale-110">
                                ⬇️
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Swipe Hint -->
                <div class="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-center opacity-60">
                    <div class="text-sm mb-2">Swipe up</div>
                    <div class="text-2xl">⬆️</div>
                </div>
            </div>
        `;
    }

    initSwiper() {
        this.swiper = new Swiper('.tiktok-swiper', {
            slidesPerView: 1,
            spaceBetween: 0,
            // mousewheel: true,
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            preloadImages: true,
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 2,
            },
            effect: 'slide',
            speed: 300,
            grabCursor: true,
            on: {
                slideChange: () => {
                    this.onSlideChange();
                },
                init: () => {
                    this.onInit();
                }
            }
        });
    }

    bindEvents() {
        // Close button
        document.getElementById('close-viewer')?.addEventListener('click', () => {
            this.close();
        });

        // Favorite button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.toggleFavorite(index);
            }
        });

        // Share button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-btn')) {
                this.shareCurrentImage();
            }
        });

        // Download button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-btn')) {
                this.downloadCurrentImage();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowUp') {
                this.swiper.slidePrev();
            } else if (e.key === 'ArrowDown') {
                this.swiper.slideNext();
            }
        });
    }

    onSlideChange() {
        this.currentIndex = this.swiper.activeIndex;
        this.updateProgressDots();
        this.preloadNextImages();
    }

    onInit() {
        this.updateProgressDots();
        this.preloadNextImages();
    }

    handleStartImage() {
        // Nếu có startImagePath, tìm index của ảnh đó và chuyển đến
        if (this.options.startImagePath && this.data.length > 0) {
            const urlImage = this.options.startImagePath.replace('/blob/', '/refs/heads/').replace('https://github.com/', 'https://raw.githubusercontent.com/')

            const startIndex = this.data.findIndex(item => item.imagePath === this.options.startImagePath);
            if (startIndex !== -1) {
                this.currentIndex = startIndex;
                if (this.swiper) {
                    this.swiper.slideTo(startIndex);
                }
                this.updateProgressDots();
            }
        }
    }

    updateProgressDots() {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('bg-opacity-100');
            } else {
                dot.classList.remove('bg-opacity-100');
            }
        });
    }

    preloadNextImages() {
        // Preload next 5 images
        const nextIndexes = [];
        for (let i = 1; i <= 5; i++) {
            const nextIndex = this.currentIndex + i;
            if (nextIndex < this.data.length) {
                nextIndexes.push(nextIndex);
            }
        }

        nextIndexes.forEach(index => {
            const img = new Image();
            img.src = this.data[index].imagePath;
        });
    }

    toggleFavorite(index) {
        this.data[index].favorite = !this.data[index].favorite;
        
        // Update button appearance
        const btn = document.querySelector(`[data-index="${index}"]`);
        if (btn) {
            if (this.data[index].favorite) {
                btn.textContent = '❤️';
                btn.classList.add('text-red-500');
                btn.classList.remove('text-white');
            } else {
                btn.textContent = '🤍';
                btn.classList.remove('text-red-500');
                btn.classList.add('text-white');
            }
        }

        // Trigger custom event
        const event = new CustomEvent('favoriteToggled', {
            detail: {
                index: index,
                item: this.data[index],
                isFavorite: this.data[index].favorite
            }
        });
        document.dispatchEvent(event);
    }

    shareCurrentImage() {
        const currentItem = this.data[this.currentIndex];
        
        if (navigator.share) {
            navigator.share({
                title: currentItem.name,
                text: `Xem ảnh: ${currentItem.name}`,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('Đã sao chép link vào clipboard!');
            });
        }
    }

    downloadCurrentImage() {
        const currentItem = this.data[this.currentIndex];
        
        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.href = currentItem.imageDownload;
        link.download = currentItem.name || 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    goToSlide(index) {
        if (this.swiper && index >= 0 && index < this.data.length) {
            this.swiper.slideTo(index);
        }
    }

    close() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        
        // Remove viewer-open class from body
        document.body.classList.remove('viewer-open');
        
        // Trigger custom event
        const event = new CustomEvent('viewerClosed', {
            detail: { currentIndex: this.currentIndex }
        });
        document.dispatchEvent(event);
    }

    // Public method to update data
    updateData(newData) {
        this.data = newData;
        this.loadView();
        this.initSwiper();
        this.handleStartImage();
    }

    // Public method to open viewer with specific image
    openWithImage(imagePath, data = null) {
        if (data) {
            this.data = data;
        }
        
        this.options.startImagePath = imagePath;
        this.loadView();
        this.initSwiper();
        this.handleStartImage();
    }

    // Public method to get current slide info
    getCurrentSlide() {
        return this.data[this.currentIndex];
    }

    // Public method to get all favorites
    getFavorites() {
        return this.data.filter(item => item.favorite);
    }
} 