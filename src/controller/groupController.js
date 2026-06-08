import * as Crypto from "expo-crypto";
import {
  insertGroupLocal,
  getGroupsByUserLocal,
  deleteGroupLocal,
  insertGroupMemberLocal,
  getGroupMembersLocal,
  insertGroupExpenseLocal,
  insertGroupExpenseSplitsLocal,
  getGroupExpensesLocal,
  deleteGroupExpenseLocal,
  calcularSaldosGrupo,
  marcarGrupoSincronizado,
  marcarGastoGrupoSincronizado,
} from "@/services/db/groupQueriesDb";
import {
  syncGroupToFirebase,
  deleteGroupFromFirebase,
  syncGroupExpenseToFirebase,
  deleteGroupExpenseFromFirebase,
} from "@/services/firebase/groupSyncService";
import {
  setGroups,
  addGroup,
  deleteGroup as deleteGroupAction,
  setCurrentGroup,
  setMembers,
  setExpenses,
  addExpense as addExpenseAction,
  deleteExpense as deleteExpenseAction,
  setBalances,
} from "@/store/groupsSlice/groupsSlice";

/**
 * Crear un grupo con sus miembros.
 */
export const crearGrupo = async (userId, name, memberNames, dispatch) => {
  try {
    const groupId = Crypto.randomUUID();
    const now = new Date().toISOString();
    const group = { id: groupId, name, created_at: now };

    // Crear miembros
    const members = memberNames.map((memberName, index) => ({
      id: Crypto.randomUUID(),
      group_id: groupId,
      name: memberName.trim(),
      user_id: index === 0 ? userId : null,
    }));

    // 1. UI inmediata
    dispatch(
      addGroup({
        ...group,
        user_id: userId,
        membersCount: members.length,
      }),
    );

    // 2. SQLite
    await insertGroupLocal(userId, group);
    for (const member of members) {
      await insertGroupMemberLocal(member);
    }

    // 3. Firebase (background)
    syncGroupToFirebase(userId, group, members).then((success) => {
      if (success) {
        marcarGrupoSincronizado(groupId);
        console.log(`Grupo "${name}" sincronizado con Firebase.`);
      }
    });

    return groupId;
  } catch (error) {
    console.error("Error creando grupo:", error);
    throw error;
  }
};

/**
 * Cargar todos los grupos del usuario.
 */
export const cargarGrupos = async (userId, dispatch) => {
  if (!userId) return;
  try {
    const groups = await getGroupsByUserLocal(userId);
    dispatch(setGroups(groups));
  } catch (error) {
    console.error("Error cargando grupos:", error);
  }
};

/**
 * Cargar el detalle de un grupo (miembros + gastos + saldos).
 */
export const cargarDetalleGrupo = async (groupId, dispatch) => {
  if (!groupId) return;
  try {
    const members = await getGroupMembersLocal(groupId);
    const expenses = await getGroupExpensesLocal(groupId);
    const balances = await calcularSaldosGrupo(groupId);

    dispatch(setMembers(members));
    dispatch(setExpenses(expenses));
    dispatch(setBalances(balances));
  } catch (error) {
    console.error("Error cargando detalle del grupo:", error);
  }
};

/**
 * Agregar un gasto al grupo.
 */
export const agregarGastoGrupo = async (
  userId,
  groupId,
  description,
  amount,
  paidByMemberId,
  splitMemberIds,
  fotoUriLocal = null,
  dispatch,
) => {
  try {
    const expenseId = Crypto.randomUUID();
    const now = new Date().toISOString();
    const expense = {
      id: expenseId,
      group_id: groupId,
      description,
      amount: Number(amount),
      paid_by_member_id: paidByMemberId,
      foto_uri: fotoUriLocal,
      created_at: now,
    };

    // 1. SQLite
    await insertGroupExpenseLocal(expense);
    await insertGroupExpenseSplitsLocal(expenseId, splitMemberIds);

    // 2. Recargar todo el detalle para que los saldos se actualicen
    await cargarDetalleGrupo(groupId, dispatch);

    // 3. Firebase (background)
    syncGroupExpenseToFirebase(userId, groupId, expense, splitMemberIds).then(
      (success) => {
        if (success) {
          marcarGastoGrupoSincronizado(expenseId);
          console.log(`Gasto "${description}" del grupo sincronizado.`);
        }
      },
    );
  } catch (error) {
    console.error("Error agregando gasto al grupo:", error);
    throw error;
  }
};

/**
 * Eliminar un gasto del grupo.
 */
export const eliminarGastoGrupo = async (
  userId,
  groupId,
  expenseId,
  dispatch,
) => {
  try {
    // 1. UI
    dispatch(deleteExpenseAction(expenseId));

    // 2. SQLite
    await deleteGroupExpenseLocal(expenseId);

    // 3. Recalcular saldos
    const balances = await calcularSaldosGrupo(groupId);
    dispatch(setBalances(balances));

    // 4. Firebase
    deleteGroupExpenseFromFirebase(userId, groupId, expenseId).then(
      (success) => {
        if (success) {
          console.log(`Gasto ${expenseId} eliminado de Firebase.`);
        }
      },
    );
  } catch (error) {
    console.error("Error eliminando gasto del grupo:", error);
  }
};

/**
 * Eliminar un grupo completo.
 */
export const eliminarGrupo = async (userId, groupId, dispatch) => {
  try {
    // 1. UI
    dispatch(deleteGroupAction(groupId));

    // 2. SQLite (CASCADE borra miembros y gastos)
    await deleteGroupLocal(groupId);

    // 3. Firebase
    deleteGroupFromFirebase(userId, groupId).then((success) => {
      if (success) {
        console.log(`Grupo ${groupId} eliminado de Firebase.`);
      }
    });
  } catch (error) {
    console.error("Error eliminando grupo:", error);
  }
};

/**
 * Saldar una deuda entre dos integrantes.
 */
export const saldarDeudaGrupo = async (
  userId,
  groupId,
  fromMemberId,
  toMemberId,
  amount,
  dispatch,
) => {
  try {
    const description = `Liquidación de deuda`;
    // El que debía la plata (from) ahora "paga" el monto total,
    // pero el beneficio (split) va 100% al que recibía (to).
    // De esa forma, `from` suma a su balance positivo, y `to` se le resta, neteando a 0.
    await agregarGastoGrupo(
      userId,
      groupId,
      description,
      amount,
      fromMemberId,
      [toMemberId],
      dispatch,
    );
  } catch (error) {
    console.error("Error al saldar deuda:", error);
    throw error;
  }
};
