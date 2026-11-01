# QuickTalk — Offline Nearby Peer-to-Peer Messenger

<p align="center">
  <img src="https://raw.githubusercontent.com/sat-yam09/QuickTalk/main/src/assets/logo.png" alt="QuickTalk Logo" width="120" onerror="this.src='https://api.iconify.design/lucide:zap.svg?color=%23000000'"/>
</p>

<h3 align="center">
  Inspiration from Quick Share to make a chatting application without internet for quick talk with file sharing inside the chat.
</h3>

<p align="center">
  <a href="https://github.com/sat-yam09/QuickTalk/releases/latest"><img src="https://img.shields.io/badge/Release%20APK-Download-black?style=for-the-badge&logo=android" alt="Download APK"></a>
  <a href="https://github.com/sat-yam09/QuickTalk/actions"><img src="https://img.shields.io/badge/CI%20Build-Passing-black?style=for-the-badge&logo=githubactions" alt="Build Status"></a>
  <img src="https://img.shields.io/badge/Platform-Android%209.0%2B%20(API%2028%2B)-black?style=for-the-badge&logo=android" alt="Android 9+">
  <img src="https://img.shields.io/badge/Stack-Kotlin%202.0%20%7C%20Compose-black?style=for-the-badge&logo=kotlin" alt="Kotlin Compose">
  <img src="https://img.shields.io/badge/Design-Minimal%20Black%20%26%20White-black?style=for-the-badge" alt="B&W Theme">
</p>

---

## ⚡ Product Vision

**QuickTalk** is a privacy-first, true native Android application born from the simplicity and speed of **Google Quick Share**. It allows two nearby Android users to discover each other, establish an authenticated high-speed Wi-Fi Direct / Bluetooth connection, and chat with instant raw file and photo sharing — completely offline.

### What Makes QuickTalk Unique?
- 🚫 **No Internet Required:** Works off-grid in basements, flights, outdoor events, natural disasters, or secure facilities.
- 🚫 **No SIM or Phone Numbers:** Zero account signup, zero SMS verification, zero tracking.
- 🚫 **No Cloud Servers:** Direct device-to-device transport via Google Nearby Connections (BLE + Wi-Fi Direct).
- 📁 **Lossless File Sharing Inside Chat:** Send high-res original photos, documents, and videos directly inside chat bubbles without compression.
- ⚡ **Instant QR Camera Handshake:** Scan the other person's screen to connect in 1 second flat.
- ⏱ **Disappearing Ephemeral Messages:** Self-destruct timers (5s, 10s, 30s, 1m) for ultra-confidential conversations.
- 🖤 **Radical Minimalist Design:** Clean Black & White monochrome aesthetic paired with Satoshi / General Sans typography and subtle haptics.

---

## 📲 Download & Install APK

You can download and run QuickTalk immediately on your physical Android phone:

### 1. Download Latest Release APK
👉 **[Download QuickTalk APK (GitHub Releases)](https://github.com/sat-yam09/QuickTalk/releases/latest)**

👉 **[Download Automated CI Artifacts (GitHub Actions)](https://github.com/sat-yam09/QuickTalk/actions)**

### 2. Installation Instructions (Android 9.0 to Android 15+)
1. Download `app-debug.apk` onto your Android phone.
2. Open your device's **Files / Downloads** app and tap the downloaded `.apk`.
3. If prompted: **"For your security, your phone is not allowed to install unknown apps from this source"**, tap **Settings** and enable **"Allow from this source"**.
4. Tap **Install** and launch **QuickTalk**.
5. Grant the nearby Bluetooth and Location permissions when requested (required by Android OS for BLE discovery).
6. Enable Wi-Fi and Bluetooth on both phones. You are ready to chat!

---

## 📱 Features & Highlights

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              QUICKTALK ARCHITECTURE                          │
│                                                                             │
│   [ Device A ]                                               [ Device B ]   │
│   ┌───────────────┐        Bluetooth Low Energy (BLE)       ┌───────────────┐ │
│   │ Advertising   │ < - - - - - - Discovery - - - - - - - - >│ Scanning      │ │
│   │ Service UUID  │          Mutual PIN Verification        │ Service UUID  │ │
│   └───────┬───────┘                                         └───────┬───────┘ │
│           │                High-Bandwidth Wi-Fi Direct              │         │
│           └─────────────────────────────────────────────────────────┘         │
│             💬 Real-time Text Messages                                        │
│             📁 Raw Lossless File Transfer (Payload.File / Bytes)              │
│             ⏱ Self-Destruct Timers                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Discovery & Authentication
- **Dual Advertising & Scanning:** Both phones can discover and be discovered simultaneously.
- **6-Digit Token Verification:** Prevents Man-in-the-Middle (MITM) attacks by displaying a matching authentication token on both screens prior to acceptance.
- **Fast QR Handshake:** Generate an encrypted QR code containing endpoint tokens for zero-search pairing via camera scan.

### 2. Chat Experience & File Sharing
- **In-Chat Lossless File Transfer:** Share images and documents directly within the chat stream. Files are transferred over Wi-Fi Direct sockets at speeds up to 40+ MB/s without third-party compression.
- **Message Delivery States:** Real-time feedback (`Sending`, `Sent`, `Delivered`, `Failed`).
- **Smart Auto-Scroll Lock:** Maintains pin-to-bottom behavior on incoming messages unless user has manually scrolled back to review conversation history.
- **Tactile Feedback:** Native Android haptic feedback tuned to standard button taps, connection events, and message transmissions.

### 3. Privacy & Local Storage
- **Room Database:** All conversations and message histories are persisted locally in SQLite (`AppDatabase.kt`).
- **Temporary Ephemeral Identities:** Customizable handles with random generator; no email, password, or device serials are ever stored or broadcasted.
- **Disappearing Messages:** Automatically purged from UI and SQLite database when the timer expires.

---

## 🏗 Repository Structure

```
QuickTalk/
├── .github/
│   └── workflows/
│       └── build-apk.yml           # GitHub Actions automated APK build CI/CD
├── android/                        # Genuine Native Android Application
│   ├── app/
│   │   ├── build.gradle.kts        # Android application build configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Permissions (BLE, Wi-Fi Direct, Android 9-15)
│   │       └── java/com/neartalk/
│   │           ├── MainActivity.kt # Single Activity Jetpack Compose host
│   │           ├── data/           # Room Database, Entities, DAOs, Repositories
│   │           │   ├── local/      # AppDatabase, Entities, Daos
│   │           │   └── repository/ # UserRepository, ChatRepository
│   │           ├── nearby/         # Google Nearby Connections Engine & Permissions
│   │           ├── ui/             # Jetpack Compose Material 3 Screens & Components
│   │           │   ├── screens/    # WelcomeScreen, HomeScreen, ChatScreen, Settings
│   │           │   ├── components/ # Minimalist B&W Components & Modals
│   │           │   └── theme/      # Satoshi/General Sans typography, Color tokens
│   │           └── viewmodel/      # MainViewModel & StateFlow architecture
│   ├── gradle/
│   │   └── libs.versions.toml      # Dependency catalog
│   ├── build.gradle.kts            # Root Gradle project configuration
│   ├── settings.gradle.kts
│   ├── gradlew                     # Gradle wrapper (Linux/macOS)
│   └── gradlew.bat                 # Gradle wrapper (Windows)
├── releases/
│   └── README.md                   # Release documentation & direct download links
├── src/                            # Web & interactive UI preview (React 19 + TypeScript)
│   ├── components/                 # Minimalist UI screens & simulation components
│   ├── services/                   # Nearby mock protocol, QR service, SQLite bridge
│   └── utils/                      # Haptics, Satoshi fonts, CSS styling
├── package.json
└── README.md                       # Main documentation
```

---

## 🛠 Local Build Instructions

### Prerequisites
- Android Studio Ladybug / Koala or newer, OR JDK 17+ and Android SDK Command-line Tools.
- Android device running Android 9 (API 28) or higher with Bluetooth and Wi-Fi capabilities.

### Build via Command Line
```bash
# Clone the repository
git clone https://github.com/sat-yam09/QuickTalk.git
cd QuickTalk/android

# Build Debug APK
./gradlew assembleDebug

# The APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Install onto Connected Phone
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 Testing on Two Physical Android Devices

1. Install `app-debug.apk` onto **Device 1** and **Device 2**.
2. Place both devices within 10 meters of each other.
3. Turn **Wi-Fi** and **Bluetooth** ON on both devices (no internet or router connection is required).
4. Launch **QuickTalk** on both devices and enter a nickname (e.g., *Alex* and *Jordan*).
5. On **Device 1**, tap **"Start Discovery"**.
6. On **Device 2**, tap **"Start Discovery"**.
7. In under 3 seconds, *Jordan* will appear in *Alex's* nearby list. Tap **Connect**.
8. Both phones will display a matching 6-digit verification code. Tap **Accept** on both.
9. Start chatting, sharing high-resolution photos, or exchanging documents offline!

---

## 🔒 Security & Privacy Architecture

- **Zero Cloud Footprint:** No telemetry, Firebase, tracking analytics, or advertising SDKs.
- **Payload Encryption:** Traffic between devices is encrypted via Nearby Connections standard TLS-like peer authentication.
- **Physical Verification:** 6-digit confirmation prompt ensures you only connect with the person in front of you.

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE). QuickTalk is free, open-source, and dedicated to private off-grid communication.
