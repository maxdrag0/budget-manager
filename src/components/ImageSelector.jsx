import { useCamera } from "@/hooks/useCamera";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";

export default function ImageSelector({ onSelect, placeholder }) {
  const { imageUri, isLoading, openCamera, openLibrary, clearImage } =
    useCamera(onSelect);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selector de Contenido Visual</Text>

      {/* Contenedor de Previsualización */}
      <View style={styles.previewContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>
            {placeholder || "No se ha seleccionado ninguna imagen"}
          </Text>
        )}
      </View>

      {/* Botonera Operativa */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={openCamera}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Tomar Foto</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={openLibrary}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Abrir Galería</Text>
        </Pressable>
      </View>

      {imageUri && (
        <Pressable style={styles.clearButton} onPress={clearImage}>
          <Text style={styles.clearButtonText}>Eliminar Imagen</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#333" },
  previewContainer: {
    width: 250,
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#dee2e6",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 20,
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderText: {
    color: "#6c757d",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  buttonContainer: { flexDirection: "row", gap: 15, marginBottom: 15 },
  button: {
    flex: 1,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 120,
  },
  secondaryButton: { backgroundColor: "#6c757d" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  clearButton: { marginTop: 10 },
  clearButtonText: { color: "#dc3545", fontWeight: "600" },
});
