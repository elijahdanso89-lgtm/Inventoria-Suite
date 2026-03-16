import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { Currency, CURRENCY_SYMBOLS, useApp } from "@/context/AppContext";

const CURRENCIES: { code: Currency; name: string }[] = [
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { currency, setCurrency, products, sales } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleExport = () => {
    Alert.alert("Export Data", "Your data is stored locally on this device.");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App info */}
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <Feather name="shopping-cart" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>Inventoria</Text>
          <Text style={styles.appTagline}>
            Inventory & Profit Tracking for Small Businesses
          </Text>
          <Text style={styles.appStats}>
            {products.length} products · {sales.length} sales recorded
          </Text>
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <View style={styles.card}>
            {CURRENCIES.map((c, i) => (
              <Pressable
                key={c.code}
                style={[
                  styles.currencyRow,
                  i < CURRENCIES.length - 1 && styles.currencyBorder,
                ]}
                onPress={() => setCurrency(c.code)}
              >
                <View>
                  <Text style={styles.currencyCode}>
                    {CURRENCY_SYMBOLS[c.code]} {c.code}
                  </Text>
                  <Text style={styles.currencyName}>{c.name}</Text>
                </View>
                {currency === c.code && (
                  <Feather name="check-circle" size={20} color={Colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={handleExport}>
              <Feather name="download" size={18} color={Colors.text} />
              <Text style={styles.actionText}>Export Data</Text>
              <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.actionBorder} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                Alert.alert(
                  "Clear All Data",
                  "This will permanently delete all products and sales. This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear Data",
                      style: "destructive",
                      onPress: async () => {
                        await Promise.all([
                          AsyncStorage.removeItem("inventoria_products_v1"),
                          AsyncStorage.removeItem("inventoria_sales_v1"),
                          AsyncStorage.removeItem("inventoria_achievements_v1"),
                        ]);
                        Alert.alert("Done", "Restart the app to see changes.");
                      },
                    },
                  ]
                );
              }}
            >
              <Feather name="trash-2" size={18} color={Colors.danger} />
              <Text style={[styles.actionText, { color: Colors.danger }]}>
                Clear All Data
              </Text>
              <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          Made for Elijah Danso · Inventoria v1.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  scroll: { padding: 16, gap: 16 },
  appCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  appIcon: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  appName: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  appTagline: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary,
    textAlign: "center", lineHeight: 18,
  },
  appStats: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.primary, marginTop: 4 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text, paddingLeft: 2 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 14, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  currencyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16,
  },
  currencyBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  currencyCode: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text },
  currencyName: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  actionRow: {
    flexDirection: "row", alignItems: "center", padding: 16, gap: 12,
  },
  actionBorder: { height: 1, backgroundColor: Colors.borderLight },
  actionText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text },
  footer: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary,
    textAlign: "center", marginTop: 8,
  },
});
