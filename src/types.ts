export interface User {
  id: string;
  name: string;
  bio: string;
  color: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  createdAt: string;
  likes: string[];
}

export interface Chat {
  id: string;
  title: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export const MAX_POST_LENGTH = 280;
