import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

type Props = {
  quantity: number;
  minQuantity: number;
};

export function StockIndicator({ quantity, minQuantity }: Props) {
  const isOut = quantity === 0;
  const isLow = quantity > 0 && quantity <= minQuantity;
  const isOk = quantity > minQuantity;

  let color = Colors.light.success;
  let label = "In Stock";
  if (isOut) {
    color = Colors.light.danger;
    label = "Out of Stock";
  } else if (isLow) {
    color = Colors.light.warning;
    label = "Low Stock";
  }

  return (
    <View style={[styles.container, { backgroundColor: color + "18" }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
