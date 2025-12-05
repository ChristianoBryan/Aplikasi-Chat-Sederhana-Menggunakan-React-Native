import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { checkUser, loginUser, logoutUser } from "../src/services/authService";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
      const verifyUser = async () => {
        const isLoggedIn = await checkUser();
        setLoggedIn(isLoggedIn);
        if (isLoggedIn) {
          router.replace("/chat");
        }
      };
      verifyUser();
    }, []);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    console.log("Attempt login", cleanEmail, password);

    if (!cleanEmail || !password) {
      alert("Email dan password wajib diisi");
      return;
    }
    if (!cleanEmail.includes("@")) {
      alert("Email tidak valid");
      return;
    }

    try {
      console.log("Mencoba login:", cleanEmail, password);
      const user = await loginUser(cleanEmail, password);
      console.log("Login success:", user);
      alert(`Login berhasil sebagai ${user.email}`);
      setEmail("");
      setPassword("");
      router.replace("/chat");
    } catch (e: unknown) {
      console.log("Login error:", e);
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      alert(`Gagal login: ${msg}`);
    }
  };
  const handleLogout = async () => {
    try {await logoutUser();
      setLoggedIn(false);
      alert("Logout berhasil");
    } catch (e: unknown) {
      console.log("Logout error:", e);
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      alert(`Gagal logout: ${msg}`);
    }
  }

  return (
    <View style={{ padding: 20, maxWidth: 400, }}>
      <Text style={{fontFamily: "Segoe UI", fontSize: 50, textAlign:"center", }}>Halaman Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 25, marginTop: 30, borderWidth: 2, padding: 5, color:"black", backgroundColor:"#c9ecf9ff", borderRadius: 5}}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 25, borderWidth: 2, padding: 5, color:"black", backgroundColor:"#d1e8f1ff", borderRadius: 5}}
      />
      <View style={{ marginBottom: 10 }}>
        <Button title="Login" onPress={handleLogin} />
      </View>
      <Button title="Logout" onPress={handleLogout} />
      <Text style={{ marginTop: 10, color:"black" }}>{loggedIn ? "Anda telah login" : "Anda belum login!"}</Text>
    </View>
  );
}