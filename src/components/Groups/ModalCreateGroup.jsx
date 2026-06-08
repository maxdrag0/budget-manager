import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from "react-redux";
import { crearGrupo } from "@/controller/groupController";

export default function ModalCreateGroup({ visible, onClose, userId }) {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [memberInputs, setMemberInputs] = useState(["", ""]);
  const [isSaving, setIsSaving] = useState(false);

  const addMemberField = () => {
    setMemberInputs([...memberInputs, ""]);
  };

  const removeMemberField = (index) => {
    if (memberInputs.length <= 2) return; // Mínimo 2 miembros
    const updated = memberInputs.filter((_, i) => i !== index);
    setMemberInputs(updated);
  };

  const updateMember = (index, value) => {
    const updated = [...memberInputs];
    updated[index] = value;
    setMemberInputs(updated);
  };

  const isFormValid =
    name.trim() &&
    memberInputs.filter((m) => m.trim()).length >= 2;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSaving(true);
    try {
      const validMembers = memberInputs.filter((m) => m.trim());
      await crearGrupo(userId, name.trim(), validMembers, dispatch);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creando grupo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setName("");
    setMemberInputs(["", ""]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.separator },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Nuevo Grupo
            </Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Ionicons
                name="close"
                size={24}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Nombre del grupo */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Nombre del Grupo
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                  },
                ]}
                placeholder="Ej: Viaje a Bariloche"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                maxLength={50}
                autoFocus
              />
            </View>

            {/* Miembros */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Integrantes ({memberInputs.filter((m) => m.trim()).length})
              </Text>

              {memberInputs.map((member, index) => (
                <View key={index} style={styles.memberRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.memberInput,
                      {
                        borderColor: colors.inputBorder,
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                      },
                    ]}
                    placeholder={`Integrante ${index + 1}`}
                    placeholderTextColor={colors.placeholder}
                    value={member}
                    onChangeText={(val) => updateMember(index, val)}
                    maxLength={30}
                  />
                  {memberInputs.length > 2 && (
                    <Pressable
                      onPress={() => removeMemberField(index)}
                      style={styles.removeMemberBtn}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="close-circle"
                        size={22}
                        color={colors.danger}
                      />
                    </Pressable>
                  )}
                </View>
              ))}

              <Pressable
                onPress={addMemberField}
                style={[
                  styles.addMemberBtn,
                  { borderColor: colors.primary + "40" },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[styles.addMemberText, { color: colors.primary }]}
                >
                  Agregar integrante
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Botón crear */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                (!isFormValid || isSaving) && {
                  backgroundColor: colors.textMuted,
                },
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.submitButtonText}>Crear Grupo</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "85%",
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  inputGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  memberInput: {
    flex: 1,
  },
  removeMemberBtn: {
    marginLeft: 8,
    padding: 2,
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 4,
  },
  addMemberText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingTop: 8,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
