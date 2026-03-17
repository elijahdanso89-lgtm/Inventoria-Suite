import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";

const { width } = Dimensions.get("window");
const WELCOME_KEY = "inventoria_welcome_seen_v1";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { setProfile, userName, businessName } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState(userName);
  const [business, setBusiness] = useState(businessName);
  const [nameError, setNameError] = useState(false);
  const [businessError, setBusinessError] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const businessRef = useRef<TextInput>(null);

  const handleGetStarted = async () => {
    let valid = true;
    if (!name.trim()) { setNameError(true); valid = false; } else setNameError(false);
    if (!business.trim()) { setBusinessError(true); valid = false; } else setBusinessError(false);
    if (!valid) return;

    setSaving(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setProfile(name.trim(), business.trim());
    await AsyncStorage.setItem(WELCOME_KEY, "1");
    setSaving(false);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.container,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo image ── */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ── Tagline ── */}
        <Text style={styles.tagline}>
          Inventory & Profit Tracking{"\n"}for Small Businesses
        </Text>

        {/* ── Badge row ── */}
        <View style={styles.badgeRow}>
          {[
            { icon: "globe", label: "Multi-currency" },
            { icon: "wifi-off", label: "Works offline" },
            { icon: "lock", label: "Private & local" },
          ].map((b) => (
            <View key={b.label} style={styles.badge}>
              <Feather name={b.icon as any} size={11} color="#2563eb" />
              <Text style={styles.badgeText}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Form ── */}
        <Text style={styles.formHeading}>Let's get to know you</Text>
        <Text style={styles.formSub}>
          Personalise your experience with your name and business info.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            ref={nameRef}
            style={[styles.input, nameError && styles.inputError]}
            placeholder="e.g. Elijah Danso"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={(t) => { setName(t); if (t.trim()) setNameError(false); }}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => businessRef.current?.focus()}
          />
          {nameError && (
            <Text style={styles.errorText}>Please enter your name</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            ref={businessRef}
            style={[styles.input, businessError && styles.inputError]}
            placeholder="e.g. Danso Electronics"
            placeholderTextColor="#9ca3af"
            value={business}
            onChangeText={(t) => { setBusiness(t); if (t.trim()) setBusinessError(false); }}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleGetStarted}
          />
          {businessError && (
            <Text style={styles.errorText}>Please enter your business name</Text>
          )}
        </View>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleGetStarted}
          activeOpacity={0.85}
          disabled={saving}
        >
          <LinearGradient
            colors={["#f59e0b", "#d97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>Get Started</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>Your data stays on your device only</Text>

        {/* ── Feature pills ── */}
        <View style={styles.divider} />
        <View style={styles.pillsRow}>
          {[
            { icon: "package", label: "Product Inventory" },
            { icon: "trending-up", label: "Profit Charts" },
            { icon: "shopping-cart", label: "Sales Recording" },
            { icon: "bell", label: "Low Stock Alerts" },
          ].map((f) => (
            <View key={f.label} style={styles.pill}>
              <Feather name={f.icon as any} size={14} color="#2563eb" />
              <Text style={styles.pillText}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Developer card ── */}
        <View style={styles.devCard}>
          <View style={styles.devAvatar}>
            <Text style={styles.devInitials}>ED</Text>
          </View>
          <View style={styles.devInfo}>
            <Text style={styles.devName}>Elijah Danso</Text>
            <Text style={styles.devRole}>Product Lead & Developer</Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0</Text>
          </View>
        </View>
        <Text style={styles.builtWith}>
          Built with React Native · Expo · AsyncStorage
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },

  container: {
    paddingHorizontal: 22,
    alignItems: "center",
  },

  /* Logo */
  logoWrap: { marginBottom: 4 },
  logo: {
    width: Math.min(width * 0.68, 260),
    height: Math.min(width * 0.52, 200),
  },

  /* Tagline */
  tagline: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#1e3a5f",
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 14,
  },

  /* Badges */
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#2563eb",
  },

  /* Divider */
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 20,
  },

  /* Form */
  formHeading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  formSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    alignSelf: "flex-start",
    lineHeight: 21,
    marginBottom: 18,
  },
  inputGroup: { width: "100%", marginBottom: 14 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#ef4444",
    marginTop: 4,
  },

  /* CTA */
  ctaButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
  },
  ctaHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },

  /* Feature pills */
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },

  /* Developer card */
  devCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  devAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  devInitials: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  devInfo: { flex: 1 },
  devName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  devRole: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    marginTop: 1,
  },
  versionBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  versionText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#2563eb",
  },
  builtWith: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 10,
  },
});
