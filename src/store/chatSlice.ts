import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Chat, Message, User } from "../types";
import { createAppThunk } from "./thunk";

export const loadChats = createAppThunk("chat/load", (_: void, { extra }) => extra.service.listChats());
export const sendMessage = createAppThunk("chat/send", (arg: { chatId: string; user: User; text: string }, { extra }) =>
  extra.service.sendMessage(arg.chatId, arg.user, arg.text));

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
}

const initialState: ChatState = { chats: [], messages: {} };

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /** Dispatched by the realtime subscription whenever a chat's message list changes. */
    messagesReceived(s, a: PayloadAction<{ chatId: string; messages: Message[] }>) {
      s.messages[a.payload.chatId] = a.payload.messages;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadChats.fulfilled, (s, a) => { s.chats = a.payload; });
  },
});

export const { messagesReceived } = chatSlice.actions;
export default chatSlice.reducer;
