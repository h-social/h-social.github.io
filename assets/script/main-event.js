export class mainEvent {
    constructor() {
    }

    setImage(image){
        this.image = image
    }
    initTiktokEvent() {
        $('.download-btn').on('click', function(){
            location.href = InstaneEvent.image.imageDownload;
        })
    }
}

window.InstaneEvent = new mainEvent();