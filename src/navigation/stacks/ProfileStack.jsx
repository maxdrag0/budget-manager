import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import { Pressable, Text } from "react-native";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: "center", headerShown: false }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Perfil",
          headerRight: () => (
            <Pressable
              onPress={() => {
                alert("Editar perfil");
              }}
            >
              <Text>Editar</Text>
            </Pressable>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
