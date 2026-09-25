import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const firebaseConfig = {
	apiKey: 'AIzaSyD45pByM8da4R87RunW6WHXM6wsVJW9cNo',
	authDomain: 'ksocial-c2ae5.firebaseapp.com',
	projectId: 'ksocial-c2ae5',
	storageBucket: 'ksocial-c2ae5.firebasestorage.app',
	messagingSenderId: '1073246539756',
	appId: '1:1073246539756:web:d134ad0c21ba2821437ac9',
	measurementId: 'G-0QJ550QVE2'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request profile and email scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Initiates Google Sign-In popup via Firebase and returns the ID token.
 */
export async function signInWithGoogle(): Promise<string> {
	const result = await signInWithPopup(auth, googleProvider);
	const idToken = await result.user.getIdToken();
	return idToken;
}
