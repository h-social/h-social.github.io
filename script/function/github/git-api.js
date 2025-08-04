import { CONFIG } from "/config.js";
import { Utils } from "/script/function/general/config.js";

export class GithubAPI {
    constructor(token) {
        this.token = token;
        this.baseUrl = CONFIG.GITHUB_API_BASE;
        this.repository = CONFIG.DEFAULTS.REPOSITORY;
        this.userInfo = null;
        this.init();

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
}