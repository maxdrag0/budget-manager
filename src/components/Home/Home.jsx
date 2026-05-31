import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Home({
  userName,
  onCategorySelect,
  loading,
  categoriesData,
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.welcome} accessibilityRole="header">
        ¡Hola, {userName}!
      </Text>
      <Text style={styles.subtitle}>
        Selecciona una categoría para explorar:
      </Text>

      <View style={styles.categoriesContainer}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 16, backgroundColor: "#ffffff" },
  welcome: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "#333" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  categoriesContainer: { flex: 1 },
});
