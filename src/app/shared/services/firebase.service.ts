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
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { Chat, Message } from '../../core/models';

interface FirestoreChat {
  title: string;
  messages: FirestoreMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

interface FirestoreMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;

  private _user = signal<User | null>(null);
  private _isAuthLoading = signal<boolean>(true);
  readonly user = this._user.asReadonly();
  readonly isAuthLoading = this._isAuthLoading.asReadonly();

  constructor() {
    const firebaseConfig = environment.firebase as FirebaseOptions;
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    this.initializeAuthPersistence();

    onAuthStateChanged(this.auth, user => {
      this._user.set(user ?? null);
      this._isAuthLoading.set(false);
    });
  }

  private async initializeAuthPersistence(): Promise<void> {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
    } catch (error) {
      console.warn('Failed to set auth persistence:', error);
    }
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

  async createChat(chat: Omit<Chat, 'id'>): Promise<string> {
    const user = this._user();
    if (!user) throw new Error('User not authenticated');

    const firestoreChat: FirestoreChat = {
      title: chat.title,
      messages: chat.messages.map(this.messageToFirestore),
      createdAt: Timestamp.fromDate(chat.createdAt),
      updatedAt: Timestamp.fromDate(chat.updatedAt),
      userId: user.uid,
    };

    const docRef = await addDoc(collection(this.firestore, 'chats'), firestoreChat);
    return docRef.id;
  }

  async getUserChats(): Promise<Chat[]> {
    const user = this._user();
    if (!user) return [];

    const q = query(
      collection(this.firestore, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.firestoreChatToChat(doc));
  }

  async getChat(chatId: string): Promise<Chat | null> {
    const user = this._user();
    if (!user) return null;

    const docRef = doc(this.firestore, 'chats', chatId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data() as FirestoreChat;
    if (data.userId !== user.uid) return null;

    return this.firestoreChatToChat(docSnap);
  }

  async updateChat(chatId: string, updates: Partial<Omit<Chat, 'id'>>): Promise<void> {
    const user = this._user();
    if (!user) throw new Error('User not authenticated');

    const updateData: Partial<FirestoreChat> = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.messages) {
      updateData.messages = updates.messages.map(this.messageToFirestore);
    }
    if (updates.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
    }

    const docRef = doc(this.firestore, 'chats', chatId);
    await updateDoc(docRef, updateData);
  }

  async deleteChat(chatId: string): Promise<void> {
    const user = this._user();
    if (!user) throw new Error('User not authenticated');

    const chat = await this.getChat(chatId);
    if (!chat) throw new Error('Chat not found or access denied');

    const docRef = doc(this.firestore, 'chats', chatId);
    await deleteDoc(docRef);
  }

  private messageToFirestore(message: Message): FirestoreMessage {
    return {
      role: message.role,
      content: message.content,
      timestamp: Timestamp.fromDate(message.timestamp),
    };
  }

  private firestoreMessageToMessage(firestoreMessage: FirestoreMessage): Message {
    return {
      id: this.generateMessageId(),
      role: firestoreMessage.role,
      content: firestoreMessage.content,
      timestamp: firestoreMessage.timestamp.toDate(),
    };
  }

  private generateMessageId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private firestoreChatToChat(doc: QueryDocumentSnapshot<DocumentData>): Chat {
    const data = doc.data() as FirestoreChat;
    return {
      id: doc.id,
      title: data.title,
      messages: data.messages.map(msg => this.firestoreMessageToMessage(msg)),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }
}
