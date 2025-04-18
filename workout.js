// Import the functions you need from the SDKs you needimport { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAK2rLIcEm4ZIUodPWhyQwzwTVJM2wZWzo",
    authDomain: "fitness-buddy-e44f7.firebaseapp.com",
    projectId: "fitness-buddy-e44f7",
    storageBucket: "fitness-buddy-e44f7.firebasestorage.app",
    messagingSenderId: "750411075422",
    appId: "1:750411075422:web:2ef218847e9c9fe74e09cf",
    measurementId: "G-VE18CRGTZV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

