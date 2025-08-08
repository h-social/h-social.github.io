import { FirebaseQuery } from "/assets/script/function/firebase/firebase-query.js";
import { GithubAPI } from "/assets/script/function/github/git-api.js";
import { Model } from "/components/model/model.js";

import { CONFIG } from "/config.js";
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'

export class GitMain {
    constructor(app) {
        this.app = app
        this.currentPage = 1;
        this.selectedCategory = "all";
        this.favorites =  new Set();
    }
    static async create(app) {
        const instance = new GitMain(app);
        await instance.init();
        return instance;
    }

    async init() {
        this.query = await FirebaseQuery.create(this.app);
        
        // Thử lấy token từ localStorage trước
        let token = localStorage.getItem('github_token');
        
        // Nếu không có trong localStorage, lấy từ Firebase
        if (!token) {
            token = await this.query.get("SettingToken", "github");
            // Lưu vào localStorage để lần sau dùng
            if (token) {
                localStorage.setItem('github_token', token);
            }
        } else {
            // Nếu có trong localStorage, vẫn lấy từ Firebase để cập nhật (chạy song song)
            this.query.get("SettingToken", "github").then(firebaseToken => {
                if (firebaseToken && firebaseToken !== token) {
                    localStorage.setItem('github_token', firebaseToken);
                }
            }).catch(err => {
                console.log('Failed to sync token from Firebase:', err);
            });
        }
        
        this.api = await GithubAPI.create(token);
    }

    async render() {
        const content = await this.api.getFolderContents();
        console.log(content);
        this.category = content.contents.filter(x => x.type === "dir");
        this.images = content.images;
        this.displayCategory();
        this.displayImages();
    }


    displayCategory() {
        $('#category-list').empty();
        let html = `<div class="swiper-slide cate-swiper ${this.selectedCategory === 'all' ? 'selected' : ''}" data-category="all">Tất cả</div>`;
        this.category.forEach(x => {
            html += `
            <div class="swiper-slide cate-swiper ${this.selectedCategory === x.name ? 'selected' : ''}" data-category="${x.name}" data-id="1">
                ${x.name}
            </div>`;
        });
        $('#category-list').html(html);
        var swiper = new Swiper(".swiper", {
            loop: false,
            slidesPerView: 3,
            spaceBetween: 10,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });
    }

    loadMoreImages() {
        this.currentPage++;
        this.displayImages();
    }

    loadCategory(category) {
        this.selectedCategory = category;
        this.displayImages();
    }
    openModal(image) {
        const modal = document.getElementById('image-modal');
        const urlImage = image.html_url.replace('/blob/', '/refs/heads/').replace('https://github.com/', 'https://raw.githubusercontent.com/')
        const previewImage = `https://images.weserv.nl/?url=${urlImage.replace('https://', '')}&w=400`
        const modelImage = `<img src="${previewImage}" alt="${image.name}" loading="lazy" class="w-full h-full">`;
        document.getElementById('modal-image').innerHTML = modelImage;
        document.getElementById('modal-title').textContent = image.name;
        document.getElementById('modal-description').textContent = image.folder;
        document.getElementById('modal-date').textContent = image.folder;

        // Update favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        const imageId = image.name;
        if (this.favorites.has(imageId)) {
            favoriteBtn.textContent = '❤️';
            favoriteBtn.classList.add('liked');
        } else {
            favoriteBtn.textContent = '🤍';
            favoriteBtn.classList.remove('liked');
        }

        favoriteBtn.onclick = () => toggleFavorite(imageId);

        modal.classList.add('active');
    }

    genDatas(imagesToShow){
        let dataResult = [];
        for(let i=0; i< imagesToShow.length; i++){
            const urlImage = imagesToShow[i].html_url.replace('/blob/', '/refs/heads/').replace('https://github.com/', 'https://raw.githubusercontent.com/')
            const previewImage = `https://images.weserv.nl/?url=${urlImage.replace('https://', '')}&w=400`
            let image = {
                name:   imagesToShow[i].name,
                imagePath:  imagesToShow[i].html_url,
                imageDownload: imagesToShow[i].download_url,
                favorite:   false,
            }
            dataResult.push(image);
        }
        return dataResult;
    }

    displayImages() {
         
        const startIndex = 0;
        const endIndex = this.currentPage * CONFIG.GALLERY_PAGE_SIZE;
        const imagesInCategory = this.images.filter(x => x.folder === this.selectedCategory || this.selectedCategory === "all");
        const imagesToShow = imagesInCategory.slice(startIndex, endIndex);
        console.log(imagesToShow);
        const dataModel = this.genDatas(imagesInCategory)
        this.modelObj = new Model(dataModel);

        const thisComponent = this;
        if (imagesToShow.length === 0) {
            document.querySelector('#image-grid').innerHTML = `
                <div class="no-images">
                    <i class="fas fa-images"></i>
                    <p>No images found</p>
                </div>
            `;
            return;
        } else {
            let htmlImageGrid = imagesToShow.map(image => this.createImageCard(image)).join('');
            if (imagesInCategory.length > endIndex) {
                htmlImageGrid += `<button class="more-btn">More</button>`;
            }
            document.querySelector('#image-grid').innerHTML = htmlImageGrid;
        }
    }

    createImageCard(image) {
        console.log(image);
        const isFavorite = (window.favoritesManager && window.favoritesManager.isFavorite(image.url)) || false;
        const urlImage = image.html_url.replace('/blob/', '/refs/heads/').replace('https://github.com/', 'https://raw.githubusercontent.com/')
        const previewImage = `https://images.weserv.nl/?url=${urlImage.replace('https://', '')}&w=400`
        return `
            <div class="image-item" data-category="food" data-id="6" data-url="${image.html_url}" data-download="${image.download_url}"  data-name="${image.name}">
                <img src="${previewImage}" alt="${image.name}" loading="lazy" class="w-full h-full">
            </div>
        `;
    }

}