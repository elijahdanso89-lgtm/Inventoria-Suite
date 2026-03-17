import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const WELCOME_KEY = "inventoria_welcome_seen_v1";

const FEATURES = [
  {
    icon: "package",
    color: "#2563eb",
    bg: "#dbeafe",
    title: "Product Inventory",
    desc: "Track every product with cost price, selling price, quantity, and low-stock alerts.",
  },
  {
    icon: "trending-up",
    color: "#16a34a",
    bg: "#dcfce7",
    title: "Profit Tracking",
    desc: "See real profit per unit and total profit across all your sales automatically.",
  },
  {
    icon: "shopping-cart",
    color: "#f59e0b",
    bg: "#fef3c7",
    title: "Sales Recording",
    desc: "Log sales in seconds with quantity, discount support, and instant stock updates.",
  },
  {
    icon: "bar-chart-2",
    color: "#7c3aed",
    bg: "#ede9fe",
    title: "Insights & Charts",
    desc: "14-day revenue trends, top performers, and achievement milestones to motivate you.",
  },
];

const DEVELOPERS = [
  {
    name: "Elijah Danso",
    role: "Product Lead & Developer",
    initials: "ED",
    color: "#2563eb",
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(WELCOME_KEY, "1");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={["#1e3a5f", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoEmoji}>🏪</Text>
          </LinearGradient>

          <Text style={styles.appName}>Inventoria</Text>
          <Text style={styles.tagline}>
            Simple inventory & profit tracking{"\n"}for small business owners
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Feather name="globe" size={12} color="#2563eb" />
              <Text style={styles.badgeText}>Multi-currency</Text>
            </View>
            <View style={styles.badge}>
              <Feather name="wifi-off" size={12} color="#2563eb" />
              <Text style={styles.badgeText}>Works offline</Text>
            </View>
            <View style={styles.badge}>
              <Feather name="lock" size={12} color="#2563eb" />
              <Text style={styles.badgeText}>Private & local</Text>
            </View>
          </View>
        </Animated.View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT YOU GET</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                  <Feather name={f.icon as any} size={22} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT THE APP</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Inventoria was built for small business owners and street vendors
              who need a fast, reliable way to manage stock and understand their
              profit margins — without the complexity of enterprise software.
            </Text>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutText}>
              Everything is stored privately on your device. No accounts, no
              subscriptions, no internet required. Just open the app and start
              tracking.
            </Text>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUILT BY</Text>
          {DEVELOPERS.map((dev) => (
            <View key={dev.name} style={styles.devCard}>
              <View style={[styles.devAvatar, { backgroundColor: dev.color + "22" }]}>
                <Text style={[styles.devInitials, { color: dev.color }]}>
                  {dev.initials}
                </Text>
              </View>
              <View style={styles.devInfo}>
                <Text style={styles.devName}>{dev.name}</Text>
                <Text style={styles.devRole}>{dev.role}</Text>
              </View>
              <View style={[styles.devBadge, { backgroundColor: dev.color + "15" }]}>
                <Text style={[styles.devBadgeText, { color: dev.color }]}>
                  v1.0
                </Text>
              </View>
            </View>
          ))}

          <Text style={styles.builtWith}>
            Built with React Native · Expo · AsyncStorage
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.ctaHint}>Your data stays on your device</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 32,
  },

  /* Hero */
  hero: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 46,
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#2563eb",
  },

  /* Section */
  section: { gap: 14 },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#94a3b8",
    letterSpacing: 1.2,
  },

  /* Features */
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0f172a",
  },
  featureDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#64748b",
    lineHeight: 21,
  },

  /* About */
  aboutCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#374151",
    lineHeight: 23,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },

  /* Team */
  devCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  devAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  devInitials: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  devInfo: { flex: 1 },
  devName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0f172a",
  },
  devRole: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  devBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  devBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  builtWith: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
  },

  /* CTA */
  ctaSection: {
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
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
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  ctaHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#94a3b8",
  },
});
