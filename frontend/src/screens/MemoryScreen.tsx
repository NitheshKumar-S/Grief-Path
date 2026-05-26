import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator
} from "react-native";
import { listMemories, createMemory, deleteMemory } from "../services/api";

export default function MemoryScreen() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await listMemories();
      setMemories(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await createMemory(title, content);
      setModal(false); setTitle(""); setContent("");
      load();
    } catch {
      Alert.alert("Error", "Could not save memory.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete memory", "Are you sure? This cannot be undone.", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await deleteMemory(id);
        setMemories((m) => m.filter((x) => x.id !== id));
      }}
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6B5EA8" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0EB" }}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={s.header}>Memory capsule</Text>
        <Text style={s.subtitle}>Moments worth keeping</Text>

        {memories.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>🫧</Text>
            <Text style={s.emptyText}>No memories yet. Add your first one below.</Text>
          </View>
        )}

        {memories.map((m) => (
          <View key={m.id} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>{m.title}</Text>
              {m.memory_date && <Text style={s.cardDate}>{m.memory_date}</Text>}
            </View>
            <Text style={s.cardContent}>{m.content}</Text>
            <TouchableOpacity onPress={() => handleDelete(m.id)}>
              <Text style={s.deleteBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setModal(true)}>
        <Text style={s.fabText}>+ Add memory</Text>
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>New memory</Text>
            <TextInput style={s.input} placeholder="Title (e.g. Dad — summer 2019)"
              placeholderTextColor="#BFBFBF" value={title} onChangeText={setTitle} />
            <TextInput style={[s.input, { minHeight: 100 }]}
              placeholder="Write the memory..."
              placeholderTextColor="#BFBFBF"
              value={content} onChangeText={setContent}
              multiline textAlignVertical="top" />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleCreate} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 22, fontWeight: "700", color: "#2D2D2D", marginTop: 12 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 20 },
  emptyBox: { alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { fontSize: 14, color: "#888", textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#2D2D2D" },
  cardDate: { fontSize: 12, color: "#888" },
  cardContent: { fontSize: 14, color: "#555", lineHeight: 21, marginBottom: 10 },
  deleteBtn: { fontSize: 12, color: "#C0614A" },
  fab: { position: "absolute", bottom: 24, right: 20, left: 20, backgroundColor: "#6B5EA8", borderRadius: 14, padding: 16, alignItems: "center" },
  fabText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#2D2D2D", marginBottom: 16 },
  input: { backgroundColor: "#F8F6F3", borderRadius: 12, padding: 14, fontSize: 14, color: "#2D2D2D", marginBottom: 12 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: "#DDD", borderRadius: 12, padding: 14, alignItems: "center" },
  cancelText: { color: "#888", fontWeight: "600" },
  saveBtn: { flex: 1, backgroundColor: "#6B5EA8", borderRadius: 12, padding: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "600" },
});
