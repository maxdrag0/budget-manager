import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import AuthStack from "./stacks/AuthStack";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAuthListener } from "@/hooks/useAuthListener";
import { View } from "react-native";

export default function RootNavigator() {
  const isLocalReady = useAppInitialization();
  useAuthListener();

  const { isAuthenticated, isReady: isAuthReady } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isLocalReady) {
      SplashScreen.hideAsync();
    }
  }, [isLocalReady]);

  if (!isLocalReady) {
    return null;
  }

  if (!isAuthReady) {
    // Retornamos una vista vacía con el mismo color de fondo que tu Splash Screen.
    // Esto evita que se renderice el AuthStack prematuramente.
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
