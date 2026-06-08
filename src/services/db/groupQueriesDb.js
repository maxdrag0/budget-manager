import { getDB } from "./initDb";

// === GROUPS ===

export const insertGroupLocal = async (userId, group) => {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO groups (id, user_id, name, created_at, sincronizado)
     VALUES (?, ?, ?, ?, 0)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name;`,
    [group.id, userId, group.name, group.created_at],
  );
};

export const getGroupsByUserLocal = async (userId) => {
  const db = await getDB();
  const groups = await db.getAllAsync(
    `SELECT * FROM groups WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );

  // Para cada grupo, obtenemos la cantidad de miembros
  const result = [];
  for (const group of groups) {
    const membersCount = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM group_members WHERE group_id = ?`,
      [group.id],
    );
    result.push({ ...group, membersCount: membersCount?.count || 0 });
  }
  return result;
};

export const deleteGroupLocal = async (groupId) => {
  const db = await getDB();
  // CASCADE deletes members and expenses
  await db.runAsync(`DELETE FROM groups WHERE id = ?`, [groupId]);
};

export const marcarGrupoSincronizado = async (groupId) => {
  const db = await getDB();
  await db.runAsync(`UPDATE groups SET sincronizado = 1 WHERE id = ?`, [
    groupId,
  ]);
};

// === GROUP MEMBERS ===

export const insertGroupMemberLocal = async (member) => {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO group_members (id, group_id, name, user_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       user_id = excluded.user_id;`,
    [member.id, member.group_id, member.name, member.user_id || null],
  );
};

export const getGroupMembersLocal = async (groupId) => {
  const db = await getDB();
  return await db.getAllAsync(
    `SELECT * FROM group_members WHERE group_id = ?`,
    [groupId],
  );
};

export const deleteGroupMemberLocal = async (memberId) => {
  const db = await getDB();
  await db.runAsync(`DELETE FROM group_members WHERE id = ?`, [memberId]);
};

// === GROUP EXPENSES ===

export const insertGroupExpenseLocal = async (expense) => {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO group_expenses (id, group_id, description, amount, paid_by_member_id, created_at, sincronizado, foto_uri, foto_url)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       description = excluded.description,
       amount = excluded.amount,
       paid_by_member_id = excluded.paid_by_member_id,
       foto_uri = excluded.foto_uri,
       foto_url = excluded.foto_url;`,
    [
      expense.id,
      expense.group_id,
      expense.description,
      expense.amount,
      expense.paid_by_member_id,
      expense.created_at,
      expense.foto_uri || null,
      expense.foto_url || null,
    ],
  );
};

export const insertGroupExpenseSplitsLocal = async (expenseId, memberIds) => {
  const db = await getDB();
  // Primero borramos los splits viejos si los hay
  await db.runAsync(
    `DELETE FROM group_expense_splits WHERE expense_id = ?`,
    [expenseId],
  );
  // Insertamos los nuevos
  for (const memberId of memberIds) {
    await db.runAsync(
      `INSERT INTO group_expense_splits (expense_id, member_id) VALUES (?, ?)`,
      [expenseId, memberId],
    );
  }
};

export const getGroupExpensesLocal = async (groupId) => {
  const db = await getDB();
  const expenses = await db.getAllAsync(
    `SELECT ge.*, gm.name as paid_by_name
     FROM group_expenses ge
     LEFT JOIN group_members gm ON ge.paid_by_member_id = gm.id
     WHERE ge.group_id = ?
     ORDER BY ge.created_at DESC`,
    [groupId],
  );

  // Para cada gasto, obtenemos los splits
  const result = [];
  for (const expense of expenses) {
    const splits = await db.getAllAsync(
      `SELECT ges.member_id, gm.name as member_name
       FROM group_expense_splits ges
       LEFT JOIN group_members gm ON ges.member_id = gm.id
       WHERE ges.expense_id = ?`,
      [expense.id],
    );
    result.push({
      ...expense,
      splits: splits.map((s) => ({ id: s.member_id, name: s.member_name })),
    });
  }
  return result;
};

export const deleteGroupExpenseLocal = async (expenseId) => {
  const db = await getDB();
  await db.runAsync(`DELETE FROM group_expenses WHERE id = ?`, [expenseId]);
};

export const marcarGastoGrupoSincronizado = async (expenseId) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE group_expenses SET sincronizado = 1 WHERE id = ?`,
    [expenseId],
  );
};

// === CÁLCULO DE SALDOS ===

/**
 * Calcula quién le debe a quién dentro de un grupo.
 * Retorna un array de objetos: { from: { id, name }, to: { id, name }, amount }
 */
export const calcularSaldosGrupo = async (groupId) => {
  const db = await getDB();

  // 1. Obtener todos los miembros
  const members = await getGroupMembersLocal(groupId);

  // 2. Obtener todos los gastos con sus splits
  const expenses = await getGroupExpensesLocal(groupId);

  // 3. Calcular balance neto de cada miembro
  // Balance positivo = le deben plata, Balance negativo = debe plata
  const balances = {};
  members.forEach((m) => {
    balances[m.id] = { id: m.id, name: m.name, balance: 0 };
  });

  expenses.forEach((expense) => {
    const splitCount = expense.splits.length;
    if (splitCount === 0) return;

    const sharePerPerson = expense.amount / splitCount;

    // Quien pagó recibe crédito por el monto total
    if (balances[expense.paid_by_member_id]) {
      balances[expense.paid_by_member_id].balance += expense.amount;
    }

    // Cada persona en el split debe su parte
    expense.splits.forEach((split) => {
      if (balances[split.id]) {
        balances[split.id].balance -= sharePerPerson;
      }
    });
  });

  // 4. Simplificar deudas usando algoritmo greedy
  const debtors = []; // balance negativo (deben)
  const creditors = []; // balance positivo (les deben)

  Object.values(balances).forEach((b) => {
    if (b.balance < -0.01) {
      debtors.push({ ...b, balance: Math.abs(b.balance) });
    } else if (b.balance > 0.01) {
      creditors.push({ ...b });
    }
  });

  // Ordenar para optimizar
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      transactions.push({
        from: { id: debtor.id, name: debtor.name },
        to: { id: creditor.id, name: creditor.name },
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return transactions;
};
