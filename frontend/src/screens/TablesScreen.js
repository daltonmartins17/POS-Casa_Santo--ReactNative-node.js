import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTables, useUpdateTableStatus } from "../api/hooks";
import { useAuthStore } from "../store/auth-store";

const statusColors = {
  FREE: "bg-green-500",
  OCCUPIED: "bg-red-500",
  RESERVED: "bg-yellow-500",
  AWAITING_PAYMENT: "bg-blue-500",
};
const statusLabels = {
  FREE: "Livre",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
  AWAITING_PAYMENT: "A pagar",
};

function TableCard({ table, onPress }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 m-2 items-center justify-center shadow-md border border-gray-100"
      style={{ width: 130, height: 130 }}
      onPress={() => onPress(table)}
      activeOpacity={0.8}
    >
      <View
        className={`w-4 h-4 rounded-full mb-2 ${statusColors[table.status]}`}
      />
      <Text className="text-lg font-bold text-primary">
        Mesa {table.number}
      </Text>
      <Text className="text-xs text-gray-400">{table.capacity} lugares</Text>
      <Text
        className="text-xs font-semibold mt-1"
        style={{ color: statusColors[table.status]?.replace("bg-", "#") }}
      >
        {statusLabels[table.status]}
      </Text>
    </TouchableOpacity>
  );
}

export default function TablesScreen({ navigation }) {
  const { data, isLoading, refetch, isFetching } = useTables();
  const updateStatus = useUpdateTableStatus();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const numColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const tables = data || [];
  const getRoleLabel = (r) =>
    ({
      ADMIN: "Administrador",
      MANAGER: "Gerente",
      CHEF: "Cozinheiro",
      WAITER: "Funcionário",
    })[r] || r;

  // ATUALIZAR SEMPRE QUE O ECRÃ RECEBE FOCO
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleTablePress = (table) => {
    if (table.status === "FREE") {
      const has = table.orders?.length > 0;
      const opts = [
        { text: "Cancelar", style: "cancel" },
        {
          text: "📝 Fazer Pedido",
          onPress: () =>
            navigation.navigate("Order", {
              tableId: table.id,
              tableNumber: table.number,
            }),
        },
      ];
      if (!has) {
        opts.push({
          text: "🔒 Reservar",
          onPress: () =>
            Alert.alert("Confirmar", `Reservar mesa ${table.number}?`, [
              { text: "Não" },
              {
                text: "Sim",
                onPress: () =>
                  updateStatus.mutate({ id: table.id, status: "RESERVED" }),
              },
            ]),
        });
      } else {
        opts.push({
          text: "ℹ️ Ver Pedidos",
          onPress: () =>
            navigation.navigate("TableOrders", {
              tableId: table.id,
              tableNumber: table.number,
            }),
        });
      }
      Alert.alert(`Mesa ${table.number}`, "O que deseja fazer?", opts);
    } else if (table.status === "OCCUPIED" || table.status === "RESERVED") {
      navigation.navigate("TableOrders", {
        tableId: table.id,
        tableNumber: table.number,
      });
    } else if (table.status === "AWAITING_PAYMENT") {
      Alert.alert("Pagamento", "Marcar como paga?", [
        { text: "Não" },
        {
          text: "Sim",
          onPress: () => updateStatus.mutate({ id: table.id, status: "FREE" }),
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-wood">
        <ActivityIndicator size="large" color="#0A2342" />
        <Text className="mt-4 text-primary text-base">Carregando mesas...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-wood">
      <FlatList
        data={tables}
        renderItem={({ item }) => (
          <TableCard table={item} onPress={handleTablePress} />
        )}
        keyExtractor={(i) => i.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <View>
            <View className="flex-row justify-center mt-4 mb-2 flex-wrap">
              {Object.entries(statusLabels).map(([k, v]) => (
                <View key={k} className="flex-row items-center mx-2 my-1">
                  <View
                    className={`w-4 h-4 rounded-full mr-1.5 ${statusColors[k]}`}
                  />
                  <Text>{v}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row justify-between items-center px-4 mt-4 flex-wrap">
              <Text className="text-2xl font-bold text-primary">
                Mapa de Mesas
              </Text>
              {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                <TouchableOpacity
                  className="bg-secondary px-4 py-2.5 rounded-lg"
                  onPress={() => navigation.navigate("ManageTables")}
                >
                  <Text className="text-white font-bold text-sm">
                    ⚙️ Gerir Mesas
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-sm text-text-secondary text-center mb-4 mt-1">
              {getRoleLabel(user?.role)}: {user?.name}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={["#0A2342"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-base text-gray-400 mb-4">
              Nenhuma mesa encontrada.
            </Text>
          </View>
        }
      />
    </View>
  );
}
