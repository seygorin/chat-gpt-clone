import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	signInWithPopup,
	GoogleAuthProvider,
	User,
	Auth,
} from 'firebase/auth';
import { envConfig } from '../../../../env.config';

@Injectable({
	providedIn: 'root',
})
export class FirebaseService {
	private app: FirebaseApp;
	private auth: Auth;

	private _user = signal<User | null>(null);
	readonly user = this._user.asReadonly();

	constructor() {
		const firebaseConfig = envConfig.firebase as FirebaseOptions;
		this.app = initializeApp(firebaseConfig);
		this.auth = getAuth(this.app);

		onAuthStateChanged(this.auth, (user) => {
			this._user.set(user ?? null);
		});
	}

	async signInWithEmail(email: string, password: string) {
		return signInWithEmailAndPassword(this.auth, email, password);
	}

	async signUpWithEmail(email: string, password: string) {
		return createUserWithEmailAndPassword(this.auth, email, password);
	}

	async signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		return signInWithPopup(this.auth, provider);
	}

	async signOut() {
		return signOut(this.auth);
	}
}
