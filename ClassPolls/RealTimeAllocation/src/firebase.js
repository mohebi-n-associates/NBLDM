import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    // TODO: Replace with your project's Firebase config
    apiKey: "AIzaSyB7FTe4d-OnaKY5134_oSQg9BXOSAx0p6M",
    authDomain: "polls-6d92f.firebaseapp.com",
    projectId: "polls-6d92f",
    storageBucket: "polls-6d92f.firebasestorage.app",
    messagingSenderId: "239573208451",
    appId: "1:239573208451:web:3eeddca96a8dbe45483ab6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
