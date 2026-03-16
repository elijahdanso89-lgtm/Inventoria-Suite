import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { products, sales, currency, deleteProduct } = useApp();

  const product = products.find((p) => p.id === Number(id));
  const productSales = useMemo(
    () => sales.filter((s) => s.productId === Number(id)),
    [sales, id]
  );

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found</Text>
        </View>
      </View>
    );
  }

  const profitPerUnit =
    parseFloat(product.sellingPrice) - parseFloat(product.costPrice);
  const totalRevenue = productSales.reduce(
    (acc, s) => acc + parseFloat(s.totalPrice),
    0
  );
  const totalProfit = productSales.reduce(
    (acc, s) => acc + parseFloat(s.profit),
    0
  );
  const totalSold = productSales.reduce((acc, s) => acc + s.quantity, 0);

  const handleDelete = () => {
    Alert.alert("Delete Product", "Do you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Product Only",
        style: "destructive",
        onPress: () => {
          deleteProduct(product.id, false);
          router.back();
        },
      },
      {
        text: "Delete Product + Past Sales",
        style: "destructive",
        onPress: () => {
          deleteProduct(product.id, true);
          router.back();
        },
      },
    ]);
  };

  const stockColor =
    product.quantity === 0
      ? Colors.danger
      : product.quantity <= product.lowStockThreshold
      ? Colors.warning
      : Colors.success;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <TouchableOpacity style={styles.backBtn2} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push(`/product/edit/${product.id}`)}
          >
            <Feather name="edit-2" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.category && (
                <Text style={styles.categoryText}>{product.category}</Text>
              )}
              {product.description && (
                <Text style={styles.descText}>{product.description}</Text>
              )}
            </View>
            <View style={styles.stockBubble}>
              <Text style={[styles.stockNumber, { color: stockColor }]}>
                {product.quantity}
              </Text>
              <Text style={styles.stockLabel}>units</Text>
            </View>
          </View>

          {/* Price row */}
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Cost</Text>
              <Text style={styles.priceItemValue}>
                {formatCurrency(product.costPrice, currency)}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Sell</Text>
              <Text style={styles.priceItemValue}>
                {formatCurrency(product.sellingPrice, currency)}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Profit/unit</Text>
              <Text
                style={[
                  styles.priceItemValue,
                  {
                    color: profitPerUnit >= 0 ? Colors.success : Colors.danger,
                  },
                ]}
              >
                {formatCurrency(profitPerUnit, currency)}
              </Text>
            </View>
          </View>

          {/* Stock threshold */}
          <Text style={styles.thresholdText}>
            Low stock alert at {product.lowStockThreshold} units
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSold}</Text>
            <Text style={styles.statLabel}>Units Sold</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(totalRevenue, currency)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                { color: totalProfit >= 0 ? Colors.success : Colors.danger },
              ]}
            >
              {formatCurrency(totalProfit, currency)}
            </Text>
            <Text style={styles.statLabel}>Profit</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.recordSaleBtn}
          onPress={() => router.push({ pathname: "/sale/new", params: { productId: String(product.id) } })}
        >
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.recordSaleBtnText}>Record a Sale</Text>
        </TouchableOpacity>

        {/* Sales history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales History</Text>
          {productSales.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={36} color={Colors.border} />
              <Text style={styles.emptyText}>No sales for this product</Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {productSales.map((sale, i) => (
                <View
                  key={sale.id}
                  style={[
                    styles.saleRow,
                    i < productSales.length - 1 && styles.saleRowBorder,
                  ]}
                >
                  <View>
                    <Text style={styles.saleDate}>
                      {formatDate(sale.timestamp)} · {formatTime(sale.timestamp)}
                    </Text>
                    <Text style={styles.saleQty}>Qty: {sale.quantity}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.saleTotal}>
                      {formatCurrency(sale.totalPrice, currency)}
                    </Text>
                    <Text
                      style={[
                        styles.saleProfit,
                        {
                          color:
                            parseFloat(sale.profit) >= 0 ? Colors.success : Colors.danger,
                        },
                      ]}
                    >
                      {parseFloat(sale.profit) >= 0 ? "+" : ""}
                      {formatCurrency(sale.profit, currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn2: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: 16, gap: 14 },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTop: { flexDirection: "row", gap: 12 },
  productName: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  categoryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  descText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  stockBubble: {
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
  },
  stockNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  stockLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceGrid: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    overflow: "hidden",
  },
  priceItem: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  priceDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  priceItemLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceItemValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  thresholdText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
  },
  statsRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: { flex: 1, padding: 16, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 12 },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  recordSaleBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  recordSaleBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textTertiary,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  saleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  saleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  saleDate: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.text,
  },
  saleQty: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  saleTotal: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  saleProfit: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 2,
  },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
