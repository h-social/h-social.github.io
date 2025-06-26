// Configuration constants
const CONFIG = {
    // App settings
    APP_NAME: 'H-Social Image Manager',
    VERSION: '1.0.0',
    
    // File limits
    MAX_FILES_PER_UPLOAD: 50,
    GALLERY_PAGE_SIZE: 21,
    
    // API endpoints
    GITHUB_API_BASE: 'https://api.github.com',
    CLOUDINARY_API_BASE: 'https://api.cloudinary.com/v1_1',
    
    // Storage keys
    STORAGE_KEYS: {
        GITHUB_TOKEN: 'githubToken',
        USER_INFO: 'userInfo',
        FAVORITES: 'favorites',
        CLOUDINARY_CONFIG: 'cloudinaryConfig'
    },
    
    // Default settings
    DEFAULTS: {
        REPOSITORY: 'h-social.github.io',
        OWNER: 'h-social',
        DEFAULT_FOLDER: 'images'
    },
    
    // UI settings
    UI: {
        ANIMATION_DURATION: 300,
        LOADING_DELAY: 2000,
        CONFIRM_DELAY: 1000
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 