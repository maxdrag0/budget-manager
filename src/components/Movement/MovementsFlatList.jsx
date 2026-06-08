// src/components/Gastos/GastosFlatList.jsx
import { useState } from "react";
import { FlatList, View, StyleSheet, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MovementCard from "./MovementCard";
import { useTheme } from "@/hooks/useTheme";

export default function MovementsFlatList({
  items,
  onEditMovement,
  onDeleteMultiple,
}) {
  const { colors } = useTheme();
  const [selectedIds, setSelectedIds] = useState([]);

  const isSelectMode = selectedIds.length > 0;

  const handlePress = (item) => {
    if (isSelectMode) {
      toggleSelection(item.id);
    } else {
      onEditMovement && onEditMovement(item);
    }
  };

  const handleLongPress = (item) => {
    if (!isSelectMode) {
      setSelectedIds([item.id]);
    }
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selId) => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = () => {
    if (onDeleteMultiple) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <MovementCard
            item={item}
            isSelected={selectedIds.includes(item.id)}
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        )}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          paddingBottom: 80,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
      />
      {isSelectMode && (
        <View style={styles.deleteButtonContainer}>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.deleteButtonText}>
              Eliminar {selectedIds.length}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteButtonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    zIndex: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
