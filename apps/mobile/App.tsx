import { createTranslator, type Locale, localeNames, locales } from "@repo/i18n";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createToolkit } from "./src/toolkit.ts";

const API_BASE_URL = "http://localhost:3000";

export default function App() {
  const [locale, setLocale] = useState<Locale>("en-GB");
  const [status, setStatus] = useState("Ready");
  const t = createTranslator(locale);
  const toolkit = createToolkit(API_BASE_URL);

  async function ping() {
    setStatus("…");
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
      <Text style={styles.title}>{t("appName")}</Text>
      <Text style={styles.subtitle}>{t("tagline")}</Text>

      <View style={styles.langRow}>
        {locales.map((l) => (
          <Pressable
            key={l}
            style={[styles.langButton, l === locale && styles.langButtonActive]}
            onPress={() => setLocale(l)}
          >
            <Text style={l === locale ? styles.langTextActive : styles.langText}>
              {localeNames[l]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.button} onPress={ping}>
        <Text style={styles.buttonText}>{t("mobile.describePdf")}</Text>
      </Pressable>
      <Text style={styles.status}>{status}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#666", textAlign: "center" },
  langRow: { flexDirection: "row", gap: 8 },
  langButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langButtonActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  langText: { color: "#333" },
  langTextActive: { color: "white" },
  button: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "600" },
  status: { marginTop: 8, color: "#333" },
});
