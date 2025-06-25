// Global variables
let selectedFiles = [];
let githubToken = localStorage.getItem('githubToken') || '';
let repository = 'h-social.github.io'; // Repository name
let owner = 'h-social'; // GitHub username
let availableFolders = []; // List of available folders
let currentFolderFilter = 'all'; // Current folder filter for gallery
let currentPage = 'config'; // Current page: 'config', 'gallery', 'upload'
let userInfo = null; // User information from GitHub API
const MAX_FILES = 50;
let failedUploads = [];

// DOM elements
const githubTokenInput = document.getElementById('githubToken');
const saveTokenBtn = document.getElementById('saveToken');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileList = document.getElementById('fileList');
const uploadBtn = document.getElementById('uploadBtn');
const refreshGalleryBtn = document.getElementById('refreshGallery');
const downloadAllBtn = document.getElementById('downloadAll');
const gallery = document.getElementById('gallery');

// Page elements
const configPage = document.getElementById('configPage');
const galleryPage = document.getElementById('galleryPage');
const uploadPage = document.getElementById('uploadPage');
const userMenu = document.getElementById('userMenu');
const avatarBtn = document.getElementById('avatarBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// Folder elements
const defaultFolderRadio = document.getElementById('defaultFolder');
const existingFolderRadio = document.getElementById('existingFolder');
const newFolderRadio = document.getElementById('newFolder');
const existingFolderSelect = document.getElementById('existingFolderSelect');
const newFolderInput = document.getElementById('newFolderInput');
const refreshFoldersBtn = document.getElementById('refreshFolders');
const galleryFolderFilter = document.getElementById('galleryFolderFilter');

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    initializeApp();
    await loadFolders();
    setupEventListeners();
    checkAuthAndNavigate();
});

function initializeApp() {
    // Set token if exists
    if (githubToken) {
        githubTokenInput.value = githubToken;
    }
}

function setupEventListeners() {
    // Token management
    saveTokenBtn.addEventListener('click', saveToken);
    
    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Upload
    uploadBtn.addEventListener('click', uploadFiles);
    
    // Gallery
    refreshGalleryBtn.addEventListener('click', loadGallery);
    downloadAllBtn.addEventListener('click', downloadAllImages);
    
    // Folder management
    refreshFoldersBtn.addEventListener('click', loadFolders);
    defaultFolderRadio.addEventListener('change', handleFolderOptionChange);
    existingFolderRadio.addEventListener('change', handleFolderOptionChange);
    newFolderRadio.addEventListener('change', handleFolderOptionChange);
    galleryFolderFilter.addEventListener('change', handleGalleryFilterChange);
    
    // Avatar dropdown
    avatarBtn.addEventListener('click', toggleDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!userMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
}

// Navigation and Routing
function checkAuthAndNavigate() {
    if (githubToken) {
        // Verify token and get user info
        verifyTokenAndGetUserInfo().then(() => {
            showUserMenu();
            navigateToGallery();
        }).catch(() => {
            // Token invalid, clear and show config page
            githubToken = '';
            localStorage.removeItem('githubToken');
            userInfo = null;
            showConfigPage();
        });
    } else {
        showConfigPage();
    }
}

function showConfigPage() {
    currentPage = 'config';
    configPage.style.display = 'block';
    galleryPage.style.display = 'none';
    uploadPage.style.display = 'none';
    userMenu.style.display = 'none';
}

async function showGalleryPage() {
    currentPage = 'gallery';
    configPage.style.display = 'none';
    galleryPage.style.display = 'block';
    uploadPage.style.display = 'none';
    userMenu.style.display = 'block';
    await loadFolders();
    loadGallery();
}

function showUploadPage() {
    currentPage = 'upload';
    configPage.style.display = 'none';
    galleryPage.style.display = 'none';
    uploadPage.style.display = 'block';
    userMenu.style.display = 'block';
    loadFolders();
}

function showFavoritesPage() {
    currentPage = 'favorites';
    configPage.style.display = 'none';
    galleryPage.style.display = 'none';
    uploadPage.style.display = 'none';
    favoritesPage.style.display = 'block';
    userMenu.style.display = 'block';
    loadFavoritesGallery();
}

function showUserMenu() {
    userMenu.style.display = 'block';
    updateUserMenu();
}

function updateUserMenu() {
    if (userInfo) {
        // Update avatar with user info
        avatarBtn.innerHTML = `
            <img src="${userInfo.avatar_url}" alt="${userInfo.login}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        `;
        
        // Update dropdown menu
        dropdownMenu.innerHTML = `
            <div class="dropdown-header">
                <strong>${userInfo.name || userInfo.login}</strong>
                <small>@${userInfo.login}</small>
            </div>
            <div class="dropdown-item" onclick="navigateToUpload()">
                <i class="fas fa-cloud-upload-alt"></i>
                Upload hình ảnh
            </div>
            <div class="dropdown-item" onclick="navigateToFavorites()">
                <i class="fas fa-heart"></i>
                Ảnh yêu thích <span id="favoritesCount" style="margin-left:6px; color:#e53e3e; font-weight:bold;">${typeof favoritesManager !== 'undefined' ? favoritesManager.getFavoritesCount() : 0}</span>
            </div>
            <div class="dropdown-item" onclick="showUserInfo()">
                <i class="fas fa-info-circle"></i>
                Thông tin tài khoản
            </div>
            <div class="dropdown-item" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Đăng xuất
            </div>
        `;
    }
}

function toggleDropdown() {
    dropdownMenu.classList.toggle('show');
}

// Navigation functions (called from HTML)
function navigateToGallery() {
    showGalleryPage();
    dropdownMenu.classList.remove('show');
}

function navigateToUpload() {
    showUploadPage();
    dropdownMenu.classList.remove('show');
}

function navigateToFavorites() {
    showFavoritesPage();
    dropdownMenu.classList.remove('show');
}

function logout() {
    githubToken = '';
    userInfo = null;
    localStorage.removeItem('githubToken');
    localStorage.removeItem('userInfo');
    selectedFiles = [];
    availableFolders = [];
    showConfigPage();
    dropdownMenu.classList.remove('show');
    showSuccess('Đã đăng xuất thành công!');
}

// Token Management
async function saveToken() {
    const token = githubTokenInput.value.trim();
    if (!token) {
        showError('Vui lòng nhập GitHub Personal Access Token');
        return;
    }
    
    showLoading('Đang kiểm tra token...');
    
    try {
        // Verify token and get user info
        await verifyTokenAndGetUserInfo(token);
        
        // Save token and user info
        githubToken = token;
        localStorage.setItem('githubToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Update repository settings
        owner = userInfo.login;
        repository = `${userInfo.login}.github.io`;
        
        hideLoading();
        showSuccess(`Đăng nhập thành công! Chào mừng ${userInfo.name || userInfo.login}!`);
        showUserMenu();
        navigateToGallery();
    } catch (error) {
        hideLoading();
        showError('Token không hợp lệ hoặc có lỗi xảy ra: ' + error.message);
    }
}

async function verifyTokenAndGetUserInfo(token = githubToken) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Token không hợp lệ');
        }
        
        userInfo = await response.json();
        
        // Update repository settings
        owner = userInfo.login;
        repository = `${userInfo.login}.github.io`;
        
        return userInfo;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw error;
    }
}

function showUserInfo() {
    if (userInfo) {
        const message = `
            <strong>Tài khoản:</strong> ${userInfo.name || userInfo.login}<br>
            <strong>Username:</strong> @${userInfo.login}<br>
            <strong>Repository:</strong> ${repository}<br>
            <strong>Email:</strong> ${userInfo.email || 'Không công khai'}<br>
            <strong>Vị trí:</strong> ${userInfo.location || 'Không công khai'}
        `;
        
        document.getElementById('successMessage').innerHTML = message;
        document.getElementById('successModal').style.display = 'block';
        dropdownMenu.classList.remove('show');
    }
}

// Repository Management
async function ensureRepositoryExists() {
    try {
        // Check if repository exists
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.status === 404) {
            // Repository doesn't exist, create it
            showLoading('Đang tạo repository...');
            
            const createResponse = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: repository,
                    description: 'GitHub Pages repository for image management',
                    homepage: `https://${owner}.github.io`,
                    private: false,
                    auto_init: true,
                    gitignore_template: 'Node',
                    license_template: 'mit'
                })
            });
            
            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(`Không thể tạo repository: ${error.message}`);
            }
            
            hideLoading();
            showSuccess(`Đã tạo repository ${repository} thành công!`);
            
            // Wait a bit for GitHub to initialize the repository
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else if (!response.ok) {
            throw new Error('Không thể truy cập repository');
        }
        
        return true;
    } catch (error) {
        console.error('Error ensuring repository exists:', error);
        throw error;
    }
}

// Folder Management
function handleFolderOptionChange() {
    const selectedOption = document.querySelector('input[name="folderOption"]:checked').value;
    
    // Reset all controls
    existingFolderSelect.disabled = true;
    newFolderInput.disabled = true;
    
    switch(selectedOption) {
        case 'existing':
            existingFolderSelect.disabled = false;
            break;
        case 'new':
            newFolderInput.disabled = false;
            break;
        case 'default':
        default:
            // Default folder - no additional controls needed
            break;
    }
}

async function loadFolders() {
    if (!githubToken) {
        return;
    }
    
    try {
        // Ensure repository exists first
        await ensureRepositoryExists();
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách thư mục');
        }
        
        const contents = await response.json();
        availableFolders = contents
            .filter(item => item.type === 'dir')
            .map(item => item.name)
            .sort();
        
        updateFolderSelects();
    } catch (error) {
        console.error('Error loading folders:', error);
        availableFolders = [];
        updateFolderSelects();
    }
}

function updateFolderSelects() {
    // Update existing folder select
    existingFolderSelect.innerHTML = '<option value="">Chọn thư mục...</option>';
    availableFolders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        existingFolderSelect.appendChild(option);
    });
    
    // Update gallery filter
    galleryFolderFilter.innerHTML = '<option value="all">Tất cả thư mục</option>';
    availableFolders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        galleryFolderFilter.appendChild(option);
    });
}

function getSelectedFolder() {
    const selectedOption = document.querySelector('input[name="folderOption"]:checked').value;
    
    switch(selectedOption) {
        case 'default':
            return 'images';
        case 'existing':
            return existingFolderSelect.value || 'images';
        case 'new':
            const newFolderName = newFolderInput.value.trim();
            return newFolderName || 'images';
        default:
            return 'images';
    }
}

function handleGalleryFilterChange() {
    currentFolderFilter = galleryFolderFilter.value;
    loadGallery();
}

// File Selection
function handleFileSelect(event) {
    let files = Array.from(event.target.files);
    if (files.length > MAX_FILES) {
        showError(`Chỉ được chọn tối đa ${MAX_FILES} file/lần. Sẽ chỉ lấy 50 file đầu tiên.`);
        files = files.slice(0, MAX_FILES);
    }
    addFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    let files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
        showError('Chỉ chấp nhận file hình ảnh');
    }
    if (imageFiles.length > MAX_FILES) {
        showError(`Chỉ được chọn tối đa ${MAX_FILES} file/lần. Sẽ chỉ lấy 50 file đầu tiên.`);
        files = imageFiles.slice(0, MAX_FILES);
    } else {
        files = imageFiles;
    }
    addFiles(files);
}

function addFiles(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            selectedFiles.push(file);
        }
    });
    updateFileList();
    updateUploadButton();
}

function updateFileList() {
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSize = formatFileSize(file.size);
        const fileType = file.type.split('/')[1].toUpperCase();
        const selectedFolder = getSelectedFolder();
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-image"></i>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <small>${fileSize} • ${fileType}</small>
                    <div class="gallery-item-folder">📁 ${selectedFolder}/</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-sm btn-danger" onclick="removeFile(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateUploadButton();
}

function updateUploadButton() {
    uploadBtn.disabled = selectedFiles.length === 0 || !githubToken;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
async function createFolder(folderName) {
    try {
        // Tạo file .gitkeep để tạo thư mục trên GitHub
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${folderName}/.gitkeep`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Create folder: ${folderName}`,
                content: btoa(''), // Empty file
                branch: 'main'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            // Nếu thư mục đã tồn tại thì bỏ qua lỗi
            if (error.message && !error.message.includes('already exists')) {
                throw new Error(error.message);
            }
        }
    } catch (error) {
        console.error('Error creating folder:', error);
        // Tiếp tục, có thể thư mục đã tồn tại
    }
}
async function uploadSingleFile(file, folder) {
    try {
        // Convert file to base64
        const base64Content = await fileToBase64(file);

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${folder}/${timestamp}-${file.name}`;

        // GitHub API request
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add image: ${file.name} to ${folder}`,
                content: base64Content,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        return { success: true, filename };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}
// Upload tuần tự từng file, lưu trạng thái
async function uploadFiles(filesToUpload = null) {
    debugger;
    if (!githubToken) {
        showError('Vui lòng nhập GitHub Personal Access Token');
        return;
    }
    if (!filesToUpload) filesToUpload = selectedFiles;
    if ((filesToUpload.length||0) === 0){
        filesToUpload = selectedFiles;
    }

    if (filesToUpload.length === 0) {
        showError('Vui lòng chọn ít nhất một hình ảnh');
        return;
    }
    if (filesToUpload.length > MAX_FILES) {
        showError(`Chỉ được upload tối đa ${MAX_FILES} file/lần.`);
        filesToUpload = filesToUpload.slice(0, MAX_FILES);
    }
    const selectedFolder = getSelectedFolder();
    if (!selectedFolder) {
        showError('Vui lòng chọn hoặc nhập tên thư mục');
        return;
    }
    showLoading('Đang upload hình ảnh...');
    failedUploads = [];
    try {
        await ensureRepositoryExists();
        if (document.getElementById('newFolder').checked && selectedFolder !== 'images') {
            await createFolder(selectedFolder);
        }
        let successCount = 0;
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            document.getElementById('loadingText').textContent = `Đang upload (${i+1}/${filesToUpload.length}): ${file.name}`;
            const result = await uploadSingleFile(file, selectedFolder);
            if (result.success) {
                successCount++;
            } else {
                failedUploads.push(file);
            }
        }
        hideLoading();
        if (failedUploads.length === 0) {
            showSuccess(`Upload thành công ${successCount} hình ảnh vào thư mục ${selectedFolder}!`);
            selectedFiles = [];
            updateFileList();
            updateUploadButton();
            loadFolders();
            // setTimeout(() => {
            //     if (confirm('Bạn có muốn xem hình ảnh vừa upload không?')) {
            //         navigateToGallery();
            //     }
            // }, 1000);
        } else {
            showFailedUploadsUI();
        }
    } catch (error) {
        hideLoading();
        showError('Có lỗi xảy ra khi upload: ' + error.message);
    }
}

function showFailedUploadsUI() {
    let html = `<h3 style='color:#e53e3e;'>Một số file upload thất bại:</h3><ul style='text-align:left;'>`;
    failedUploads.forEach(f => {
        html += `<li>${f.name} (${formatFileSize(f.size)})</li>`;
    });
    html += `</ul><button class='btn btn-primary' onclick='retryFailedUploads()'><i class='fas fa-redo'></i> Upload lại file lỗi</button>`;
    html += `<button class='btn btn-secondary' style='margin-left:10px;' onclick='closeModal("successModal")'>Đóng</button>`;
    document.getElementById('successMessage').innerHTML = html;
    document.getElementById('successModal').style.display = 'block';
}

function retryFailedUploads() {
    closeModal('successModal');
    if (failedUploads.length > 0) {
        uploadFiles(failedUploads);
    }
}

// Gallery Management
async function loadGallery() {
    if (!githubToken) {
        gallery.innerHTML = '<p>Vui lòng nhập GitHub token để xem hình ảnh</p>';
        return;
    }
    
    showLoading('Đang tải thư viện hình ảnh...');
    
    try {
        // Ensure repository exists first
        await ensureRepositoryExists();
        
        let allImages = [];
        
        if (currentFolderFilter === 'all') {
            // Load images from all folders
            const folders = ['images', ...availableFolders];
            const folderPromises = folders.map(folder => loadImagesFromFolder(folder));
            const folderResults = await Promise.allSettled(folderPromises);
            
            folderResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    allImages = allImages.concat(result.value);
                }
            });
        } else {
            // Load images from specific folder
            allImages = await loadImagesFromFolder(currentFolderFilter) || [];
        }
        
        displayGallery(allImages);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Lỗi khi tải thư viện: ' + error.message);
    }
}

async function loadImagesFromFolder(folder) {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${folder}`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Cache-Control': 'no-cache'

            }
        });
        
        if (!response.ok) {
            return []; // Folder doesn't exist or no access
        }
        
        const files = await response.json();
        const imageFiles = files
            .filter(file => 
                file.type === 'file' && 
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) &&
                file.name !== '.gitkeep'
            )
            .map(file => ({
                ...file,
                folder: folder
            }));
        
        return imageFiles;
    } catch (error) {
        console.error(`Error loading images from ${folder}:`, error);
        return [];
    }
}

function displayGallery(files) {
    gallery.innerHTML = '';
    
    if (files.length === 0) {
        gallery.innerHTML = '<p>Chưa có hình ảnh nào</p>';
        return;
    }
    
    files.forEach(file => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        const downloadUrl = file.download_url;
        const filename = file.name;
        const size = formatFileSize(file.size);
        const folder = file.folder || 'images';
        
        galleryItem.innerHTML = `
            <img src="${downloadUrl}" alt="${filename}" loading="lazy">
            <div class="gallery-item-info">
                <h4>${filename}</h4>
                <small>${size}</small>
                <div class="gallery-item-folder">📁 ${folder}/</div>
                <div class="gallery-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="downloadImage('${downloadUrl}', '${filename}')">
                        <i class="fas fa-download"></i> Tải về
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteImage('${file.path}', '${file.sha}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
        
        gallery.appendChild(galleryItem);
    });
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showSuccess(`Đã tải về: ${filename}`);
    } catch (error) {
        showError('Lỗi khi tải về: ' + error.message);
    }
}

async function downloadAllImages() {
    if (!githubToken) {
        showError('Vui lòng nhập GitHub token');
        return;
    }
    
    showLoading('Đang tải tất cả hình ảnh...');
    
    try {
        let allImages = [];
        
        if (currentFolderFilter === 'all') {
            const folders = ['images', ...availableFolders];
            const folderPromises = folders.map(folder => loadImagesFromFolder(folder));
            const folderResults = await Promise.allSettled(folderPromises);
            
            folderResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    allImages = allImages.concat(result.value);
                }
            });
        } else {
            allImages = await loadImagesFromFolder(currentFolderFilter) || [];
        }
        
        if (allImages.length === 0) {
            hideLoading();
            showError('Không có hình ảnh nào để tải');
            return;
        }
        
        // Download each image
        for (const file of allImages) {
            await downloadImage(file.download_url, file.name);
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
        }
        
        hideLoading();
        showSuccess(`Đã tải về ${allImages.length} hình ảnh!`);
    } catch (error) {
        hideLoading();
        showError('Lỗi khi tải tất cả: ' + error.message);
    }
}

async function deleteImage(path, sha) {
    if (!confirm('Bạn có chắc muốn xóa hình ảnh này?')) {
        return;
    }
    
    if (!githubToken) {
        showError('Vui lòng nhập GitHub token');
        return;
    }
    
    showLoading('Đang xóa hình ảnh...');
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete image: ${path.split('/').pop()}`,
                sha: sha
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Delete failed');
        }
        
        hideLoading();
        showSuccess('Đã xóa hình ảnh thành công!');
        loadGallery();
    } catch (error) {
        hideLoading();
        showError('Lỗi khi xóa: ' + error.message);
    }
}

// Modal Management
function showLoading(message) {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingModal').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}

function showSuccess(message) {
    document.getElementById('successMessage').innerHTML = message;
    document.getElementById('successModal').style.display = 'block';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}); 