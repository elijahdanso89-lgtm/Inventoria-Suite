import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { Product, useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/format";

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0)
    return (
      <View style={[styles.badge, { backgroundColor: Colors.dangerLight }]}>
        <View style={[styles.badgeDot, { backgroundColor: Colors.danger }]} />
        <Text style={[styles.badgeText, { color: Colors.danger }]}>Out of Stock</Text>
      </View>
    );
  if (qty <= threshold)
    return (
      <View style={[styles.badge, { backgroundColor: Colors.warningLight }]}>
        <View style={[styles.badgeDot, { backgroundColor: Colors.warning }]} />
        <Text style={[styles.badgeText, { color: Colors.warning }]}>Low Stock</Text>
      </View>
    );
  return (
    <View style={[styles.badge, { backgroundColor: Colors.successLight }]}>
      <View style={[styles.badgeDot, { backgroundColor: Colors.success }]} />
      <Text style={[styles.badgeText, { color: Colors.success }]}>In Stock</Text>
    </View>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { currency, sales } = useApp();
  const profitPerUnit =
    parseFloat(product.sellingPrice) - parseFloat(product.costPrice);
  const unitsSold = sales
    .filter((s) => s.productId === product.id)
    .reduce((acc, s) => acc + s.quantity, 0);

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.75}
    >
      <View style={styles.productCardBody}>
        <View style={styles.productMain}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          {product.category ? (
            <Text style={styles.productCat}>{product.category}</Text>
          ) : null}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cost:</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(product.costPrice, currency)}
            </Text>
            <Text style={styles.priceSep}>·</Text>
            <Text style={styles.priceLabel}>Sell:</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(product.sellingPrice, currency)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.profitLabel}>Profit/unit:</Text>
            <Text
              style={[
                styles.profitValue,
                { color: profitPerUnit >= 0 ? Colors.success : Colors.danger },
              ]}
            >
              {formatCurrency(profitPerUnit, currency)}
            </Text>
            <Text style={styles.priceSep}>·</Text>
            <Text style={styles.profitLabel}>Sold: {unitsSold}</Text>
          </View>
        </View>
        <View style={styles.productRight}>
          <Text style={styles.quantityNumber}>{product.quantity}</Text>
          <Text style={styles.quantityLabel}>units</Text>
          <StockBadge qty={product.quantity} threshold={product.lowStockThreshold} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { products, deleteProduct } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        search.length === 0 ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all"
          ? true
          : filter === "out"
          ? p.quantity === 0
          : p.quantity > 0 && p.quantity <= p.lowStockThreshold;
      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerCount}>{products.length} products</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={Colors.textTertiary} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={{ paddingRight: 12 }}>
              <Feather name="x" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {(["all", "low", "out"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === f && styles.filterPillTextActive,
                ]}
              >
                {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        renderItem={({ item }) => <ProductCard product={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="package" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>
              {products.length === 0 ? "No products yet" : "No results found"}
            </Text>
            <Text style={styles.emptySub}>
              {products.length === 0
                ? "Tap + to add your first product"
                : "Try a different search term"}
            </Text>
          </View>
        }
      />

      {/* FAB Row */}
      <View style={[styles.fabRow, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.quickAddFab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/product/quickadd");
          }}
        >
          <Feather name="zap" size={20} color="#fff" />
          <Text style={styles.quickAddText}>Quick Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addFab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/product/new");
          }}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  headerCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  filterRow: { flexDirection: "row", gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterPillTextActive: { color: Colors.primary },
  list: { padding: 16, gap: 10 },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardBody: { flexDirection: "row", padding: 14, gap: 12 },
  productMain: { flex: 1, gap: 4 },
  productName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  productCat: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  priceLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  priceValue: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  priceSep: { color: Colors.textTertiary },
  profitLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  profitValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  productRight: { alignItems: "flex-end", gap: 4 },
  quantityNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
  },
  quantityLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  fabRow: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickAddFab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  quickAddText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  addFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
