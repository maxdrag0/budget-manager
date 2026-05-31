import * as SQLite from "expo-sqlite";

let dbInstance = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("budget_manager.db");
  }
  return dbInstance;
};

export const initLocalDB = async () => {
  try {
    const db = await getDB();

    // 1. Aislamos el PRAGMA en su propia ejecución
    await db.execAsync("PRAGMA journal_mode = WAL;");

    // 2. Ejecutamos los CREATE TABLE uno por uno para evitar errores de parseo multisentencia en Android
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        concepto TEXT NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        periodo TEXT NOT NULL,
        categoria_id TEXT NOT NULL,
        tipo TEXT NOT NULL, -- 'ingreso' o 'egreso'
        foto_uri TEXT,
        foto_url TEXT,
        sincronizado INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS incomes (
        periodo TEXT NOT NULL,
        user_id TEXT NOT NULL,
        ingreso_proyectado REAL DEFAULT 0,
        sincronizado INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (periodo, user_id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        user_id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT,
        name TEXT,
        lastname TEXT,
        email  TEXT,
        photo_local_uri TEXT,
        photo_url TEXT,
        sincronizado INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `);

    // Migración para tabla user_profile por si ya existía sin las nuevas columnas
    const tableInfo = await db.getAllAsync("PRAGMA table_info(user_profile);");
    const columns = tableInfo.map((c) => c.name);

    if (!columns.includes("name")) {
      await db.execAsync("ALTER TABLE user_profile ADD COLUMN name TEXT;");
    }
    if (!columns.includes("lastname")) {
      await db.execAsync("ALTER TABLE user_profile ADD COLUMN lastname TEXT;");
    }
    if (!columns.includes("email")) {
      await db.execAsync("ALTER TABLE user_profile ADD COLUMN email TEXT;");
    }

    return true;
  } catch (error) {
    console.error("❌ SQLite: Error crítico inicializando tablas:", error);
    throw error;
  }
};
