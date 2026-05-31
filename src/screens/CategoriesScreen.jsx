import Header from "@/components/Header/Header";
import { Button, Pressable, TouchableOpacity } from "react-native";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import styles from "@/styles/styles";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrease } from "@/store/counterSlice/counterSlice";

export default function CategoriesScreen() {
  const value = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrease = () => {
    dispatch(decrease());
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={"Categorías"}
        rightIcon={
          <Pressable onPress={() => alert("Inicia sesión para ver el gráfico")}>
            <Ionicons name="pie-chart-outline" size={24} color="black" />
          </Pressable>
        }
      />
      <View style={localStyles.counterContainer}>
        <Button onPress={handleDecrease} title="-" />

        <Text>Contador: {value} </Text>
        <Button onPress={handleIncrement} title="+" />
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
