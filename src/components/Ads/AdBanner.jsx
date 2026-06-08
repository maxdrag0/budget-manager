import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useSelector } from "react-redux";

// En desarrollo usamos el ID de prueba de Google. 
// Para producción, se debe usar tu ID real.
const adUnitId = __DEV__ ? TestIds.BANNER : "ca-app-pub-TU_ID_AQUÍ";

export default function AdBanner() {
  const isPremium = useSelector((state) => state.user.isPremium);

  // Si el usuario es premium, no renderizamos nada
  if (isPremium) {
    return null;
  }

  return (
    <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#fff", paddingTop: 4 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
