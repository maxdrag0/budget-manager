import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from "react-redux";
import {
  getGroupFromFirebase,
  joinGroupFirebase,
  fetchGroupExpensesFromFirebase,
} from "@/services/firebase/groupSyncService";
import {
  insertGroupLocal,
  insertGroupMemberLocal,
  insertGroupExpenseLocal,
  insertGroupExpenseSplitsLocal,
} from "@/services/db/groupQueriesDb";
import { cargarGrupos } from "@/controller/groupController";

export default function ModalJoinGroup({ visible, onClose, inviteGroupId, userId }) {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (visible && inviteGroupId) {
      loadGroupData();
    }
  }, [visible, inviteGroupId]);

  const loadGroupData = async () => {
    setLoading(true);
    const data = await getGroupFromFirebase(inviteGroupId);
    if (!data) {
      Alert.alert("Error", "El grupo no existe o el enlace es inválido.");
      onClose();
    } else {
      setGroupData(data);
    }
    setLoading(false);
  };

  const handleJoinAs = async (member) => {
    if (member.user_id) {
      Alert.alert("Aviso", "Este usuario ya está vinculado a otra cuenta.");
      return;
    }

    setIsJoining(true);
    try {
      // 1. Unirse en Firebase
      const success = await joinGroupFirebase(inviteGroupId, member.id, userId);
      if (!success) {
        throw new Error("No se pudo unir al grupo en Firebase.");
      }

      // 2. Guardar Grupo en SQLite
      await insertGroupLocal(userId, {
        id: groupData.id,
        name: groupData.name,
        created_at: groupData.created_at,
      });

      // 3. Guardar Miembros en SQLite
      for (const m of groupData.members) {
        await insertGroupMemberLocal({
          ...m,
          group_id: groupData.id,
          user_id: m.id === member.id ? userId : m.user_id,
        });
      }

      // 4. Descargar Gastos de Firebase y guardarlos en SQLite
      const expenses = await fetchGroupExpensesFromFirebase(inviteGroupId);
      for (const exp of expenses) {
        await insertGroupExpenseLocal({
          id: exp.id,
          group_id: inviteGroupId,
          description: exp.description,
          amount: exp.amount,
          paid_by_member_id: exp.paid_by_member_id,
          foto_uri: null,
          foto_url: exp.foto_url || null,
          created_at: exp.created_at,
        });
        if (exp.split_member_ids && exp.split_member_ids.length > 0) {
          await insertGroupExpenseSplitsLocal(exp.id, exp.split_member_ids);
        }
      }

      // 5. Recargar la lista de grupos en UI
      await cargarGrupos(userId, dispatch);

      Alert.alert("¡Éxito!", `Te has unido al grupo "${groupData.name}".`);
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al intentar unirte al grupo.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[styles.container, { backgroundColor: colors.modalBackground }]}
        >
          <View style={[styles.header, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Unirse a un Grupo
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
                  Buscando grupo...
                </Text>
              </View>
            ) : groupData ? (
              <>
                <Text style={[styles.title, { color: colors.text }]}>
                  {groupData.name}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Para unirte, seleccioná cuál de estos integrantes sos vos:
                </Text>

                <View style={styles.membersList}>
                  {groupData.members.map((m) => {
                    const isTaken = !!m.user_id;
                    const isMe = m.user_id === userId; // En caso de que ya estuviera unido
                    
                    return (
                      <Pressable
                        key={m.id}
                        style={[
                          styles.memberCard,
                          {
                            backgroundColor: isMe
                              ? colors.primaryLight
                              : isTaken
                              ? colors.inputBackground
                              : colors.card,
                            borderColor: isMe
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => handleJoinAs(m)}
                        disabled={isTaken || isJoining}
                      >
                        <Ionicons
                          name="person"
                          size={20}
                          color={
                            isMe
                              ? colors.primary
                              : isTaken
                              ? colors.textMuted
                              : colors.text
                          }
                        />
                        <View style={styles.memberInfo}>
                          <Text
                            style={[
                              styles.memberName,
                              {
                                color: isMe
                                  ? colors.primary
                                  : isTaken
                                  ? colors.textMuted
                                  : colors.text,
                              },
                            ]}
                          >
                            {m.name}
                          </Text>
                          {isTaken && (
                            <Text
                              style={[
                                styles.takenText,
                                { color: colors.textMuted },
                              ]}
                            >
                              {isMe ? "Ya vinculado" : "Vinculado a otra cuenta"}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {isJoining && (
                  <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                )}
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "50%",
    maxHeight: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    padding: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  memberInfo: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  takenText: {
    fontSize: 12,
    marginTop: 2,
  },
});
