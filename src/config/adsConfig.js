import { TestIds } from 'react-native-google-mobile-ads';

// NOTA: Reemplaza estos IDs con los tuyos cuando vayas a publicar a producción.
// Nunca uses tus IDs reales mientras desarrollas para evitar baneos de tu cuenta.
const REAL_BANNER_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ';
const REAL_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY';

export const adConfig = {
  bannerId: __DEV__ ? TestIds.BANNER : REAL_BANNER_ID,
  interstitialId: __DEV__ ? TestIds.INTERSTITIAL : REAL_INTERSTITIAL_ID,
};
