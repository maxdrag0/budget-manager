import {
  Button,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  TextInput,
  Switch,
  Modal,
} from "react-native";
import { logout } from "@/services/firebase/authService";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  guardarPerfilUsuario,
  eliminarFotoPerfilUsuario,
} from "@/controller/controller";
import { Ionicons } from "@expo/vector-icons";
import { useCamera } from "@/hooks/useCamera";
import { useTheme } from "@/hooks/useTheme";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { colors, isDark, toggleTheme } = useTheme();

  const userId = useSelector((state) => state.auth.uid);
  const photoURL = useSelector((state) => state.user.photoURL);
  const name = useSelector((state) => state.user.name);
  const lastname = useSelector((state) => state.user.lastname);
  const authEmail = useSelector((state) => state.auth.email);
  const userEmail = useSelector((state) => state.user.email);
  const email = userEmail || authEmail;

  const [nameInput, setNameInput] = useState(name || "");
  const [lastnameInput, setLastnameInput] = useState(lastname || "");
  const [emailInput, setEmailInput] = useState(email || "");

  // Nuevo estado para controlar si estamos en modo edición de datos
  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const {
    imageUri,
    openCamera,
    openLibrary,
    isLoading: isLoadingImage,
  } = useCamera((uri) => {
    manejarSeleccionImagen(uri);
  });

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      Alert.alert("Error al cerrar sesión", error);
    }
  };

  // Guardar foto de perfil independientemente
  const manejarSeleccionImagen = async (uri) => {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario.");
      return;
    }
    try {
      setIsUploading(true);
      await guardarPerfilUsuario(
        userId,
        {
          displayName: `${nameInput} ${lastnameInput}`,
          name: nameInput,
          lastname: lastnameInput,
          email: emailInput,
          photoLocalUri: uri,
        },
        dispatch,
      );
    } catch (error) {
      console.error("Error al guardar foto de perfil:", error);
      Alert.alert("Error", "No se pudo guardar la foto de perfil.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEliminarFoto = async () => {
    if (!userId) return;
    try {
      setIsUploading(true);
      await eliminarFotoPerfilUsuario(userId, dispatch);
      Alert.alert("Éxito", "Foto de perfil eliminada.");
    } catch (error) {
      console.error("Error al eliminar la foto:", error);
      Alert.alert("Error", "No se pudo eliminar la foto de perfil.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePressEditarFoto = () => {
    const opciones = [
      { text: "Tomar foto", onPress: openCamera },
      { text: "Elegir de galería", onPress: openLibrary },
    ];

    if (fotoAMostrar) {
      opciones.push({
        text: "Eliminar Foto",
        style: "destructive",
        onPress: handleEliminarFoto,
      });
    }

    opciones.push({ text: "Cancelar", style: "cancel" });

    Alert.alert(
      "Foto de Perfil",
      "Selecciona una opción para cambiar tu foto:",
      opciones,
    );
  };

  // Guardar datos de texto
  const handleGuardarCambios = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await guardarPerfilUsuario(
        userId,
        {
          displayName: `${nameInput} ${lastnameInput}`,
          name: nameInput,
          lastname: lastnameInput,
          email: emailInput,
          photoLocalUri: null,
        },
        dispatch,
      );
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
      setIsEditing(false); // Salir del modo edición al guardar con éxito
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelarEdicion = () => {
    // Restaurar los valores originales
    setNameInput(name || "");
    setLastnameInput(lastname || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (name) setNameInput(name);
    if (lastname) setLastnameInput(lastname);
    if (email) setEmailInput(email);
  }, [name, lastname, email]);

  const fotoAMostrar = imageUri || photoURL;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View
          style={[styles.avatarWrapper, { backgroundColor: colors.border }]}
        >
          {isLoadingImage || isUploading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.avatarLoader}
            />
          ) : fotoAMostrar ? (
            <Pressable onPress={() => setIsImageModalVisible(true)}>
              <Image source={{ uri: fotoAMostrar }} style={styles.avatarImage} />
            </Pressable>
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.chipBackground },
              ]}
            >
              <Ionicons name="person" size={48} color={colors.textMuted} />
            </View>
          )}

          <Pressable
            onPress={handlePressEditarFoto}
            style={[
              styles.editPhotoButton,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
              },
            ]}
            hitSlop={10}
          >
            <Ionicons name="camera-outline" size={16} color="#fff" />
          </Pressable>
        </View>
        {isUploading && (
          <Text style={[styles.uploadingText, { color: colors.primary }]}>
            Subiendo foto...
          </Text>
        )}
      </View>

      {/* Toggle Modo Oscuro */}
      <View
        style={[
          styles.themeToggleContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.themeToggleRow}>
          <View style={styles.themeToggleInfo}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={isDark ? "#fbbf24" : "#f59e0b"}
            />
            <Text style={[styles.themeToggleLabel, { color: colors.text }]}>
              Modo Oscuro
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#dee2e6", true: colors.primary }}
            thumbColor={isDark ? "#fff" : "#f8f9fa"}
          />
        </View>
      </View>

      {/* Datos Personales */}
      <View style={styles.formContainer}>
        <View
          style={[styles.formHeader, { borderBottomColor: colors.separator }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Datos Personales
          </Text>
          {!isEditing && (
            <Pressable
              onPress={() => setIsEditing(true)}
              style={styles.editDataBtn}
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
              <Text style={[styles.editDataText, { color: colors.primary }]}>
                Editar
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Nombre
          </Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nombre"
              placeholderTextColor={colors.placeholder}
            />
          ) : (
            <Text
              style={[
                styles.textValue,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                },
              ]}
            >
              {nameInput || "No especificado"}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Apellido
          </Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={lastnameInput}
              onChangeText={setLastnameInput}
              placeholder="Apellido"
              placeholderTextColor={colors.placeholder}
            />
          ) : (
            <Text
              style={[
                styles.textValue,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                },
              ]}
            >
              {lastnameInput || "No especificado"}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Email
          </Text>
          {/* El email siempre es de solo lectura o texto simple */}
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                styles.inputDisabled,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.chipBackground,
                  color: colors.textSecondary,
                },
              ]}
              value={emailInput}
              editable={false}
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
            />
          ) : (
            <Text
              style={[
                styles.textValue,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                },
              ]}
            >
              {emailInput || "No especificado"}
            </Text>
          )}
        </View>

        {/* Botones de acción cuando está en modo edición */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Cancelar"
                color="#6c757d"
                onPress={handleCancelarEdicion}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title={isSaving ? "Guardando..." : "Guardar Cambios"}
                color={colors.primary}
                onPress={handleGuardarCambios}
                disabled={isSaving}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.logoutContainer}>
        <Button color="tomato" title="Cerrar Sesión" onPress={handleLogout} />
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Pressable style={styles.modalCloseArea} onPress={() => setIsImageModalVisible(false)} />
          <Image source={{ uri: fotoAMostrar }} style={styles.fullScreenImage} resizeMode="contain" />
          <Pressable style={styles.closeButton} onPress={() => setIsImageModalVisible(false)}>
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    marginTop: 10,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  // Toggle de Modo Oscuro
  themeToggleContainer: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  themeToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  themeToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Form
  formContainer: {
    width: "100%",
    gap: 20,
    marginTop: 10,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  editDataBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editDataText: {
    fontWeight: "600",
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  textValue: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputDisabled: {},
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
  logoutContainer: {
    marginTop: 40,
    width: "100%",
  },
});
