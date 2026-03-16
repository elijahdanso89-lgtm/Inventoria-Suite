import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { Category } from "@/context/InventoryContext";

const CATEGORY_LABELS: Record<Category, string> = {
  electronics: "Electronics",
  clothing: "Clothing",
  food: "Food",
  tools: "Tools",
  furniture: "Furniture",
  sports: "Sports",
  books: "Books",
  other: "Other",
};

type Props = {
  category: Category;
  small?: boolean;
};

export function CategoryBadge({ category, small = false }: Props) {
  const color = Colors.light.categoryColors[category] ?? "#607D8B";

  return (
    <View
      style={[
        styles.badge,
        small && styles.badgeSmall,
        { backgroundColor: color + "20" },
      ]}
    >
      <Text
        style={[
          styles.text,
          small && styles.textSmall,
          { color },
        ]}
      >
        {CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  textSmall: {
    fontSize: 11,
  },
});
