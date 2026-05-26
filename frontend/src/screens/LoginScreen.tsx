import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from "react-native";
import { login, register } from "../services/api";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lossType, setLossType] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert("Please fill in all fields");
    setLoading(true);
    try {
      const res = isLogin
        ? await login(email, password)
        : await register({ email, password, display_name: name, loss_type: lossType });
      setAuth(res.data.access_token, res.data.user_id);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.card}>
        <Text style={s.logo}>🌿</Text>
        <Text style={s.title}>GriefPath</Text>
        <Text style={s.subtitle}>A safe space for your journey</Text>

        {!isLogin && (
          <>
            <TextInput style={s.input} placeholder="Your name" placeholderTextColor="#999"
              value={name} onChangeText={setName} />
            <TextInput style={s.input} placeholder="Who did you lose? (optional)" placeholderTextColor="#999"
              value={lossType} onChangeText={setLossType} />
          </>
        )}

        <TextInput style={s.input} placeholder="Email" placeholderTextColor="#999"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Password" placeholderTextColor="#999"
          value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{isLogin ? "Sign in" : "Begin journey"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={s.toggle}>{isLogin ? "New here? Create account" : "Already have an account? Sign in"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0EB", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 28, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  logo: { fontSize: 40, textAlign: "center", marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", color: "#2D2D2D" },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 28 },
  input: { backgroundColor: "#F8F6F3", borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15, color: "#2D2D2D" },
  btn: { backgroundColor: "#6B5EA8", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  toggle: { textAlign: "center", marginTop: 16, color: "#6B5EA8", fontSize: 14 },
});
