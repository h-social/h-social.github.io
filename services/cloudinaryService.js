// Cloudinary API Service
class CloudinaryService {
    constructor() {
        this.cloudName = null;
        this.uploadPreset = null;
        this.apiBase = CONFIG.CLOUDINARY_API_BASE;
    }

    // Initialize service
    init(cloudName, uploadPreset) {
        this.cloudName = cloudName;
        this.uploadPreset = uploadPreset;
        
        // Save config
        Utils.setStorage(CONFIG.STORAGE_KEYS.CLOUDINARY_CONFIG, {
            cloudName: this.cloudName,
            uploadPreset: this.uploadPreset
        });

        return { success: true };
    }

    // Upload file to Cloudinary
    async uploadFile(file, folder = '') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            
            if (folder) {
                formData.append('folder', folder);
            }

            const response = await fetch(`${this.apiBase}/${this.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            
            return {
                success: true,
                file: {
                    name: file.name,
                    path: result.public_id,
                    url: result.secure_url,
                    size: file.size,
                    type: file.type,
                    cloudinaryId: result.public_id,
                    width: result.width,
                    height: result.height
                }
            };
        } catch (error) {
            return Utils.handleError(error, 'CloudinaryService.uploadFile');
        }
    }

    // Delete file from Cloudinary
    async deleteFile(publicId) {
        try {
            const formData = new FormData();
            formData.append('public_id', publicId);

            const response = await fetch(`${this.apiBase}/${this.cloudName}/image/destroy`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.statusText}`);
            }

            return { success: true };
        } catch (error) {
            return Utils.handleError(error, 'CloudinaryService.deleteFile');
        }
    }

    // Get folder contents (Cloudinary doesn't have a direct API for this)
    // This would need to be implemented differently, perhaps by maintaining a local cache
    async getFolderContents(folder = '') {
        // Note: Cloudinary doesn't provide a direct API to list folder contents
        // This would need to be implemented with a backend or by maintaining a local cache
        return {
            success: true,
            contents: []
        };
    }

    // Create folder (Cloudinary creates folders automatically when uploading)
    async createFolder(folderPath) {
        // Cloudinary creates folders automatically when uploading files
        return { success: true };
    }

    // Get configuration
    getConfig() {
        return {
            cloudName: this.cloudName,
            uploadPreset: this.uploadPreset
        };
    }

    // Check if service is initialized
    isInitialized() {
        return this.cloudName && this.uploadPreset;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudinaryService;
} else {
    window.CloudinaryService = CloudinaryService;
} 