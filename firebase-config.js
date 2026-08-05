// ==========================================
// BIZMANAGER FIREBASE CONFIGURATION
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyC95kBKFr9PcmxOdHOFg8KHYx3I2NlLR9Y",

    authDomain:
        "bizmanager-12.firebaseapp.com",

    projectId:
        "bizmanager-12",

    storageBucket:
        "bizmanager-12.firebasestorage.app",

    messagingSenderId:
        "499159308090",

    appId:
        "1:499159308090:web:50110bfe7dd36679e42203",

    measurementId:
        "G-HCJXTK6RDH"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(
        firebaseConfig
    );


// ==========================================
// FIREBASE SERVICES
// ==========================================

const db =
    getFirestore(app);

const auth =
    getAuth(app);

const storage =
    getStorage(app);


// ==========================================
// EXPORT
// ==========================================

export {
    app,
    db,
    auth,
    storage
};