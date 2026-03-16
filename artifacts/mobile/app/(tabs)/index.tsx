import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";

import { AchievementToast } from "@/components/AchievementToast";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { formatCurrency, formatDateShort, getLast30Days } from "@/utils/format";

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statIcon]}>{icon}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    products,
    sales,
    currency,
    totalRevenue,
    totalProfit,
    totalStockValue,
    todaysSales,
    lowStockProducts,
    newAchievement,
    clearNewAchievement,
  } = useApp();

  const topProducts = useMemo(() => {
    const map: Record<number, number> = {};
    for (const s of sales) {
      map[s.productId] = (map[s.productId] ?? 0) + parseFloat(s.profit);
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, profit]) => ({
        product: products.find((p) => p.id === Number(id)),
        profit,
      }))
      .filter((x) => x.product);
  }, [sales, products]);

  const chartData = useMemo(() => {
    const days = getLast30Days();
    const map: Record<string, number> = {};
    for (const s of sales) {
      const day = new Date(s.timestamp).toDateString();
      map[day] = (map[day] ?? 0) + parseFloat(s.totalPrice);
    }
    return days.slice(-14).map((day) => ({
      value: map[day] ?? 0,
      label: new Date(day).getDate().toString(),
      frontColor: Colors.primary,
    }));
  }, [sales]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <AchievementToast achievement={newAchievement} onDismiss={clearNewAchievement} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View>
          <Text style={styles.headerGreeting}>Good day 👋</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/settings")}
        >
          <Feather name="settings" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue, currency)}
            color={Colors.primary}
            icon="💰"
          />
          <StatCard
            label="Total Profit"
            value={formatCurrency(totalProfit, currency)}
            color={totalProfit >= 0 ? Colors.success : Colors.danger}
            icon="📈"
          />
          <StatCard
            label="Stock Value"
            value={formatCurrency(totalStockValue, currency)}
            color={Colors.accent}
            icon="📦"
          />
          <StatCard
            label="Today's Sales"
            value={formatCurrency(todaysSales, currency)}
            color="#8b5cf6"
            icon="🛒"
          />
        </View>

        {/* Sales Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14-Day Sales Trend</Text>
          {sales.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyText}>No sales recorded yet</Text>
            </View>
          ) : (
            <View style={styles.chartCard}>
              <BarChart
                data={chartData}
                width={280}
                height={150}
                barWidth={16}
                spacing={4}
                barBorderRadius={4}
                noOfSections={4}
                yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: Colors.textTertiary, fontSize: 9 }}
                hideRules
                yAxisThickness={0}
                xAxisThickness={0}
                isAnimated
              />
            </View>
          )}
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products by Profit</Text>
          {topProducts.length === 0 ? (
            <View style={[styles.emptyChart, { height: 80 }]}>
              <Text style={styles.emptyText}>No sales data yet</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {topProducts.map((item, i) => (
                <View
                  key={item.product!.id}
                  style={[
                    styles.topProductRow,
                    i < topProducts.length - 1 && styles.topProductBorder,
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topProductName} numberOfLines={1}>
                      {item.product!.name}
                    </Text>
                    {item.product!.category ? (
                      <Text style={styles.topProductCat}>{item.product!.category}</Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.topProductProfit,
                      { color: item.profit >= 0 ? Colors.success : Colors.danger },
                    ]}
                  >
                    {formatCurrency(item.profit, currency)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
            <View style={styles.card}>
              {lowStockProducts.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.alertRow,
                    i < lowStockProducts.length - 1 && styles.alertBorder,
                  ]}
                  onPress={() => router.push(`/product/${p.id}`)}
                >
                  <View
                    style={[
                      styles.alertDot,
                      {
                        backgroundColor:
                          p.quantity === 0 ? Colors.danger : Colors.warning,
                      },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.alertSub}>
                      {p.quantity === 0
                        ? "Out of stock"
                        : `Only ${p.quantity} left (min: ${p.lowStockThreshold})`}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {products.length === 0 && (
          <View style={styles.getStarted}>
            <Text style={styles.getStartedTitle}>Welcome to Inventoria!</Text>
            <Text style={styles.getStartedSub}>
              Add your first product to get started tracking inventory and sales.
            </Text>
            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={() => router.push("/product/new")}
            >
              <Text style={styles.getStartedBtnText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: 16, gap: 8 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyChart: {
    height: 140,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  topProductRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  topProductBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.primary,
  },
  topProductName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  topProductCat: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  topProductProfit: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  alertBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  alertSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  getStarted: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  getStartedTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
  },
  getStartedSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  getStartedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  getStartedBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
