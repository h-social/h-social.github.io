importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: "AIzaSyAXXyKzcIKvKY_STCRHzvaIBn8l5UwGxg8",
  authDomain: "hsocial-c5ef7.firebaseapp.com",
  projectId: "hsocial-c5ef7",
  storageBucket: "hsocial-c5ef7.firebasestorage.app",
  messagingSenderId: "656660800576",
  appId: "1:656660800576:web:3dad320a72be9270b26ba5",
  measurementId: "G-4VZDZPGXSQ"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 