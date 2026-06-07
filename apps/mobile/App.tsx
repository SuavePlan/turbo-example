import { APP_NAME } from "@repo/core";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createToolkit } from "./src/toolkit.ts";

const API_BASE_URL = "http://localhost:3000";

export default function App() {
  const [status, setStatus] = useState("Ready");
  const toolkit = createToolkit(API_BASE_URL);

  async function ping() {
    setStatus("Contacting API…");
    try {
      // Demonstrates the shared client; a real build wires expo-document-picker.
      const summary = await toolkit.describePdf(new Uint8Array());
      setStatus(summary);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "error");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>Mobile client (Expo / React Native)</Text>
      <Pressable style={styles.button} onPress={ping}>
        <Text style={styles.buttonText}>Describe a PDF</Text>
      </Pressable>
      <Text style={styles.status}>{status}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#666" },
  button: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "600" },
  status: { marginTop: 8, color: "#333" },
});
