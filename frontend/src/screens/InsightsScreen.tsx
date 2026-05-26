import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { getInsights } from "../services/api";

const EMOTION_COLORS: Record<string, string> = {
  sadness: "#7B8FB5", anger: "#C0614A", guilt: "#A0789A",
  yearning: "#6B5EA8", numbness: "#8A9BA8", acceptance: "#5DAA89",
  fear: "#A07850", relief: "#6AAA8A",
};

export default function InsightsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInsights().then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6B5EA8" /></View>;
  if (!data) return <View style={s.center}><Text style={s.empty}>No entries yet. Start journaling to see insights.</Text></View>;

  const maxIntensity = Math.max(...(data.emotion_trend?.map((d: any) => d.intensity) || [1]), 0.1);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.header}>Your journey</Text>
      <Text style={s.subtitle}>Last 30 days</Text>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statNum}>{data.journal_streak}</Text>
          <Text style={s.statLabel}>Day streak</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statNum}>{data.total_entries}</Text>
          <Text style={s.statLabel}>Total entries</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: EMOTION_COLORS[data.dominant_emotion] + "22" }]}>
          <Text style={[s.statNum, { fontSize: 13, color: EMOTION_COLORS[data.dominant_emotion] }]}>
            {data.dominant_emotion}
          </Text>
          <Text style={s.statLabel}>Top emotion</Text>
        </View>
      </View>

      {/* Grief stage */}
      <View style={s.stageCard}>
        <Text style={s.stageLabel}>Current grief stage</Text>
        <Text style={s.stageName}>{data.grief_stage_current}</Text>
        <Text style={s.stageDesc}>Grief is not linear. You may move between stages — that's completely natural.</Text>
      </View>

      {/* Emotion bar chart */}
      {data.emotion_trend?.length > 0 && (
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Emotion intensity over time</Text>
          <View style={s.bars}>
            {data.emotion_trend.slice(-14).map((point: any, i: number) => (
              <View key={i} style={s.barCol}>
                <View style={[s.bar, {
                  height: Math.max(8, (point.intensity / maxIntensity) * 80),
                  backgroundColor: EMOTION_COLORS[point.emotion] || "#888"
                }]} />
              </View>
            ))}
          </View>
          <Text style={s.chartNote}>Last 14 entries</Text>
        </View>
      )}

      {/* AI summary */}
      <View style={s.summaryCard}>
        <Text style={s.summaryIcon}>🌿</Text>
        <Text style={s.summaryText}>{data.progress_summary}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0EB", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#888", fontSize: 15, textAlign: "center" },
  header: { fontSize: 22, fontWeight: "700", color: "#2D2D2D", marginTop: 12 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "700", color: "#6B5EA8" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 2, textAlign: "center" },
  stageCard: { backgroundColor: "#EEF0FC", borderRadius: 16, padding: 18, marginBottom: 16 },
  stageLabel: { fontSize: 12, color: "#6B5EA8", textTransform: "uppercase", letterSpacing: 0.5 },
  stageName: { fontSize: 20, fontWeight: "700", color: "#3D3580", marginVertical: 4, textTransform: "capitalize" },
  stageDesc: { fontSize: 13, color: "#6B5EA8", lineHeight: 19 },
  chartCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 16 },
  chartTitle: { fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 14 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 90, gap: 4 },
  barCol: { flex: 1, justifyContent: "flex-end" },
  bar: { borderRadius: 3 },
  chartNote: { fontSize: 11, color: "#BFBFBF", marginTop: 8 },
  summaryCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18, flexDirection: "row", gap: 12 },
  summaryIcon: { fontSize: 22 },
  summaryText: { flex: 1, fontSize: 14, color: "#555", lineHeight: 21 },
});
