import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";

// Auth
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data; // ✅ Extrai os dados corretamente
    },
  });
};

// Tables
export const useTables = () => {
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await apiClient.get("/tables");
      return response.data;
    },
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch(`/tables/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["tables"]),
  });
};

// Menu
export const useMenu = () => {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await apiClient.get("/menu");
      return response.data;
    },
  });
};

// Orders
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await apiClient.post("/orders", orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
      queryClient.invalidateQueries(["kitchenOrders"]);
    },
  });
};

export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ["kitchenOrders"],
    queryFn: async () => {
      const response = await apiClient.get("/orders/kitchen");
      return response.data;
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch(`/orders/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["kitchenOrders"]),
  });
};
