// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmOcng61DGRL3QEQprrexUK0EgGBfpY2Q",
  authDomain: "ricesencepro-351a6.firebaseapp.com",
  databaseURL: "https://ricesencepro-351a6-default-rtdb.firebaseio.com/",
  projectId: "ricesencepro-351a6",
  storageBucket: "ricesencepro-351a6.firebasestorage.app",
  messagingSenderId: "1025576713244",
  appId: "1:1025576713244:web:c38b6aa0d34546da1373d9",
  measurementId: "G-T1VC3758Z6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };