import { Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

/**
 * Floating Action Button con diseño premium.
 * Sombras pronunciadas, sin borde plano, animación orgánica de rebote.
 */
export default function FAB({
  onPress,
  iconName = "add",
  bgColor = "#dcfce7",
  iconColor = "#166534",
  size = 58,
  style,
  disabled = false,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: bgColor,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Ionicons name={iconName} size={26} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    justifyContent: "center",
    alignItems: "center",
    // Sombra pronunciada para aspecto premium
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});
