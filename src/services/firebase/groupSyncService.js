import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { uploadMovementPhoto } from "./storageService";

// ============================================================
//  GROUPS - FIREBASE SYNC
// ============================================================

/**
 * Sincroniza un grupo completo (con miembros) a Firebase.
 */
export const syncGroupToFirebase = async (userId, group, members) => {
  try {
    const groupRef = doc(db, "groups", group.id);
    await setDoc(groupRef, {
      name: group.name,
      created_at: group.created_at,
      creator_id: userId,
      members: members.map((m) => ({ id: m.id, name: m.name, user_id: m.user_id || null })),
      updated_at: new Date(),
    });
    return true;
  } catch (error) {
    console.warn("Fallo respaldo Grupo (posible offline):", error.message);
    return false;
  }
};

/**
 * Obtiene un grupo compartido desde Firebase.
 */
export const getGroupFromFirebase = async (groupId) => {
  try {
    const { getDoc } = await import("firebase/firestore");
    const groupRef = doc(db, "groups", groupId);
    const snap = await getDoc(groupRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.warn("Fallo obtener Grupo:", error.message);
    return null;
  }
};

/**
 * Une un usuario a un grupo existente actualizando el user_id de un miembro.
 */
export const joinGroupFirebase = async (groupId, memberId, userId) => {
  try {
    const { getDoc, updateDoc } = await import("firebase/firestore");
    const groupRef = doc(db, "groups", groupId);
    const snap = await getDoc(groupRef);
    if (!snap.exists()) return false;

    const groupData = snap.data();
    const updatedMembers = groupData.members.map(m => {
      if (m.id === memberId) {
        return { ...m, user_id: userId };
      }
      return m;
    });

    await updateDoc(groupRef, { members: updatedMembers });
    return true;
  } catch (error) {
    console.warn("Error uniendo usuario a grupo:", error.message);
    return false;
  }
};

/**
 * Elimina un grupo de Firebase.
 */
export const deleteGroupFromFirebase = async (userId, groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    await deleteDoc(groupRef);
    return true;
  } catch (error) {
    console.warn("Fallo eliminar Grupo en Firebase:", error.message);
    return false;
  }
};

/**
 * Sincroniza un gasto de grupo a Firebase.
 */
export const syncGroupExpenseToFirebase = async (
  userId,
  groupId,
  expense,
  splitMemberIds,
) => {
  try {
    let fotoUrl = expense.foto_url || null;

    if (expense.foto_uri && !fotoUrl) {
      // Reutilizamos uploadMovementPhoto que sube a users/userId/movements/id.jpg
      // O idealmente deberíamos tener una función uploadGroupPhoto.
      // Por ahora la guardamos bajo la ruta del usuario, o en una ruta del grupo.
      // Crearemos la ruta del grupo.
      const uploadedUrl = await uploadGroupExpensePhoto(groupId, expense.id, expense.foto_uri);
      if (uploadedUrl) {
        fotoUrl = uploadedUrl;
      }
    }

    const expenseRef = doc(
      db,
      "groups",
      groupId,
      "expenses",
      expense.id,
    );
    await setDoc(expenseRef, {
      description: expense.description,
      amount: expense.amount,
      paid_by_member_id: expense.paid_by_member_id,
      split_member_ids: splitMemberIds,
      created_at: expense.created_at,
      foto_url: fotoUrl,
      updated_at: new Date(),
    });
    return true;
  } catch (error) {
    console.warn(
      "Fallo respaldo Gasto de Grupo (posible offline):",
      error.message,
    );
    return false;
  }
};

/**
 * Obtiene los gastos de un grupo compartido.
 */
export const fetchGroupExpensesFromFirebase = async (groupId) => {
  try {
    const expensesRef = collection(db, "groups", groupId, "expenses");
    const snap = await getDocs(expensesRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Fallo obtener gastos de Grupo:", error.message);
    return [];
  }
};

/**
 * Elimina un gasto de grupo de Firebase.
 */
export const deleteGroupExpenseFromFirebase = async (
  userId,
  groupId,
  expenseId,
) => {
  try {
    const expenseRef = doc(
      db,
      "groups",
      groupId,
      "expenses",
      expenseId,
    );
    await deleteDoc(expenseRef);
    return true;
  } catch (error) {
    console.warn("Fallo eliminar Gasto de Grupo en Firebase:", error.message);
    return false;
  }
};

// ============================================================
//  SYNC DOWN
// ============================================================

/**
 * Descarga todos los grupos del usuario desde Firebase (los que él creó o en los que participa).
 */
export const fetchGroupsFromFirebase = async (userId) => {
  try {
    // Ideally this requires a collectionGroup query or fetching groups where members array contains user_id.
    // For simplicity, we just fetch all groups where creator_id = userId for now.
    // In a real scenario, you'd query 'members' subfield or similar.
    const { query, where } = await import("firebase/firestore");
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("creator_id", "==", userId));
    const snapshot = await getDocs(q);
    const groups = [];
    snapshot.forEach((docSnap) => {
      groups.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    return groups;
  } catch (error) {
    console.warn("Fallo al descargar Grupos:", error.message);
    return [];
  }
};
