import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";

export default function TableOrdersScreen({ route, navigation }) {
  const { tableId, tableNumber } = route.params || {};
  const { width } = useWindowDimensions();
  const isLandscape = width > 700;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editQty, setEditQty] = useState("");

  useEffect(() => {
    if (tableId) load();
  }, [tableId]);
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      if (tableId) load();
    });
    return unsub;
  }, [navigation, tableId]);

  const load = async () => {
    if (!tableId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/tables/${tableId}/orders`);
      const ords = res.data || [];
      setOrders(ords);
      const map = {};
      let tot = 0;
      ords.forEach((o) =>
        o.items.forEach((i) => {
          const k = i.productId;
          if (map[k]) {
            map[k].qty += i.quantity;
            map[k].sub += parseFloat(i.product.price) * i.quantity;
            map[k].oids.push(i.id);
          } else {
            map[k] = {
              pid: i.productId,
              name: i.product.name,
              price: parseFloat(i.product.price),
              qty: i.quantity,
              sub: parseFloat(i.product.price) * i.quantity,
              oids: [i.id],
            };
          }
          tot += parseFloat(i.product.price) * i.quantity;
        }),
      );
      setItems(Object.values(map));
      setTotal(tot);
    } catch (e) {
      Alert.alert("Erro", "Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (it) => {
    setEditing(it);
    setEditQty(it.qty.toString());
  };
  const saveEdit = async () => {
    if (!editing) return;
    const q = parseInt(editQty);
    if (isNaN(q) || q < 0) {
      Alert.alert("Erro", "Quantidade inválida.");
      return;
    }
    try {
      if (q === 0) {
        Alert.alert("Remover", `Remover "${editing.name}"?`, [
          { text: "Cancelar" },
          {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
              for (const oid of editing.oids)
                await apiClient.delete(`/orders/items/${oid}`);
              setEditing(null);
              load();
            },
          },
        ]);
      } else {
        await apiClient.patch(`/orders/items/${editing.oids[0]}`, {
          quantity: q,
        });
        setEditing(null);
        load();
      }
    } catch (e) {
      Alert.alert("Erro", "Falha.");
    }
  };

  const pay = () =>
    Alert.alert("💳 Pagamento", `Total: €${total.toFixed(2)}\n\nMétodo:`, [
      { text: "Cancelar" },
      { text: "💵 Dinheiro", onPress: () => processPay("Dinheiro") },
      { text: "🏧 Multibanco", onPress: () => processPay("Multibanco") },
      { text: "📱 MBWay", onPress: () => processPay("MBWay") },
    ]);
  const processPay = async (m) => {
    try {
      for (const o of orders)
        await apiClient.patch(`/orders/${o.id}/status`, {
          status: "DELIVERED",
        });
      await apiClient.patch(`/tables/${tableId}/status`, { status: "FREE" });
      queryClient.invalidateQueries(["tables"]);
      Alert.alert(
        "✅ Pago!",
        `Mesa ${tableNumber} paga com ${m}.\nTotal: €${total.toFixed(2)}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert("Erro", "Falha.");
    }
  };
  const freeTable = () =>
    Alert.alert(
      orders.length > 0
        ? `⚠️ ${orders.length} pedido(s) ativo(s) - €${total.toFixed(2)}`
        : "Libertar Mesa",
      orders.length > 0
        ? "Libertar sem pagar?"
        : `Libertar mesa ${tableNumber}?`,
      [
        { text: "Cancelar" },
        {
          text: "Libertar",
          style: "destructive",
          onPress: async () => {
            await apiClient.patch(`/tables/${tableId}/status`, {
              status: "FREE",
            });
            queryClient.invalidateQueries(["tables"]);
            navigation.goBack();
          },
        },
      ],
    );

  if (!tableId)
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-2xl mb-4">⚠️</Text>
        <Text className="text-base text-primary">
          Erro: Mesa não especificada.
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary rounded-xl px-6 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0A2342" />
        <Text className="mt-4 text-primary">Carregando...</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 py-4 flex-row justify-between items-center border-b-2 border-wood shadow-sm">
        <View className="flex-row items-center gap-3">
          <Text className="text-4xl">🪑</Text>
          <View>
            <Text className="text-2xl font-bold text-primary">
              Mesa {tableNumber}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {items.reduce((s, i) => s + i.qty, 0)} itens consumidos
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.pid.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-2.5 border border-gray-200 shadow-sm"
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-wood justify-center items-center">
                <Text className="font-bold text-primary text-sm">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-text-primary">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {item.qty}x • €{item.price.toFixed(2)} cada
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-secondary">
                  €{item.sub.toFixed(2)}
                </Text>
                <Text className="text-[10px] text-gray-300 mt-0.5">
                  toque para editar
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 mt-2.5 flex-wrap">
              {Array.from({ length: Math.min(item.qty, 15) }).map((_, i) => (
                <View key={i} className="w-2 h-2 rounded-full bg-secondary" />
              ))}
              {item.qty > 15 && (
                <Text className="text-xs text-secondary font-bold">
                  +{item.qty - 15}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-5xl mb-3">🛒</Text>
            <Text className="text-base text-gray-400 font-medium">
              Nenhum item
            </Text>
            <Text className="text-sm text-gray-300 mt-1">
              Toque em "Novo Pedido"
            </Text>
          </View>
        }
      />
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t-2 border-wood shadow-lg">
        {items.length > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-primary">
              Total a Pagar
            </Text>
            <Text className="text-3xl font-bold text-secondary">
              €{total.toFixed(2)}
            </Text>
          </View>
        )}
        <View className="gap-2.5">
          {orders.length > 0 && (
            <TouchableOpacity
              className="bg-success rounded-2xl py-4 items-center shadow-md"
              onPress={pay}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-xl">
                💳 Pagar €{total.toFixed(2)}
              </Text>
            </TouchableOpacity>
          )}
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 bg-primary rounded-lg py-3 items-center"
              onPress={() =>
                navigation.navigate("Order", { tableId, tableNumber })
              }
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-sm">
                ➕ Novo Pedido
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg py-3 items-center border-2 border-danger"
              onPress={freeTable}
              activeOpacity={0.7}
            >
              <Text className="text-danger font-bold text-sm">🔄 Libertar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {editing && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="bg-white rounded-2xl p-6 w-[85%] max-w-md">
            <Text className="text-xl font-bold text-primary mb-2 text-center">
              Editar Item
            </Text>
            <Text className="text-lg font-semibold text-center mb-1">
              {editing.name}
            </Text>
            <Text className="text-sm text-gray-400 text-center mb-5">
              €{editing.price.toFixed(2)} cada
            </Text>
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Quantidade:
            </Text>
            <View className="flex-row items-center justify-center gap-3 mb-4">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-primary justify-center items-center"
                onPress={() =>
                  setEditQty(Math.max(0, parseInt(editQty) - 1).toString())
                }
              >
                <Text className="text-white font-bold text-xl">−</Text>
              </TouchableOpacity>
              <TextInput
                className="w-16 h-10 border-2 border-primary rounded-lg text-center text-lg font-bold"
                value={editQty}
                onChangeText={setEditQty}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-primary justify-center items-center"
                onPress={() => setEditQty((parseInt(editQty) + 1).toString())}
              >
                <Text className="text-white font-bold text-xl">+</Text>
              </TouchableOpacity>
            </View>
            {editQty !== editing.qty.toString() && (
              <Text className="text-center text-secondary font-semibold mb-4">
                Novo: €{(parseInt(editQty) * editing.price).toFixed(2)}
              </Text>
            )}
            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 p-3 rounded-lg bg-gray-400 items-center"
                onPress={() => setEditing(null)}
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-3 rounded-lg bg-primary items-center"
                onPress={saveEdit}
              >
                <Text className="text-white font-bold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
