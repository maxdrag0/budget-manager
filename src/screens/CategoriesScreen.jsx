import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { PieChart } from "react-native-chart-kit";

import Header from "@/components/Header/Header";
import MonthSelector from "@/components/Home/MonthSelector";
import styles from "@/styles/styles";
import { CATEGORIES } from "@/constants";
import { usePeriodo } from "@/hooks/usePeriodo";
import { cargarDatosDelPeriodo } from "@/controller/controller";

const screenWidth = Dimensions.get("window").width;

export default function CategoriesScreen() {
  const dispatch = useDispatch();
  const {
    month,
    year,
    currentPeriod,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
  } = usePeriodo();

  const userId = useSelector((state) => state.auth.uid);
  const movements = useSelector((state) => state.movements.value);

  // Cada vez que cambie el mes, cargamos los datos (como en HomeScreen)
  useEffect(() => {
    if (userId) {
      cargarDatosDelPeriodo(userId, currentPeriod, dispatch);
    }
  }, [userId, currentPeriod, dispatch]);

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
        legendFontColor: "#333",
        legendFontSize: 12,
      };
    });

    // Ordenamos por mayor gasto
    data.sort((a, b) => b.total - a.total);

    return { data, totalExpenses };
  }, [movements]);

  const { data: chartData, totalExpenses } = expensesByCategory;

  return (
    <SafeAreaView style={styles.safeArea}>
      <MonthSelector
        currentMonth={month}
        currentYear={year}
        onToday={handleToday}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <ScrollView
        style={localStyles.container}
        contentContainerStyle={localStyles.contentContainer}
      >
        {chartData.length > 0 ? (
          <>
            <View style={localStyles.chartContainer}>
              <PieChart
                data={chartData}
                width={screenWidth - 20} // Ajuste para el padding
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"total"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                hasLegend={false}
                absolute
              />
            </View>

            <View style={localStyles.listContainer}>
              <Text style={localStyles.listTitle}>Detalle de Egresos</Text>
              {chartData.map((item) => {
                const percentage =
                  totalExpenses > 0
                    ? ((item.total / totalExpenses) * 100).toFixed(1)
                    : 0;

                return (
                  <View key={item.id} style={localStyles.categoryRow}>
                    <View style={localStyles.categoryInfo}>
                      <View
                        style={[
                          localStyles.iconContainer,
                          { backgroundColor: item.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.color}
                        />
                      </View>
                      <Text style={localStyles.categoryName}>{item.name}</Text>
                    </View>
                    <View style={localStyles.amountInfo}>
                      <Text style={localStyles.categoryAmount}>
                        ${item.total.toFixed(2)}
                      </Text>
                      <Text style={localStyles.categoryPercentage}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={localStyles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={60} color="#ccc" />
            <Text style={localStyles.emptyText}>
              No hay egresos registrados en este período.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 10,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listContainer: {
    backgroundColor: "white",
    marginHorizontal: 10,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  amountInfo: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  categoryPercentage: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
});
