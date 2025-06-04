import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARkWh4V_EFxavVQJFHrzFEXofV5joub_w",
  authDomain: "antihorse-b7dc5.firebaseapp.com",
  projectId: "antihorse-b7dc5",
  storageBucket: "antihorse-b7dc5.appspot.com",
  messagingSenderId: "959876682680",
  appId: "1:959876682680:web:d5cb07be87a89a9ccfb54d",
  measurementId: "G-298GTE66XC",
  databaseURL: "https://antihorse-b7dc5-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
export const db = getDatabase(app);

// Get Auth instance
export const auth = getAuth(app); 
