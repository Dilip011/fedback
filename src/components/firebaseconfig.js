

import {initializeApp} from "firebase/app";


import {getFirestore} from "firebase/firestore";


import {getDatabase} from "firebase/database";


import {getAuth} from "firebase/auth";

import {getStorage} from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyA65ZDdwV4LlhHExD5RJ4wqTBmqfUai8Xs",
    authDomain: "feedbackmanager-ec9e3.firebaseapp.com",
    projectId: "feedbackmanager-ec9e3",
    storageBucket: "feedbackmanager-ec9e3.appspot.com",
    messagingSenderId: "593231106994",
    appId: "1:593231106994:web:2d059791330ed6d5194aab"
  };


const app = initializeApp(firebaseConfig);
 const db = getFirestore(app);
 const database = getDatabase(app);
 const auth = getAuth(app);
 const storage = getStorage(app);

export {app, db, database, auth,storage};