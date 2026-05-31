import React from "react";
import { View, StyleSheet } from "react-native";
import FAB from "@/components/Home/FAB";

export const SingleActionTabBarButton = ({
  onPress,
  iconName,
  bgColor,
  iconColor,
}) => {
  return (
    <View style={styles.tabBarButton}>
      <FAB
        onPress={onPress}
        iconName={iconName}
        bgColor={bgColor}
        iconColor={iconColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    top: -18,
  },
});
