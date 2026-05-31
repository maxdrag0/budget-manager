import { Text, View, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES } from "@/constants"; // Importamos los colores

export default function MovementCard({
  item,
  onPress,
  onLongPress,
  isSelected,
}) {
  const {
    concepto,
    fecha,
    monto,
    categoria_id,
    tipo,
    fotoUri,
    fotoUrl,
    foto_url,
    foto_uri,
  } = item;

  const esIngreso = tipo === "ingreso";

  const photoSource = fotoUrl || foto_url || fotoUri || foto_uri;
  const categoryData = CATEGORIES.find(
    (c) => Number(c.id) === Number(categoria_id),
  );
  const getCardStyle = () => {
    if (isSelected) {
      return {
        backgroundColor: "#e0f2fe",
        borderColor: "#0284c7",
      };
    }
    if (esIngreso) {
      return {
        backgroundColor: "#e8fced", // Verde muy suave y opaco
        borderColor: "#28cb52", // Borde del mismo verde que el monto
      };
    } else {
      return {
        backgroundColor: "#fde8e8", // Rojo muy suave y opaco
        borderColor: "#ef4444", // Borde del mismo rojo que el monto
      };
    }
  };

  return (
    <Pressable
      style={[styles.card, getCardStyle()]}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onLongPress && onLongPress(item)}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={
              categoryData?.icon ||
              (esIngreso ? "arrow-down-circle-outline" : "receipt-outline")
            }
            size={20}
            color={categoryData?.color || (esIngreso ? "#28cb52" : "#333")}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{concepto}</Text>
          <Text style={styles.date}>{fecha}</Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <Text
          style={[styles.amount, { color: esIngreso ? "#28cb52" : "#ef4444" }]}
        >
          {esIngreso ? "+" : "-"}${monto}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardPressed: {
    opacity: 0.8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightContent: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
