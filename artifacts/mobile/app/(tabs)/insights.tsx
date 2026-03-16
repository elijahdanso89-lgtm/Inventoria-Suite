import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LineChart, BarChart } from "react-native-gifted-charts";

import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { formatCurrency, formatDateShort, getLast30Days } from "@/utils/format";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { products, sales, currency, achievements } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const last30 = useMemo(() => {
    const days = getLast30Days();
    const map: Record<string, { revenue: number; profit: number }> = {};
    for (const s of sales) {
      const day = new Date(s.timestamp).toDateString();
      if (!map[day]) map[day] = { revenue: 0, profit: 0 };
      map[day].revenue += parseFloat(s.totalPrice);
      map[day].profit += parseFloat(s.profit);
    }
    return days.map((day) => ({
      day,
      revenue: map[day]?.revenue ?? 0,
      profit: map[day]?.profit ?? 0,
    }));
  }, [sales]);

  const revenueLineData = last30.slice(-14).map((d, i) => ({
    value: d.revenue,
    dataPointText: "",
    label: i % 3 === 0 ? formatDateShort(new Date(d.day).toISOString()) : "",
  }));

  const productPerformance = useMemo(() => {
    const map: Record<number, { revenue: number; profit: number; qty: number }> = {};
    for (const s of sales) {
      if (!map[s.productId]) map[s.productId] = { revenue: 0, profit: 0, qty: 0 };
      map[s.productId].revenue += parseFloat(s.totalPrice);
      map[s.productId].profit += parseFloat(s.profit);
      map[s.productId].qty += s.quantity;
    }
    return products
      .map((p) => ({
        product: p,
        ...( map[p.id] ?? { revenue: 0, profit: 0, qty: 0 }),
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [products, sales]);

  const topProducts = productPerformance.slice(0, 5);
  const poorProducts = productPerformance.filter(
    (x) => x.profit < 10 || x.qty < 2
  );

  const totalRevenue = sales.reduce((s, x) => s + parseFloat(x.totalPrice), 0);
  const totalProfit = sales.reduce((s, x) => s + parseFloat(x.profit), 0);
  const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.headerTitle}>Insights</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Key metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {formatCurrency(totalRevenue, currency)}
            </Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardMid]}>
            <Text
              style={[
                styles.metricValue,
                { color: totalProfit >= 0 ? Colors.success : Colors.danger },
              ]}
            >
              {formatCurrency(totalProfit, currency)}
            </Text>
            <Text style={styles.metricLabel}>Net Profit</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{margin}%</Text>
            <Text style={styles.metricLabel}>Margin</Text>
          </View>
        </View>

        {/* Revenue trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trend (14 Days)</Text>
          {sales.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="trending-up-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyText}>No data yet</Text>
            </View>
          ) : (
            <View style={styles.chartCard}>
              <LineChart
                data={revenueLineData}
                width={280}
                height={150}
                color={Colors.primary}
                thickness={2.5}
                curved
                hideDataPoints={false}
                dataPointsColor={Colors.primary}
                dataPointsRadius={4}
                startFillColor={Colors.primaryLight}
                endFillColor={Colors.surface}
                areaChart
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

        {/* Top performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {topProducts.length === 0 ? (
            <View style={[styles.emptyChart, { height: 80 }]}>
              <Text style={styles.emptyText}>No sales data</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {topProducts.map((item, i) => (
                <View
                  key={item.product.id}
                  style={[
                    styles.perfRow,
                    i < topProducts.length - 1 && styles.perfBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.rankCircle,
                      i === 0 && { backgroundColor: "#fbbf24" },
                    ]}
                  >
                    <Text style={styles.rankText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.perfName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.perfSub}>{item.qty} units sold</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.perfProfit,
                        { color: item.profit >= 0 ? Colors.success : Colors.danger },
                      ]}
                    >
                      {formatCurrency(item.profit, currency)}
                    </Text>
                    <Text style={styles.perfRevLabel}>
                      {formatCurrency(item.revenue, currency)} rev
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Poor performers */}
        {poorProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Needs Attention</Text>
            <View style={styles.card}>
              {poorProducts.slice(0, 5).map((item, i) => (
                <View
                  key={item.product.id}
                  style={[
                    styles.perfRow,
                    i < Math.min(poorProducts.length, 5) - 1 && styles.perfBorder,
                  ]}
                >
                  <View style={[styles.rankCircle, { backgroundColor: Colors.dangerLight }]}>
                    <Feather name="alert-triangle" size={14} color={Colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.perfName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.perfSub}>
                      {item.qty} units sold · {formatCurrency(item.profit, currency)} profit
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.card}>
            {achievements.map((a, i) => (
              <View
                key={a.id}
                style={[
                  styles.achievementRow,
                  i < achievements.length - 1 && styles.perfBorder,
                  !a.unlockedAt && styles.achievementLocked,
                ]}
              >
                <Text
                  style={[styles.achievementIcon, !a.unlockedAt && { opacity: 0.3 }]}
                >
                  {a.icon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !a.unlockedAt && { color: Colors.textTertiary },
                    ]}
                  >
                    {a.title}
                  </Text>
                  <Text style={styles.achievementDesc}>{a.description}</Text>
                </View>
                {a.unlockedAt ? (
                  <Feather name="check-circle" size={20} color={Colors.success} />
                ) : (
                  <Feather name="lock" size={18} color={Colors.border} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  scroll: { padding: 16, gap: 8 },
  metricsRow: { flexDirection: "row", gap: 0, marginBottom: 8 },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  metricCardMid: { marginHorizontal: 8 },
  metricValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  metricLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
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
    height: 130,
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
  perfRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  perfBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.primary,
  },
  perfName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  perfSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  perfProfit: { fontFamily: "Inter_700Bold", fontSize: 14 },
  perfRevLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  achievementLocked: { opacity: 0.6 },
  achievementIcon: { fontSize: 28 },
  achievementTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  achievementDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
