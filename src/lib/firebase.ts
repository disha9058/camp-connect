
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDja5IjgFqMRPZFKWmIcrYDbP3061NKEA8",
  authDomain: "campconnect-784b0.firebaseapp.com",
  projectId: "campconnect-784b0",
  storageBucket: "campconnect-784b0.firebasestorage.app",
  messagingSenderId: "355405367311",
  appId: "1:355405367311:web:adc511f707833a8b2c7b7a",
  measurementId: "G-K1W1HKR8T2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
