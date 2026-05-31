import * as SQLite from "expo-sqlite";
import { getDB } from "./initDb";

// === MOVIMIENTOS (EXPENSES) ===

export const insertMovementsLocal = async (userId, expense) => {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO movements (id, user_id, concepto, monto, fecha, periodo, categoria_id, tipo, foto_uri, foto_url, sincronizado, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
     ON CONFLICT(id) DO UPDATE SET
       concepto = excluded.concepto,
       monto = excluded.monto,
       fecha = excluded.fecha,
       periodo = excluded.periodo,
       categoria_id = excluded.categoria_id,
       tipo = excluded.tipo,
       foto_uri = COALESCE(excluded.foto_uri, foto_uri),
       sincronizado = 0,
       updated_at = excluded.updated_at;`,
    [
      expense.id,
      userId,
      expense.concepto,
      expense.monto,
      expense.fecha,
      expense.periodo,
      expense.categoria_id,
      expense.tipo,
      expense.fotoUri ?? null,
      expense.fotoUrl ?? null,
      now,
    ],
  );
};

export const deleteMovementLocal = async (id) => {
  const db = await getDB();
  await db.runAsync(`DELETE FROM movements WHERE id = ?`, [id]);
};

export const getMovementsByPeriodLocal = async (userId, periodo) => {
  if (!userId || !periodo) {
    console.log(
      "⚠️ getMovementsByPeriodLocal abortado por parámetros vacíos:",
      {
        userId,
        periodo,
      },
    );
    return [];
  }

  console.log(
    `db: getMovementsByPeriodLocal iniciando con userId: "${userId}", periodo: "${periodo}"`,
  );
  try {
    const db = await getDB();
    console.log("db: Conexión abierta con éxito en getMovementsByPeriodLocal");
    console.log("db: Ejecutando SELECT movimientos para el periodo:", periodo);
    const result = await db.getAllAsync(
      `SELECT * FROM movements WHERE user_id = ? AND periodo = ? ORDER BY fecha DESC`,
      [userId, periodo],
    );
    return result;
  } catch (error) {
    console.error("db: Error en getMovementsByPeriodLocal:", error);
    throw error;
  }
};

export const marcarMovementsSincronizado = async (id) => {
  const db = await getDB();
  await db.runAsync(`UPDATE movements SET sincronizado = 1 WHERE id = ?`, [id]);
};

/**
 * Actualiza la URL remota de la foto de un gasto
 * después de subirla a Firebase Storage.
 */
export const updateMovementsPhotoUrlLocal = async (id, fotoUrl) => {
  const db = await getDB();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE movements SET foto_url = ?, updated_at = ? WHERE id = ?`,
    [fotoUrl, now, id],
  );
};

export const deleteUserProfilePhotoLocal = async (userId) => {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE user_profile SET photo_local_uri = NULL, photo_url = NULL, sincronizado = 0, updated_at = ? WHERE user_id = ?`,
    [now, userId],
  );
};
// === INGRESOS (INCOMES) ===

export const insertIncomeLocal = async (userId, periodo, monto) => {
  const db = await getDB();
  const now = new Date().toISOString();

  // ON CONFLICT actualiza el monto si el usuario edita el presupuesto del mismo mes
  await db.runAsync(
    `INSERT INTO incomes (periodo, user_id, ingreso_proyectado, sincronizado, updated_at)
     VALUES (?, ?, ?, 0, ?)
     ON CONFLICT(periodo, user_id) DO UPDATE SET
     ingreso_proyectado = excluded.ingreso_proyectado,
     sincronizado = 0,
     updated_at = excluded.updated_at;`,
    [periodo, userId, monto, now],
  );
};

export const getIncomeByPeriodLocal = async (userId, periodo) => {
  if (!userId || !periodo) {
    console.log("⚠️ getIncomeByPeriodLocal abortado por parámetros vacíos:", {
      userId,
      periodo,
    });
    return 0;
  }

  console.log(
    `db: getIncomeByPeriodLocal iniciando con userId: "${userId}", periodo: "${periodo}"`,
  );
  try {
    const db = await getDB();
    console.log("db: Conexión abierta con éxito en getIncomeByPeriodLocal");
    const result = await db.getFirstAsync(
      `SELECT ingreso_proyectado FROM incomes WHERE periodo = ? AND user_id = ?`,
      [periodo, userId],
    );
    return result ? result.ingreso_proyectado : 0;
  } catch (error) {
    console.error("db: Error en getIncomeByPeriodLocal:", error);
    throw error;
  }
};

export const marcarIngresoSincronizado = async (userId, periodo) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE incomes SET sincronizado = 1 WHERE periodo = ? AND user_id = ?`,
    [periodo, userId],
  );
};

// === PERFIL DE USUARIO ===

export const upsertUserProfileLocal = async (
  userId,
  { displayName, name, lastname, email, photoLocalUri, photoUrl },
) => {
  const db = await getDB();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO user_profile (user_id, display_name, name, lastname, email, photo_local_uri, photo_url, sincronizado, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       display_name = COALESCE(excluded.display_name, display_name),
       name = COALESCE(excluded.name, name),
       lastname = COALESCE(excluded.lastname, lastname),
       email = COALESCE(excluded.email, email),
       photo_local_uri = COALESCE(excluded.photo_local_uri, photo_local_uri),
       photo_url = COALESCE(excluded.photo_url, photo_url),
       sincronizado = 0,
       updated_at = excluded.updated_at;`,
    [
      userId,
      displayName ?? null,
      name ?? null,
      lastname ?? null,
      email ?? null,
      photoLocalUri ?? null,
      photoUrl ?? null,
      now,
    ],
  );
};

export const getUserProfileLocal = async (userId) => {
  const db = await getDB();
  const result = await db.getFirstAsync(
    `SELECT * FROM user_profile WHERE user_id = ?`,
    [userId],
  );
  return result;
};

export const marcarPerfilSincronizado = async (userId) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE user_profile SET sincronizado = 1 WHERE user_id = ?`,
    [userId],
  );
};
