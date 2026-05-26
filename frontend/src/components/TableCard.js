import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { theme } from "../theme";

const statusColors = {
  FREE: "#2ecc71",
  OCCUPIED: "#e74c3c",
  RESERVED: "#f39c12",
  AWAITING_PAYMENT: "#3498db",
};

const statusLabels = {
  FREE: "Livre",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
  AWAITING_PAYMENT: "A pagar",
};

export default function TableCard({ table, onPress }) {
  const { width } = useWindowDimensions();
  const cardSize = width > 900 ? 140 : width > 600 ? 120 : 100;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardSize, height: cardSize }]}
      onPress={() => onPress(table)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: statusColors[table.status] },
        ]}
      />
      <Text
        style={[styles.tableNumber, { fontSize: cardSize > 120 ? 22 : 18 }]}
      >
        Mesa {table.number}
      </Text>
      <Text style={styles.capacity}>{table.capacity} lugares</Text>
      <Text style={[styles.status, { color: statusColors[table.status] }]}>
        {statusLabels[table.status]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  tableNumber: {
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  capacity: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: "600",
  },
});
