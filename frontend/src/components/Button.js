import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { theme } from "../theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}) {
  const { width } = useWindowDimensions();
  const bgColor = disabled
    ? "#ccc"
    : variant === "primary"
      ? theme.colors.primary
      : theme.colors.secondary;
  const fontSize = width > 600 ? 18 : 16;
  const paddingV = width > 600 ? 16 : 12;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor, paddingVertical: paddingV },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { fontSize }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  text: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
