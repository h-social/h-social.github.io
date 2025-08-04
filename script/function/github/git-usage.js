import { FirebaseQuery } from "/script/function/firebase/firebase-query.js";
import { GithubAPI } from "/script/function/github/git-api.js";

export class GitMain {
    constructor(app) {
        this.app = app
    }
    static async create(app) {
        const instance = new GitMain.create(app);
        await instance.init();
        return instance;
    }
    
    async init(){
        this.query = await FirebaseQuery.create(app);
        const token = this.get("SettingToken", "github")
        this.api = new GithubAPI(token);
    }


    async loadImages() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        try {
            const result = await this.service.getFolderContents(this.currentFolder);
            
            if (result.success) {
                this.category = result.contents.filter(x=> x.type == "dir");
                this.images = result.images;
                this.filterImages();
                this.displayImages();
            } else {
                this.showError('Failed to load images: ' + result.error);
            }
        } catch (error) {
            this.showError('Error loading images: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    

    getFolderFromPath(path) {
        const parts = path.split('/');
        return parts.length > 1 ? parts[0] : '';
    }

    filterImages() {
        this.filteredImages = this.images.filter(image => {
            if (this.currentFolder && image.folder !== this.currentFolder) {
                return false;
            }
            return true;
        });
        
        this.currentPage = 1;
        this.updateFolderList();
    }

    displayImages() {
        const container = this.container;
        const startIndex = 0;
        const endIndex = this.currentPage * CONFIG.GALLERY_PAGE_SIZE;
        const imagesToShow = this.filteredImages.slice(startIndex, endIndex);
        if (imagesToShow.length === 0) {
            container.querySelector('#image-grid').innerHTML = `
                <div class="no-images">
                    <i class="fas fa-images"></i>
                    <p>No images found</p>
                </div>
            `;
            this.hidePagination();
            return;
        }
        
        container.querySelector('#image-grid').innerHTML = imagesToShow.map(image => this.createImageCard(image)).join('');
        this.showPagination();
    }

    createImageCard(image) {
        const isFavorite = (window.favoritesManager && window.favoritesManager.isFavorite(image.url)) || false;
        const urlImage = image.html_url.replace('/blob/','/refs/heads/').replace('https://github.com/','https://raw.githubusercontent.com/')
        const previewImage = `https://images.weserv.nl/?url=${urlImage.replace('https://','')}&w=400`
        return `
            <div class="image-item" data-category="food" data-id="6" data-url="${image.url}" data-name="${image.name}">
                <img src="${previewImage}" alt="${image.name}" loading="lazy" class="w-full h-full">
            </div>
        `;
    }

    loadMoreImages() {
        this.currentPage++;
        this.displayImages();
    }

    showPagination() {
        const hasMore = this.filteredImages.length > this.currentPage * CONFIG.GALLERY_PAGE_SIZE;
        const pagination = this.container.querySelector('#galleryPagination');
        
        if (hasMore) {
            pagination.style.display = 'block';
        } else {
            pagination.style.display = 'none';
        }
    }

    hidePagination() {
        $('#galleryPagination').css('display','none');
    }

    showLoading() {
        $('#loadingSpinner').css('display','flex');
    }

    hideLoading() {
        $('#loadingSpinner').css('display','none');
    }

    showError(message) {
        noti.alert.error(message);
    }

    handleFolderFilter(e) {
        this.currentFolder = e.target.value;
        this.filterImages();
        this.displayImages();
    }

    updateFolderList() {
        const folderSelect = this.container.querySelector('#galleryFolderSelect');
        const currentValue = folderSelect.value;
        
        // Get unique folders from images
        const folders = [...new Set(this.images.map(img => img.folder).filter(folder => folder))];
        
        // Clear existing options except "All Folders"
        while (folderSelect.children.length > 1) {
            folderSelect.removeChild(folderSelect.lastChild);
        }
        
        // Add folder options
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            folderSelect.appendChild(option);
        });
        
        folderSelect.value = currentValue;
    }

    toggleFavoritesView() {
        if (window.favoritesManager) {
            const favoriteImages = this.filteredImages.filter(img => 
                window.favoritesManager.isFavorite(img.url)
            );
            
            if (favoriteImages.length === 0) {
                this.showMessage('No favorite images found', 'info');
                return;
            }
            
            this.filteredImages = favoriteImages;
            this.currentPage = 1;
            this.displayImages();
            this.hidePagination();
        }
    }

    previewImage(url, name) {
        if (!window.imagePreview) {
            window.imagePreview = new ImagePreview();
        }
         window.imagePreview.show(url, name, this.filteredImages);
    }

    downloadImage(url, name) {
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    toggleFavorite(url, name) {
        if (window.favoritesManager) {
            window.favoritesManager.toggleFavorite(url, name);
            this.displayImages(); // Refresh to update favorite button
        }
    }

    async deleteImage(path, name) {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }
        
        try {
            const result = await this.service.deleteFile(path);
            
            if (result.success) {
                this.showMessage(`Deleted: ${name}`, 'success');
                this.loadImages(); // Refresh gallery
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

    setService(service) {
        this.service = service;
    }

    refresh() {
        this.loadImages();
    }
}