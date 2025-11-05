// fix: Use Firebase v9 compat libraries to support v8 syntax.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANblr6MInsVbY9LnN3OUHNA5Ri2ttPHCo",
  authDomain: "ai-event-bot.firebaseapp.com",
  databaseURL: "https://ai-event-bot-default-rtdb.firebaseio.com",
  projectId: "ai-event-bot",
  storageBucket: "ai-event-bot.firebasestorage.app",
  messagingSenderId: "884896771261",
  appId: "1:884896771261:web:b60d950938a924a71a5bd4",
  measurementId: "G-4H9BVWN184"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a Firestore instance
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

export { db, storage, auth };