import { app, auth, analytics } from "/script/function/firebase/firebase-object.js";


  // Initialize Firebase

export class Firebase {
    constructor() {

    }

    init() {
        
    }
    getAnalytics(){
        return analytics
    }
    getApp(){
        return app
    }

    getAuthApp(){
        return auth
    }

    loginGoogle() {
        const provider = new auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(result => {
            const user = result.user;
            console.log("Logged in as:", user.displayName);
          })
          .catch(error => {
            console.error("Google login error", error);
          });
    }

    loginManual(email, password){
        auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Login success", userCredential.user);
        })
        .catch(error => {
            console.error("Email login error", error);
        });
    }

    signUp(email, password){
        auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Sign up success", userCredential.user);
        })
        .catch(error => {
            console.error("Sign up error", error);
        });
    }

    signOut(){
        auth.signOut()
        .then(() => {
            console.log("Logged out");
        })
        .catch(error => {
            console.error("Logout error", error);
        });
    }
}