import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICACIONES_KEY = "@recibir_notificaciones";

export const saveRecibirNotificaciones = async (recibir) => {
  try {
    await AsyncStorage.setItem(NOTIFICACIONES_KEY, recibir ? "true" : "false");
  } catch (e) {
    console.error("Error guardando preferencia", e);
  }
};

export const getRecibirNotificaciones = async () => {
  try {
    const recibir = await AsyncStorage.getItem(NOTIFICACIONES_KEY);
    return recibir === "true";
  } catch (e) {
    console.error("Error al traer preferencia", e);
  }
};

export const deleteRecibirNotificaciones = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICACIONES_KEY);
  } catch (e) {
    console.error("Error eliminando preferencia", e);
  }
};
