import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../store/auth-store";
import LoginScreen from "../screens/LoginScreen";
import TablesScreen from "../screens/TablesScreen";
import OrderScreen from "../screens/OrderScreen";
import TableOrdersScreen from "../screens/TableOrdersScreen";
import KitchenScreen from "../screens/KitchenScreen";
import AdminScreen from "../screens/AdminScreen";
import ManageTablesScreen from "../screens/ManageTablesScreen";
import ManageProductsScreen from "../screens/ManageProductsScreen";
import ManageUsersScreen from "../screens/ManageUsersScreen";
import { theme } from "../theme";

const Stack = createNativeStackNavigator();

function LogoutButton() {
  const { logout } = useAuthStore();
  return (
    <TouchableOpacity onPress={() => logout()} style={{ marginRight: 16 }}>
      <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
        Sair
      </Text>
    </TouchableOpacity>
  );
}

// Navegador para o CHEF (começa na cozinha)
function ChefNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "#FFF",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Kitchen"
        component={KitchenScreen}
        options={({ navigation }) => ({
          title: "Painel Cozinha",
          headerRight: () => <LogoutButton />,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Tables")}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}>
                🗺️ Mesas
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Tables"
        component={TablesScreen}
        options={({ navigation }) => ({
          title: "Mesas - Casa o Santo",
          headerRight: () => <LogoutButton />,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Kitchen")}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}>
                🍳 Cozinha
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Order"
        component={OrderScreen}
        options={{ title: "Novo Pedido" }}
      />
      <Stack.Screen
        name="TableOrders"
        component={TableOrdersScreen}
        options={{ title: "Pedidos da Mesa" }}
      />
    </Stack.Navigator>
  );
}

// Navegador para os outros cargos (começa nas mesas)
function StaffNavigator() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 500;
  const fontSize = isSmallScreen ? 11 : 13;
  const buttonSpacing = isSmallScreen ? 6 : 8;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "#FFF",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Tables"
        component={TablesScreen}
        options={({ navigation }) => ({
          title: "Mesas - Casa o Santo",
          headerRight: () => <LogoutButton />,
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                marginRight: 60, // Dá espaço para o botão Sair
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  flex: 1,
                }}
                contentContainerStyle={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
                scrollEnabled={true}
                bounces={true}
                showsVerticalScrollIndicator={false}
              >
                {(user.role === "ADMIN" || user.role === "MANAGER") && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Kitchen")}
                      style={{
                        marginRight: buttonSpacing,
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                        minHeight: 40,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "bold",
                          fontSize,
                          includeFontPadding: false,
                        }}
                        numberOfLines={1}
                        allowFontScaling={true}
                      >
                        🍳 Cozinha
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Admin")}
                      style={{
                        marginRight: buttonSpacing,
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                        minHeight: 40,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "bold",
                          fontSize,
                          includeFontPadding: false,
                        }}
                        numberOfLines={1}
                        allowFontScaling={true}
                      >
                        📊 Dashboard
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("ManageUsers")}
                      style={{
                        marginRight: buttonSpacing,
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                        minHeight: 40,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "bold",
                          fontSize,
                          includeFontPadding: false,
                        }}
                        numberOfLines={1}
                        allowFontScaling={true}
                      >
                        👥 Utilizadores
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("ManageProducts")}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                        minHeight: 40,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "bold",
                          fontSize,
                          includeFontPadding: false,
                        }}
                        numberOfLines={1}
                        allowFontScaling={true}
                      >
                        📦 Produtos
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="Kitchen"
        component={KitchenScreen}
        options={{ title: "Painel Cozinha" }}
      />
      <Stack.Screen
        name="Order"
        component={OrderScreen}
        options={{ title: "Novo Pedido" }}
      />
      <Stack.Screen
        name="TableOrders"
        component={TableOrdersScreen}
        options={{ title: "Pedidos da Mesa" }}
      />
      <Stack.Screen
        name="Admin"
        component={AdminScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{ title: "Gerir Utilizadores" }}
      />
      <Stack.Screen
        name="ManageTables"
        component={ManageTablesScreen}
        options={{ title: "Gerir Mesas" }}
      />
      <Stack.Screen
        name="ManageProducts"
        component={ManageProductsScreen}
        options={{ title: "Gerir Produtos" }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === "CHEF" ? (
        <Stack.Screen name="ChefRoot" component={ChefNavigator} />
      ) : (
        <Stack.Screen name="StaffRoot" component={StaffNavigator} />
      )}
    </Stack.Navigator>
  );
}
