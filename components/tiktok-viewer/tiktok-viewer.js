import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'


export class TikTokViewer {
    constructor(containerId, data = [], options = {}) {
        this.containerId = containerId;
        this.data = data;
        this.currentIndex = 0;
        this.loadedUntilIndex = 9;
        this.jumpIndex = 0;
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
        const slidesHTML = this.data.slice(0, 10)
            .map((item, index) => this.renderSlide(item, index))
            .join('');
    
        return `
            <div class="tiktok-viewer-container w-full h-screen bg-black">
                <div class="swiper tiktok-swiper h-full">
                    <div class="swiper-wrapper">
                        ${slidesHTML}
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
                            <button href="${item.imageDownload}" class="download-btn text-white text-2xl transition-transform hover:scale-110">
                                ⬇️
                            </button>
                            <button class="delete-btn text-red-500 text-2xl transition-transform hover:scale-110" data-imageDownload="${item.imageDownload}">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initSwiper() {
        this.swiper = new Swiper('.tiktok-swiper', {
            slidesPerView: 1,
            spaceBetween: 0,
            direction: "vertical",
            mousewheel: true,
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

        const thisClass= this;
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

        $('.delete-btn').on('click', function(){
            const dataImageDownload = $(this).attr('data-imageDownload');
            const index = thisClass.data.findIndex(item => item.imageDownload === dataImageDownload);
            thisClass.deleteCurrentImage(index);
        })

        // // Delete button
        // document.addEventListener('click', (e) => {
        //     if (e.target.classList.contains('')) {
        //         const index = parseInt(e.target.dataset.index);
        //         this.deleteCurrentImage(index);
        //     }
        // });

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


    onInit() {
        this.preloadNextImages();
    }
    onSlideChange() {
        this.currentIndex = this.swiper.activeIndex;
        // Nếu đang gần cuối vùng đã load, append thêm slide
        if (this.currentIndex + 2 >= this.loadedUntilIndex && this.loadedUntilIndex < this.data.length - 1) {
            const nextIndex = this.loadedUntilIndex + 1;
            const maxLoad = Math.min(nextIndex + 5, this.data.length);
            
            // Xóa slide cũ nếu có quá nhiều slide (giữ lại 10 slide gần nhất)
            const currentSlides = this.swiper.slides.length;
            const maxSlidesToKeep = 10;
            
            if (currentSlides > maxSlidesToKeep) {
                const slidesToRemove = currentSlides - maxSlidesToKeep;
                // Xóa slide từ đầu (slide cũ nhất)
                for (let i = 0; i < slidesToRemove; i++) {
                    this.swiper.removeSlide(0);
                }
                // Điều chỉnh currentIndex sau khi xóa slide
                this.currentIndex = Math.max(0, this.currentIndex - slidesToRemove);
            }
            
            // Append slide mới
            for (let i = nextIndex; i < maxLoad; i++) {
                const slideHTML = this.renderSlide(this.data[i], i);
                const slideEl = document.createElement('div');
                slideEl.classList.add('swiper-slide');
                slideEl.innerHTML = slideHTML;
                this.swiper.appendSlide(slideEl.outerHTML);
            }
            this.loadedUntilIndex = maxLoad - 1;
        }

        this.preloadNextImages();
    }

    handleStartImage() {
        debugger;
        // Nếu có startImagePath, tìm index của ảnh đó và chuyển đến
        if (this.options.startImagePath && this.data.length > 0) {
            const urlImage = this.options.startImagePath.replace('/blob/', '/refs/heads/').replace('https://github.com/', 'https://raw.githubusercontent.com/')

            const startIndex = this.data.findIndex(item => item.imagePath === this.options.startImagePath);
            if (startIndex !== -1) {
                this.loadedUntilIndex = startIndex - 5;
                this.currentIndex = startIndex;
                this.onSlideChange();
                if (this.swiper) {
                    this.swiper.slideTo(startIndex);
                }
            }
        }
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
        debugger
        if (navigator.share) {
            navigator.share({
                title: currentItem.name,
                text: `Xem ảnh: ${currentItem.name}`,
                url: currentItem.imagePath
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const url = currentItem.imagePath;
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

    async deleteCurrentImage(index) {
        const currentItem = this.data[index || this.currentIndex];
        
        // Show confirmation popup
        const confirmed = confirm(`Bạn có chắc chắn muốn xóa ảnh "${currentItem.name}"?`);
        
        if (!confirmed) {
            return;
        }

        try {
            
            // Delete file from GitHub
            const result = await gitMain.api.deleteFile(currentItem.imagePath);
            
            if (result.success) {
                // Remove item from data array
                this.data.splice(index || this.currentIndex, 1);
                
                // Update swiper
                if (this.swiper) {
                    this.swiper.removeSlide(index || this.currentIndex);
                    
                    // If we deleted the last slide, go to previous slide
                    if (this.currentIndex >= this.data.length) {
                        this.currentIndex = Math.max(0, this.data.length - 1);
                        this.swiper.slideTo(this.currentIndex);
                    }
                }
                
                alert('Đã xóa ảnh thành công!');
                
                // Trigger custom event for parent components
                const event = new CustomEvent('imageDeleted', {
                    detail: {
                        index: index || this.currentIndex,
                        item: currentItem
                    }
                });
                document.dispatchEvent(event);
                
            } else {
                alert('Có lỗi xảy ra khi xóa ảnh. Vui lòng thử lại.');
            }
            
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Có lỗi xảy ra khi xóa ảnh: ' + error.message);
        }
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