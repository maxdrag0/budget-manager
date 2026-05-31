import React from "react";
import { Modal, StyleSheet, Text, View, Button } from "react-native";

export default function ModalComponent({
  visible,
  animationType,
  transparent,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>¡Modal Activo!</Text>
          <Text style={styles.modalText}>
            Este es un mensaje dentro del modal.
          </Text>

          <Button title="Cerrar Modal" onPress={onClose} color="#d9534f" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
});
