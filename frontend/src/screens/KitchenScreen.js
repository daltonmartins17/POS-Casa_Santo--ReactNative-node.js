import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useKitchenOrders, useUpdateOrderStatus } from "../api/hooks";
import socket from "../api/socket";

export default function KitchenScreen() {
  const { data, isLoading, refetch } = useKitchenOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const { width } = useWindowDimensions();
  const isLandscape = width > 700;

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    socket.emit("join_kitchen");
    socket.on("new_order", handleRefetch);
    socket.on("order_status_changed", handleRefetch);

    return () => {
      socket.off("new_order");
      socket.off("order_status_changed");
    };
  }, [handleRefetch]);

  // Polling rápido a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  const active = (data || []).filter(
    (o) => o.status === "PENDING" || o.status === "PREPARING",
  );
  const pending = active.filter((o) => o.status === "PENDING");
  const preparing = active.filter((o) => o.status === "PREPARING");

  const getTime = (d) => {
    const m = Math.floor((new Date() - new Date(d)) / 60000);
    return m < 1
      ? "Agora"
      : m === 1
        ? "1 min"
        : m < 60
          ? `${m} min`
          : `${Math.floor(m / 60)}h ${m % 60}min`;
  };

  const renderCard = (order, isPending) => (
    <View
      key={order.id}
      className={`rounded-xl p-3.5 mb-2.5 border-2 ${isPending ? "bg-[#1e2d3d] border-warning" : "bg-[#1e2d3d] border-info"}`}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-white">#{order.id}</Text>
          {order.table && (
            <Text className="bg-white/10 px-2.5 py-1 rounded-full text-white text-xs font-semibold">
              Mesa {order.table.number}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-400 text-xs">
            ⏱ {getTime(order.createdAt)}
          </Text>
          <View
            className={`px-2.5 py-1 rounded-full ${isPending ? "bg-warning" : "bg-info"}`}
          >
            <Text className="text-white font-bold text-[11px]">
              {isPending ? "PENDENTE" : "EM PREPARAÇÃO"}
            </Text>
          </View>
        </View>
      </View>
      <View className="mb-3">
        {order.items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center py-1.5 border-b border-white/5"
          >
            <View className="bg-secondary w-8 h-8 rounded-lg justify-center items-center mr-2.5">
              <Text className="text-dark font-bold text-sm">
                {item.quantity}x
              </Text>
            </View>
            <Text className="flex-1 text-white text-base font-medium">
              {item.product.name}
            </Text>
            {item.notes ? (
              <Text className="text-warning text-xs italic ml-2">
                📝 {item.notes}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
      <TouchableOpacity
        className={`rounded-lg py-3 items-center ${isPending ? "bg-info" : "bg-success"}`}
        onPress={() =>
          Alert.alert(
            isPending ? "👨‍🍳 Iniciar Preparação" : "✅ Pedido Pronto",
            isPending
              ? "Marcar como 'Em Preparação'?"
              : "Confirmar que está pronto?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: isPending ? "Iniciar" : "Pronto",
                onPress: () =>
                  updateOrderStatus.mutate({
                    id: order.id,
                    status: isPending ? "PREPARING" : "READY",
                  }),
              },
            ],
          )
        }
      >
        <Text className="text-white font-bold text-sm">
          {isPending ? "👨‍🍳 Iniciar Preparação" : "✅ Marcar como Pronto"}
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-500 text-[11px] mt-2 text-right">
        Pedido por: {order.user?.name || "Funcionário"}
      </Text>
    </View>
  );

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-dark">
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );

  return (
    <View className="flex-1 bg-dark">
      <View className="bg-dark-light px-5 py-4 border-b-2 border-secondary">
        <Text className="text-2xl font-bold text-white mb-3">
          👨‍🍳 Painel da Cozinha
        </Text>
        <View className="flex-row gap-2.5">
          <View className="bg-warning px-3.5 py-1.5 rounded-full">
            <Text className="text-white font-bold text-xs">
              {pending.length} Pendente(s)
            </Text>
          </View>
          <View className="bg-info px-3.5 py-1.5 rounded-full">
            <Text className="text-white font-bold text-xs">
              {preparing.length} Em Preparação
            </Text>
          </View>
        </View>
      </View>
      {active.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-6xl mb-4">✅</Text>
          <Text className="text-2xl font-bold text-white mb-2">
            Tudo em ordem!
          </Text>
          <Text className="text-base text-gray-400">
            Não há pedidos pendentes.
          </Text>
        </View>
      ) : (
        <View
          className={`flex-1 gap-2 p-2 ${isLandscape ? "flex-row" : "flex-col"}`}
        >
          <View className="flex-1 bg-dark-light rounded-xl overflow-hidden">
            <View className="bg-warning px-4 py-3 items-center">
              <Text className="text-white font-bold text-sm">
                🕒 Pendentes ({pending.length})
              </Text>
            </View>
            <FlatList
              data={pending}
              keyExtractor={(i) => i.id.toString()}
              renderItem={({ item }) => renderCard(item, true)}
              contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
              ListEmptyComponent={
                <Text className="text-gray-500 text-center mt-6 text-sm italic">
                  Sem pendentes
                </Text>
              }
            />
          </View>
          <View className="flex-1 bg-dark-light rounded-xl overflow-hidden">
            <View className="bg-info px-4 py-3 items-center">
              <Text className="text-white font-bold text-sm">
                👨‍🍳 Em Preparação ({preparing.length})
              </Text>
            </View>
            <FlatList
              data={preparing}
              keyExtractor={(i) => i.id.toString()}
              renderItem={({ item }) => renderCard(item, false)}
              contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
              ListEmptyComponent={
                <Text className="text-gray-500 text-center mt-6 text-sm italic">
                  Sem preparação
                </Text>
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}
