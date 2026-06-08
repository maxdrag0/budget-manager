import { useState, useEffect } from "react";
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
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from "react-redux";
import { agregarGastoGrupo } from "@/controller/groupController";
import { useCamera } from "@/hooks/useCamera";

export default function ModalGroupExpense({
  visible,
  onClose,
  groupId,
  members,
  userId,
}) {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState(null);
  const [selectedSplitIds, setSelectedSplitIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [fotoUriLocal, setFotoUriLocal] = useState(null);

  const {
    imageUri,
    openCamera,
    openLibrary,
    isLoading: isLoadingImage,
  } = useCamera((uri) => {
    setFotoUriLocal(uri);
  });

  const handleAttachImage = () => {
    Alert.alert(
      "Comprobante de pago",
      "Selecciona una opción para adjuntar una foto del ticket:",
      [
        { text: "Tomar foto", onPress: openCamera },
        { text: "Elegir de galería", onPress: openLibrary },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const toggleSplit = (memberId) => {
    if (selectedSplitIds.includes(memberId)) {
      setSelectedSplitIds(selectedSplitIds.filter((id) => id !== memberId));
    } else {
      setSelectedSplitIds([...selectedSplitIds, memberId]);
    }
  };

  const selectAllSplits = () => {
    if (selectedSplitIds.length === members.length) {
      setSelectedSplitIds([]);
    } else {
      setSelectedSplitIds(members.map((m) => m.id));
    }
  };

  const isFormValid =
    description.trim() &&
    amount &&
    Number(amount) > 0 &&
    paidByMemberId &&
    selectedSplitIds.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSaving(true);
    try {
      await agregarGastoGrupo(
        userId,
        groupId,
        description.trim(),
        Number(amount),
        paidByMemberId,
        selectedSplitIds,
        fotoUriLocal,
        dispatch,
      );
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error agregando gasto:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidByMemberId(null);
    setSelectedSplitIds([]);
    setFotoUriLocal(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calcular cuánto le toca a cada uno
  const splitAmount =
    selectedSplitIds.length > 0 && amount
      ? (Number(amount) / selectedSplitIds.length).toFixed(2)
      : "0.00";

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
              Nuevo Gasto del Grupo
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
            {/* Foto Comprobante */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Comprobante (Opcional)
              </Text>
              {fotoUriLocal ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: fotoUriLocal }}
                    style={styles.imagePreview}
                  />
                  <Pressable
                    style={styles.removeImageBtn}
                    onPress={() => setFotoUriLocal(null)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.danger} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.attachImageBtn,
                    {
                      borderColor: colors.primary + "40",
                      backgroundColor: colors.primaryLight + "30",
                    },
                  ]}
                  onPress={handleAttachImage}
                >
                  <Ionicons name="camera-outline" size={24} color={colors.primary} />
                  <Text style={[styles.attachImageText, { color: colors.primary }]}>
                    Adjuntar Foto
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Concepto
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
                placeholder="Ej: Cena en restaurante"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                maxLength={100}
              />
            </View>

            {/* Monto */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Monto
              </Text>
              <View style={styles.montoWrapper}>
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: colors.textSecondary },
                  ]}
                >
                  $
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.montoInput,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.placeholder}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Quién Pagó */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                ¿Quién pagó?
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {members.map((member) => {
                  const isSelected = paidByMemberId === member.id;
                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.chip,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : colors.inputBorder,
                          backgroundColor: isSelected
                            ? colors.primaryLight
                            : colors.inputBackground,
                        },
                      ]}
                      onPress={() => setPaidByMemberId(member.id)}
                    >
                      <Ionicons
                        name={isSelected ? "person" : "person-outline"}
                        size={14}
                        color={
                          isSelected ? colors.primary : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected
                              ? colors.primary
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {member.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Entre quiénes se divide */}
            <View style={styles.inputGroup}>
              <View style={styles.splitHeader}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  Dividir entre:
                </Text>
                <Pressable onPress={selectAllSplits}>
                  <Text
                    style={[styles.selectAllText, { color: colors.primary }]}
                  >
                    {selectedSplitIds.length === members.length
                      ? "Ninguno"
                      : "Todos"}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.splitGrid}>
                {members.map((member) => {
                  const isSelected = selectedSplitIds.includes(member.id);
                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.splitChip,
                        {
                          borderColor: isSelected
                            ? colors.success
                            : colors.inputBorder,
                          backgroundColor: isSelected
                            ? colors.successLight
                            : colors.inputBackground,
                        },
                      ]}
                      onPress={() => toggleSplit(member.id)}
                    >
                      <Ionicons
                        name={
                          isSelected
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={18}
                        color={
                          isSelected ? colors.success : colors.textMuted
                        }
                      />
                      <Text
                        style={[
                          styles.splitChipText,
                          {
                            color: isSelected
                              ? colors.success
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {member.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Preview de cuánto le toca a cada uno */}
              {selectedSplitIds.length > 0 && amount && Number(amount) > 0 && (
                <View
                  style={[
                    styles.splitPreview,
                    { backgroundColor: colors.chipBackground },
                  ]}
                >
                  <Ionicons
                    name="calculator-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.splitPreviewText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ${splitAmount} por persona ({selectedSplitIds.length}{" "}
                    {selectedSplitIds.length === 1 ? "persona" : "personas"})
                  </Text>
                </View>
              )}
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
                    name="checkmark-circle-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.submitButtonText}>
                    Agregar Gasto
                  </Text>
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
    maxHeight: "92%",
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
  montoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  montoInput: {
    flex: 1,
  },
  chipsRow: {
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  splitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  splitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  splitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  splitChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  splitPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  splitPreviewText: {
    fontSize: 13,
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
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
  },
  attachImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  attachImageText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
