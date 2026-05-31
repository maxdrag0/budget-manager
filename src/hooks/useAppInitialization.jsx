import { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { initLocalDB } from "@/services/db/initDb";
SplashScreen.preventAutoHideAsync().catch(() => {});

export const useAppInitialization = () => {
  const [isLocalReady, setIsLocalReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await Promise.all([
          initLocalDB(),
          Font.loadAsync({
            "montserrat-bold": require("@/assets/fonts/Monteserrat/static/Montserrat-Bold.ttf"),
          }),
        ]);
      } catch (error) {
        console.error("Error crítico durante la inicialización:", error);
      } finally {
        setIsLocalReady(true);
      }
    };

    prepareApp();
  }, []);

  return isLocalReady;
};
