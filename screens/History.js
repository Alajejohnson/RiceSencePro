// import { Colors } from '@/constants/Colors';
// import { auth, database } from "@/FirebaseConfig";
// import { onValue, ref } from 'firebase/database';
// import React, { useEffect, useState } from 'react';
// import { FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

// const History = () => {
//     const [userInfo, setUserInfo] = useState(null);
//     const [history, setHistory] = useState([]);

//    useEffect(() => {
//     if (!userId) return;

//     const userRef = ref(database, "users/" + userId);
//     onValue(userRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setUserInfo({
//           firstName: data.firstName,
//           lastName: data.lastName,
//           email: data.email,  // or pass email differently if needed
//         });
//       }
//     });

//     const historyRef = ref(database, `users/${userId}/pestHistory`);
//     onValue(historyRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const historyArray = Object.entries(data).map(([key, value]) => ({
//           id: key,
//           ...value,
//         })).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
//         setHistory(historyArray);
//       } else {
//         setHistory([]);
//       }
//     });
//   }, [userId]);


//     const renderItem = ({ item }) => (
//         <View style={styles.historyItem}>
//             <Image source={{ uri: item.imageUrl }} style={styles.image} />
//             <View style={styles.details}>
//                 <Text style={styles.label}>Diagnosis:</Text>
//                 <Text style={styles.value}>{item.diagnosis || "Unknown"}</Text>
//                 <Text style={styles.label}>Date:</Text>
//                 <Text style={styles.value}>
//                     {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Unknown date"}
//                 </Text>
//             </View>
//         </View>
//     );

//     return (
//         <SafeAreaView style={styles.Container}>
//             <View style={styles.container}>
//                 {userInfo && (
//                     <View style={styles.profileSection}>
//                         <View style={styles.avatar}>
//                             <Text style={styles.avatarText}>
//                                 {userInfo?.lastName?.charAt(0)?.toUpperCase() || 'U'}
//                             </Text>
//                         </View>
//                         <View>
//                             <Text style={styles.name}>Hi, {userInfo?.lastName || 'User'}</Text>
//                             <Text style={styles.email}>{userInfo.email}</Text>
//                         </View>
//                     </View>
//                 )}
//                 <Text style={styles.sectionTitle}>Detection History</Text>
//                 <FlatList
//                     data={history}
//                     keyExtractor={(item) => item.id}
//                     renderItem={renderItem}
//                     contentContainerStyle={{ paddingBottom: 20 }}
//                 />
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     Container: {
//         flex: 1,
//         backgroundColor: Colors.white,
//     },
//     container: {
//         padding: 20,
//     },
//     profileSection: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginBottom: 20,
//     },
//     avatar: {
//         backgroundColor: Colors.primary,
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         justifyContent: "center",
//         alignItems: "center",
//         marginRight: 15,
//     },
//     avatarText: {
//         color: Colors.white,
//         fontSize: 20,
//         fontWeight: "bold",
//     },
//     name: {
//         fontSize: 18,
//         fontWeight: "600",
//     },
//     email: {
//         fontSize: 14,
//         color: "gray",
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: "bold",
//         marginBottom: 10,
//     },
//     historyItem: {
//         borderWidth: 1,
//         borderColor: Colors.ash2,
//         borderRadius: 10,
//         marginBottom: 15,
//         overflow: "hidden",
//     },
//     image: {
//         width: "100%",
//         height: 180,
//     },
//     details: {
//         padding: 10,
//     },
//     label: {
//         fontWeight: "bold",
//     },
//     value: {
//         marginBottom: 5,
//     },
// });

// export default History;


import { Colors } from '@/constants/Colors';
import { database } from "@/FirebaseConfig";
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const History = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log("Fetched userId from AsyncStorage:", userId);

        if (!userId) return;

        // Fetch user profile info
        const userRef = ref(database, `users/${userId}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          console.log("User profile data:", data);

          if (data) {
            setUserInfo({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
            });
          }
        });

        // Fetch history
        // const historyRef = ref(database, `users/${userId}/pestHistory`);
        // onValue(historyRef, (snapshot) => {
        //   const data = snapshot.val();
        //   console.log("History data:", data);

        //   if (data) {
        //     const historyArray = Object.entries(data).map(([key, value]) => ({
        //       id: key,
        //       ...value,
        //     })).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        //     setHistory(historyArray);
        //   } else {
        //     setHistory([]);
        //   }
        // });

        const historyRef = ref(database, `users/${userId}/pestHistory`);
onValue(historyRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const historyArray = Object.entries(data)
      .map(([key, value]) => ({ id: key, ...value }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    setHistory(historyArray);
  } else {
    setHistory([]);
  }
});


      } catch (error) {
        console.error("Error fetching user data or history:", error);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.label}>Diagnosis:</Text>
        <Text style={styles.value}>{item.diagnosis || "Unknown"}</Text>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Unknown date"}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.Container}>
      <View style={styles.container}>
        {userInfo && (
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userInfo?.lastName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.name}>Hi, {userInfo?.lastName || 'User'}</Text>
              <Text style={styles.email}>{userInfo.email}</Text>
            </View>
          </View>
        )}
        <Text style={styles.sectionTitle}>Detection History</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    padding: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    color: "gray",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: Colors.ash2,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
  },
  details: {
    padding: 10,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    marginBottom: 5,
  },
});

export default History;
