import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  Switch,
} from "react-native";
import apiClient from "../api/client";
import { useAuthStore } from "../store/auth-store";

export default function ManageUsersScreen() {
  const { user: currentUser } = useAuthStore();
  const { width } = useWindowDimensions();
  const isSmall = width < 500;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WAITER");
  const [isActive, setIsActive] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const roles = [
    { key: "ADMIN", label: "Administrador" },
    { key: "MANAGER", label: "Gerente" },
    { key: "CHEF", label: "Cozinheiro" },
    { key: "WAITER", label: "Empregado" },
  ];

  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      Alert.alert("Erro", "Falha ao carregar utilizadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Que cargos este utilizador pode gerir
  const getManageableRoles = () => {
    if (isAdmin) return roles; // ADMIN gere todos
    if (isManager)
      return roles.filter((r) => r.key === "CHEF" || r.key === "WAITER"); // MANAGER só gere CHEF e WAITER
    return [];
  };

  // Que utilizadores este utilizador pode ver
  const getVisibleUsers = () => {
    if (isAdmin) return users;
    if (isManager)
      return users.filter(
        (u) =>
          u.role === "CHEF" || u.role === "WAITER" || u.id === currentUser?.id,
      );
    return [];
  };

  // Pode editar este utilizador?
  const canEdit = (u) => {
    if (u.id === currentUser?.id) return false; // Não pode editar-se a si próprio
    if (isAdmin) return true;
    if (isManager) return u.role === "CHEF" || u.role === "WAITER";
    return false;
  };

  // Pode apagar este utilizador?
  const canDelete = (u) => {
    if (u.id === currentUser?.id) return false;
    if (isAdmin) return true;
    if (isManager) return u.role === "CHEF" || u.role === "WAITER";
    return false;
  };

  // Pode inativar este utilizador?
  const canToggle = (u) => {
    if (u.id === currentUser?.id) return false;
    if (isAdmin) return true;
    if (isManager) return u.role === "CHEF" || u.role === "WAITER";
    return false;
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("WAITER");
    setIsActive(true);
    setIsEdit(false);
    setModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setIsActive(u.isActive !== false);
    setIsEdit(true);
    setModal(true);
  };

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Erro", "Nome e email são obrigatórios.");
      return;
    }
    if (!isEdit && !password.trim()) {
      Alert.alert("Erro", "Password é obrigatória.");
      return;
    }
    try {
      if (isEdit) {
        const data = { name: name.trim(), email: email.trim(), role, isActive };
        if (password.trim()) data.password = password.trim();
        await apiClient.put(`/users/${editing.id}`, data);
      } else {
        await apiClient.post("/users", {
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          isActive,
        });
      }
      setModal(false);
      fetchUsers();
      Alert.alert("✅ Sucesso", isEdit ? "Atualizado." : "Criado.");
    } catch (e) {
      Alert.alert("❌ Erro", e.response?.data?.error || "Falha.");
    }
  };

  const toggleActive = async (u) => {
    const newStatus = u.isActive === false ? true : false;
    try {
      await apiClient.put(`/users/${u.id}`, { isActive: newStatus });
      fetchUsers();
    } catch (e) {
      Alert.alert("❌ Erro", e.response?.data?.error || "Falha.");
    }
  };

  const remove = (u) => {
    Alert.alert("⚠️ Remover", `Remover "${u.name}"?`, [
      { text: "Cancelar" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/users/${u.id}`);
            fetchUsers();
          } catch (e) {
            Alert.alert("❌ Erro", e.response?.data?.error || "Falha.");
          }
        },
      },
    ]);
  };

  const roleColor = (r) =>
    ({
      ADMIN: "#e74c3c",
      MANAGER: "#3498db",
      CHEF: "#f39c12",
      WAITER: "#2ecc71",
    })[r] || "#999";
  const roleLabel = (r) => roles.find((x) => x.key === r)?.label || r;

  const visibleUsers = getVisibleUsers();
  const manageableRoles = getManageableRoles();

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0A2342" />
      </View>
    );

  return (
    <View className="flex-1 bg-white p-4">
      <View
        className={`justify-between items-center mb-4 gap-3 ${isSmall ? "flex-col" : "flex-row"}`}
      >
        <Text className="text-2xl font-bold text-primary">👥 Utilizadores</Text>
        <TouchableOpacity
          className="bg-primary rounded-xl px-6 py-3 shadow-md"
          onPress={openAdd}
        >
          <Text className="text-white font-bold">+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleUsers}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => {
          const isSelf = item.id === currentUser?.id;
          return (
            <View
              className={`flex-row justify-between items-center rounded-xl p-3.5 mb-2 border ${item.isActive === false ? "bg-gray-100 border-gray-300 opacity-70" : "bg-wood border-gray-200"}`}
            >
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-semibold text-text-primary">
                    {item.name}
                  </Text>
                  {isSelf && (
                    <View className="bg-secondary px-2 py-0.5 rounded-full">
                      <Text className="text-white font-bold text-[10px]">
                        TU
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-500">{item.email}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: roleColor(item.role) }}
                  >
                    <Text className="text-white font-bold text-xs">
                      {roleLabel(item.role)}
                    </Text>
                  </View>
                  {canToggle(item) ? (
                    <View className="flex-row items-center gap-1">
                      <Switch
                        value={item.isActive !== false}
                        onValueChange={() => toggleActive(item)}
                        trackColor={{ false: "#ccc", true: "#2ecc71" }}
                        thumbColor="#FFF"
                        style={{
                          transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
                        }}
                      />
                      <Text className="text-[10px] text-gray-500">
                        {item.isActive !== false ? "Ativo" : "Inativo"}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-[10px] text-gray-400">
                      {item.isActive !== false ? "Ativo" : "Inativo"}
                    </Text>
                  )}
                </View>
              </View>

              {/* BOTÕES MODERNOS */}
              <View className="flex-row gap-2">
                {canEdit(item) && (
                  <TouchableOpacity
                    className="w-9 h-9 rounded-full bg-blue-50 justify-center items-center border border-blue-200"
                    onPress={() => openEdit(item)}
                  >
                    <Text className="text-blue-600 text-sm">✎</Text>
                  </TouchableOpacity>
                )}
                {canDelete(item) && (
                  <TouchableOpacity
                    className="w-9 h-9 rounded-full bg-red-50 justify-center items-center border border-red-200"
                    onPress={() => remove(item)}
                  >
                    <Text className="text-red-500 text-sm">✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">
            Nenhum utilizador.
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
                {isEdit ? "✎ Editar" : "✚ Novo"} Utilizador
              </Text>

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Nome *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
                placeholder="Nome"
                value={name}
                onChangeText={setName}
              />

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Email *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Password {isEdit ? "(vazio = manter)" : "*"}
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-base mb-4 border border-gray-300"
                placeholder="••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Cargo *
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {manageableRoles.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    className={`px-4 py-2 rounded-full ${role === r.key ? "bg-primary" : "bg-gray-100"}`}
                    onPress={() => setRole(r.key)}
                  >
                    <Text
                      className={`text-sm ${role === r.key ? "text-white font-semibold" : "text-gray-500"}`}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
                <Text className="text-sm font-semibold text-gray-700">
                  Ativo
                </Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: "#ccc", true: "#2ecc71" }}
                  thumbColor="#FFF"
                />
              </View>

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
