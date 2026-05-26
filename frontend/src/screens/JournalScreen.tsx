import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { createEntry } from "../services/api";

const EMOTION_COLORS: Record<string, string> = {
  sadness: "#7B8FB5", anger: "#C0614A", guilt: "#A0789A",
  yearning: "#6B5EA8", numbness: "#8A9BA8", acceptance: "#5DAA89",
  fear: "#A07850", relief: "#6AAA8A",
};

const PROMPTS = [
  "What moment from today do you want to hold onto?",
  "What's weighing on you right now?",
  "Is there something you wish you could say to them?",
  "What did you do today that they would have smiled at?",
  "What does the grief feel like in your body right now?",
];

export default function JournalScreen() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await createEntry(text);
      setResponse(res.data);
      if (res.data.crisis_flagged) {
        Alert.alert(
          "We're concerned about you",
          "Please reach out to a crisis helpline right now. You deserve real support.",
          [{ text: "See resources", onPress: () => {} }]
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not save your entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setText(""); setResponse(null); };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.header}>Today's journal</Text>
        <Text style={s.date}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</Text>

        {!response ? (
          <>
            <Text style={s.prompt}>💭 {prompt}</Text>
            <TextInput
              style={s.input}
              placeholder="Write freely. This is your safe space..."
              placeholderTextColor="#BFBFBF"
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
            />
            <Text style={s.charCount}>{text.length} characters</Text>
            <TouchableOpacity style={[s.btn, !text.trim() && s.btnDisabled]} onPress={handleSubmit} disabled={loading || !text.trim()}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Save & reflect →</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <View style={s.responseCard}>
            <View style={s.emotionRow}>
              <View style={[s.emotionDot, { backgroundColor: EMOTION_COLORS[response.emotion_detected] || "#888" }]} />
              <Text style={s.emotionLabel}>{response.emotion_detected}</Text>
              <Text style={s.stageLabel}>· {response.grief_stage} stage</Text>
            </View>

            <View style={s.entryBox}>
              <Text style={s.entryText}>{text}</Text>
            </View>

            <View style={[s.aiBox, response.crisis_flagged && s.crisisBox]}>
              <Text style={s.aiIcon}>{response.crisis_flagged ? "🆘" : "🌿"}</Text>
              <Text style={s.aiText}>{response.ai_response}</Text>
            </View>

            <View style={s.actions}>
              <TouchableOpacity style={s.actionBtn} onPress={reset}>
                <Text style={s.actionBtnText}>+ New entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0EB", padding: 20 },
  header: { fontSize: 22, fontWeight: "700", color: "#2D2D2D", marginTop: 12 },
  date: { fontSize: 13, color: "#888", marginBottom: 20 },
  prompt: { fontSize: 14, color: "#6B5EA8", marginBottom: 12, fontStyle: "italic" },
  input: { backgroundColor: "#fff", borderRadius: 16, padding: 16, minHeight: 180, fontSize: 15, color: "#2D2D2D", lineHeight: 22, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  charCount: { fontSize: 11, color: "#BFBFBF", textAlign: "right", marginTop: 4, marginBottom: 16 },
  btn: { backgroundColor: "#6B5EA8", borderRadius: 14, padding: 16, alignItems: "center" },
  btnDisabled: { backgroundColor: "#C5BEE0" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  responseCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  emotionRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  emotionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  emotionLabel: { fontSize: 14, fontWeight: "600", color: "#2D2D2D", textTransform: "capitalize" },
  stageLabel: { fontSize: 13, color: "#888", marginLeft: 4, textTransform: "capitalize" },
  entryBox: { backgroundColor: "#F8F6F3", borderRadius: 12, padding: 14, marginBottom: 16 },
  entryText: { fontSize: 14, color: "#555", lineHeight: 21 },
  aiBox: { backgroundColor: "#EEF0FC", borderRadius: 12, padding: 14, flexDirection: "row", gap: 10 },
  crisisBox: { backgroundColor: "#FFF0F0" },
  aiIcon: { fontSize: 18 },
  aiText: { flex: 1, fontSize: 14, color: "#3D3580", lineHeight: 21 },
  actions: { marginTop: 16 },
  actionBtn: { borderWidth: 1, borderColor: "#6B5EA8", borderRadius: 12, padding: 13, alignItems: "center" },
  actionBtnText: { color: "#6B5EA8", fontWeight: "600" },
});
