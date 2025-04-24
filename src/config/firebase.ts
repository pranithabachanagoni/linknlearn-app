
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAW1a-PorKqHuzNbvU8DPa1A_RxFyyikZY",
  authDomain: "linknlearn-app.firebaseapp.com",
  projectId: "linknlearn-app",
  storageBucket: "linknlearn-app.appspot.com",
  messagingSenderId: "435521921031",
  appId: "1:435521921031:web:1d49e30633f43bd78a4aa2",
  measurementId: "G-1JFNG33Y83"
};

const app = initializeApp(firebaseConfig);

// 👇 Fix persistence issue for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
