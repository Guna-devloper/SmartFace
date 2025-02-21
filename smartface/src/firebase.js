import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-IPclPPw7UPhlXjqnNKd-R5xwzX3Qih0",
  authDomain: "smartface-com-d395d.firebaseapp.com",
  projectId: "smartface-com-d395d",
  storageBucket: "smartface-com-d395d.appspot.com",
  messagingSenderId: "405780524930",
  appId: "1:405780524930:web:d63dd952e07ad01101e99b",
  measurementId: "G-C8FD7WQWGH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, query, getDocs };
