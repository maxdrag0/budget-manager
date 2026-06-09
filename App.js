import { store } from "./src/store";
import { Provider } from "react-redux";
import RootNavigator from "./src/navigation/RootNavigator";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import mobileAds from 'react-native-google-mobile-ads';

SplashScreen.preventAutoHideAsync();

// Inicializar Google Mobile Ads SDK
mobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('AdMob initialized');
  });

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </Provider>
  );
}
