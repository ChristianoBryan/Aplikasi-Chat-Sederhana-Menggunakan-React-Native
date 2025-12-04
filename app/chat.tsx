import { useLocalSearchParams } from "expo-router";
import {
    addDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { messagesCollection } from "../firebase/firebaseconfig";

type MessageType = {
  id: string;
  text: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

export default function ChatScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });
      setMessages(list);
    });
    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    await addDoc(messagesCollection, {
      text: message,
      user: name,
      createdAt: serverTimestamp(),
    });
    setMessage("");
  };

  const renderItem = ({ item }: { item: MessageType }) => (
    <View
      style={[
        styles.msgBox,
        item.user === name ? styles.myMsg : styles.otherMsg,
      ]}
    >
      <Text style={styles.sender}>{item.user}</Text>
      <Text style={styles.msgText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <FlatList
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
        />
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
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});