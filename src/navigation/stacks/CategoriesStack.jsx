import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoriesScreen from "@/screens/CategoriesScreen";

const Stack = createNativeStackNavigator();

export default function CategoriesStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: "center", headerShown: false }}
    >
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
}
