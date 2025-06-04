import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARkWh4V_EFxavVQJFHrzFEXofV5joub_w",
  authDomain: "antihorse-b7dc5.firebaseapp.com",
  projectId: "antihorse-b7dc5",
  storageBucket: "antihorse-b7dc5.appspot.com",
  messagingSenderId: "959876682680",
  appId: "1:959876682680:web:d5cb07be87a89a9ccfb54d",
  measurementId: "G-298GTE66XC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth }; 
