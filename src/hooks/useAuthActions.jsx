import { useState } from "react";
import { Alert } from "react-native";
import { loginWithEmail, registerWithEmail } from "@/services/firebase/authService";

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      Alert.alert("Error", "Ingrese email y contraseña");
      return;
    }
    setLoading(true);
    const { error } = await loginWithEmail(email, password);
    if (error) {
      Alert.alert("Error al ingresar", error);
    }
    setLoading(false);
  };

  const handleRegister = async (email, password) => {
    if (!email || !password) {
      Alert.alert("Error", "Ingrese email y contraseña");
      return;
    }
    setLoading(true);
    const { error } = await registerWithEmail(email, password);
    if (error) {
      Alert.alert("Error al registrar", error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    Alert.alert("Próximamente", "El inicio de sesión con Google será implementado en breve.");
  };

  return {
    loading,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
  };
};
