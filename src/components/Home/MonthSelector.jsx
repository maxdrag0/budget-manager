import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export default function MonthSelector({
  currentMonth,
  currentYear,
  onPrev,
  onNext,
  onToday,
}) {
  const { colors } = useTheme();

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <View style={styles.containerPrincipal}>
      <View style={styles.container}>
        {/* Botón Anterior */}
        <TouchableOpacity onPress={onPrev} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={26} color={colors.icon} />
        </TouchableOpacity>

        {/* Contenedor central con la Fecha */}
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {meses[currentMonth]} {currentYear}
          </Text>
        </View>

        {/* Botón Siguiente */}
        <TouchableOpacity onPress={onNext} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={26} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Botón "Hoy" corregido con un Text adentro */}
      <Pressable
        onPress={onToday}
        style={[
          styles.todayButton,
          { backgroundColor: colors.chipBackground },
        ]}
      >
        <Text style={[styles.todayText, { color: colors.chipText }]}>
          Ir al mes actual
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 4,
    backgroundColor: "transparent",
  },
  arrowButton: {
    padding: 8,
  },
  dateContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "700",
  },
  todayButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: -4,
  },
  todayText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
