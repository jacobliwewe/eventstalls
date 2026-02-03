// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhoM7bjMKN2t1ZYcIgNxy9EvhzQESjf4c",
    authDomain: "eventstall-26df5.firebaseapp.com",
    projectId: "eventstall-26df5",
    storageBucket: "eventstall-26df5.firebasestorage.app",
    messagingSenderId: "209424525547",
    appId: "1:209424525547:web:c38db998ef93b52ffe76ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;