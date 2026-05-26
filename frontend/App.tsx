import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import JournalScreen from "./src/screens/JournalScreen";
import InsightsScreen from "./src/screens/InsightsScreen";
import MemoryScreen from "./src/screens/MemoryScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { useAuthStore } from "./src/store/authStore";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, any> = {
            Journal: focused ? "journal" : "journal-outline",
            Insights: focused ? "analytics" : "analytics-outline",
            Memories: focused ? "heart" : "heart-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6B5EA8",
        tabBarInactiveTintColor: "#BFBFBF",
        tabBarStyle: { borderTopColor: "#F0EDE8", paddingBottom: 4 },
        headerStyle: { backgroundColor: "#F5F0EB" },
        headerShadowVisible: false,
        headerTitleStyle: { color: "#2D2D2D", fontWeight: "700" },
      })}
    >
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Memories" component={MemoryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Restore session from secure storage
    (async () => {
      const token = await SecureStore.getItemAsync("access_token");
      const userId = await SecureStore.getItemAsync("user_id");
      if (token && userId) setAuth(token, userId);
      setHydrated(true);
    })();
  }, []);

  if (!hydrated) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainTabs /> : <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
