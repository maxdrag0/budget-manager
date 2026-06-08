import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import * as FileSystem from "expo-file-system/legacy";

const uploadFileToStorage = async (fileRef, localUri) => {
  let blob = null;
  try {
    // 1. Usamos fetch para transformar la URI local en un Blob binario nativo
    // Esto es mucho más rápido y estable que leer base64 y usar atob()
    const response = await fetch(localUri);
    blob = await response.blob();

    const metadata = { contentType: "image/jpeg" };
    const uploadTask = uploadBytesResumable(fileRef, blob, metadata);

    // 2. Retornamos la promesa controlando el ciclo de vida de la subida
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null, // Aquí podrías poner una función para barra de progreso si quisieras
        (error) => {
          if (blob) blob.close(); // Liberamos memoria en caso de fallo
          reject(error);
        },
        async () => {
          // Subida exitosa: obtenemos la URL de descarga inmutable
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (blob) blob.close(); // Liberamos memoria para evitar fugas (Memory Leaks)
          resolve(downloadURL);
        },
      );
    });
  } catch (error) {
    if (blob) blob.close();
    throw error;
  }
};

export const uploadMovementPhoto = async (userId, movementId, localUri) => {
  try {
    if (!localUri) return null;
    const fileRef = ref(storage, `users/${userId}/movements/${movementId}.jpg`);
    const downloadURL = await uploadFileToStorage(fileRef, localUri);
    return downloadURL;
  } catch (error) {
    console.error(
      "Error subiendo foto de movimiento a Firebase Storage:",
      error,
    );
    return null;
  }
};

export const uploadProfilePhoto = async (userId, localUri) => {
  try {
    if (!localUri) return null;
    const fileRef = ref(storage, `users/${userId}/profile.jpg`);
    const downloadURL = await uploadFileToStorage(fileRef, localUri);
    return downloadURL;
  } catch (error) {
    console.error("Error subiendo foto de perfil a Firebase Storage:", error);
    return null;
  }
};

export const uploadGroupExpensePhoto = async (groupId, expenseId, localUri) => {
  try {
    if (!localUri) return null;
    const fileRef = ref(storage, `groups/${groupId}/expenses/${expenseId}.jpg`);
    const downloadURL = await uploadFileToStorage(fileRef, localUri);
    return downloadURL;
  } catch (error) {
    console.error(
      "Error subiendo foto de gasto de grupo a Firebase Storage:",
      error,
    );
    return null;
  }
};
