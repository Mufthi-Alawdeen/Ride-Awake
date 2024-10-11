
// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyAplP9SSK85zbB3cxzNnXz2qHDWQTimUvQ',
    authDomain: 'rideawake-8778e.firebaseapp.com',
    projectId: 'rideawake-8778e',
    storageBucket: 'rideawake-8778e.appspot.com',
    messagingSenderId: '637910798890',
    appId: '1:637910798890:android:843eac1ba1d17f26636953',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
