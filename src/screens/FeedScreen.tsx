import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { PostCard } from "../components/PostCard";
import { addPost, loadPosts, toggleLike } from "../store/postsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { MAX_POST_LENGTH } from "../types";

export function FeedScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const { items, loading, error } = useAppSelector((s) => s.posts);
  const [text, setText] = useState("");

  useEffect(() => {
    void dispatch(loadPosts());
  }, [dispatch]);

  async function publish() {
    const result = await dispatch(addPost({ user, text }));
    if (addPost.fulfilled.match(result)) setText("");
  }

  return (
    <View style={styles.container}>
      <View style={styles.composer}>
        <TextInput style={styles.input} placeholder="What's happening?" value={text} onChangeText={setText} multiline maxLength={MAX_POST_LENGTH} />
        <View style={styles.row}>
          <Text style={styles.counter}>{text.length}/{MAX_POST_LENGTH}</Text>
          <Pressable style={[styles.button, !text.trim() && styles.disabled]} disabled={!text.trim()} onPress={publish}>
            <Text style={styles.buttonText}>Post</Text>
          </Pressable>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void dispatch(loadPosts())} />}
        renderItem={({ item }) => (
          <PostCard post={item} userId={user.id} onLike={() => void dispatch(toggleLike({ postId: item.id, userId: user.id }))} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  composer: { backgroundColor: "#fff", padding: 12, gap: 8, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  input: { minHeight: 56, fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  counter: { color: "#9ca3af" },
  button: { backgroundColor: "#2563eb", paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20 },
  disabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#b91c1c" },
});
