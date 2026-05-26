import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useAuthStore } from "../store/auth-store";
import { useLogin } from "../api/hooks";

export default function LoginScreen() {
  const [email, setEmail] = useState("admin@casasanto.pt");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const loginMutation = useLogin();
  const { login } = useAuthStore();
  const { width } = useWindowDimensions();
  const isSmall = width < 400;

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const response = await loginMutation.mutateAsync({
        email: email.toLowerCase().trim(),
        password: password,
      });
      if (response?.token && response?.user) {
        await login(response.token, response.user);
      } else {
        Alert.alert("Erro", "Resposta inválida.");
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Credenciais inválidas.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-wood"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className={`items-center ${isSmall ? "px-4" : "px-8"} py-8`}>
            <Image
              source={require("../assets/images/logo.png")}
              className={`${isSmall ? "w-20 h-20" : "w-32 h-32"} mb-4`}
              resizeMode="contain"
            />
            <Text
              className={`font-bold text-primary ${isSmall ? "text-2xl" : "text-4xl"} mb-1`}
            >
              Casa o Santo
            </Text>
            <Text className="text-secondary text-lg mb-12">
              Sistema de Gestão
            </Text>
            <View className="w-full max-w-sm">
              <TextInput
                className="w-full bg-white rounded-xl p-4 text-base mb-4 border border-gray-300"
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!loading}
              />
              <TextInput
                className="w-full bg-white rounded-xl p-4 text-base mb-4 border border-gray-300"
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                className={`rounded-xl p-4 items-center ${loading ? "bg-gray-400" : "bg-primary"}`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text className="text-white font-bold text-lg">
                  {loading ? "A Entrar..." : "Entrar"}
                </Text>
              </TouchableOpacity>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#0A2342"
                  className="mt-4"
                />
              )}
            </View>
            <Text className="mt-12 text-gray-400 text-xs">
              Desenvolvido por Dalton Martins
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
