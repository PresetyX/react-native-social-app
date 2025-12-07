import type { Chat, Message, Post, User } from "../types";

/** Everything the app needs from a backend. Implemented in-memory and on Firebase. */
export interface SocialService {
  signIn(name: string): Promise<User>;
  signOut(): Promise<void>;
  updateProfile(user: User, patch: Partial<Pick<User, "name" | "bio">>): Promise<User>;
  fetchPosts(): Promise<Post[]>;
  createPost(user: User, text: string): Promise<Post>;
  toggleLike(postId: string, userId: string): Promise<Post>;
  listChats(): Promise<Chat[]>;
  /** Calls back with the full, ordered message list now and after every change. Returns an unsubscribe function. */
  subscribeMessages(chatId: string, onMessages: (messages: Message[]) => void): () => void;
  sendMessage(chatId: string, user: User, text: string): Promise<void>;
}

export function validatePostText(text: string, max: number): string {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Write something first");
  if (trimmed.length > max) throw new Error(`Posts are limited to ${max} characters`);
  return trimmed;
}
