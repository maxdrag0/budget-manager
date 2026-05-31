import * as Crypto from "expo-crypto";
import {
  insertMovementsLocal,
  getMovementsByPeriodLocal,
  deleteMovementLocal,
  marcarMovementSincronizado,
  insertIncomeLocal,
  getIncomeByPeriodLocal,
  getUserProfileLocal,
  marcarIngresoSincronizado,
  upsertUserProfileLocal,
  marcarPerfilSincronizado,
  deleteUserProfilePhotoLocal,
} from "@/services/db/queriesDb";
import {
  syncMovementToFirebase,
  deleteMovementFromFirebase,
  syncIncomeToFirebase,
  syncUserProfileToFirebase,
  deleteProfilePhotoFromFirebase,
} from "@/services/firebase/syncService";
import {
  createMovement,
  editMovement,
  deleteMovement,
  setMovementPhotoUrl,
  clearMovements,
  setMovements,
} from "../store/movementsSlice/movementsSlice";
import { setIncome } from "../store/incomesSlice/incomesSlice";
import { setUserProfile } from "../store/userSlice/userSlice";

/**
 * 1. Cargar datos del mes al mover el MonthSelector
 */
export const cargarDatosDelPeriodo = async (userId, periodo, dispatch) => {
  // 1. EL ESCUDO: Bloqueamos la ejecución si las variables no están listas
  if (!userId || !periodo) {
    console.log("⏳ Esperando resolución de userId o periodo...");
    return; // Abortamos silenciosamente
  }

  try {
    console.log(
      `🔍 Intentando cargar periodo en SQLite. userId: "${userId}", periodo: "${periodo}"`,
    );

    // Lectura veloz desde SQLite
    console.log("⏳ Leyendo gastos...");
    const movimientos = await getMovementsByPeriodLocal(userId, periodo);
    console.log(`✅ Gastos leídos con éxito. Total: ${movimientos.length}`);

    console.log("⏳ Leyendo ingresos...");
    const ingreso = await getIncomeByPeriodLocal(userId, periodo);
    console.log(`✅ Ingresos leídos con éxito: ${ingreso}`);

    // Inyección a Redux para actualizar la UI
    dispatch(setMovements(movimientos));
    dispatch(setIncome({ periodo, monto: ingreso }));
  } catch (error) {
    console.error("❌ Error cargando el periodo en controlador:", error);
  }
};

/**
 * 2. Guardar un nuevo ingreso (Presupuesto)
 */
export const guardarIngreso = async (userId, periodo, monto, dispatch) => {
  try {
    const numMonto = Number(monto);
    dispatch(setIncome({ periodo, monto: numMonto })); // UI
    await insertIncomeLocal(userId, periodo, numMonto); // Disco
    syncIncomeToFirebase(userId, periodo, numMonto).then((exito) => {
      if (exito) {
        marcarIngresoSincronizado(userId, periodo);
        console.log(`Ingreso de ${periodo} sincronizado y marcado en SQLite.`);
      }
    });
  } catch (error) {
    console.error("Error guardando ingreso:", error);
  }
};

/**
 * 3. Guardar un nuevo gasto
 */
export const guardarMovimiento = async (
  concepto,
  monto,
  fecha,
  periodo,
  categoria_id,
  tipo,
  fotoUri,
  userId,
  dispatch,
  existingId = null,
  currentPeriod = null, // <-- Nuevo parámetro
) => {
  try {
    const isEditing = !!existingId;
    const newMovement = {
      id: existingId || Crypto.randomUUID(),
      concepto,
      monto: Number(monto),
      fecha,
      periodo,
      categoria_id,
      tipo,
      fotoUri: fotoUri || null,
    };

    // Solo actualizamos Redux si el periodo del movimiento coincide con el actual en pantalla
    const coincidePeriodo = !currentPeriod || periodo === currentPeriod;

    if (coincidePeriodo) {
      if (isEditing) {
        dispatch(editMovement(newMovement));
      } else {
        dispatch(createMovement(newMovement));
      }
    } else {
      // Si editamos un movimiento y le cambiamos el periodo a otro mes, lo removemos de la lista actual
      if (isEditing) {
        dispatch(deleteMovement(newMovement.id));
      }
    }

    await insertMovementsLocal(userId, newMovement);
    syncMovementToFirebase(userId, newMovement).then((result) => {
      if (result.success) {
        marcarMovementSincronizado(newMovement.id);
        if (result.fotoUrl) {
          dispatch(
            setMovementPhotoUrl({
              id: newMovement.id,
              fotoUrl: result.fotoUrl,
            }),
          );
        }
        console.log(
          `Gasto ${newMovement.concepto} sincronizado y marcado en SQLite.`,
        );
      }
    });
  } catch (error) {
    console.error("Error guardando gasto:", error);
  }
};

/**
 * 4. Eliminar un gasto
 */
export const eliminarMovimiento = async (userId, movementId, dispatch) => {
  try {
    // 1. Update UI instantly
    dispatch(deleteMovement(movementId));

    // 2. Update local DB
    await deleteMovementLocal(movementId);

    // 3. Update Firebase asynchronously
    deleteMovementFromFirebase(userId, movementId).then((success) => {
      if (success) {
        console.log(`Movimiento ${movementId} eliminado de Firebase.`);
      }
    });
  } catch (error) {
    console.error("Error eliminando movimiento:", error);
  }
};

/**
 * 5. Guardar/Actualizar el perfil del usuario (incluye foto)
 */
export const guardarPerfilUsuario = async (
  userId,
  { displayName, name, lastname, email, photoLocalUri },
  dispatch,
) => {
  try {
    // 1. UI inmediata: mostramos la foto local mientras se sube
    dispatch(
      setUserProfile({
        uid: userId,
        displayName,
        name,
        lastname,
        email,
        photoURL: photoLocalUri,
      }),
    );

    // 2. Persistimos en SQLite (local-first)
    await upsertUserProfileLocal(userId, {
      displayName,
      name,
      lastname,
      email,
      photoLocalUri,
      photoUrl: null,
    });

    // 3. Subimos foto a Storage + sync a Firestore (en background)
    syncUserProfileToFirebase(userId, {
      displayName,
      name,
      lastname,
      email,
      photoLocalUri,
    }).then(async (result) => {
      if (result.success) {
        // 4. Actualizamos SQLite con la URL remota permanente
        await upsertUserProfileLocal(userId, {
          displayName,
          name,
          lastname,
          email,
          photoLocalUri,
          photoUrl: result.photoURL,
        });
        await marcarPerfilSincronizado(userId);

        // 5. Actualizamos Redux con la URL remota (reemplaza la local temporal)
        if (result.photoURL) {
          dispatch(setUserProfile({ photoURL: result.photoURL }));
        }

        console.log("Perfil sincronizado y marcado en SQLite.");
      }
    });
  } catch (error) {
    console.error("Error guardando perfil:", error);
  }
};

/**
 * 6. Cargar el perfil del usuario desde SQLite a Redux
 */
export const cargarPerfilUsuario = async (userId, dispatch) => {
  if (!userId) return;

  try {
    // 1. Obtenemos el registro en crudo desde SQLite
    const perfil = await getUserProfileLocal(userId);

    if (perfil) {
      // 2. Mapeamos las columnas en snake_case de SQLite a las propiedades camelCase de Redux
      dispatch(
        setUserProfile({
          uid: perfil.user_id,
          displayName: perfil.display_name,
          name: perfil.name,
          lastname: perfil.lastname,
          email: perfil.email,
          // Intentamos cargar la foto local primero por rendimiento/caché, de lo contrario usamos la URL remota
          photoURL: perfil.photo_local_uri || perfil.photo_url,
        }),
      );
      console.log("✅ SQLite: Perfil cargado en Redux correctamente.");
    } else {
      console.log(
        "ℹ️ SQLite: Aún no existe un perfil guardado para este usuario.",
      );
    }
  } catch (error) {
    console.error("❌ Error al cargar el perfil desde SQLite:", error);
  }
};

export const eliminarFotoPerfilUsuario = async (userId, dispatch) => {
  try {
    // 1. Limpiamos Redux inmediatamente
    dispatch(setUserProfile({ photoURL: null }));

    // 2. Limpiamos SQLite local
    await deleteUserProfilePhotoLocal(userId);

    // 3. Eliminamos de Firebase
    deleteProfilePhotoFromFirebase(userId).then((exito) => {
      if (exito) {
        marcarPerfilSincronizado(userId);
        console.log("Foto de perfil eliminada de Firebase con éxito.");
      }
    });
  } catch (error) {
    console.error("Error al eliminar foto de perfil en controlador:", error);
  }
};
