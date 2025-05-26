import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, push } from "firebase/database";
import * as ImageManipulator from "expo-image-manipulator";
import { database } from "@/FirebaseConfig";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Pest = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  useEffect(() => {
    const debugUserData = async () => {
      const data = await AsyncStorage.getItem("userData");
      console.log("UserData from AsyncStorage:", data);
    };
    debugUserData();
  }, []);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error("Error reading user data:", err);
      return null;
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    formData.append("upload_preset", "unsigned_preset");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dmu3xqmax/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      console.log("Upload success:", data);
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return null;
    }
  };

  const detectDiseaseWithRoboflow = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    try {
      const response = await fetch(
        "https://detect.roboflow.com/ricecropdisease/3?api_key=jFWG3CvrZaTABjzVZ7IH",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Roboflow result:", data);
      const detected = data.predictions?.[0]?.class || "No disease detected";
      setDetectionResult(detected);
      return detected;
    } catch (error) {
      console.error("Roboflow detection failed:", error);
      setDetectionResult("Detection failed");
      return null;
    }
  };

  const saveImageUrlToFirebase = async (url, detectedClass) => {
    const user = await getCurrentUser();
    if (!user) {
      console.error("No user found. Can't save.");
      return;
    }

    // const userId = user.userId;
    const userId = await AsyncStorage.getItem('userId');

    const historyRef = ref(database, `users/${userId}/pestHistory`);

    await push(historyRef, {
      imageUrl: url,
      uploadedAt: new Date().toISOString(),
      diagnosis: detectedClass || "Unknown",
    });
  };

  const handleImage = async (result) => {
    if (!result.canceled) {
      let imageUri = result.assets[0].uri;
      console.log("Selected image URI:", imageUri);

      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      imageUri = compressedImage.uri;
      setImage(imageUri);
      setUploading(true);

      const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
      if (cloudinaryUrl) {
        const detectedClass = await detectDiseaseWithRoboflow(imageUri);
        await saveImageUrlToFirebase(cloudinaryUrl, detectedClass);
        Alert.alert("Success", "Image uploaded and saved!");
      } else {
        Alert.alert("Upload Failed", "Could not upload image.");
      }

      setUploading(false);
    }
  };

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log("Camera permission status:", status);
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      await handleImage(result);
    } catch (err) {
      console.error("Error in takePicture:", err);
      Alert.alert("Error", "Something went wrong when taking picture.");
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Media library permission status:", status);
      if (status !== "granted") {
        Alert.alert("Permission Required", "Media access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      await handleImage(result);
    } catch (err) {
      console.error("Error in pickImage:", err);
      Alert.alert("Error", "Something went wrong when picking image.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <View style={{ marginTop: 20, padding: 15 }}>
          <Text style={styles.healText}>Heal your Crop</Text>
          <View style={styles.healSection}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <View style={styles.iconBox}>
                <Image source={require("../assets/Image.png")} />
                <Text>Take a picture</Text>
              </View>
              <Image source={require("../assets/Arrow.png")} />
              <View style={styles.iconBox}>
                <Image source={require("../assets/Result.png")} />
                <Text>See diagnosis</Text>
              </View>
              <Image source={require("../assets/Arrow.png")} />
              <View style={styles.iconBox}>
                <Image source={require("../assets/Bottle.png")} />
                <Text>Get Solution</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.takePictureButton}
              onPress={takePicture}
            >
              <Text style={styles.buttonText}>Take a picture</Text>
            </TouchableOpacity>

            <Text onPress={pickImage} style={styles.uploadText}>
              Upload from gallery
            </Text>

            {uploading && (
              <ActivityIndicator
                size="large"
                color={Colors.secondary}
                style={{ marginTop: 10 }}
              />
            )}
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}

            {detectionResult && (
              <Text style={styles.diagnosisText}>
                Diagnosis: {detectionResult}
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  healText: {
    fontSize: 16,
    marginBottom: 10,
  },
  healSection: {
    backgroundColor: Colors.ash2,
    borderRadius: 10,
    padding: 20,
  },
  iconBox: {
    alignItems: "center",
    margin: 10,
  },
  takePictureButton: {
    marginTop: 10,
    backgroundColor: Colors.secondary,
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  uploadText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 5,
  },
  imagePreview: {
    marginTop: 10,
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  diagnosisText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
});

export default Pest;
