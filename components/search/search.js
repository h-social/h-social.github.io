export class search {
    constructor() {
        this.init();
    }

    init(){
        this.loadView()
    }

    loadView(){
        $('#search-overlay').html(this.render())
    }

    render(){
        return `<div class="p-4">
            <div class="flex items-center gap-3 mb-6">
                <button id="close-search" class="text-2xl">←</button>
                <h2 class="text-xl font-semibold">Tìm kiếm</h2>
            </div>

            <div class="relative mb-6">
                <input type="text" id="search-input" placeholder="Tìm kiếm ảnh..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div class="absolute right-3 top-3 text-gray-400">🔍</div>
            </div>

            <div class="text-center py-12 text-gray-500">
                <div class="text-4xl mb-4">🔍</div>
                <p>Nhập từ khóa để tìm kiếm ảnh</p>
            </div>
        </div>`;
    }
}