import { favorite } from "/components/favorites/favorite.js";
import { search } from "/components/search/search.js";


export class main {
    constructor() {
        this.init();
    }

    init(){
        this.favorite = new favorite();
        this.search = new search();
    }
}

