import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import AuthStack from "./stacks/AuthStack";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAuthListener } from "@/hooks/useAuthListener";
import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function RootNavigator() {
  const isLocalReady = useAppInitialization();
  useAuthListener();

  const { colors, isDark } = useTheme();

  const { isAuthenticated, isReady: isAuthReady } = useSelector(
    (state) => state.auth,
  );

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Inicia un timer apenas carga el RootNavigator
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Solo oculta el splash si ya cargó local, cargó auth, Y pasaron 1.5s
    if (isLocalReady && isAuthReady && minTimeElapsed) {
      SplashScreen.hideAsync();
    }
  }, [isLocalReady, isAuthReady, minTimeElapsed]);

  if (!isLocalReady) {
    return null;
  }

  if (!isAuthReady) {
    // Retornamos una vista vacía con el mismo color de fondo que tu Splash Screen.
    // Esto evita que se renderice el AuthStack prematuramente.
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const linking = {
    prefixes: ["budgetmanager://"],
    config: {
      screens: {
        GroupsTab: {
          screens: {
            GroupsList: {
              path: "group/join/:inviteGroupId",
            },
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
