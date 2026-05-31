import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useCamera = (onSelect) => {
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  };

  const openCamera = async () => {
    try {
      setIsLoading(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se requieren permisos de cámara para continuar.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        if (onSelect) onSelect(uri);
      }
    } catch (error) {
      console.error("Error al abrir la cámara:", error);
      Alert.alert("Error", "No se pudo acceder a la cámara.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => setImageUri(null);

  const openLibrary = async () => {
    try {
      setIsLoading(true);

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se requieren permisos de libreria para continuar.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        if (onSelect) onSelect(uri);
      }
    } catch (error) {
      console.error("Error al abrir la libreria:", error);
      Alert.alert("Error", "No se pudo acceder a la libreria.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    imageUri,
    setImageUri,
    isLoading,
    openCamera,
    openLibrary,
    clearImage,
  };
};
