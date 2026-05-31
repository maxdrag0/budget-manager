import { useState } from "react";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

export const useLocation = (onLocationChange) => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [errorMsj, setErrorMsj] = useState(null);

  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsj("Ubicación denegada");
        setLocation({ latitude: null, longitude: null });
        Alert.alert(
          "Permiso Necesario",
          "Has denegado el acceso al GPS. Para usar esta función, debes habilitarlo manualmente en la configuración de tu teléfono.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configuración",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return;
      }

      console.log("Buscando ubicación rápida en caché...");

      // 1. Intentamos obtener la última ubicación conocida (Súper rápido y no se cuelga)
      let result = await Location.getLastKnownPositionAsync({});

      // 2. Si la caché está vacía, pedimos una nueva con precisión baja/media
      if (!result) {
        console.log(
          "Caché vacía. Solicitando ubicación al GPS (Precisión Balanceada)...",
        );
        result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      console.log("¡Ubicación obtenida!", result.coords);

      const newCoords = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };

      setLocation(newCoords);
      setErrorMsj(null);

      if (onLocationChange) {
        onLocationChange(newCoords);
      }
    } catch (error) {
      console.error("Error crítico al obtener la ubicación: ", error);
      setErrorMsj(
        "Ocurrió un error para obtener la ubicación. Verifica tu GPS.",
      );
    }
  };

  const mapPreviewUrl = location?.latitude
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=15&size=600x300&markers=color:red%7C${location.latitude},${location.longitude}&key=${GOOGLE_API_KEY}`
    : null;

  console.log("🔗 URL del Mapa Estático:", mapPreviewUrl);
  return { location, errorMsj, mapPreviewUrl, handleGetLocation };
};
