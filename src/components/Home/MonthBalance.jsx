import { Text, View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export default function MonthBalance({ income, outcome, onEditIncome }) {
  const { colors } = useTheme();
  const balance = income - outcome;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.row,
          { borderBottomColor: colors.separator },
          pressed && { backgroundColor: colors.successLight, opacity: 0.85 },
        ]}
        onPress={onEditIncome}
      >
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Ingresos:
          </Text>
          <Ionicons
            name="pencil-outline"
            size={16}
            color={colors.success}
            style={{ marginLeft: 6 }}
          />
        </View>
        <Text style={[styles.amount, { color: colors.success }]}>
          ${income}
        </Text>
      </Pressable>

      <View
        style={[styles.row, { borderBottomColor: colors.separator }]}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Gastos:
        </Text>
        <Text style={[styles.amount, { color: colors.danger }]}>
          ${outcome}
        </Text>
      </View>

      <View style={[styles.row, styles.noBorder]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Balance:
        </Text>
        <Text
          style={[
            styles.amount,
            { color: balance >= 0 ? colors.success : colors.danger },
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
    width: "100%",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
