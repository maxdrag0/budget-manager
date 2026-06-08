import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useSelector } from "react-redux";

// Siempre usamos el ID de prueba de Google por ahora para evitar crashes en producción.
// Cuando tengas el ID real, cámbialo aquí.
const adUnitId = TestIds.BANNER;

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
