// Upload Manager Component
class UploadManager {
    constructor(container, service) {
        this.container = container;
        this.service = service;
        this.uploadQueue = [];
        this.isUploading = false;
        this.currentFolder = '';
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="upload-section">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-content">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h3>Upload Images</h3>
                        <p>Drag & drop images here or click to browse</p>
                        <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
                        <button class="btn btn-primary" id="browseBtn">Browse Files</button>
                    </div>
                </div>
                
                <div class="folder-selector">
                    <label for="folderSelect">Select Folder:</label>
                    <select id="folderSelect">
                        <option value="">Root Folder</option>
                    </select>
                    <button class="btn btn-secondary" id="newFolderBtn">New Folder</button>
                </div>
                
                <div class="upload-progress" id="uploadProgress" style="display: none;">
                    <div class="progress-header">
                        <h4>Uploading Files</h4>
                        <span id="progressText">0 / 0</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="upload-queue" id="uploadQueue"></div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const uploadArea = this.container.querySelector('#uploadArea');
        const fileInput = this.container.querySelector('#fileInput');
        const browseBtn = this.container.querySelector('#browseBtn');
        const folderSelect = this.container.querySelector('#folderSelect');
        const newFolderBtn = this.container.querySelector('#newFolderBtn');

        // Drag and drop events
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input events
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Folder events
        folderSelect.addEventListener('change', this.handleFolderChange.bind(this));
        newFolderBtn.addEventListener('click', this.handleNewFolder.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const imageFiles = files.filter(file => Utils.isValidImageFile(file));
        
        if (imageFiles.length === 0) {
            this.showMessage('No valid image files selected', 'error');
            return;
        }

        if (imageFiles.length > CONFIG.MAX_FILES_PER_UPLOAD) {
            this.showMessage(`Too many files selected. Maximum ${CONFIG.MAX_FILES_PER_UPLOAD} files allowed.`, 'warning');
            return;
        }

        this.addToQueue(imageFiles);
        this.startUpload();
    }

    addToQueue(files) {
        files.forEach(file => {
            this.uploadQueue.push({
                file: file,
                status: 'pending',
                progress: 0
            });
        });
    }

    async startUpload() {
        if (this.isUploading) return;
        
        this.isUploading = true;
        this.showProgress();
        
        for (let i = 0; i < this.uploadQueue.length; i++) {
            const item = this.uploadQueue[i];
            
            if (item.status === 'pending') {
                item.status = 'uploading';
                this.updateQueueDisplay();
                
                try {
                    const result = await this.service.uploadFile(item.file, this.currentFolder);
                    
                    if (result.success) {
                        item.status = 'completed';
                        item.result = result.file;
                        this.showMessage(`Uploaded: ${item.file.name}`, 'success');
                    } else {
                        item.status = 'failed';
                        item.error = result.error;
                        this.showMessage(`Failed: ${item.file.name} - ${result.error}`, 'error');
                    }
                } catch (error) {
                    item.status = 'failed';
                    item.error = error.message;
                    this.showMessage(`Failed: ${item.file.name} - ${error.message}`, 'error');
                }
                
                this.updateQueueDisplay();
                
                // Add delay between uploads
                if (i < this.uploadQueue.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        this.isUploading = false;
        this.hideProgress();
        
        // Trigger gallery refresh
        if (typeof window.refreshGallery === 'function') {
            window.refreshGallery();
        }
    }

    updateQueueDisplay() {
        const queueContainer = this.container.querySelector('#uploadQueue');
        const progressText = this.container.querySelector('#progressText');
        const progressFill = this.container.querySelector('#progressFill');
        
        const total = this.uploadQueue.length;
        const completed = this.uploadQueue.filter(item => item.status === 'completed').length;
        const failed = this.uploadQueue.filter(item => item.status === 'failed').length;
        const uploading = this.uploadQueue.filter(item => item.status === 'uploading').length;
        
        progressText.textContent = `${completed + failed} / ${total}`;
        progressFill.style.width = `${((completed + failed) / total) * 100}%`;
        
        queueContainer.innerHTML = this.uploadQueue.map(item => `
            <div class="queue-item ${item.status}">
                <span class="file-name">${item.file.name}</span>
                <span class="file-size">${Utils.formatFileSize(item.file.size)}</span>
                <span class="status">
                    ${item.status === 'pending' ? '<i class="fas fa-clock"></i>' : ''}
                    ${item.status === 'uploading' ? '<i class="fas fa-spinner fa-spin"></i>' : ''}
                    ${item.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                    ${item.status === 'failed' ? '<i class="fas fa-times"></i>' : ''}
                </span>
                ${item.status === 'failed' ? `<button class="btn btn-sm btn-retry" onclick="uploadManager.retryUpload('${item.file.name}')">Retry</button>` : ''}
            </div>
        `).join('');
    }

    retryUpload(fileName) {
        const item = this.uploadQueue.find(item => item.file.name === fileName);
        if (item) {
            item.status = 'pending';
            item.error = null;
            this.updateQueueDisplay();
            this.startUpload();
        }
    }

    showProgress() {
        this.container.querySelector('#uploadProgress').style.display = 'block';
    }

    hideProgress() {
        this.container.querySelector('#uploadProgress').style.display = 'none';
    }

    handleFolderChange(e) {
        this.currentFolder = e.target.value;
    }

    async handleNewFolder() {
        const folderName = prompt('Enter folder name:');
        if (folderName && folderName.trim()) {
            const result = await this.service.createFolder(folderName.trim());
            if (result.success) {
                this.updateFolderList();
                this.container.querySelector('#folderSelect').value = folderName.trim();
                this.currentFolder = folderName.trim();
                this.showMessage(`Created folder: ${folderName}`, 'success');
            } else {
                this.showMessage(`Failed to create folder: ${result.error}`, 'error');
            }
        }
    }

    updateFolderList() {
        // This would need to be implemented based on the service
        // For now, we'll just add the current folder if it's not in the list
        const folderSelect = this.container.querySelector('#folderSelect');
        const currentValue = folderSelect.value;
        
        if (this.currentFolder && !Array.from(folderSelect.options).some(option => option.value === this.currentFolder)) {
            const option = document.createElement('option');
            option.value = this.currentFolder;
            option.textContent = this.currentFolder;
            folderSelect.appendChild(option);
        }
        
        folderSelect.value = currentValue;
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = Utils.createElement('div', `message message-${type}`, message);
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    setService(service) {
        this.service = service;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UploadManager;
} else {
    window.UploadManager = UploadManager;
} 