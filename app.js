// Main Application Class
class App {
    constructor() {
        this.currentService = null;
        this.currentPage = 'config';
        this.components = {};
        
        this.init();
    }

    init() {
        this.loadDependencies();
        this.setupEventListeners();
    }

    loadDependencies() {
        // Load configuration and utilities
        if (typeof CONFIG === 'undefined') {
            console.error('CONFIG not loaded');
            return;
        }
        
        if (typeof Utils === 'undefined') {
            console.error('Utils not loaded');
            return;
        }
    }

    setupEventListeners() {
        // Navigation events
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.setupServiceSwitching();
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }

    setupServiceSwitching() {
        const serviceTabs = document.querySelectorAll('.service-tab');
        serviceTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const service = e.target.getAttribute('data-service');
                this.switchService(service);
            });
        });
    }

    async initializeGitHubService(token) {
        try {
            this.githubService = new GitHubService();
            const result = await this.githubService.init(token);
            if (result.success) {
                this.currentService = this.githubService;
                this.updateUserInfo(result.user);
                this.showMainApp();
                $('#userInfoContainer').show();
            } else {
                this.showConfigPage();
                $('#userInfoContainer').hide();
            }
        } catch (error) {
            console.error('Failed to initialize GitHub service:', error);
            this.showConfigPage();
        }
    }

    async initializeCloudinaryService(cloudName, uploadPreset) {
        try {
            this.cloudinaryService = new CloudinaryService();
            const result = this.cloudinaryService.init(cloudName, uploadPreset);
            
            if (result.success) {
                this.currentService = this.cloudinaryService;
                this.updateUserInfo({ login: cloudName, avatar_url: '' });
                this.showMainApp();
            } else {
                this.showConfigPage();
            }
        } catch (error) {
            console.error('Failed to initialize Cloudinary service:', error);
            this.showConfigPage();
        }
    }

    switchService(serviceName) {
        // Hide all service configs
        document.querySelectorAll('.service-config').forEach(config => {
            config.style.display = 'none';
        });
        
        // Show selected service config
        const selectedConfig = document.getElementById(`${serviceName}Config`);
        if (selectedConfig) {
            selectedConfig.style.display = 'block';
        }
        
        // Update active tab
        document.querySelectorAll('.service-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-service="${serviceName}"]`).classList.add('active');
    }


    initMain() {
        const galleryContainer = document.getElementById('galleryContainer');
        if (galleryContainer && !this.components.galleryManager) {
            this.components.galleryManager = new GalleryManager(galleryContainer, this.currentService);
        }
    }
    async handleGitHubConfig() {
        const token = document.getElementById('githubToken').value.trim();
        
        if (!Utils.isValidGitHubToken(token)) {
            this.showMessage('Please enter a valid GitHub token', 'error');
            return;
        }
        
        try {
            await this.initializeGitHubService(token);
            Utils.setStorage(CONFIG.STORAGE_KEYS.GITHUB_TOKEN, token);
            pageService.redirectPage('main.html', function(){
                this.initMain();
            })
        } catch (error) {
            this.showMessage('Failed to configure GitHub: ' + error.message, 'error');
        }
    }

    async handleCloudinaryConfig() {
        const cloudName = document.getElementById('cloudName').value.trim();
        const uploadPreset = document.getElementById('uploadPreset').value.trim();
        
        if (!cloudName || !uploadPreset) {
            this.showMessage('Please enter both Cloud Name and Upload Preset', 'error');
            return;
        }
        
        try {
            await this.initializeCloudinaryService(cloudName, uploadPreset);
        } catch (error) {
            this.showMessage('Failed to configure Cloudinary: ' + error.message, 'error');
        }
    }

    updateUserInfo(user) {
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userInfo && userAvatar) {
            userInfo.textContent = user.login;
            userAvatar.src = user.avatar_url || 'default-avatar.png';
        }
    }

    showConfigPage() {
        this.hideAllPages();
        document.getElementById('configPage').style.display = 'block';
        this.currentPage = 'config';
    }

    showMainApp() {
        // pageService.redirectPage('main.html');
        // this.currentPage = 'main';
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
    }

    initializeComponents() {
        // Initialize favorites manager
        // if (!window.favoritesManager) {
        //     window.favoritesManager = new FavoritesManager();
        // }
        
        // // Initialize image preview
        // if (!window.imagePreview) {
        //     window.imagePreview = new ImagePreview();
        // }
        
        // // Initialize upload manager
        // const uploadContainer = document.getElementById('uploadContainer');
        // if (uploadContainer && !this.components.uploadManager) {
        //     this.components.uploadManager = new UploadManager(uploadContainer, this.currentService);
        // }
        
        // // Initialize gallery manager
        // const galleryContainer = document.getElementById('galleryContainer');
        // if (galleryContainer && !this.components.galleryManager) {
        //     this.components.galleryManager = new GalleryManager(galleryContainer, this.currentService);
        // }
    }

    navigateTo(page) {
        this.hideAllPages();
        
        switch (page) {
            case 'upload':
                document.getElementById('uploadPage').style.display = 'block';
                break;
            case 'gallery':
                document.getElementById('galleryPage').style.display = 'block';
                if (this.components.galleryManager) {
                    this.components.galleryManager.refresh();
                }
                break;
            case 'config':
                this.showConfigPage();
                break;
        }
        
        this.currentPage = page;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
    }

    logout() { 
        noti.confirm('Are you sure you want to log out?', function(){
            Utils.removeStorage(CONFIG.STORAGE_KEYS.GITHUB_TOKEN);
            Utils.removeStorage(CONFIG.STORAGE_KEYS.USER_INFO);
            Utils.removeStorage(CONFIG.STORAGE_KEYS.CLOUDINARY_CONFIG);
            
            // Reset services
            this.currentService = null;
            this.githubService = null;
            this.cloudinaryService = null;
            
            // Clear components
            this.components = {};
            
            // Show config page
            this.showConfigPage();
            
            this.showMessage('Logged out successfully', 'success');
        })
        // Clear all storage
    }

    showMessage(message, type = 'info') {
        const messageEl = Utils.createElement('div', `message message-${type}`, message);
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // Global refresh function for gallery
    refreshGallery() {
        if (this.components.galleryManager) {
            this.components.galleryManager.refresh();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Make refresh function globally available
    window.refreshGallery = () => {
        if (window.app) {
            window.app.refreshGallery();
        }
    };
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
} else {
    window.App = App;
} 