import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormField } from "@/components/FormField";
import Colors from "@/constants/colors";
import { CURRENCY_SYMBOLS, useApp } from "@/context/AppContext";

const CATEGORIES = [
  "Electronics", "Clothing", "Food & Drinks", "Tools",
  "Sports", "Books", "Beauty", "Other",
];

export default function QuickAddScreen() {
  const insets = useSafeAreaInsets();
  const { addProduct, currency } = useApp();
  const symbol = CURRENCY_SYMBOLS[currency];

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!costPrice || isNaN(parseFloat(costPrice))) e.costPrice = "Required";
    if (!sellingPrice || isNaN(parseFloat(sellingPrice))) e.sellingPrice = "Required";
    if (!quantity || isNaN(parseInt(quantity, 10))) e.quantity = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addProduct({
      name: name.trim(),
      description: null,
      category: category || null,
      costPrice,
      sellingPrice,
      quantity: parseInt(quantity, 10),
      lowStockThreshold: 5,
      imageUrl: null,
    });
    router.back();
  };

  const profitPerUnit =
    costPrice && sellingPrice
      ? parseFloat(sellingPrice || "0") - parseFloat(costPrice || "0")
      : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Feather name="zap" size={20} color={Colors.accent} />
            <Text style={styles.headerTitle}>Quick Add</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="Product Name"
            required
            placeholder="Product name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoFocus
          />

          {/* Category chips */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category (optional)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(category === c ? "" : c)}
                >
                  <Text
                    style={[styles.chipText, category === c && styles.chipTextActive]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <FormField
            label="Quantity"
            required
            placeholder="0"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            error={errors.quantity}
          />

          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Cost Price"
                required
                placeholder="0.00"
                prefix={symbol}
                value={costPrice}
                onChangeText={setCostPrice}
                keyboardType="decimal-pad"
                error={errors.costPrice}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Selling Price"
                required
                placeholder="0.00"
                prefix={symbol}
                value={sellingPrice}
                onChangeText={setSellingPrice}
                keyboardType="decimal-pad"
                error={errors.sellingPrice}
              />
            </View>
          </View>

          {profitPerUnit !== null && (
            <View
              style={[
                styles.profitPill,
                { backgroundColor: profitPerUnit >= 0 ? Colors.successLight : Colors.dangerLight },
              ]}
            >
              <Text
                style={[
                  styles.profitText,
                  { color: profitPerUnit >= 0 ? Colors.success : Colors.danger },
                ]}
              >
                {profitPerUnit >= 0 ? "+" : ""}
                {symbol}
                {profitPerUnit.toFixed(2)} profit per unit
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Feather name="zap" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fullFormLink}
            onPress={() => {
              router.back();
              setTimeout(() => router.push("/product/new"), 100);
            }}
          >
            <Text style={styles.fullFormText}>Need more options? Use full form</Text>
            <Feather name="arrow-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20 },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  form: { padding: 20, gap: 18 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.text },
  priceRow: { flexDirection: "row", gap: 14 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
  profitPill: {
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  profitText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  fullFormLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  fullFormText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.primary,
  },
});
