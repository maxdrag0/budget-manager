import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  SectionList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import {
  cargarDetalleGrupo,
  eliminarGastoGrupo,
} from "@/controller/groupController";
import { setCurrentGroup } from "@/store/groupsSlice/groupsSlice";
import FAB from "@/components/Home/FAB";
import ModalGroupExpense from "@/components/Groups/ModalGroupExpense";

export default function GroupDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { groupId, groupName } = route.params;
  const userId = useSelector((state) => state.auth.uid);
  const members = useSelector((state) => state.groups.members);
  const expenses = useSelector((state) => state.groups.expenses);
  const balances = useSelector((state) => state.groups.balances);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(setCurrentGroup({ id: groupId, name: groupName }));
    cargarDetalleGrupo(groupId, dispatch);
  }, [groupId]);

  const handleDeleteExpense = (expense) => {
    Alert.alert(
      "Eliminar Gasto",
      `¿Eliminar "${expense.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            eliminarGastoGrupo(userId, groupId, expense.id, dispatch),
        },
      ],
    );
  };

  // Calcular el total gastado
  const totalGastado = expenses.reduce((acc, e) => acc + e.amount, 0);

  const renderExpenseItem = ({ item }) => (
    <Pressable
      style={[
        styles.expenseCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onLongPress={() => handleDeleteExpense(item)}
    >
      <View style={styles.expenseLeft}>
        <View
          style={[
            styles.expenseIcon,
            { backgroundColor: colors.dangerLight },
          ]}
        >
          <Ionicons name="receipt-outline" size={18} color={colors.danger} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseDesc, { color: colors.text }]}>
            {item.description}
          </Text>
          <Text
            style={[styles.expensePaidBy, { color: colors.textSecondary }]}
          >
            Pagó: {item.paid_by_name || "Desconocido"}
          </Text>
          {item.splits && item.splits.length > 0 && (
            <Text
              style={[styles.expenseSplits, { color: colors.textMuted }]}
            >
              Dividido entre: {item.splits.map((s) => s.name).join(", ")}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={[styles.expenseAmount, { color: colors.danger }]}>
          ${item.amount.toFixed(2)}
        </Text>
        {(item.foto_uri || item.foto_url) && (
          <Ionicons
            name="image-outline"
            size={16}
            color={colors.textMuted}
            style={styles.expensePhotoIcon}
          />
        )}
      </View>
    </Pressable>
  );

  const handleSettleDebt = (balance) => {
    Alert.alert(
      "Liquidar Deuda",
      `¿Liquidar deuda de ${balance.from.name} a ${balance.to.name} por $${balance.amount.toFixed(2)}? Se registrará un pago automático.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Liquidar",
          style: "default",
          onPress: async () => {
            try {
              const { saldarDeudaGrupo } = await import("@/controller/groupController");
              await saldarDeudaGrupo(
                userId,
                groupId,
                balance.from.id,
                balance.to.id,
                balance.amount,
                dispatch
              );
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  };

  const renderBalanceItem = ({ item }) => (
    <Pressable
      style={[
        styles.balanceCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => handleSettleDebt(item)}
    >
      <View style={styles.balanceContent}>
        <Text style={[styles.balanceFrom, { color: colors.danger }]}>
          {item.from.name}
        </Text>
        <View style={styles.balanceArrow}>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={colors.textMuted}
          />
        </View>
        <Text style={[styles.balanceTo, { color: colors.success }]}>
          {item.to.name}
        </Text>
      </View>
      <Text style={[styles.balanceAmount, { color: colors.text }]}>
        ${item.amount.toFixed(2)}
      </Text>
    </Pressable>
  );

  // Build sections data
  const sections = [
    ...(balances.length > 0
      ? [
          {
            title: "Saldos",
            icon: "swap-horizontal",
            data: balances,
            renderItem: renderBalanceItem,
          },
        ]
      : []),
    {
      title: `Gastos (${expenses.length})`,
      icon: "list-outline",
      data: expenses,
      renderItem: renderExpenseItem,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={26} color={colors.icon} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]}>
            {groupName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {members.length} integrantes · Total: $
            {totalGastado.toFixed(2)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            import("react-native").then(({ Share }) => {
              Share.share({
                message: `¡Unite a mi grupo de gastos "${groupName}" en Budget Manager! Hacé click en este link: budgetmanager://group/join/${groupId}`,
              });
            });
          }}
          style={styles.shareButton}
          hitSlop={10}
        >
          <Ionicons name="share-social-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Members chips */}
      <View style={styles.membersRow}>
        {members.map((member) => (
          <View
            key={member.id}
            style={[
              styles.memberChip,
              { backgroundColor: colors.chipBackground },
            ]}
          >
            <Ionicons
              name="person"
              size={12}
              color={colors.chipText}
            />
            <Text style={[styles.memberChipText, { color: colors.chipText }]}>
              {member.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Content */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id || `${item.from?.id}-${item.to?.id}`}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons
              name={section.icon}
              size={18}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary },
              ]}
            >
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item, section }) => section.renderItem({ item })}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Agregá el primer gasto del grupo
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />

      <FAB
        onPress={() => setModalVisible(true)}
        iconName="add"
        bgColor={colors.primary}
        iconColor="#fff"
        style={styles.fab}
      />

      <ModalGroupExpense
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        groupId={groupId}
        members={members}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  shareButton: {
    padding: 4,
    marginLeft: 8,
  },
  membersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  memberChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // Expense card
  expenseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
    paddingRight: 8,
  },
  expenseDesc: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  expensePaidBy: {
    fontSize: 12,
    fontWeight: "500",
  },
  expenseSplits: {
    fontSize: 11,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  expensePhotoIcon: {
    marginTop: 4,
  },
  // Balance card
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  balanceContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  balanceFrom: {
    fontSize: 15,
    fontWeight: "600",
  },
  balanceArrow: {
    paddingHorizontal: 4,
  },
  balanceTo: {
    fontSize: 15,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
});
