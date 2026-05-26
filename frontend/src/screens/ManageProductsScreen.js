import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useMenu } from "../api/hooks";
import apiClient from "../api/client";

export default function ManageProductsScreen() {
  const { data: menu, refetch } = useMenu();
  const cats = menu || [];
  const { width } = useWindowDimensions();
  const isSmall = width < 500;
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [catId, setCatId] = useState("");
  const [desc, setDesc] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [selCat, setSelCat] = useState(null);

  const all = cats.flatMap((c) =>
    c.products.map((p) => ({ ...p, catName: c.name, catId: c.id })),
  );
  const filtered = selCat ? all.filter((p) => p.catId === selCat) : all;

  const openAdd = (cid = null) => {
    setEditing(null);
    setName("");
    setPrice("");
    setCatId(cid ? cid.toString() : "");
    setDesc("");
    setIsEdit(false);
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setName(p.name);
    setPrice(parseFloat(p.price).toFixed(2));
    setCatId(p.catId?.toString() || "");
    setDesc(p.description || "");
    setIsEdit(true);
    setModal(true);
  };
  const submit = async () => {
    if (!name.trim() || !price || !catId) {
      Alert.alert("Erro", "Preencha nome, preço e categoria.");
      return;
    }
    const pr = parseFloat(price);
    if (isNaN(pr) || pr <= 0) {
      Alert.alert("Erro", "Preço inválido.");
      return;
    }
    try {
      if (isEdit)
        await apiClient.put(`/orders/products/${editing.id}`, {
          name: name.trim(),
          price: pr,
          categoryId: parseInt(catId),
          description: desc.trim(),
        });
      else
        await apiClient.post("/orders/products", {
          name: name.trim(),
          price: pr,
          categoryId: parseInt(catId),
          description: desc.trim(),
        });
      setModal(false);
      refetch();
    } catch (e) {
      Alert.alert("Erro", e.response?.data?.error || "Falha.");
    }
  };
  const remove = (p) => {
    Alert.alert("Remover", `Remover "${p.name}"?`, [
      { text: "Cancelar" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/orders/products/${p.id}`);
            refetch();
          } catch (e) {
            Alert.alert("Erro", e.response?.data?.error || "Falha.");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View
        className={`justify-between items-center mb-4 gap-3 ${isSmall ? "flex-col" : "flex-row"}`}
      >
        <Text className="text-2xl font-bold text-primary">
          📦 Gestão de Produtos
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-xl px-6 py-3"
          onPress={() => openAdd()}
        >
          <Text className="text-white font-bold">+ Novo Produto</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro por categoria - TODOS COM MESMO TAMANHO */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          style={{ flexGrow: 0 }}
        >
          <TouchableOpacity
            className={`px-5 py-2.5 rounded-full ${!selCat ? "bg-primary" : "bg-gray-100"}`}
            onPress={() => setSelCat(null)}
          >
            <Text
              className={`text-sm font-semibold ${!selCat ? "text-white" : "text-gray-500"}`}
            >
              Todos
            </Text>
          </TouchableOpacity>
          {cats.map((c) => (
            <TouchableOpacity
              key={c.id}
              className={`px-5 py-2.5 rounded-full ${selCat === c.id ? "bg-primary" : "bg-gray-100"}`}
              onPress={() => setSelCat(c.id)}
            >
              <Text
                className={`text-sm font-semibold ${selCat === c.id ? "text-white" : "text-gray-500"}`}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-wood rounded-xl p-3.5 mb-2 border border-gray-200">
            <View className="flex-1 mr-3">
              <Text className="text-base font-semibold text-text-primary">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {item.catName} • €{parseFloat(item.price).toFixed(2)}
              </Text>
              {item.description ? (
                <Text
                  className="text-xs text-gray-400 mt-1 italic"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="w-10 h-10 rounded-lg bg-primary justify-center items-center"
                onPress={() => openEdit(item)}
              >
                <Text className="text-white text-lg">✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 h-10 rounded-lg bg-danger justify-center items-center"
                onPress={() => remove(item)}
              >
                <Text className="text-white text-lg">🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">
            Nenhum produto encontrado.
          </Text>
        }
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modal}
        onRequestClose={() => setModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center">
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 40,
            }}
          >
            <View className="bg-white rounded-2xl p-6">
              <Text className="text-xl font-bold text-primary mb-5 text-center">
                {isEdit ? "✏️ Editar Produto" : "➕ Novo Produto"}
              </Text>

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Nome do Produto *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
                placeholder="Ex: Imperial"
                value={name}
                onChangeText={setName}
              />

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Preço (€) *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
                placeholder="Ex: 3.50"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Categoria *
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {cats.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    className={`px-4 py-2 rounded-full ${catId === c.id.toString() ? "bg-primary" : "bg-gray-100"}`}
                    onPress={() => setCatId(c.id.toString())}
                  >
                    <Text
                      className={`text-sm ${catId === c.id.toString() ? "text-white font-semibold" : "text-gray-500"}`}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Descrição (opcional)
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300 min-h-[80px]"
                placeholder="Descrição do produto..."
                value={desc}
                onChangeText={setDesc}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View className="flex-row justify-between gap-3">
                <TouchableOpacity
                  className="flex-1 p-3 rounded-lg bg-gray-400 items-center"
                  onPress={() => setModal(false)}
                >
                  <Text className="text-white font-bold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 p-3 rounded-lg bg-primary items-center"
                  onPress={submit}
                >
                  <Text className="text-white font-bold">
                    {isEdit ? "Atualizar" : "Criar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
