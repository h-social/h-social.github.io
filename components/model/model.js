import { TikTokViewer } from '/components/tiktok-viewer/tiktok-viewer.js';

export class Model {
    constructor(data) {
        this.container = document.getElementById('tiktok-viewer-container');
        this.datas = data;
        this.currentImage = "";
        this.tiktokViewer = null;
        this.updateView();
    }

    updateData(data){
        this.datas = data;
        this.updateView();
    }

    focus(urlPath){
        this.currentImage = urlPath;
        this.updateView();
    }

    hide(){
        this.container.classList.add('hidden');
    }
    show(){
        this.container.classList.remove('hidden');
        
    }

    updateView(){
        if(this.currentImage==''){
            this.tiktokViewer = new TikTokViewer('tiktok-viewer-container', this.datas);
        }else{
            this.tiktokViewer = new TikTokViewer('tiktok-viewer-container', this.datas, {
                startImagePath: this.currentImage
            });
        }
        
    }

}