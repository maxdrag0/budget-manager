import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "@/screens/GroupsScreen";
import GroupDetailScreen from "@/screens/GroupDetailScreen";

const Stack = createNativeStackNavigator();

export default function GroupsStack() {
  return (
    <Stack.Navigator
      initialRouteName="GroupsList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
}
