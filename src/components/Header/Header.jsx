import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ title, onBack, rightIcon }) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>

      <View style={styles.rightContainer}>{rightIcon}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderColor: "#dee2e6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  rightContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
