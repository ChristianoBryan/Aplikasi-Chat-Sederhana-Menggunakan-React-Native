import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveChatToLocal = async (messages) => {
  try {
    await AsyncStorage.setItem("chatHistory", JSON.stringify(messages));
  } catch (e) {
    console.log("Error saving:", e);
  }
};

export const loadChatFromLocal = async () => {
  try {
    const json = await AsyncStorage.getItem("chatHistory");
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.log("Error loading:", e);
    return [];
  }
};
