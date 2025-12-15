import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { SocialService } from "../services/types";
import { loadChats, messagesReceived, sendMessage } from "../store/chatSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function ChatScreen({ service }: { service: SocialService }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const { chats, messages } = useAppSelector((s) => s.chat);
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    void dispatch(loadChats());
  }, [dispatch]);

  useEffect(() => {
    if (!chatId && chats.length > 0) setChatId(chats[0].id);
  }, [chats, chatId]);

  // Realtime: one live subscription for the open chat, released when switching or leaving.
  useEffect(() => {
    if (!chatId) return;
    return service.subscribeMessages(chatId, (list) => dispatch(messagesReceived({ chatId, messages: list })));
  }, [chatId, service, dispatch]);

  const current = chatId ? messages[chatId] ?? [] : [];

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {chats.map((c) => (
          <Pressable key={c.id} onPress={() => setChatId(c.id)} style={[styles.tab, c.id === chatId && styles.tabActive]}>
            <Text style={c.id === chatId ? styles.tabTextActive : styles.tabText}>{c.title}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={current}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = item.senderId === user.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              {!mine && <Text style={styles.sender}>{item.senderName}</Text>}
              <Text style={mine ? styles.mineText : undefined}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message" />
        <Pressable
          style={styles.send}
          onPress={() => {
            if (chatId && text.trim()) {
              void dispatch(sendMessage({ chatId, user, text }));
              setText("");
            }
          }}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  tabs: { flexDirection: "row", gap: 8, padding: 8, backgroundColor: "#fff" },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#e5e7eb" },
  tabActive: { backgroundColor: "#2563eb" },
  tabText: { color: "#374151" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  list: { padding: 12, gap: 8 },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 14 },
  mine: { alignSelf: "flex-end", backgroundColor: "#2563eb" },
  mineText: { color: "#fff" },
  theirs: { alignSelf: "flex-start", backgroundColor: "#fff" },
  sender: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  inputRow: { flexDirection: "row", gap: 8, padding: 8, backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  send: { justifyContent: "center", paddingHorizontal: 16, backgroundColor: "#2563eb", borderRadius: 20 },
  sendText: { color: "#fff", fontWeight: "700" },
});
