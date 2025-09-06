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
  ScrollView,
  Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, push } from "firebase/database";
import * as ImageManipulator from "expo-image-manipulator";
import { database } from "@/FirebaseConfig";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import pestRule from '../pestRule.json';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Constants from 'expo-constants'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Pest = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [matchedRule, setMatchedRule] = useState(null);
 const [expoPushToken, setExpoPushToken] = useState('');
  
const [notificationListener, setNotificationListener] = useState(null);
  const [responseListener, setResponseListener] = useState(null);

  useEffect(() => {
    const debugUserData = async () => {
      const data = await AsyncStorage.getItem("userData");
      console.log("UserData from AsyncStorage:", data);
    };
    debugUserData();
  }, []);

 useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log('Push token:', token);
      }
    });

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('pest-detection', {
        name: 'Pest Detection',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

  // Listen for incoming notifications
    const notifListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    const respListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap - you can navigate to specific screens here
    });

    return () => {
      // Notifications.removeNotificationSubscription(notifListener);
      // Notifications.removeNotificationSubscription(respListener);
    
      notifListener.remove();
      respListener.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission not granted', 'Failed to get push token for push notification!');
        return;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo push token:', token);
      } catch (e) {
        console.error('Error getting push token:', e);
        token = `${Device.osName} ${Device.modelName}`;
      }
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    return token;
  }

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

  const sendPestDetectionNotification = async (pestName, rule) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${pestName} Detected! 🦗`,
          body: 'Tap to view treatment recommendations and control methods.',
          data: { 
            pestName: pestName,
            ruleId: rule?.id || null,
            screen: 'PestDetails'
          },
        },
        trigger: null, // Send immediately
      });
      
      console.log('Notification scheduled with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
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
        "https://detect.roboflow.com/ricesencedetection/2?api_key=jFWG3CvrZaTABjzVZ7IH",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Roboflow result:", data); //console
      const detected = data.predictions?.[0]?.class || "No disease detected";
      setDetectionResult(detected);

      // Match to rule entry
      const rule = matchDiagnosisToRule(detected);
      if (rule) {
        console.log("Matched rule:", rule);
        setMatchedRule(rule); // Save rule to state
      }

      //Trigger notification
      // console.log("Scheduling notification...");
  //     await Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: ` ${rule.name} Detected`,
  //     body: 'Tap to view control methods and treatment suggestions.',
  //   },
  //   trigger: null, // Triggers immediately
  // });
  
     // Send notification only if pest/disease is detected
      if (detected !== "No disease detected") {
        await sendPestDetectionNotification(rule?.name || detected, rule);
      }
    
      return detected;
    } catch (error) {
      console.error("Roboflow detection failed:", error);
      setDetectionResult("Detection failed");
      return null;
    }
  };

const saveImageUrlToFirebase = async (url, detectedClass) => {
  const userId = await AsyncStorage.getItem("userId");
  console.log("Fetched userId:", userId);

  if (!userId) {
    console.error("No userId found in AsyncStorage. Can't save.");
    return;
  }

  const historyRef = ref(database, `users/${userId}/pestHistory`);

  await push(historyRef, {
    imageUrl: url,
    uploadedAt: new Date().toISOString(),
    diagnosis: matchedRule?.name || detectedClass || "Unknown",
  });

  console.log(" History saved for user:", userId);
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
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const matchDiagnosisToRule = (diagnosis) => {
  const lower = diagnosis.toLowerCase();
  return pestRule.find(rule =>
    rule.name.toLowerCase() === lower ||
    (rule.aliases && rule.aliases.includes(lower))
  );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
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

            {/* get solution */}
            {matchedRule ? (
            <Text style={styles.diagnosisText}>
              {/* Diagnosis: */}
               {matchedRule.name}
            </Text>
          ) : detectionResult && (
            <Text style={styles.diagnosisText}>
              Diagnosis: {detectionResult}
            </Text>
          )}


                  {matchedRule && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{matchedRule.name}</Text>
            <Text style={{ fontStyle: 'italic' }}>{matchedRule.type}</Text>
            <Text style={{ marginTop: 8 }}> <Text style={{ fontWeight: 'bold' }}>Description:</Text> {matchedRule.description}</Text>
            <Text style={{ marginTop: 8 }}> <Text style={{ fontWeight: 'bold' }}>Damage:</Text> {matchedRule.damage}</Text>

            <Text style={{ marginTop: 8, fontWeight: 'bold' }}> 🦠 Biological Control:</Text>
            {matchedRule.management.biological.map((item, index) => (
              <Text key={index}>- {item}</Text>
            ))}

            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>🧪 Chemical Control:</Text>
            {matchedRule.management.chemical.map((item, index) => (
              <Text key={index}>- {item}</Text>
            ))}

            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>🌾 Cultural Methods:</Text>
            {matchedRule.management.cultural.map((item, index) => (
              <Text key={index}>- {item}</Text>
            ))}

            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>🌱 Organic Methods:</Text>
            {matchedRule.management.organic.map((item, index) => (
              <Text key={index}>- {item}</Text>
            ))}
          </View>
        )}


          </View>
        </View>
      </View>
      </ScrollView>
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
