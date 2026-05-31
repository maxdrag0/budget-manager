import { Text, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { useLocation } from "@/hooks/useLocation";

export default function LocationSelector({ onLocationChange }) {
  const { location, errorMsj, mapPreviewUrl, handleGetLocation } =
    useLocation(onLocationChange);
  return (
    <View style={styles.container}>
      {errorMsj && <Text style={styles.errorText}>{errorMsj}</Text>}

      <View style={styles.mapPreview}>
        {mapPreviewUrl ? (
          <Image source={{ uri: mapPreviewUrl }} style={styles.mapImage} />
        ) : (
          <Text>No hay ubicación seleccionada</Text>
        )}
      </View>

      <Text style={styles.coordsText}>
        {location?.latitude
          ? `Lat: ${location.latitude.toFixed(5)} | Lng: ${location.longitude.toFixed(5)}`
          : "Sin coordenadas"}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGetLocation}>
        <Text style={styles.buttonText}>Obtener ubicación actual</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
    width: "100%",
  },
  mapPreview: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  coordsText: {
    marginBottom: 15,
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
