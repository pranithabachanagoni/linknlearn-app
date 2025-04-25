import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAW1a-PorKqHuzNbvU8DPa1A_RxFyyikZY",
  authDomain: "linknlearn-app.firebaseapp.com",
  projectId: "linknlearn-app",
  storageBucket: "linknlearn-app.appspot.com",
  messagingSenderId: "435521921031",
  appId: "1:435521921031:web:1d49e30633f43bd78a4aa2",
  measurementId: "G-1JFNG33Y83"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

let firestore;
try {
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
} catch (e) {
  firestore = getFirestore(app);
}

const storage = getStorage(app);
const database = getDatabase(app); // ✅ Realtime Database added

export { auth, firestore, storage, database };
