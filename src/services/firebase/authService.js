import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage = "Ocurrió un error al registrar.";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "El email ya está registrado.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "El email no es válido.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "La contraseña es muy débil (mínimo 6 caracteres).";
    }
    return { user: null, error: errorMessage };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage = "Ocurrió un error al iniciar sesión.";
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      errorMessage = "Email o contraseña incorrectos.";
    }
    return { user: null, error: errorMessage };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
