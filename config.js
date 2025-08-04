
export const firebaseConfig = {
    apiKey: "AIzaSyAXXyKzcIKvKY_STCRHzvaIBn8l5UwGxg8",
    authDomain: "hsocial-c5ef7.firebaseapp.com",
    projectId: "hsocial-c5ef7",
    storageBucket: "hsocial-c5ef7.firebasestorage.app",
    messagingSenderId: "656660800576",
    appId: "1:656660800576:web:3dad320a72be9270b26ba5",
    measurementId: "G-4VZDZPGXSQ"
};

// Configuration constants
export const CONFIG = {
  // App settings
  APP_NAME: 'H-Social Image Manager',
  VERSION: '1.0.0',
  
  // File limits
  MAX_FILES_PER_UPLOAD: 50,
  GALLERY_PAGE_SIZE: 21,
  
  // API endpoints
  GITHUB_API_BASE: 'https://api.github.com',
  
  // Storage keys
  STORAGE_KEYS: {
      GITHUB_TOKEN: 'githubToken',
      USER_INFO: 'userInfo',
      FAVORITES: 'favorites',
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
