# ADR-005: Native Kotlin Implementation for Android Sharing

## Context
ApplyAlert needs to act as a target for Android's built-in sharing functionality (Sharesheet). When a user shares text, a URL, an image, or a PDF from another app (e.g., Telegram, LinkedIn, Chrome, Gallery), ApplyAlert should launch, receive the payload, and feed it into the existing Import (Task 5) and Extraction (Task 6) pipelines.

We evaluated using a third-party React Native library (such as `react-native-share-menu` or `react-native-receive-sharing-intent`). However, many of these libraries:
- Are unmaintained or rely on deprecated Android APIs.
- Struggle with modern scoped storage and `content://` URI resolution for images and PDFs.
- Have known issues with Android lifecycle edge cases (e.g., cold start vs. warm start deduplication).
- Force the app into broad storage permissions (`MANAGE_EXTERNAL_STORAGE`).

## Decision
We decided to implement the share receiving logic natively in Kotlin, exposing a minimal `ShareModule` to React Native.

1. **Native Intent Handling**: `MainActivity` registers for `ACTION_SEND` and `ACTION_SEND_MULTIPLE`.
2. **Lifecycle Management**: The native code differentiates between cold starts (intent read during launch) and warm starts (`onNewIntent`), maintaining a flag to avoid duplicate processing.
3. **Storage Security**: For file shares (images, PDFs), the native code securely reads the file via Android's `ContentResolver` (which temporarily grants URI permission) and copies it to the app's internal cache directory. This avoids the need for broad storage permissions.
4. **Normalized JS Boundary**: `ShareModule` returns a normalized `SharedContent` object with typed content (TEXT, URL, IMAGE, PDF, MULTIPLE) and absolute file paths (`file://...`) pointing to the cached copies.

## Consequences
- **Positive**: Full control over intent lifecycle and file permissions. Clean, modern, scoped-storage-compliant Kotlin code. No bloated third-party dependencies.
- **Negative**: The native code must be maintained alongside the React Native codebase. Testing requires compiling the Android app and using ADB intents.

## Alternatives Considered
- `react-native-receive-sharing-intent`: Highly active but open issues regarding file paths and deduplication.
- `expo-sharing`: Primarily meant for *sharing out*, not receiving shares into a bare React Native project.
