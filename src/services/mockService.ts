import { MAX_POST_LENGTH, type Chat, type Message, type Post, type User } from "../types";
import { validatePostText, type SocialService } from "./types";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const colorFor = (s: string) => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

/** Self-contained backend used by default and in tests: no network, no credentials. */
export class MockService implements SocialService {
  private seq = 0;
  private posts: Post[] = [];
  private messages = new Map<string, Message[]>();
  private listeners = new Map<string, Set<(m: Message[]) => void>>();
  private chats: Chat[] = [
    { id: "general", title: "# general" },
    { id: "random", title: "# random" },
  ];

  constructor(private readonly replyDelayMs = 800) {
    this.posts.push({
      id: this.id("post"), authorId: "bot", authorName: "Welcome Bot", authorColor: "#3b82f6",
      text: "Welcome! Write a post, like it, or say hi in a chat.", createdAt: new Date().toISOString(), likes: [],
    });
  }

  private id(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${++this.seq}`;
  }

  async signIn(name: string): Promise<User> {
    const clean = name.trim();
    if (clean.length < 2) throw new Error("Name must have at least 2 characters");
    return { id: `u-${clean.toLowerCase().replace(/\W+/g, "")}`, name: clean, bio: "", color: colorFor(clean) };
  }

  async signOut() {}

  async updateProfile(user: User, patch: Partial<Pick<User, "name" | "bio">>): Promise<User> {
    const name = patch.name?.trim() ?? user.name;
    if (name.length < 2) throw new Error("Name must have at least 2 characters");
    return { ...user, name, bio: (patch.bio ?? user.bio).slice(0, 160) };
  }

  async fetchPosts() {
    return this.posts.map((p) => ({ ...p })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createPost(user: User, text: string): Promise<Post> {
    const post: Post = {
      id: this.id("post"), authorId: user.id, authorName: user.name, authorColor: user.color,
      text: validatePostText(text, MAX_POST_LENGTH), createdAt: new Date().toISOString(), likes: [],
    };
    this.posts.push(post);
    return { ...post }; // callers (Redux/immer) may freeze what they get, so never hand out internal objects
  }

  async toggleLike(postId: string, userId: string): Promise<Post> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");
    post.likes = post.likes.includes(userId) ? post.likes.filter((u) => u !== userId) : [...post.likes, userId];
    return { ...post };
  }

  async listChats() {
    return this.chats;
  }

  subscribeMessages(chatId: string, onMessages: (messages: Message[]) => void) {
    const set = this.listeners.get(chatId) ?? new Set();
    set.add(onMessages);
    this.listeners.set(chatId, set);
    onMessages([...(this.messages.get(chatId) ?? [])]);
    return () => void set.delete(onMessages);
  }

  async sendMessage(chatId: string, user: User, text: string) {
    const clean = text.trim();
    if (!clean) return;
    this.push({ id: this.id("msg"), chatId, senderId: user.id, senderName: user.name, text: clean, createdAt: new Date().toISOString() });
    if (this.replyDelayMs >= 0) {
      setTimeout(() => this.push({
        id: this.id("msg"), chatId, senderId: "bot", senderName: "Welcome Bot",
        text: `Echo: ${clean}`, createdAt: new Date().toISOString(),
      }), this.replyDelayMs).unref?.();
    }
  }

  private push(message: Message) {
    const list = [...(this.messages.get(message.chatId) ?? []), message];
    this.messages.set(message.chatId, list);
    this.listeners.get(message.chatId)?.forEach((cb) => cb([...list]));
  }
}
