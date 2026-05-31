import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase/firebase";
import { setAuthUser, clearAuthUser } from "@/store/authSlice/authSlice";
import { cargarPerfilUsuario } from "@/controller/controller";
import { clearUserProfile } from "@/store/userSlice/userSlice";

export function useAuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setAuthUser({
            uid: user.uid,
            email: user.email,
          }),
        );

        cargarPerfilUsuario(user.uid, dispatch);
      } else {
        dispatch(clearAuthUser());
        dispatch(clearUserProfile());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
}
