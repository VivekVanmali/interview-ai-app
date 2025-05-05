// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
import {getAuth} from "@firebase/auth"; 

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgXolh4nsQ4PGi_lYxZi6Df999bmu5jNk",
  authDomain: "ai-interviews---fyp.firebaseapp.com",
  projectId: "ai-interviews---fyp",
  storageBucket: "ai-interviews---fyp.firebasestorage.app",
  messagingSenderId: "1056571987783",
  appId: "1:1056571987783:web:86292d5bb1692a11fc1e62",
  measurementId: "G-8QXQYCWLP1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 