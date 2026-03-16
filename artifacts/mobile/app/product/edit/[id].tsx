import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
  "Electronics", "Clothing", "Food & Drinks", "Tools", "Furniture",
  "Sports", "Books", "Beauty", "Toys", "Other",
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { products, updateProduct, currency } = useApp();
  const product = products.find((p) => p.id === Number(id));
  const symbol = CURRENCY_SYMBOLS[currency];

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? "");
  const [sellingPrice, setSellingPrice] = useState(product?.sellingPrice ?? "");
  const [quantity, setQuantity] = useState(String(product?.quantity ?? ""));
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(product?.lowStockThreshold ?? "5")
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!product) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!costPrice || isNaN(parseFloat(costPrice))) e.costPrice = "Invalid";
    if (!sellingPrice || isNaN(parseFloat(sellingPrice))) e.sellingPrice = "Invalid";
    if (!quantity || isNaN(parseInt(quantity, 10))) e.quantity = "Invalid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProduct(product.id, {
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      costPrice,
      sellingPrice,
      quantity: parseInt(quantity, 10),
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      imageUrl: imageUrl.trim() || null,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 40 }]}
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
          />
          <FormField
            label="Description"
            placeholder="Optional"
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ height: 72, textAlignVertical: "top", paddingTop: 12 }}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(category === c ? "" : c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField label="Cost Price" required placeholder="0.00" prefix={symbol}
                value={costPrice} onChangeText={setCostPrice} keyboardType="decimal-pad" error={errors.costPrice} />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Selling Price" required placeholder="0.00" prefix={symbol}
                value={sellingPrice} onChangeText={setSellingPrice} keyboardType="decimal-pad" error={errors.sellingPrice} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField label="Quantity" required placeholder="0"
                value={quantity} onChangeText={setQuantity} keyboardType="number-pad" error={errors.quantity} />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Low Stock Alert" placeholder="5"
                value={lowStockThreshold} onChangeText={setLowStockThreshold} keyboardType="number-pad" />
            </View>
          </View>

          <FormField label="Image URL" placeholder="https://..." value={imageUrl}
            onChangeText={setImageUrl} keyboardType="url" autoCapitalize="none" />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  form: { padding: 20, gap: 18 },
  fieldGroup: { gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.text },
  row: { flexDirection: "row", gap: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
});
