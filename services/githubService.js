// GitHub API Service
class GitHubService {
    constructor() {
        this.token = null;
        this.userInfo = null;
        this.repository = CONFIG.DEFAULTS.REPOSITORY;
        this.owner = CONFIG.DEFAULTS.OWNER;
    }

    // Initialize service
    init(token) {
        this.token = token;
        return this.verifyToken();
    }

    // Verify GitHub token and get user info
    async verifyToken() {
        try {
            const response = await fetch(`${CONFIG.GITHUB_API_BASE}/user`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Invalid GitHub token');
            }

            this.userInfo = await response.json();
            this.owner = this.userInfo.login;
            this.repository = `${this.owner}.github.io`;

            // Save user info
            Utils.setStorage(CONFIG.STORAGE_KEYS.USER_INFO, this.userInfo);

            return {
                success: true,
                user: this.userInfo
            };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.verifyToken');
        }
    }

    // Create repository if it doesn't exist
    async createRepositoryIfNeeded() {
        try {
            const response = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status === 404) {
                // Repository doesn't exist, create it
                const createResponse = await fetch(`${CONFIG.GITHUB_API_BASE}/user/repos`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.repository,
                        description: 'Personal GitHub Pages site',
                        homepage: `https://${this.owner}.github.io`,
                        private: false,
                        auto_init: true
                    })
                });

                if (!createResponse.ok) {
                    throw new Error('Failed to create repository');
                }

                return { success: true, created: true };
            }

            return { success: true, created: false };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.createRepositoryIfNeeded');
        }
    }

    // Create folder by uploading .gitkeep file
    async createFolder(folderPath) {
        try {
            const content = btoa(''); // Empty content for .gitkeep
            const message = `Create folder: ${folderPath}`;
            
            const response = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${folderPath}/.gitkeep`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create folder: ${folderPath}`);
            }

            return { success: true };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.createFolder');
        }
    }
    processImages(contents) {
        return contents
            .filter(item => this.isImageFile(item));
    }

    isImageFile(item) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const fileName = item.name.toLowerCase();
        return imageExtensions.some(ext => fileName.endsWith(ext));
    }
    // Get folder contents
    async getFolderContents(folderPath = '') {
        try {
            const response = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${folderPath}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get folder contents: ${folderPath}`);
            }
            const contents = await response.json();
            let images = this.processImages(contents);
            images.forEach(image => {
                image.folder = folderPath;
            });
            if(Array.isArray(contents) && contents.length !== 0) {
                let cate = contents.filter(x=> x.type === "dir");
                for (let dir of cate) {
                    const dirContents = await this.getFolderContents(dir.path);
                    if (dirContents.success && Array.isArray(dirContents.contents)) {
                        images = images.concat(dirContents.images);
                    }
                }
            }

            return {
                success: true,
                contents: Array.isArray(contents) ? contents : [],
                images: images
            };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.getFolderContents');
        }
    }

    // Upload file to GitHub
    async uploadFile(file, folderPath = '') {
        try {
            const base64Content = await Utils.fileToBase64(file);
            const fileName = `${Utils.generateTimestamp()}_${file.name}`;
            const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
            
            const response = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload: ${fileName}`,
                    content: base64Content
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to upload file: ${fileName}`);
            }

            const result = await response.json();
            return {
                success: true,
                file: {
                    name: fileName,
                    path: filePath,
                    url: result.content.download_url,
                    size: file.size,
                    type: file.type
                }
            };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.uploadFile');
        }
    }

    // Delete file from GitHub
    async deleteFile(filePath) {
        try {
            // First get the file to get its SHA
            const getResponse = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${filePath}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!getResponse.ok) {
                throw new Error(`File not found: ${filePath}`);
            }

            const fileInfo = await getResponse.json();
            
            // Delete the file
            const deleteResponse = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${filePath}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete: ${filePath}`,
                    sha: fileInfo.sha
                })
            });

            if (!deleteResponse.ok) {
                throw new Error(`Failed to delete file: ${filePath}`);
            }

            return { success: true };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.deleteFile');
        }
    }

    // Get user info
    getUserInfo() {
        return this.userInfo;
    }

    // Get repository info
    getRepositoryInfo() {
        return {
            owner: this.owner,
            repository: this.repository
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubService;
} else {
    window.GitHubService = GitHubService;
} 