import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from "expo-router";
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
import { db, storage } from "../firebase/firebaseconfig"; // adjust import if needed

type MessageType = {
  id: string;
  text: string;
  imageUrl?: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

export default function ChatScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Real-time listener for messages
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

      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  // Send message function
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        user: name,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const sendImage = async () => {
    try {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Izin akses galeri diperlukan!");
      return;
    }

    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated: use array instead of MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Compress to reduce upload size
    });

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets[0].uri;
    
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create unique filename
    const filename = `chat-images/${Date.now()}-${name}.jpg`;
    const storageRef = ref(storage, filename);

    // Upload to Firebase Storage
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Save message with image URL to Firestore
    await addDoc(collection(db, "messages"), {
      imageUrl: downloadURL,
      user: name,
      createdAt: serverTimestamp(),
    });

    console.log("Image sent successfully!");
  } catch (error) {
    console.error("Error sending image:", error);
    alert("Gagal mengirim gambar. Coba lagi.");
  }
};

  // Render each message
const renderItem = ({ item }: { item: MessageType }) => (
  <View
    style={[
      styles.msgBox,
      item.user === name ? styles.myMsg : styles.otherMsg,
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

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  messageImage: {  // ← ADD THIS
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
    backgroundColor: "#c68235ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight : 5
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
