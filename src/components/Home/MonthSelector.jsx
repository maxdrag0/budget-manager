import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MonthSelector({
  currentMonth,
  currentYear,
  onPrev,
  onNext,
  onToday,
}) {
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
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>

        {/* Contenedor central con la Fecha */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {meses[currentMonth]} {currentYear}
          </Text>
        </View>

        {/* Botón Siguiente */}
        <TouchableOpacity onPress={onNext} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Botón "Hoy" corregido con un Text adentro */}
      <Pressable onPress={onToday} style={styles.todayButton}>
        <Text style={styles.todayText}>Ir al mes actual</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  arrowButton: {
    padding: 10,
  },
  dateContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#212529",
  },
  todayButton: {
    backgroundColor: "#e9ecef",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: -5,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
  },
});
