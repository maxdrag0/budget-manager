import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { cargarGrupos, eliminarGrupo } from "@/controller/groupController";
import FAB from "@/components/Home/FAB";
import ModalCreateGroup from "@/components/Groups/ModalCreateGroup";
import ModalJoinGroup from "@/components/Groups/ModalJoinGroup";

export default function GroupsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const userId = useSelector((state) => state.auth.uid);
  const groups = useSelector((state) => state.groups.groups);

  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);

  const inviteGroupId = route.params?.inviteGroupId;

  useEffect(() => {
    if (inviteGroupId) {
      setJoinModalVisible(true);
    }
  }, [inviteGroupId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        cargarGrupos(userId, dispatch);
      }
    }, [userId, dispatch]),
  );

  const handleDeleteGroup = (group) => {
    Alert.alert(
      "Eliminar Grupo",
      `¿Estás seguro de eliminar "${group.name}"? Se borrarán todos los gastos asociados.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarGrupo(userId, group.id, dispatch),
        },
      ],
    );
  };

  const renderGroup = ({ item }) => (
    <Pressable
      style={[
        styles.groupCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() =>
        navigation.navigate("GroupDetail", {
          groupId: item.id,
          groupName: item.name,
        })
      }
      onLongPress={() => handleDeleteGroup(item)}
    >
      <View
        style={[
          styles.groupIcon,
          { backgroundColor: colors.primaryLight },
        ]}
      >
        <Ionicons name="people" size={24} color={colors.primary} />
      </View>
      <View style={styles.groupInfo}>
        <Text style={[styles.groupName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.groupMeta, { color: colors.textSecondary }]}>
          {item.membersCount || 0}{" "}
          {item.membersCount === 1 ? "integrante" : "integrantes"}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textMuted}
      />
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Grupos
        </Text>
      </View>

      {groups.length > 0 ? (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={64}
            color={colors.textMuted}
          />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            No tenés grupos
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Creá un grupo para dividir gastos con amigos, compañeros o familia.
          </Text>
        </View>
      )}

      <FAB
        onPress={() => setModalVisible(true)}
        iconName="add"
        bgColor={colors.primary}
        iconColor="#fff"
        style={styles.fab}
      />

      <ModalCreateGroup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={userId}
      />

      <ModalJoinGroup
        visible={joinModalVisible}
        onClose={() => {
          setJoinModalVisible(false);
          // Clear params so it doesn't reopen
          navigation.setParams({ inviteGroupId: undefined });
        }}
        inviteGroupId={inviteGroupId}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },
  groupMeta: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
});
