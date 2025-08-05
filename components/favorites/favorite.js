export class favorite {
    constructor() {
        this.init();
    }

    init(){
        this.loadView()
    }

    loadView(){
        $('#favorites-view').html(this.render())
    }

    render(){
        return `<div class="text-center py-12">
            <div class="text-6xl mb-4">❤️</div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Chưa có ảnh yêu thích</h2>
            <p class="text-gray-600">Nhấn vào biểu tượng trái tim để thêm ảnh vào danh sách yêu thích</p>
        </div>
        <div class="image-grid" id="favorites-grid"></div>`;
    }
}