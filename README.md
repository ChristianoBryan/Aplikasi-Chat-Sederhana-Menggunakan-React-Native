## (Project dibuat menggunakan expo, dikarenakan terdapat banyak sekali masalah saat set up react native cli, dan juga waktu yang mepet dengan deadline.)

# Aplikasi Chat Menggunakan React Native

## Proyek ini adalah aplikasi chat real-time yang dibangun menggunakan Expo (React Native) dan Firebase Firestore. Pengguna dapat mengirim serta menerima pesan secara instan. Aplikasi menggunakan listener real-time dari Firestore untuk memperbarui daftar pesan tanpa perlu refresh.

## Fitur:

- Pengiriman pesan secara real-time.
- Mendengarkan perubahan data menggunakan onSnapshot.
- Menyimpan pesan ke koleksi "messages" di Firestore.
- Auto scroll ke pesan paling bawah saat ada pesan baru.
- Tampilan sederhana menggunakan komponen React Native.
- Identitas pengirim diambil dari parameter Expo Router.

## Struktur Proyek:

- ChatScreen.tsx berisi logika utama chat.
- firebaseconfig.ts berisi konfigurasi Firebase.
- Komponen React Native seperti FlatList, TextInput, dan TouchableOpacity digunakan untuk UI.

## Teknologi yang Digunakan:

- React Native
- Expo Router
- Firebase Firestore
- TypeScript
- React Hooks

## Cara Instalasi:

- Clone repository project.
- Jalankan perintah instalasi:
    npm install
- Atur Firebase dengan membuat file firebaseconfig.ts di dalam folder firebase.
- Masukkan konfigurasi Firebase seperti apiKey, authDomain, dan projectId sesuai Firebase milik Anda.

## Menjalankan Aplikasi:

- Jalankan perintah:
    npx expo start

Aplikasi dapat dijalankan di Android, iOS, maupun Web