import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useAuthStore } from "../store/auth-store";
import apiClient from "../api/client";

export default function AdminScreen({ navigation }) {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isSmall = width < 600;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeTables: 0,
    totalProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [t, m, o] = await Promise.all([
        apiClient.get("/tables"),
        apiClient.get("/menu"),
        apiClient.get("/orders/kitchen"),
      ]);
      const tables = t.data || [];
      const cats = m.data || [];
      const orders = o.data || [];
      const today = new Date().toDateString();
      const todayOrders = orders.filter(
        (or) => new Date(or.createdAt).toDateString() === today,
      );
      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + parseFloat(o.total), 0),
        activeTables: tables.filter((tb) => tb.status !== "FREE").length,
        totalProducts: cats.flatMap((c) => c.products).length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((s, o) => s + parseFloat(o.total), 0),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F9FA",
        }}
      >
        <ActivityIndicator size="large" color="#0A2342" />
      </View>
    );
  }

  const Card = ({ icon, value, label, bg }) => (
    <View
      style={{
        flex: 1,
        minHeight: 120,
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 8 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#FFF",
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.9)",
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );

  const lineStyle = {
    flexDirection: isSmall ? "column" : "row",
    gap: 12,
    marginBottom: 12,
    alignSelf: "center",
    width: "100%",
    maxWidth: 900,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8F9FA" }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
      }}
    >
      {/* Título */}
      <View
        style={{
          alignSelf: "center",
          width: "100%",
          maxWidth: 900,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#0A2342",
            marginBottom: 4,
          }}
        >
          📊 Dashboard
        </Text>
        <Text style={{ fontSize: 16, color: "#666" }}>
          Bem-vindo, {user?.name}
        </Text>
      </View>

      {/* Linha 1 */}
      <View style={lineStyle}>
        <Card
          icon="📦"
          value={stats.totalOrders}
          label="Pedidos Ativos"
          bg="#3498db"
        />
        <Card
          icon="💰"
          value={`€${stats.totalRevenue.toFixed(2)}`}
          label="Receita Pendente"
          bg="#2ecc71"
        />
        <Card
          icon="🪑"
          value={stats.activeTables}
          label="Mesas Ocupadas"
          bg="#e74c3c"
        />
      </View>

      {/* Linha 2 */}
      <View style={lineStyle}>
        <Card
          icon="📅"
          value={stats.todayOrders}
          label="Pedidos Hoje"
          bg="#f39c12"
        />
        <Card
          icon="💵"
          value={`€${stats.todayRevenue.toFixed(2)}`}
          label="Receita Hoje"
          bg="#9b59b6"
        />
        <Card
          icon="🍽️"
          value={stats.totalProducts}
          label="Produtos no Menu"
          bg="#1abc9c"
        />
      </View>

      {/* Atalhos */}
      <View
        style={{
          alignSelf: "center",
          width: "100%",
          maxWidth: 900,
          marginTop: 24,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#0A2342",
            marginBottom: 16,
          }}
        >
          ⚡ Atalhos Rápidos
        </Text>
      </View>
      <View style={lineStyle}>
        {[
          { icon: "🪑", label: "Gerir Mesas", nav: "ManageTables" },
          { icon: "📦", label: "Gerir Produtos", nav: "ManageProducts" },
          { icon: "🍳", label: "Cozinha", nav: "Kitchen" },
          { icon: "🗺️", label: "Mapa de Mesas", nav: "Tables" },
        ].map((s) => (
          <TouchableOpacity
            key={s.nav}
            style={{
              flex: 1,
              backgroundColor: "#FFF",
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#EEE",
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => navigation.navigate(s.nav)}
          >
            <Text style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#0A2342",
                textAlign: "center",
              }}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Créditos */}
      <View
        style={{
          alignSelf: "center",
          width: "100%",
          maxWidth: 900,
          marginTop: 32,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "#EEE",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#0A2342" }}>
          Desenvolvido por Dalton Martins
        </Text>
        <Text style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
          Casa o Santo de ANIBAL PORTUGAL GALVÃO
        </Text>
      </View>
    </ScrollView>
  );
}