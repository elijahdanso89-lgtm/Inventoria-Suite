import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { Sale, useApp } from "@/context/AppContext";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";

function SaleCard({ sale }: { sale: Sale }) {
  const { currency, products } = useApp();
  const product = products.find((p) => p.id === sale.productId);
  const profit = parseFloat(sale.profit);

  return (
    <View style={styles.saleCard}>
      <View style={styles.saleLeft}>
        <Text style={styles.saleName} numberOfLines={1}>
          {product?.name ?? "Deleted Product"}
        </Text>
        <Text style={styles.saleMeta}>
          {formatDate(sale.timestamp)} · {formatTime(sale.timestamp)}
        </Text>
        <Text style={styles.saleMeta}>Qty: {sale.quantity}</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleTotal}>
          {formatCurrency(sale.totalPrice, currency)}
        </Text>
        <Text
          style={[
            styles.saleProfit,
            { color: profit >= 0 ? Colors.success : Colors.danger },
          ]}
        >
          {profit >= 0 ? "+" : ""}
          {formatCurrency(profit, currency)}
        </Text>
      </View>
    </View>
  );
}

export default function SalesScreen() {
  const insets = useSafeAreaInsets();
  const { sales, currency, totalRevenue, totalProfit } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todaySales = sales.filter(
    (s) => new Date(s.timestamp) >= todayStart
  );
  const todayRevenue = todaySales.reduce(
    (acc, s) => acc + parseFloat(s.totalPrice),
    0
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Sales</Text>
          <Text style={styles.headerCount}>{sales.length} total</Text>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalRevenue, currency)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardMid]}>
            <Text style={styles.summaryLabel}>Total Profit</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totalProfit >= 0 ? Colors.success : Colors.danger },
              ]}
            >
              {formatCurrency(totalProfit, currency)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(todayRevenue, currency)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        renderItem={({ item }) => <SaleCard sale={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shopping-cart" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>No sales yet</Text>
            <Text style={styles.emptySub}>
              Record a sale to start tracking your revenue
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/sale/new");
        }}
      >
        <Feather name="plus" size={22} color="#fff" />
        <Text style={styles.fabText}>Record Sale</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
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
  summaryRow: { flexDirection: "row", gap: 0 },
  summaryCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  summaryCardMid: { marginHorizontal: 8 },
  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  list: { padding: 16, gap: 10 },
  saleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  saleLeft: { flex: 1, gap: 3 },
  saleName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  saleMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saleRight: { alignItems: "flex-end", gap: 4 },
  saleTotal: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  saleProfit: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
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
  fab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
});
