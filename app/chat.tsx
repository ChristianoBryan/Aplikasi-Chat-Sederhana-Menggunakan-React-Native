import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db, storage } from "../firebase/firebaseconfig";
import { getUser, logoutUser } from "../src/services/authService";

type MessageType = {
  id: string;
  text?: string;
  imageUrl?: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

export default function ChatScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getUser();
      console.log("Loaded user:", user);
      
      if (user && user.email) {
        const displayName = user.email.split('@')[0];
        console.log("Display name:", displayName);
        setCurrentUser(displayName);
      } else {
        console.error("No user found");
        alert("Tidak ada user login. Silakan login ulang.");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Error loading user data");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const messagesCollectionRef = collection(db, "messages");
    const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });
      setMessages(list);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  // Send
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    if (!currentUser) {
      alert("Menunggu data user... Coba lagi");
      return;
    }

    console.log("Sending message as:", currentUser);

    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        user: currentUser,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        alert("Gagal mengirim pesan: " + errorMessage);
      }
  };

  const sendImage = async () => {
    if (!currentUser) {
      alert("Menunggu data user...");
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert("Izin akses galeri diperlukan!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filename = `chat-images/${Date.now()}-${currentUser}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "messages"), {
        imageUrl: downloadURL,
        user: currentUser,
        createdAt: serverTimestamp(),
      });

      console.log("Image sent successfully!");
    } catch (error) {
      console.error("Error sending image:", error);
      alert("Gagal mengirim gambar. Coba lagi.");
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => (
    <View
      style={[
        styles.msgBox,
        item.user === currentUser ? styles.myMsg : styles.otherMsg,
      ]}
    >
      <Text style={styles.sender}>{item.user}</Text>
      
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.messageImage}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.msgText}>{item.text}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tidak ada user login</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.errorButtonText}>Kembali ke Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const handleLogout = async () => {
  try {
    await logoutUser();
    router.replace("/login");
  } catch (error) {
    console.error("Error logging out:", error);
    alert("Gagal logout");
  }
};
  return (
    <>
    <Stack.Screen 
      options={{ 
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ marginRight: 15 }}
          >
            <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>
              Logout
            </Text>
          </TouchableOpacity>
        ),
      }} 
    />
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendImageButton} onPress={sendImage}>
          <Text style={styles.sendButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  errorButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messageList: {
    padding: 10,
  },
  msgBox: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: "80%",
  },
  myMsg: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#E9E9EB",
    alignSelf: "flex-start",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
    color: "#666",
  },
  msgText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendImageButton: {
    backgroundColor: "#0e71f2ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 5
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});