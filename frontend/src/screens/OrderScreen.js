import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMenu, useCreateOrder } from "../api/hooks";

export default function OrderScreen({ route, navigation }) {
  const { tableId, tableNumber } = route.params;
  const { data: menuData, isLoading: menuLoading } = useMenu();
  const createOrder = useCreateOrder();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = menuData || [];

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory)
      setSelectedCategory(categories[0].id);
  }, [categories]);

  const addToCart = (p) =>
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === p.id);
      return ex
        ? prev.map((i) =>
            i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [
            ...prev,
            {
              productId: p.id,
              quantity: 1,
              notes: "",
              productName: p.name,
              price: parseFloat(p.price),
            },
          ];
    });
  const removeFromCart = (id) =>
    Alert.alert("Remover", "Deseja remover?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          setCart((prev) => prev.filter((i) => i.productId !== id)),
      },
    ]);
  const decrease = (id) =>
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === id
            ? { ...i, quantity: Math.max(0, i.quantity - 1) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  const increase = (id) =>
    setCart((prev) =>
      prev.map((i) =>
        i.productId === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  const clearCart = () => {
    if (cart.length === 0) return;
    Alert.alert("Limpar", "Tem certeza?", [
      { text: "Cancelar" },
      { text: "Limpar", style: "destructive", onPress: () => setCart([]) },
    ]);
  };

  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const sendOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Vazio", "Adicione itens.");
      return;
    }
    Alert.alert(
      "Confirmar",
      `Mesa ${tableNumber}\n${totalItems} itens\nTotal: €${totalPrice.toFixed(2)}\n\nEnviar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              await createOrder.mutateAsync({
                tableId,
                type: "DINE_IN",
                items: cart.map(({ productId, quantity, notes }) => ({
                  productId,
                  quantity,
                  notes,
                })),
              });
              Alert.alert("✅ Sucesso", "Pedido enviado!", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (e) {
              Alert.alert("❌ Erro", e.response?.data?.error || "Falha.");
            }
          },
        },
      ],
    );
  };

  const displayed = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.products || []
    : [];

  if (menuLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0A2342" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white p-3"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text className="text-xl font-bold text-primary text-center mb-3">
        🍽️ Pedido - Mesa {tableNumber || tableId}
      </Text>
      <View className={`flex-1 gap-2 ${isLandscape ? "flex-row" : "flex-col"}`}>
        {/* Menu */}
        <View className="flex-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === c.id ? "bg-primary" : "bg-gray-100"}`}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text
                  className={`text-sm font-semibold ${selectedCategory === c.id ? "text-white" : "text-gray-500"}`}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={displayed}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-2.5 px-2.5 bg-wood rounded-lg mb-1"
                onPress={() => addToCart(item)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-text-primary">
                    {item.name}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary mr-2.5">
                  €{parseFloat(item.price).toFixed(2)}
                </Text>
                <View className="w-7 h-7 rounded-full bg-secondary justify-center items-center">
                  <Text className="text-white font-bold text-lg">+</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-center mt-6 text-gray-400">
                Selecione uma categoria
              </Text>
            }
          />
        </View>
        {/* Carrinho */}
        <View
          className={`bg-gray-50 rounded-xl p-3 border border-gray-200 ${isLandscape ? "w-[340px]" : "flex-1 mt-2"}`}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-bold text-primary">
              🛒 Carrinho ({totalItems})
            </Text>
            {cart.length > 0 && (
              <TouchableOpacity
                className="px-2.5 py-1 rounded-md bg-red-50"
                onPress={clearCart}
              >
                <Text className="text-danger font-semibold text-xs">
                  🗑️ Limpar
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={cart}
            keyExtractor={(i) => i.productId.toString()}
            className="flex-1"
            renderItem={({ item }) => (
              <View className="flex-row items-center py-2 border-b border-gray-200 gap-1.5">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-text-primary">
                    {item.productName}
                  </Text>
                  <Text className="text-[10px] text-gray-400">
                    €{item.price.toFixed(2)} cada
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    className="w-7 h-7 rounded-lg bg-primary justify-center items-center"
                    onPress={() => decrease(item.productId)}
                  >
                    <Text className="text-white font-bold">−</Text>
                  </TouchableOpacity>
                  <Text className="font-bold text-sm text-text-primary">
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    className="w-7 h-7 rounded-lg bg-primary justify-center items-center"
                    onPress={() => increase(item.productId)}
                  >
                    <Text className="text-white font-bold">+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-7 h-7 rounded-lg bg-red-50 justify-center items-center"
                    onPress={() => removeFromCart(item.productId)}
                  >
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-sm font-bold text-secondary w-12 text-right">
                  €{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-4xl mb-2">🛒</Text>
                <Text className="text-sm text-gray-400 font-medium">
                  Carrinho vazio
                </Text>
              </View>
            }
          />
          <View className="border-t-2 border-wood pt-3 mt-2 bg-gray-50">
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-base font-semibold text-text-primary">
                Total:
              </Text>
              <Text className="text-2xl font-bold text-primary">
                €{totalPrice.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              className={`rounded-xl p-3.5 items-center ${cart.length === 0 ? "bg-gray-300" : "bg-primary"}`}
              onPress={sendOrder}
              disabled={cart.length === 0}
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-lg">
                📤 Enviar Pedido ({totalItems} itens)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
