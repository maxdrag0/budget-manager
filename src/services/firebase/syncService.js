// ============================================================

import { doc, setDoc, deleteDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, storage } from "./firebase";
import { uploadMovementPhoto, uploadProfilePhoto } from "./storageService";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { updateMovementsPhotoUrlLocal } from "../db/queriesDb";

export const syncMovementToFirebase = async (userId, movement) => {
  try {
    // 1. Si el gasto tiene foto local, subirla primero a Storage
    let fotoUrl = movement.fotoUrl ?? null;

    if (movement.fotoUri && !fotoUrl) {
      const uploadedUrl = await uploadMovementPhoto(
        userId,
        movement.id,
        movement.fotoUri,
      );
      if (uploadedUrl) {
        fotoUrl = uploadedUrl;
        // Opcional: Actualizar SQLite con la URL remota para que el usuario no la vuelva a subir si se borra caché
        await updateMovementsPhotoUrlLocal(movement.id, fotoUrl);
      }
    }

    const movementRef = doc(db, "users", userId, "movements", movement.id);
    await setDoc(movementRef, {
      concepto: movement.concepto,
      monto: movement.monto,
      fecha: movement.fecha,
      periodo: movement.periodo,
      categoria_id: movement.categoria_id,
      tipo: movement.tipo,
      foto_url: fotoUrl,
      updated_at: new Date(),
    });

    // Retornamos también fotoUrl para que se pueda actualizar Redux si es necesario
    return { success: true, fotoUrl };
  } catch (error) {
    console.warn("Fallo respaldo Movimiento (posible offline):", error.message);
    return { success: false, fotoUrl: null };
  }
};

export const deleteMovementFromFirebase = async (userId, movementId) => {
  try {
    const movementRef = doc(db, "users", userId, "movements", movementId);
    await deleteDoc(movementRef);

    const photoRef = storageRef(
      storage,
      `users/${userId}/movements/${movementId}.jpg`,
    );
    await deleteObject(photoRef).catch((err) => {
      console.warn("Fallo eliminar foto:", err.message);
    });
    return true;
  } catch (error) {
    console.warn(
      "Fallo eliminar Movimiento en Firebase (posible offline):",
      error.message,
    );
    return false;
  }
};
// ============================================================
//  INGRESOS
// ============================================================

export const syncIncomeToFirebase = async (userId, periodo, monto) => {
  try {
    const incomeRef = doc(db, "users", userId, "incomes", periodo);

    await setDoc(incomeRef, {
      ingreso_proyectado: monto,
      updated_at: new Date(),
    });
    return true;
  } catch (error) {
    console.warn("Fallo respaldo Ingreso (posible offline):", error.message);
    return false;
  }
};

// ============================================================
//  PERFIL DE USUARIO
// ============================================================

/**
 * Sincroniza el perfil del usuario (incluyendo foto) a Firebase.
 *
 * @param {string} userId
 * @param {object} profile – { displayName, photoLocalUri, photoURL }
 * @returns {{ success: boolean, photoURL: string|null }}
 */
export const syncUserProfileToFirebase = async (userId, profile) => {
  try {
    let photoURL = profile.photoURL ?? null;

    // Si hay una foto local nueva, subirla
    if (profile.photoLocalUri) {
      const uploadedUrl = await uploadProfilePhoto(
        userId,
        profile.photoLocalUri,
      );
      if (uploadedUrl) photoURL = uploadedUrl;
    }

    const profileRef = doc(db, "users", userId);
    await setDoc(
      profileRef,
      {
        display_name: profile.displayName ?? null,
        name: profile.name ?? null,
        lastname: profile.lastname ?? null,
        email: profile.email ?? null,
        photo_url: photoURL,
        updated_at: new Date(),
      },
      { merge: true },
    );

    return { success: true, photoURL };
  } catch (error) {
    console.warn("Fallo respaldo Perfil (posible offline):", error.message);
    return { success: false, photoURL: null };
  }
};

export const deleteProfilePhotoFromFirebase = async (userId) => {
  try {
    // 1. Limpiar el campo photo_url en Firestore
    const profileRef = doc(db, "users", userId);
    await setDoc(
      profileRef,
      { photo_url: null, updated_at: new Date() },
      { merge: true },
    );
    // 2. Eliminar el archivo físico de Firebase Storage
    const photoRef = storageRef(storage, `users/${userId}/profile.jpg`);
    await deleteObject(photoRef).catch((err) => {
      // Si el usuario no tenía foto remota en Storage, silenciamos el error para no romper la app
      console.log(
        "No había foto de perfil en Storage para eliminar:",
        err.message,
      );
    });
    return true;
  } catch (error) {
    console.warn(
      "Fallo al eliminar foto de perfil de Firebase:",
      error.message,
    );
    return false;
  }
};

// ============================================================
//  SYNC DOWN (FETCH FROM FIREBASE)
// ============================================================

export const fetchUserProfileFromFirebase = async (userId) => {
  try {
    const profileRef = doc(db, "users", userId);
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn("Fallo al descargar Perfil:", error.message);
    return null;
  }
};

export const fetchIncomesFromFirebase = async (userId) => {
  try {
    const incomesRef = collection(db, "users", userId, "incomes");
    const querySnapshot = await getDocs(incomesRef);
    const incomes = [];
    querySnapshot.forEach((docSnap) => {
      incomes.push({
        periodo: docSnap.id,
        ...docSnap.data()
      });
    });
    return incomes;
  } catch (error) {
    console.warn("Fallo al descargar Ingresos:", error.message);
    return [];
  }
};

export const fetchMovementsFromFirebase = async (userId) => {
  try {
    const movementsRef = collection(db, "users", userId, "movements");
    const querySnapshot = await getDocs(movementsRef);
    const movements = [];
    querySnapshot.forEach((docSnap) => {
      movements.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return movements;
  } catch (error) {
    console.warn("Fallo al descargar Movimientos:", error.message);
    return [];
  }
};
