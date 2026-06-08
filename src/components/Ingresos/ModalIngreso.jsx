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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export default function ModalIngreso({
  visible,
  onClose,
  onSubmit,
  periodo,
  valorActual,
}) {
  const { colors } = useTheme();
  const [monto, setMonto] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setMonto(valorActual ? valorActual.toString() : "");
    }
  }, [visible, valorActual]);

  const handleSubmit = async () => {
    if (!monto || Number(monto) < 0) return;

    setIsSaving(true);
    try {
      await onSubmit(Number(monto));
      onClose();
    } catch (error) {
      console.error("Error al guardar ingreso:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMonto("");
    onClose();
  };

  const isFormValid = monto && Number(monto) >= 0;

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
              Proyectar Ingreso
            </Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Ionicons
                name="close"
                size={24}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Chip del periodo actual */}
          <View
            style={[
              styles.periodoChip,
              { backgroundColor: colors.chipBackground },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.chipText}
            />
            <Text style={[styles.periodoText, { color: colors.chipText }]}>
              Periodo: {periodo}
            </Text>
          </View>

          <View style={styles.formContent}>
            {/* Monto */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Monto Estimado
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
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
            </View>

            {/* Botón Guardar */}
            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: colors.success },
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
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.submitButtonText}>Guardar Ingreso</Text>
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
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  periodoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  periodoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  formContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  inputGroup: {
    marginTop: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
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
