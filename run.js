const pageService = new window.PageService()
const app = new window.App()
const onLoad = async () => {
    
    
    const githubToken = Utils.getStorage(CONFIG.STORAGE_KEYS.GITHUB_TOKEN);

    if (githubToken) {
        await app.initializeGitHubService(githubToken);
        // app.initializeComponents();
        pageService.redirectPage('main.html', function(){
            app.initMain();
        })
        
    } else {
        pageService.redirectPage('login.html')
    }
}

onLoad();


$('.dropdown-toggle').on('click', function (e) {
    e.preventDefault();
    $(this).next('.dropdown-menu').toggleClass('show');
})