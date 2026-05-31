import { Text, View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MonthBalance({ income, outcome, onEditIncome }) {
  const balance = income - outcome;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
        onPress={onEditIncome}
      >
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Ingresos:</Text>
          <Ionicons
            name="pencil-outline"
            size={16}
            color="#28cb52"
            style={{ marginLeft: 6 }}
          />
        </View>
        <Text style={[styles.amount, styles.incomeText]}>${income}</Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.label}>Gastos:</Text>
        <Text style={[styles.amount, styles.outcomeText]}>${outcome}</Text>
      </View>

      <View style={[styles.row, styles.noBorder]}>
        <Text style={styles.label}>Balance:</Text>
        <Text
          style={[
            styles.amount,
            balance >= 0 ? styles.incomeText : styles.outcomeText,
          ]}
        >
          ${balance}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pressedRow: {
    backgroundColor: "#f1fdf4",
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeText: {
    color: "#28cb52",
  },
  outcomeText: {
    color: "#d9534f",
  },
});
