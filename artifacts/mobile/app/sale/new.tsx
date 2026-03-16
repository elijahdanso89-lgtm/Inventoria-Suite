import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { CURRENCY_SYMBOLS, useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/format";

export default function NewSaleScreen() {
  const insets = useSafeAreaInsets();
  const { products, recordSale, currency } = useApp();
  const params = useLocalSearchParams<{ productId?: string }>();
  const symbol = CURRENCY_SYMBOLS[currency];

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    params.productId ? Number(params.productId) : null
  );
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [search, setSearch] = useState("");

  const inStockProducts = products.filter((p) => p.quantity > 0);
  const filteredProducts = inStockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const qty = parseInt(quantity, 10) || 0;
  const disc = parseFloat(discount) || 0;

  const totalPrice = selectedProduct
    ? parseFloat(selectedProduct.sellingPrice) * (1 - disc / 100) * qty
    : 0;
  const profit = selectedProduct
    ? (parseFloat(selectedProduct.sellingPrice) * (1 - disc / 100) -
        parseFloat(selectedProduct.costPrice)) *
      qty
    : 0;

  const handleRecord = () => {
    if (!selectedProduct) {
      Alert.alert("Select a product first");
      return;
    }
    if (qty <= 0) {
      Alert.alert("Enter a valid quantity");
      return;
    }
    if (qty > selectedProduct.quantity) {
      Alert.alert("Not enough stock", `Only ${selectedProduct.quantity} units available`);
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      recordSale(selectedProduct.id, qty, disc);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Sale</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Product</Text>

            {/* Search */}
            <View style={styles.searchRow}>
              <Feather name="search" size={15} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor={Colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {inStockProducts.length === 0 ? (
              <View style={styles.emptyProducts}>
                <Text style={styles.emptyText}>No products in stock</Text>
              </View>
            ) : (
              <View style={styles.productList}>
                {filteredProducts.map((p) => (
                  <Pressable
                    key={p.id}
                    style={[
                      styles.productOption,
                      selectedProductId === p.id && styles.productOptionSelected,
                    ]}
                    onPress={() => setSelectedProductId(p.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productOptionName}>{p.name}</Text>
                      <Text style={styles.productOptionMeta}>
                        {formatCurrency(p.sellingPrice, currency)} · {p.quantity} left
                      </Text>
                    </View>
                    {selectedProductId === p.id && (
                      <Feather name="check-circle" size={20} color={Colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Qty & discount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sale Details</Text>
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Discount %</Text>
                <TextInput
                  style={styles.input}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
          </View>

          {/* Summary */}
          {selectedProduct && qty > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Sale Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Product</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {selectedProduct.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryValue}>{qty}</Text>
              </View>
              {disc > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: Colors.warning }]}>
                    -{disc}%
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatCurrency(totalPrice, currency)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Profit</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: profit >= 0 ? Colors.success : Colors.danger },
                  ]}
                >
                  {profit >= 0 ? "+" : ""}
                  {formatCurrency(profit, currency)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.recordBtn,
              (!selectedProduct || qty <= 0) && styles.recordBtnDisabled,
            ]}
            onPress={handleRecord}
            disabled={!selectedProduct || qty <= 0}
          >
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.recordBtnText}>Confirm Sale</Text>
          </TouchableOpacity>
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
  form: { padding: 20, gap: 20 },
  section: { gap: 12 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, height: 42, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text },
  emptyProducts: { padding: 20, alignItems: "center" },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textTertiary },
  productList: { gap: 8 },
  productOption: {
    flexDirection: "row", alignItems: "center", padding: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary, gap: 10,
  },
  productOptionSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryLight,
  },
  productOptionName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  productOptionMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  row: { flexDirection: "row", gap: 14 },
  inputGroup: { flex: 1, gap: 6 },
  inputLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.text },
  input: {
    backgroundColor: Colors.surfaceSecondary, borderRadius: 12, height: 48,
    paddingHorizontal: 14, fontFamily: "Inter_400Regular", fontSize: 16,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceSecondary, borderRadius: 14, padding: 16, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  summaryTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.text, marginBottom: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  summaryTotal: {
    paddingTop: 10, marginTop: 4,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  summaryTotalLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  summaryTotalValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.primary },
  recordBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  recordBtnDisabled: { opacity: 0.45 },
  recordBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});
