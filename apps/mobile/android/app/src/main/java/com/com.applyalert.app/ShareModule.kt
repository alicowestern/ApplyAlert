package com.applyalert.app

import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class ShareModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var initialIntentProcessed = false

    override fun getName(): String {
        return "ShareModule"
    }

    @ReactMethod
    fun getInitialShare(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.resolve(null)
            return
        }

        val intent = currentActivity.intent
        if (intent != null && isShareIntent(intent) && !initialIntentProcessed) {
            initialIntentProcessed = true
            val payload = extractPayload(intent)
            promise.resolve(payload)
        } else {
            promise.resolve(null)
        }
    }

    fun handleIntent(intent: Intent) {
        if (isShareIntent(intent)) {
            val payload = extractPayload(intent)
            sendEvent("onShareReceived", payload)
        }
    }

    private fun isShareIntent(intent: Intent): Boolean {
        val action = intent.action
        return Intent.ACTION_SEND == action || Intent.ACTION_SEND_MULTIPLE == action
    }

    private fun extractPayload(intent: Intent): WritableMap {
        val payload = Arguments.createMap()
        val action = intent.action
        val type = intent.type

        payload.putString("sourcePackage", intent.getPackage() ?: intent.sender ?: "")

        if (Intent.ACTION_SEND == action) {
            if ("text/plain" == type) {
                val text = intent.getStringExtra(Intent.EXTRA_TEXT)
                if (text != null) {
                    payload.putString("type", "TEXT")
                    payload.putString("text", text)
                    return payload
                }
            } else if (type != null) {
                val uri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                if (uri != null) {
                    val fileArray = Arguments.createArray()
                    val fileMap = processFileUri(uri, type)
                    if (fileMap != null) {
                        fileArray.pushMap(fileMap)
                        payload.putString("type", resolveContentType(type))
                        payload.putArray("files", fileArray)
                        return payload
                    }
                }
            }
        } else if (Intent.ACTION_SEND_MULTIPLE == action && type != null) {
            val uris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
            if (uris != null && uris.isNotEmpty()) {
                val fileArray = Arguments.createArray()
                for (uri in uris) {
                    val fileMap = processFileUri(uri, type)
                    if (fileMap != null) {
                        fileArray.pushMap(fileMap)
                    }
                }
                payload.putString("type", "MULTIPLE")
                payload.putArray("files", fileArray)
                return payload
            }
        }

        payload.putString("type", "UNKNOWN")
        return payload
    }

    private fun resolveContentType(mimeType: String): String {
        return when {
            mimeType.startsWith("image/") -> "IMAGE"
            mimeType == "application/pdf" -> "PDF"
            else -> "UNKNOWN"
        }
    }

    private fun processFileUri(uri: Uri, mimeType: String): WritableMap? {
        val contentResolver = reactContext.contentResolver
        val fileMap = Arguments.createMap()

        // Securely read filename and size using ContentResolver
        var fileName = "shared_file_${UUID.randomUUID()}"
        var size = 0L

        if (uri.scheme == "content") {
            val cursor = contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)
                    if (nameIndex != -1) fileName = it.getString(nameIndex)
                    if (sizeIndex != -1) size = it.getLong(sizeIndex)
                }
            }
        } else if (uri.scheme == "file") {
            val file = File(uri.path ?: "")
            fileName = file.name
            size = file.length()
        }

        // We copy the file to our app's cache directory so it's accessible by React Native
        // without requesting MANAGE_EXTERNAL_STORAGE.
        try {
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            val cacheDir = File(reactContext.cacheDir, "shared_uploads")
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            val tempFile = File(cacheDir, fileName)
            val outputStream = FileOutputStream(tempFile)

            inputStream.copyTo(outputStream)
            
            inputStream.close()
            outputStream.close()

            fileMap.putString("uri", "file://${tempFile.absolutePath}")
            fileMap.putString("mimeType", mimeType)
            fileMap.putString("fileName", fileName)
            fileMap.putDouble("size", size.toDouble())

            return fileMap
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
