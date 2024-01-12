// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyADzi39WVio2LP0KyO-fYfZEclBnsvfdDo',
  authDomain: 'remotecc-ccb45.firebaseapp.com',
  databaseURL: 'https://remotecc-ccb45-default-rtdb.firebaseio.com',
  projectId: 'remotecc-ccb45',
  storageBucket: 'remotecc-ccb45.appspot.com',
  messagingSenderId: '96888024643',
  appId: '1:96888024643:web:640354c85857b65f012ef6',
  measurementId: 'G-BTCWL0M79K'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
