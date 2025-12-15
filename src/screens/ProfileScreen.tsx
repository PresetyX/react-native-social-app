import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { saveProfile, signOut } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const posts = useAppSelector((s) => s.posts.items.filter((p) => p.authorId === user.id).length);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [saved, setSaved] = useState(false);

  async function save() {
    const result = await dispatch(saveProfile({ user, name, bio }));
    setSaved(saveProfile.fulfilled.match(result));
  }

  return (
    <View style={styles.container}>
      <Avatar name={user.name} color={user.color} size={80} />
      <Text style={styles.stat}>{posts} post{posts === 1 ? "" : "s"}</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
      <TextInput style={[styles.input, styles.bio]} value={bio} onChangeText={setBio} placeholder="Bio" multiline maxLength={160} />
      <Pressable style={styles.button} onPress={save}><Text style={styles.buttonText}>Save profile</Text></Pressable>
      {saved && <Text style={styles.ok}>Saved</Text>}
      <Pressable onPress={() => void dispatch(signOut())}><Text style={styles.signOut}>Sign out</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "stretch", padding: 24, gap: 12, backgroundColor: "#fff" },
  stat: { textAlign: "center", color: "#6b7280" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 16 },
  bio: { minHeight: 80 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  ok: { color: "#16a34a", textAlign: "center" },
  signOut: { color: "#b91c1c", textAlign: "center", marginTop: 12 },
});
