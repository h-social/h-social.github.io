import { CONFIG } from "/config.js";
import { Utils } from "/script/function/general/Utils.js";

export class GithubAPI {
    constructor(token) {
        this.token = token;
        this.baseUrl = CONFIG.GITHUB_API_BASE;
        this.repository = CONFIG.DEFAULTS.REPOSITORY;
        this.userInfo = null;
        this.init();

    }
    static async create(token) {
        const instance = new GithubAPI(token);
        await instance.verifyToken();
        return instance;
    }
    init() {
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

    // Hàm chung để gọi API
    async request(endpoint, method = "GET", body = null) {
        const headers = {
            "Authorization": `token ${this.token}`,
            "Accept": "application/vnd.github+json"
        };
        if (body) headers["Content-Type"] = "application/json";

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`GitHub API error: ${response.status} - ${error}`);
        }
        return response.json();
    }

    // Lấy data (ví dụ: lấy thông tin user)
    async getUser() {
        return this.request("/user");
    }

    // Lưu data (ví dụ: cập nhật bio user)
    async updateUserBio(newBio) {
        return this.request("/user", "PATCH", { bio: newBio });
    }

    // Lấy repo
    async getRepos() {
        return this.request("/user/repos");
    }

    // Tạo repo mới
    async createRepo(repoData) {
        return this.request("/user/repos", "POST", repoData);
    }

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

    processImages(contents) {
        return contents
            .filter(item => this.isImageFile(item));
    }

    isImageFile(item) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic'];
        const fileName = item.name.toLowerCase();
        return imageExtensions.some(ext => fileName.endsWith(ext));
    }

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

    getHeader(){
        return{
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            "Content-Type": "application/json" 
        }
    }
    // Delete file from GitHub
    async deleteFile(filePath) {
        try {
            // First get the file to get its SHA
            filePath = filePath.replace(`https://github.com/${this.owner}/${this.repository}/blob/main/`,'') 
            const getResponse = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${filePath}`, {
                headers: this.getHeader()
            });

            if (!getResponse.ok) {
               
                throw new Error(`File not found: ${filePath}`);
            }

            const fileInfo = await getResponse.json();
            
            // Delete the file
            const deleteResponse = await fetch(`${CONFIG.GITHUB_API_BASE}/repos/${this.owner}/${this.repository}/contents/${filePath}`, {
                method: 'DELETE',
                headers: this.getHeader(),
                body: JSON.stringify(
                    {message:`Delete: ${filePath}`,committer:{name:"Bot",email:"bot@example.com"}, sha: fileInfo.sha}
                )
            });

            if (!deleteResponse.ok) {
                const err = await deleteResponse.json();
                console.error("GitHub DELETE error:", err);
                throw new Error(`Failed to delete file: ${filePath}`);
            }

            return { success: true };
        } catch (error) {
            return Utils.handleError(error, 'GitHubService.deleteFile');
        }
    }
}