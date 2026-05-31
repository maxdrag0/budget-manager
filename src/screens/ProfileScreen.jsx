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
} from "react-native";
import { logout } from "@/services/firebase/authService";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ImageSelector from "@/components/ImageSelector";
import {
  guardarPerfilUsuario,
  eliminarFotoPerfilUsuario,
} from "@/controller/controller";
import { Ionicons } from "@expo/vector-icons";
import { useCamera } from "@/hooks/useCamera";

export default function ProfileScreen() {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth.uid);
  const photoURL = useSelector((state) => state.user.photoURL);
  const name = useSelector((state) => state.user.name);
  const lastname = useSelector((state) => state.user.lastname);
  const email = useSelector((state) => state.user.email || state.auth.email);

  const [nameInput, setNameInput] = useState(name || "");
  const [lastnameInput, setLastnameInput] = useState(lastname || "");
  const [emailInput, setEmailInput] = useState(email || "");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
          photoLocalUri: null, // No cambiamos la foto en este guardado manual
        },
        dispatch,
      );
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelarEdicion = () => {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {isLoadingImage || isUploading ? (
            <ActivityIndicator
              size="large"
              color="#0d6efd"
              style={styles.avatarLoader}
            />
          ) : fotoAMostrar ? (
            <Image source={{ uri: fotoAMostrar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#999" />
            </View>
          )}
          <Pressable
            onPress={handlePressEditarFoto}
            style={styles.editPhotoButton}
            hitSlop={10}
          >
            <Ionicons name="camera-outline" size={16} color="#fff" />
          </Pressable>
        </View>
        {isUploading && (
          <Text style={styles.uploadingText}>Subiendo foto...</Text>
        )}
      </View>
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          {!isEditing && (
            <Pressable
              onPress={() => setIsEditing(true)}
              style={styles.editDataBtn}
            >
              <Ionicons name="pencil" size={18} color="#0d6efd" />
              <Text style={styles.editDataText}>Editar</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nombre"
              placeholderTextColor="#adb5bd"
            />
          ) : (
            <Text style={styles.textValue}>
              {nameInput || "No especificado"}
            </Text>
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellido</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={lastnameInput}
              onChangeText={setLastnameInput}
              placeholder="Apellido"
              placeholderTextColor="#adb5bd"
            />
          ) : (
            <Text style={styles.textValue}>
              {lastnameInput || "No especificado"}
            </Text>
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          {/* El email siempre es de solo lectura o texto simple */}
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={emailInput}
              editable={false}
              placeholder="Email"
              placeholderTextColor="#adb5bd"
            />
          ) : (
            <Text style={styles.textValue}>
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
                color="#0d6efd"
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
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    marginTop: 10,
    color: "#333",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
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
    backgroundColor: "#e0e0e0",
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
    backgroundColor: "#e9ecef",
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
    backgroundColor: "#0d6efd",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#0d6efd",
    fontWeight: "500",
  },
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
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  editDataBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editDataText: {
    color: "#0d6efd",
    fontWeight: "600",
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 6,
    fontWeight: "500",
  },
  textValue: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
  },
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
