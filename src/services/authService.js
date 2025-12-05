import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseconfig";

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await AsyncStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email
    }));

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export const checkUser = async () => {
  const data = await AsyncStorage.getItem("user");
  return data ? true : false;
};

export async function getUser() {
  const data = await AsyncStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

export async function logoutUser() {
  await AsyncStorage.removeItem("user");
}