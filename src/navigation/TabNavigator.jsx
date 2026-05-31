import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import HomeStack from "@/navigation/stacks/HomeStack";
import ProfileStack from "@/navigation/stacks/ProfileStack";
import { View } from "react-native";
import CategoriesStack from "@/navigation/stacks/CategoriesStack";
import { SingleActionTabBarButton } from "@/components/SingleTab/SingleActionTabBarButton";

const Tab = createBottomTabNavigator();
const DummyScreen = () => <View />;

export default function TabNavigator() {
  const navigation = useNavigation();
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          // backgroundColor: "#ffffff",

          // borderTopWidth: 1,
          // borderTopColor: "#ffffff",

          paddingBottom: 5,
          paddingTop: 5,

          elevation: 8, // Sombra en Android
          shadowColor: "#000", // Sombra en iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },

        // ICONOS
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarIconStyle: {
          marginBottom: 0,
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "CategoriesTab") {
            iconName = focused ? "list" : "list-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        // TEXTOS
        // tabBarShowLabel: false,
        // tabBarLabelStyle: {
        //   fontSize: 11,
        //   fontWeight: "600",
        //   marginTop: 2,
        // },
      })}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: "Perfil",
        }}
      />

      <Tab.Screen
        name="IngresoTab"
        component={DummyScreen}
        options={{
          tabBarButton: () => (
            <SingleActionTabBarButton
              iconName="add"
              bgColor="#94ff94ff"
              iconColor="#63be63ff"
              onPress={() =>
                navigation.navigate("HomeTab", {
                  screen: "Home",
                  params: { openModal: "ingreso" },
                })
              }
            />
          ),
        }}
      />

      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="EgresoTab"
        component={DummyScreen}
        options={{
          tabBarButton: () => (
            <SingleActionTabBarButton
              iconName="remove"
              bgColor="#f48686ff"
              iconColor="#ad4747ff"
              onPress={() =>
                navigation.navigate("HomeTab", {
                  screen: "Home",
                  params: { openModal: "egreso" },
                })
              }
            />
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesStack}
        options={{
          tabBarLabel: "Categorías",
        }}
      />
    </Tab.Navigator>
  );
}
