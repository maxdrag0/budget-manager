import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES } from "@/constants";
import { useCamera } from "@/hooks/useCamera";
import DateTimePicker from "@react-native-community/datetimepicker";

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDateForPeriod = (periodo) => {
  if (!periodo) return getTodayString();
  const today = getTodayString();
  if (today.startsWith(periodo)) {
    return today;
  }
  return `${periodo}-01`;
};

export default function ModalMovement({
  tipo,
  visible,
  onClose,
  onSubmit,
  onDelete,
  periodo,
  movementToEdit,
}) {
  const [localTipo, setLocalTipo] = useState(tipo);
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(getDefaultDateForPeriod(periodo));
  const [categoriaId, setCategoriaId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(periodo);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [verFotoVisible, setVerFotoVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const categoriasFiltradas = CATEGORIES.filter((cat) =>
    localTipo === "ingreso" ? cat.id >= 101 : cat.id < 100,
  );

  const {
    imageUri,
    setImageUri,
    isLoading: isLoadingImage,
    openCamera,
    openLibrary,
    clearImage,
  } = useCamera();

  useEffect(() => {
    setLocalTipo(tipo);
    if (visible && movementToEdit) {
      setConcepto(movementToEdit.concepto);
      setMonto(movementToEdit.monto.toString());
      setFecha(movementToEdit.fecha);
      setCategoriaId(Number(movementToEdit.categoria_id));
      setSelectedPeriod(movementToEdit.periodo || periodo);

      const fotoExistente =
        movementToEdit.fotoUri ||
        movementToEdit.foto_uri ||
        movementToEdit.fotoUrl ||
        movementToEdit.foto_url ||
        null;
      setImageUri(fotoExistente);
    } else if (visible && !movementToEdit) {
      resetForm();
    }
  }, [visible, movementToEdit, periodo, tipo]);

  const isDateValid = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const dateToString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const stringToDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setFecha(dateToString(selectedDate));
    }
  };

  const handleSubmit = async () => {
    if (!concepto.trim() || !monto || !categoriaId || !isDateValid(fecha))
      return;

    setIsSaving(true);
    try {
      await onSubmit({
        id: movementToEdit?.id,
        concepto: concepto.trim(),
        monto,
        fecha,
        periodo: selectedPeriod,
        tipo: localTipo,
        categoria_id: categoriaId,
        fotoUri: imageUri,
      });
      // Limpiamos el formulario
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error al guardar gasto:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setConcepto("");
    setMonto("");
    setFecha(getDefaultDateForPeriod(periodo));
    setCategoriaId(null);
    clearImage();
    setSelectedPeriod(periodo);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDelete = async () => {
    if (!movementToEdit || !onDelete) return;
    setIsSaving(true);
    try {
      await onDelete(movementToEdit.id);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    concepto.trim() && monto && categoriaId && isDateValid(fecha);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: localTipo === "ingreso" ? "#f0fdf4" : "#fef2f2" },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: localTipo === "ingreso" ? "#dcfce7" : "#fecaca",
                borderBottomColor: localTipo === "ingreso" ? "#166534" : "#7f1d1d",
              },
            ]}
          >
            <Text style={styles.headerTitle}>
              {localTipo === "ingreso"
                ? movementToEdit
                  ? "Editar Ingreso"
                  : "Nuevo Ingreso"
                : movementToEdit
                  ? "Editar Gasto"
                  : "Nuevo Gasto"}
            </Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#6c757d" />
            </Pressable>
          </View>

          {/* Segmented Control solo para nuevos movimientos */}
          {!movementToEdit && (
            <View style={styles.typeToggleContainer}>
              <Pressable
                style={[
                  styles.typeToggleButton,
                  localTipo === "egreso" && styles.typeToggleButtonActiveEgreso,
                ]}
                onPress={() => {
                  setLocalTipo("egreso");
                  setCategoriaId(null);
                }}
              >
                <Text
                  style={[
                    styles.typeToggleText,
                    localTipo === "egreso" && styles.typeToggleTextActive,
                  ]}
                >
                  Egreso
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeToggleButton,
                  localTipo === "ingreso" && styles.typeToggleButtonActiveIngreso,
                ]}
                onPress={() => {
                  setLocalTipo("ingreso");
                  setCategoriaId(null);
                }}
              >
                <Text
                  style={[
                    styles.typeToggleText,
                    localTipo === "ingreso" && styles.typeToggleTextActive,
                  ]}
                >
                  Ingreso
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={[styles.periodoChip, { alignSelf: "center", marginTop: 10 }]}
            onPress={() => setShowPeriodPicker(true)}
          >
            <Ionicons name="calendar-outline" size={14} color="#495057" />
            <Text style={styles.periodoText}>Período: {selectedPeriod}</Text>
            <Ionicons
              name="pencil-outline"
              size={14}
              color="#0d6efd"
              style={{ marginLeft: 6 }}
            />
          </Pressable>
          {/* Justo debajo pegas el componente oculto del Selector de Período */}
          {showPeriodPicker && (
            <DateTimePicker
              value={stringToDate(`${selectedPeriod}-01`)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPeriodPicker(false);
                if (selectedDate) {
                  // Solo extraemos YYYY y MM
                  const yyyy = selectedDate.getFullYear();
                  const mm = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  );
                  setSelectedPeriod(`${yyyy}-${mm}`);
                }
              }}
            />
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Concepto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Concepto</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Compra supermercado"
                placeholderTextColor="#adb5bd"
                value={concepto}
                onChangeText={setConcepto}
                maxLength={100}
              />
            </View>

            {/* Monto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto</Text>
              <View style={styles.montoWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.input, styles.montoInput]}
                  placeholder="0.00"
                  placeholderTextColor="#adb5bd"
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: "#495057" }}>{fecha}</Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={stringToDate(fecha)}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            {/* Categoría */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesRow}
              >
                {categoriasFiltradas.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      categoriaId === cat.id && {
                        backgroundColor: cat.color + "20",
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => setCategoriaId(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={categoriaId === cat.id ? cat.color : "#6c757d"}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        categoriaId === cat.id && { color: cat.color },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Foto (opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Foto <Text style={styles.optionalLabel}>(opcional)</Text>
              </Text>

              {imageUri ? (
                <View style={styles.photoPreviewContainer}>
                  <Pressable onPress={() => setVerFotoVisible(true)}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.photoPreview}
                    />
                  </Pressable>
                  <View style={styles.photoActionRow}>
                    <Pressable
                      style={styles.viewPhotoBtn}
                      onPress={() => setVerFotoVisible(true)}
                    >
                      <Ionicons name="eye-outline" size={16} color="#0d6efd" />
                      <Text style={styles.viewPhotoText}>Ver foto</Text>
                    </Pressable>
                    <Pressable
                      style={styles.removePhotoBtn}
                      onPress={clearImage}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#d9534f"
                      />
                      <Text style={styles.removePhotoText}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.photoButtons}>
                  <Pressable
                    style={styles.photoBtn}
                    onPress={openCamera}
                    disabled={isLoadingImage}
                  >
                    <Ionicons name="camera-outline" size={20} color="#0d6efd" />
                    <Text style={styles.photoBtnText}>Cámara</Text>
                  </Pressable>
                  <Pressable
                    style={styles.photoBtn}
                    onPress={openLibrary}
                    disabled={isLoadingImage}
                  >
                    <Ionicons name="images-outline" size={20} color="#0d6efd" />
                    <Text style={styles.photoBtnText}>Galería</Text>
                  </Pressable>
                </View>
              )}
              {isLoadingImage && (
                <ActivityIndicator
                  size="small"
                  color="#0d6efd"
                  style={{ marginTop: 8 }}
                />
              )}
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            {/* Botón Guardar */}
            <Pressable
              style={[
                styles.submitButton,
                (!isFormValid || isSaving) && styles.submitButtonDisabled,
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
                    {movementToEdit ? "Guardar" : "Crear"}
                  </Text>
                </>
              )}
            </Pressable>

            {movementToEdit && (
              <Pressable
                style={[
                  styles.submitButton,
                  styles.deleteButton,
                  isSaving && styles.submitButtonDisabled,
                ]}
                onPress={handleDelete}
                disabled={isSaving}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Eliminar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={verFotoVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVerFotoVisible(false)}
      >
        <View style={styles.viewerOverlay}>
          <Pressable
            style={styles.viewerCloseButton}
            onPress={() => setVerFotoVisible(false)}
            hitSlop={15}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
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
    borderBottomWidth: 1.5,
    paddingHorizontal: 20, // Padding horizontal movido aquí
    borderTopLeftRadius: 24, // Para que el bg no se salga de las esquinas redondeadas
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
  },
  typeToggleContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#e9ecef",
    borderRadius: 12,
    padding: 4,
  },
  typeToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  typeToggleButtonActiveEgreso: {
    backgroundColor: "#fecaca",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeToggleButtonActiveIngreso: {
    backgroundColor: "#dcfce7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
  },
  typeToggleTextActive: {
    color: "#212529",
  },
  periodoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  periodoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
  },
  formContent: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 6,
  },
  optionalLabel: {
    fontWeight: "400",
    color: "#adb5bd",
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#212529",
    backgroundColor: "#f8f9fa",
  },
  montoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: "#495057",
    marginRight: 8,
  },
  montoInput: {
    flex: 1,
  },
  diaInput: {
    width: 80,
  },
  categoriesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6c757d",
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0d6efd40",
    backgroundColor: "#0d6efd08",
  },
  photoBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0d6efd",
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 20, // Padding horizontal movido aquí
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // Padding bottom movido aquí
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#64748b", // Gris azulado (Slate 500)
    paddingVertical: 12,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: "#ef4444", // Rojo más tenue
    marginTop: 0,
  },
  submitButtonDisabled: {
    backgroundColor: "#cbd5e1", // Slate 300
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  viewerImage: {
    width: "95%",
    height: "80%",
  },
  photoPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoActionRow: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  viewPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0d6efd40",
    backgroundColor: "#0d6efd08",
  },
  viewPhotoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0d6efd",
  },
  removePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9534f40",
    backgroundColor: "#d9534f08",
  },
  removePhotoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d9534f",
  },
});
