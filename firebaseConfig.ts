// fix: Use namespace imports for Firebase modules to resolve module resolution error.
import * as firebase from "firebase/app";
import * as firestore from "firebase/firestore";

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

// Initialize Firebase using the modern v9+ modular API
const app = firebase.initializeApp(firebaseConfig);

// Get a Firestore instance
const db = firestore.getFirestore(app);

export { db };
