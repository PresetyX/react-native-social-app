import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { signIn } from "../store/authSlice";

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social</Text>
      <Text style={styles.subtitle}>Pick a display name to join the conversation.</Text>
      <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={() => dispatch(signIn(name))} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12, backgroundColor: "#fff" },
  title: { fontSize: 36, fontWeight: "800" },
  subtitle: { color: "#6b7280", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 16 },
  error: { color: "#b91c1c" },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
