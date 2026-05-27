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
import { Ionicons } from "@expo/vector-icons";
import { useTables } from "../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";

export default function ManageTablesScreen() {
  const { data, refetch } = useTables();
  const queryClient = useQueryClient();
  const tables = data || [];
  const { width } = useWindowDimensions();
  const isSmall = width < 500;
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [num, setNum] = useState("");
  const [cap, setCap] = useState("4");
  const [isEdit, setIsEdit] = useState(false);

  const refreshAll = () => {
    refetch();
    queryClient.invalidateQueries(["tables"]);
  };

  const openAdd = () => {
    setEditing(null);
    setNum("");
    setCap("4");
    setIsEdit(false);
    setModal(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setNum(t.number.toString());
    setCap(t.capacity.toString());
    setIsEdit(true);
    setModal(true);
  };
  const submit = async () => {
    const n = parseInt(num);
    if (!n || n < 1) {
      Alert.alert("Erro", "Número inválido.");
      return;
    }
    try {
      if (isEdit)
        await apiClient.put(`/tables/${editing.id}`, {
          number: n,
          capacity: parseInt(cap) || 4,
        });
      else
        await apiClient.post("/tables", {
          number: n,
          capacity: parseInt(cap) || 4,
        });
      setModal(false);
      refreshAll();
    } catch (e) {
      Alert.alert("Erro", e.response?.data?.error || "Falha.");
    }
  };
  const remove = (t) =>
    Alert.alert("Remover", `Remover mesa ${t.number}?`, [
      { text: "Cancelar" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/tables/${t.id}`);
            refreshAll();
          } catch (e) {
            Alert.alert("Erro", e.response?.data?.error || "Falha.");
          }
        },
      },
    ]);
  const changeStatus = (t, s) =>
    apiClient
      .patch(`/tables/${t.id}/status`, { status: s })
      .then(() => refreshAll())
      .catch(() => Alert.alert("Erro", "Falha."));
  const statusC = {
    FREE: "#2ecc71",
    OCCUPIED: "#e74c3c",
    RESERVED: "#f39c12",
    AWAITING_PAYMENT: "#3498db",
  };
  const statusL = {
    FREE: "Livre",
    OCCUPIED: "Ocupada",
    RESERVED: "Reservada",
    AWAITING_PAYMENT: "A Pagar",
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View
        className={`justify-between items-center mb-4 gap-3 ${isSmall ? "flex-col" : "flex-row"}`}
      >
        <Text className="text-2xl font-bold text-primary">Gestão de Mesas</Text>
        <TouchableOpacity
          className="bg-primary rounded-xl px-6 py-3 shadow-md"
          onPress={openAdd}
        >
          <Text className="text-white font-bold">+ Nova Mesa</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tables}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-wood rounded-xl p-4 mb-3 border border-gray-200">
            <View
              className={`items-center mb-3 gap-2 ${isSmall ? "flex-col" : "flex-row"}`}
            >
              <Text className="text-lg font-bold text-primary">
                Mesa {item.number}
              </Text>
              <Text className="text-sm text-gray-500">
                {item.capacity} lugares
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: statusC[item.status] }}
              >
                <Text className="text-white font-bold text-xs">
                  {statusL[item.status]}
                </Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-1.5">
                {[
                  { s: "FREE", l: "Livre", c: "#2ecc71" },
                  { s: "OCCUPIED", l: "Ocup.", c: "#e74c3c" },
                  { s: "RESERVED", l: "Reserv.", c: "#f39c12" },
                  { s: "AWAITING_PAYMENT", l: "Pagar", c: "#3498db" },
                ].map((a) => (
                  <TouchableOpacity
                    key={a.s}
                    className="px-2.5 py-1.5 rounded-md"
                    style={{ backgroundColor: a.c }}
                    onPress={() => changeStatus(item, a.s)}
                  >
                    <Text className="text-white font-bold text-xs">{a.l}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-blue-50 justify-center items-center border border-blue-200"
                  onPress={() => openEdit(item)}
                >
                  <Ionicons name="create-outline" size={16} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-red-50 justify-center items-center border border-red-200"
                  onPress={() => remove(item)}
                >
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">Nenhuma mesa.</Text>
        }
      />
      <Modal
        animationType="slide"
        transparent
        visible={modal}
        onRequestClose={() => setModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 w-[80%] max-w-md">
            <Text className="text-xl font-bold text-primary mb-5 text-center">
              {isEdit ? "Editar Mesa" : "Nova Mesa"}
            </Text>
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">
              Número
            </Text>
            <TextInput
              className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
              placeholder="Ex: 13"
              value={num}
              onChangeText={setNum}
              keyboardType="numeric"
            />
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">
              Capacidade
            </Text>
            <TextInput
              className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
              placeholder="Ex: 4"
              value={cap}
              onChangeText={setCap}
              keyboardType="numeric"
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
        </View>
      </Modal>
    </View>
  );
}
