import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut as fbSignOut, updateProfile as fbUpdateProfile } from "firebase/auth";
import {
  addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, getFirestore,
  limit, onSnapshot, orderBy, query, setDoc, updateDoc,
} from "firebase/firestore";
import { MAX_POST_LENGTH, type Chat, type Message, type Post, type User } from "../types";
import { validatePostText, type SocialService } from "./types";

export interface FirebaseSettings {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

/** Firestore layout: users/{uid}, posts/{id}, chats/{id}/messages/{id}. */
export class FirebaseService implements SocialService {
  private readonly auth;
  private readonly db;

  constructor(settings: FirebaseSettings) {
    const app = initializeApp(settings);
    this.auth = getAuth(app);
    this.db = getFirestore(app);
  }

  async signIn(name: string): Promise<User> {
    const clean = name.trim();
    if (clean.length < 2) throw new Error("Name must have at least 2 characters");
    const cred = await signInAnonymously(this.auth);
    await fbUpdateProfile(cred.user, { displayName: clean });
    const ref = doc(this.db, "users", cred.user.uid);
    const existing = await getDoc(ref);
    if (existing.exists()) return { id: cred.user.uid, ...(existing.data() as Omit<User, "id">), name: clean };
    const user: User = { id: cred.user.uid, name: clean, bio: "", color: COLORS[cred.user.uid.charCodeAt(0) % COLORS.length] };
    await setDoc(ref, { name: user.name, bio: user.bio, color: user.color });
    return user;
  }

  async signOut() {
    await fbSignOut(this.auth);
  }

  async updateProfile(user: User, patch: Partial<Pick<User, "name" | "bio">>): Promise<User> {
    const next = { ...user, name: patch.name?.trim() || user.name, bio: (patch.bio ?? user.bio).slice(0, 160) };
    await updateDoc(doc(this.db, "users", user.id), { name: next.name, bio: next.bio });
    return next;
  }

  async fetchPosts(): Promise<Post[]> {
    const snap = await getDocs(query(collection(this.db, "posts"), orderBy("createdAt", "desc"), limit(50)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, "id">) }));
  }

  async createPost(user: User, text: string): Promise<Post> {
    const data = {
      authorId: user.id, authorName: user.name, authorColor: user.color,
      text: validatePostText(text, MAX_POST_LENGTH), createdAt: new Date().toISOString(), likes: [] as string[],
    };
    const ref = await addDoc(collection(this.db, "posts"), data);
    return { id: ref.id, ...data };
  }

  async toggleLike(postId: string, userId: string): Promise<Post> {
    const ref = doc(this.db, "posts", postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Post not found");
    const liked = (snap.data().likes as string[]).includes(userId);
    await updateDoc(ref, { likes: liked ? arrayRemove(userId) : arrayUnion(userId) });
    const fresh = await getDoc(ref);
    return { id: postId, ...(fresh.data() as Omit<Post, "id">) };
  }

  async listChats(): Promise<Chat[]> {
    const snap = await getDocs(collection(this.db, "chats"));
    return snap.docs.map((d) => ({ id: d.id, title: String(d.data().title ?? d.id) }));
  }

  subscribeMessages(chatId: string, onMessages: (messages: Message[]) => void) {
    const q = query(collection(this.db, "chats", chatId, "messages"), orderBy("createdAt", "asc"), limit(200));
    return onSnapshot(q, (snap) =>
      onMessages(snap.docs.map((d) => ({ id: d.id, chatId, ...(d.data() as Omit<Message, "id" | "chatId">) }))),
    );
  }

  async sendMessage(chatId: string, user: User, text: string) {
    const clean = text.trim();
    if (!clean) return;
    await addDoc(collection(this.db, "chats", chatId, "messages"), {
      senderId: user.id, senderName: user.name, text: clean, createdAt: new Date().toISOString(),
    });
  }
}
