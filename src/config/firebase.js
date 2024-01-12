import firebase from 'firebase/app'
// import firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCSLiFNaXijy6yaGhO89r8YziI46TVg6H8',
  authDomain: 'pixal-stream-dev.firebaseapp.com',
  databaseURL: 'https://pixal-stream-dev-default-rtdb.firebaseio.com',
  projectId: 'pixal-stream-dev',
  storageBucket: 'pixal-stream-dev.appspot.com',
  messagingSenderId: '826804523446',
  appId: '1:826804523446:web:87b6003c53d36c3e603117',
  measurementId: 'G-YNVV4ZXXE3'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export const db = firebase.firestore()
export const storage = firebase.storage()
export const auth = firebase.auth()
export const analytics = firebase.analytics()
export const provider = new firebase.auth.GoogleAuthProvider()

export default firebase
