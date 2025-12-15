import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Post } from "../types";
import { Avatar } from "./Avatar";

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function PostCard({ post, userId, onLike }: { post: Post; userId: string; onLike: () => void }) {
  const liked = post.likes.includes(userId);
  return (
    <View style={styles.card}>
      <Avatar name={post.authorName} color={post.authorColor} />
      <View style={styles.body}>
        <Text style={styles.author}>
          {post.authorName} <Text style={styles.time}>· {timeAgo(post.createdAt)}</Text>
        </Text>
        <Text style={styles.text}>{post.text}</Text>
        <Pressable onPress={onLike} accessibilityRole="button" accessibilityLabel={liked ? "Unlike" : "Like"}>
          <Text style={[styles.like, liked && styles.liked]}>{liked ? "♥" : "♡"} {post.likes.length}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#d1d5db", backgroundColor: "#fff" },
  body: { flex: 1, gap: 4 },
  author: { fontWeight: "700", color: "#111827" },
  time: { fontWeight: "400", color: "#6b7280" },
  text: { fontSize: 15, color: "#1f2937" },
  like: { color: "#6b7280", marginTop: 4 },
  liked: { color: "#e11d48" },
});
