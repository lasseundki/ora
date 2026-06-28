import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyCkSFFLLHfNAnd29Vowp9FJe8BFfP3ATMQ',
  authDomain:        'opus-orationis.firebaseapp.com',
  projectId:         'opus-orationis',
  storageBucket:     'opus-orationis.firebasestorage.app',
  messagingSenderId: '508469481797',
  appId:             '1:508469481797:web:a3192b442b0c5a930eae2c',
}

export const app           = initializeApp(firebaseConfig)
export const auth          = getAuth(app)
export const db            = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
