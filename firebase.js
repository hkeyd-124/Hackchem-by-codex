// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCO3BvrQ0GAmIebCwueVd88Do1YGk_iYJo",
  authDomain: "hackchem-90922.firebaseapp.com",
  projectId: "hackchem-90922",
  storageBucket: "hackchem-90922.firebasestorage.app",
  messagingSenderId: "86265015549",
  appId: "1:86265015549:web:b7981ab509a1e06363a294"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* USER */
const ss = window.sessionService;

let userId = ss?.getStorageUserId
  ? ss.getStorageUserId()
  : localStorage.getItem("uid");

if(userId){
  localStorage.setItem("username", userId);
}

/* EXPORT */
export { app, db, userId, doc, setDoc, getDoc };
