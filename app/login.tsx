import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [name, setName] = useState<string>("");
  const router = useRouter();

  const handleLogin = () => {
    if (!name.trim()) return;
    router.push({
      pathname: "/chat",
      params: { name }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Masukkan Nama Anda</Text>
      <TextInput
        style={styles.input}
        placeholder="Nama kamu"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Masuk Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});