import { store } from "./src/store";
import { Provider } from "react-redux";
import RootNavigator from "./src/navigation/RootNavigator";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "./src/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </Provider>
  );
}
