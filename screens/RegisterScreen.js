// import { Colors } from "@/constants/Colors";
// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from "react-native";
// import  {  database } from "../FirebaseConfig";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { ref, set } from "firebase/database";

// export default function RegisterScreen({ navigation }) {
//     const [firstName, setFirstName] = useState("");
//     const [lastName, setLastName] = useState("");
//     const [email, setEmail] = useState("");
//     const [phone, setPhone] = useState("");
//     const [password, setPassword] = useState("");

//       //  Function to handle Sign Up
//   const handleSignUp = async () => {
//     if (!email || !password) {
//       Alert.alert("Error", "Email and password are required.");
//       return;
//     }

//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const { uid } = userCredential.user;

//       //Save additional user data in Realtime Database
//       await set(ref(database, `users/${uid}`), {
//         firstName,
//         lastName,
//         email,
//         phone,
//         createdAt: new Date().toISOString(),
//       });

//       Alert.alert("Success", "Registration successful!");
//       navigation.navigate("Login");
//     } catch (error) {
//       Alert.alert("Registration Error", error.message);
//     }
//   };

//   return (
//     <SafeAreaView style={{flex: 1, backgroundColor: Colors.white}}>
//     <View style={{backgroundColor: Colors.primary,
//             height: 180,
//             width: 180,
//             borderRadius: 90,
//             position: "absolute",
//             top: "-10%",
//             left: "70%",

//             }} />
//     <View style={{backgroundColor: Colors.primary,
//         height: 180,
//         width: 180,
//         borderRadius: 90,
//         position: "absolute",
//         bottom: "-10%",
//         right: "70%",

//         }} />

//     <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
//       <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Sign Up</Text>

//         <Text>First Name</Text>
//         <TextInput
//         style={styles.btn}
//         placeholder="First Name"
//         value={firstName}
//         onChangeText={setFirstName}
//       />
// <Text>Last Name</Text>
//       <TextInput
//         style={styles.btn}
//         placeholder="Last Name"
//         value={lastName}
//         onChangeText={setLastName}
//       />

//       <Text>Email Address</Text>
//       <TextInput
//         style={styles.btn}
//         placeholder="Email Address"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <Text>Phone Number</Text>
//       <TextInput
//        style={styles.btn}
//         placeholder="Phone Number"
//         value={phone}
//         onChangeText={setPhone}
//       />

//       <Text>Password</Text>
//       <TextInput
//         style={styles.btn}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

      
//       <TouchableOpacity
//         onPress={() => navigation.navigate("Login")}
//         // onPress={handleSignUp}
//         style={{
//             backgroundColor: Colors.secondary,
//             padding: 15,
//             borderRadius: 25,
//             alignItems: "center",
//             marginTop: 10,
//         }}
//       >
//         <Text style={{ color: Colors.white, textAlign: "center", fontWeight: "bold" }}>Sign Up</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//       <Text style={{ marginTop: 10, textAlign: "center" }}>
//           Already have an account? <Text style={{ color: Colors.primary }}>Sign In</Text>
//         </Text>
//       </TouchableOpacity>
//     </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//     btn: {
//         borderWidth: 1,
//         borderColor: Colors.ash1,
//         padding: 10,
//         borderRadius: 5,
//         marginBottom: 10,
//         marginTop: 3,
//         backgroundColor: Colors.ash2,
//     }

// })

import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { push, ref, set } from "firebase/database";
import { database } from "@/FirebaseConfig";

export default function RegisterScreen({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");


const handleSignUp = async () => {
  if (!firstName || !lastName || !email || !phone || !password) {
    Alert.alert("Error", "All fields are required.");
    return;
  }

  try {
    const usersRef = ref(database, "users/");
    const newUserRef = push(usersRef);
    const userId = newUserRef.key;

    const userData = {
      userId,
      firstName,
      lastName,
      email,
      phone,
      password, // Required for login match
      createdAt: new Date().toISOString(),
    };

    await set(newUserRef, userData);

    Alert.alert("Success", "Registration complete!");
    navigation.navigate("Login");
  } catch (error) {
    Alert.alert("Error", "Could not save to database.");
    console.log(error);
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Sign Up</Text>

        <Text>First Name</Text>
        <TextInput style={styles.btn} placeholder="First Name" value={firstName} onChangeText={setFirstName} />

        <Text>Last Name</Text>
        <TextInput style={styles.btn} placeholder="Last Name" value={lastName} onChangeText={setLastName} />

        <Text>Email Address</Text>
        <TextInput style={styles.btn} placeholder="Email Address" value={email} onChangeText={setEmail} />

        <Text>Phone Number</Text>
        <TextInput style={styles.btn} placeholder="Phone Number" value={phone} onChangeText={setPhone} />

        <Text>Password</Text>
        <TextInput style={styles.btn} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={{ marginTop: 10, textAlign: "center" }}>
            Already have an account? <Text style={{ color: Colors.primary }}>Sign In</Text>
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
  },
  signUpButton: {
    backgroundColor: Colors.secondary,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  signUpText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  circleTop: {
    backgroundColor: Colors.primary,
    height: 180,
    width: 180,
    borderRadius: 90,
    position: "absolute",
    top: "-10%",
    left: "70%",
  },
  circleBottom: {
    backgroundColor: Colors.primary,
    height: 180,
    width: 180,
    borderRadius: 90,
    position: "absolute",
    bottom: "-10%",
    right: "70%",
  },
});
