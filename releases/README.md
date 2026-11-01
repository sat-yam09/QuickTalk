# QuickTalk APK Releases & Downloads

Download the latest version of QuickTalk for native Android without requiring Google Play Store or third-party store accounts.

---

## 🚀 Direct Download Links

| Version | Type | Download Link | Notes |
|---|---|---|---|
| **v1.0.0 (Latest)** | Debug / Unsigned Release APK | [Download from GitHub Releases](https://github.com/sat-yam09/QuickTalk/releases/latest) | Plug-and-play APK for Android 9.0 to 15+ |
| **Direct Workflow Artifacts** | CI Auto-Build | [Download Latest CI APK Artifact](https://github.com/sat-yam09/QuickTalk/actions) | Auto-built on every commit via GitHub Actions |

---

## 📲 How to Install the APK on Your Android Device

1. Download the `app-debug.apk` directly to your phone from the [Releases page](https://github.com/sat-yam09/QuickTalk/releases) or transfer it via USB / Quick Share / SD Card.
2. Tap the APK file in your phone's File Manager / Downloads.
3. If prompted: **"Install unknown apps"**, toggle **"Allow from this source"**.
4. Tap **Install** and open **QuickTalk**.
5. Grant Bluetooth, Nearby Devices, and Location (required by Android OS for BLE discovery) permissions when prompted.
6. Turn on Wi-Fi and Bluetooth on both phones. No cellular data, SIM card, or Wi-Fi router internet connection is needed!

---

## 🛠 Self-Building the APK

If you prefer building the APK yourself using Android Studio or command-line Gradle:

```bash
cd android
./gradlew assembleDebug
```
The generated APK will be available at:
`android/app/build/outputs/apk/debug/app-debug.apk`
