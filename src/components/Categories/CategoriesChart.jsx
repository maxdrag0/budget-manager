import React, { useMemo } from "react";
import { View, StyleSheet, Text, Dimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";

import { CATEGORIES } from "@/constants";
import { useTheme } from "@/hooks/useTheme";

const screenWidth = Dimensions.get("window").width;

export default function CategoriesChart({ movements = [] }) {
  const { colors, isDark } = useTheme();

  // Filtramos solo los egresos y los agrupamos por categoría
  const expensesByCategory = useMemo(() => {
    const egresos = movements.filter((m) => m.tipo === "egreso");

    const grouped = {};
    let totalExpenses = 0;

    egresos.forEach((movement) => {
      const catId = movement.categoria_id;
      if (!grouped[catId]) {
        grouped[catId] = 0;
      }
      grouped[catId] += movement.monto || 0;
      totalExpenses += movement.monto || 0;
    });

    // Mapeamos a un array con la información necesaria para el gráfico y la lista
    const data = Object.keys(grouped).map((catId) => {
      const catData = CATEGORIES.find((c) => Number(c.id) === Number(catId));
      return {
        id: catId,
        name: catData?.title || "Otros",
        icon: catData?.icon || "ellipsis-horizontal-circle-outline",
        color: catData?.color || "#9E9E9E",
        total: grouped[catId],
        legendFontColor: colors.text,
        legendFontSize: 12,
      };
    });

    // Ordenamos por mayor gasto
    data.sort((a, b) => b.total - a.total);

    return { data, totalExpenses };
  }, [movements, colors.text]);

  const { data: chartData, totalExpenses } = expensesByCategory;

  if (chartData.length === 0) {
    return (
      <View style={localStyles.emptyContainer}>
        <Ionicons
          name="pie-chart-outline"
          size={60}
          color={colors.textMuted}
        />
        <Text style={[localStyles.emptyText, { color: colors.textMuted }]}>
          No hay egresos registrados en este período.
        </Text>
      </View>
    );
  }

  return (
    <View style={[localStyles.container, { flex: 1 }]}>
      <View
        style={[
          localStyles.chartContainer,
          { backgroundColor: colors.card },
        ]}
      >
        <PieChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: colors.chartBackground,
            backgroundGradientFrom: colors.chartBackground,
            backgroundGradientTo: colors.chartBackground,
            color: (opacity = 1) =>
              isDark
                ? `rgba(255, 255, 255, ${opacity})`
                : `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"total"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          center={[(screenWidth - 32) / 4, 0]}
          hasLegend={false}
          absolute
        />
        
        {/* Overlay para crear el efecto "Donut Chart" central */}
        <View style={[localStyles.donutHole, { backgroundColor: colors.card }]}>
          <Text style={[localStyles.donutLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text style={[localStyles.donutAmount, { color: colors.text }]}>
            ${totalExpenses > 1000 ? (totalExpenses / 1000).toFixed(1) + 'k' : totalExpenses.toFixed(0)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            localStyles.listContainer,
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={localStyles.listHeader}>
            <Text style={[localStyles.listTitle, { color: colors.text }]}>
              Detalle de Egresos
            </Text>
            <Text style={[localStyles.listTotal, { color: colors.textSecondary }]}>
              Total: ${totalExpenses.toFixed(2)}
            </Text>
          </View>
          
          {chartData.map((item) => {
            const percentage =
              totalExpenses > 0
                ? ((item.total / totalExpenses) * 100).toFixed(1)
                : 0;

            return (
              <View
                key={item.id}
                style={[
                  localStyles.categoryCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={localStyles.categoryInfo}>
                  <View
                    style={[
                      localStyles.iconContainer,
                      { backgroundColor: item.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={item.color}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        localStyles.categoryName,
                        { color: colors.text },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        localStyles.categoryPercentage,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {percentage}% del total
                    </Text>
                  </View>
                </View>
                <View style={localStyles.amountInfo}>
                  <Text
                    style={[
                      localStyles.categoryAmount,
                      { color: colors.danger },
                    ]}
                  >
                    ${item.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  donutHole: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  donutLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  donutAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  listContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  listTotal: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
  },
  amountInfo: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
});
