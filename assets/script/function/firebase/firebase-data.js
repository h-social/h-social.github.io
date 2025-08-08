import { getDatabase, ref, set, child, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


export class FirebaseData {
    constructor(app) {
        this.app = app;
        this.auth = getAuth();
        this.user = this.currentUser;
        init();
    }

    init() {
        if(this.app){
            this.database = getDatabase(this.app);
        }
    }

    write(collection, Id, obj) {
        const db = getDatabase();
        set(ref(db, collection+'/' + Id), obj);
    }

    read(collection, Id) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${collection}/${Id}`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
        } else {
            console.log("No data available");
        }
        }).catch((error) => {
            console.error(error);
        });
    }

    writeNewPost(collection, Id, obj) {
        const db = getDatabase();
        // Get a key for a new Post.
        const newPostKey = push(child(ref(db), 'posts')).key;
      
        // Write the new post's data simultaneously in the posts list and the user's post list.
        const updates = {};
        updates['/posts/' + newPostKey] = postData;
        updates[`${collection}/${Id}/${newPostKey}`] = postData;
      
        return update(ref(db), updates);
    }
}