import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { database } from "../FirebaseConfig";
import { ref, get, child } from "firebase/database";

export const unstable_settings = {
  ssr: false,
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "users"));

      if (snapshot.exists()) {
        const users = snapshot.val();
        const foundUser = Object.entries(users).find(
          ([, value]) => value.email === email && value.password === password
        );

        if (foundUser) {
          const [uid, userData] = foundUser;

          // Always store userId
          await AsyncStorage.setItem("userId", uid);

          // Store other details if rememberMe is on
          if (rememberMe) {
            await AsyncStorage.setItem("userEmail", userData.email);
            await AsyncStorage.setItem(
              "userName",
              userData.firstName + " " + userData.lastName
            );
          }

          // Optional: For debugging
          console.log("Saved userId:", await AsyncStorage.getItem("userId"));

          setError(null);
          setShowReset(false);
          navigation.replace("Menu");
          return;
        }
      }

      setError("Invalid credentials. Please check your email or password.");
      setShowReset(true);
    } catch (err) {
      setError("Login failed. Please try again.");
      console.log("Login error:", err);
    }
  };

  const handleResetPassword = () => {
    if (!email) {
      setError("Enter your email address to reset password.");
    } else {
      Alert.alert("Note", "Password reset not available. Contact admin.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          height: 180,
          width: 180,
          borderRadius: 90,
          position: "absolute",
          top: "-10%",
          left: "70%",
        }}
      />
      <View
        style={{
          backgroundColor: Colors.primary,
          height: 180,
          width: 180,
          borderRadius: 90,
          position: "absolute",
          bottom: "-10%",
          right: "70%",
        }}
      />

      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Sign In
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.btn}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.btn}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            thumbColor={Colors.primary}
          />
          <Text style={{ marginLeft: 10 }}>Remember Me</Text>
        </View>

        {error && (
          <Text style={{ color: Colors.secondary, marginBottom: 10 }}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: Colors.secondary,
            padding: 15,
            borderRadius: 25,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Sign In</Text>
        </TouchableOpacity>

        {showReset && (
          <TouchableOpacity onPress={handleResetPassword}>
            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                color: Colors.primary,
                fontWeight: "bold",
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            New User? <Text style={{ color: Colors.primary }}>Sign Up </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: Colors.ash1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 3,
    backgroundColor: Colors.ash2,
    color: Colors.black,
  },
});
