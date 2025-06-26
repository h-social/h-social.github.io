class PageService {

    constructor() {
        this.orgPath = 'file:///D:/Coding/MiniProject/h-social.github.io/views/';
    }

    async redirectPage(page, onLoadCallback) {
        const url = this.orgPath + page;
        const idPage = page.split('.')[0];
        // Check if the page is already loaded
        if ($('#partial-view-content').find(`[data-id="${idPage}]"`).length > 0) {
            // If the page is already loaded, just show it
            $('#partial-view-content').find('.component').hide();
            $('#partial-view-content').find(`[data-id="${idPage}"]`).show();
            if (typeof onLoadCallback === 'function') {
                onLoadCallback();
            }
            return;
        }

        axiosBackend.get(url, (response) => {
            $('#partial-view-content').html(response);
            let newCompo = $('#partial-view-content').find('.component.newComponent');
            newCompo.attr('data-id', idPage);
            let oldCompo = $('#partial-view-content').find('.component:not(.newComponent)');
            oldCompo.hide();
            newCompo.removeClass('newComponent');
            newCompo.show();
            if (typeof onLoadCallback === 'function') {
                onLoadCallback();
            }
        }, (error) => {
            noti.toast.error(error.message)
        })
        //const responseHtml = await fetch(url);
        //$('#partial-view-content').html(responseHtml);
    }

}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageService;
} else {
    window.PageService = PageService;
} 