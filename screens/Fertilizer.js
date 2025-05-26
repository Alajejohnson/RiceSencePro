import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";

const riceFertilizerData = {
  loamy: {
    seedling: {
      inorganic: {
        type: "Urea (46-0-0)",
        dosage: "20–30 kg/ha",
        timing: "At transplanting or 10 days after",
        note: "Loamy soils retain nutrients well; apply lightly."
      },
      organic: {
        type: "Compost or poultry manure",
        dosage: "2–4 tons/ha",
        note: "Improves soil structure and early growth."
      }
    },
    tillering: {
      inorganic: {
        type: "NPK 20-10-10",
        dosage: "75 kg/ha",
        timing: "21–30 days after transplanting",
        note: "Boosts shoot and tiller development."
      }
    },
    panicle: {
      inorganic: {
        type: "NPK 10-20-20",
        dosage: "30–60 kg P₂O₅/ha",
        timing: "45–55 days after transplanting",
        note: "Phosphorus-rich fertilizers, Promotes panicle and flower formation."
      }
    },
    grain_filling: {
      inorganic: {
        type: "Muriate of Potash (0-0-50)",
        dosage: "30 kg K₂O/ha",
        timing: "70–80 days after transplanting",
        note: "Improves grain filling and yield quality."
      }
    }
  },
  sandy: {
    seedling: {
      inorganic: {
        type: "Urea (46-0-0)",
        dosage: "30 kg/ha",
        timing: "10 days after planting",
        note: "Nutrients are easily lost in sandy soil."
      },
      organic: {
        type: "Compost or farmyard manure",
        dosage: "5–10 tons/ha",
        note: "Enhances nutrient-holding capacity."
      }
    },
    tillering: {
      inorganic: {
        type: "Slow-release NPK 15-15-15",
        dosage: "75–100 kg/ha",
        timing: "21–30 days after planting",
        note: "Slow release avoids nutrient loss."
      }
    },
    panicle: {
      inorganic: {
        type: "NPK 10-20-20",
        dosage: "30–60 kg P₂O₅/ha",
        timing: "45–55 days after transplanting",
        note: "Supports panicle development."
      }
    },
    grain_filling: {
      inorganic: {
        type: "Muriate of Potash (0-0-50)",
        dosage: "30–40 kg K₂O/ha",
        timing: "70–80 days after transplanting",
        note: "Essential for grain quality."
      }
    }
  },
  clay: {
    seedling: {
      inorganic: {
        type: "Urea or NPK 20-10-10",
        dosage: "20–30 kg/ha",
        timing: "At transplanting",
        note: "Clay soils are nutrient-rich but compact."
      },
      organic: {
        type: "Well-decomposed manure or compost",
        dosage: "2–4 tons/ha",
        note: "Improves drainage and root growth."
      }
    },
    tillering: {
      inorganic: {
        type: "NPK 20-10-10",
        dosage: "75 kg/ha",
        timing: "21–30 days after transplanting",
        note: "Supports strong tillering."
      }
    },
    panicle: {
      inorganic: {
        type: "NPK 10-20-20",
        dosage: "30–60 kg P₂O₅/ha",
        timing: "45–55 days after transplanting",
        note: "Promotes flowering and panicle."
      }
    },
    grain_filling: {
      inorganic: {
        type: "Muriate of Potash (0-0-50)",
        dosage: "30 kg K₂O/ha",
        timing: "70–80 days after transplanting",
        note: "Improves grain filling."
      }
    }
  }
};

const Fertilizer = () => {
  const [soilType, setSoilType] = useState("loamy");
  const [cropStage, setCropStage] = useState("seedling");
  const [recommendation, setRecommendation] = useState(null);

  const getFertilizerRecommendation = () => {
    const data = riceFertilizerData[soilType]?.[cropStage];
    if (data) {
      setRecommendation(data);
    } else {
      setRecommendation(null);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.Container}>
        <Text style={styles.heading}>Select Soil Type:</Text>
        <Picker selectedValue={soilType} onValueChange={(itemValue) => setSoilType(itemValue)} style={styles.picker}>
          <Picker.Item label="Loamy Soil" value="loamy" />
          <Picker.Item label="Sandy Soil" value="sandy" />
          <Picker.Item label="Clay Soil" value="clay" />
        </Picker>

        <Text style={styles.heading}>Select Rice Growth Stage:</Text>
        <Picker selectedValue={cropStage} onValueChange={(itemValue) => setCropStage(itemValue)} style={styles.picker}>
          <Picker.Item label="Seedling Stage" value="seedling" />
          <Picker.Item label="Tillering Stage" value="tillering" />
          <Picker.Item label="Panicle Initiation" value="panicle" />
          <Picker.Item label="Grain Filling Stage" value="grain_filling" />
        </Picker>

        <TouchableOpacity onPress={getFertilizerRecommendation} style={styles.btn}>
          <Text style={styles.btnText}>Get Recommendation</Text>
        </TouchableOpacity>

        {recommendation && (
          <View style={styles.recommendationBox}>
            {recommendation.inorganic && (
              <>
                <Text style={styles.title}>Inorganic Recommendation</Text>
                <Text>Type: {recommendation.inorganic.type}</Text>
                <Text>Dosage: {recommendation.inorganic.dosage}</Text>
                <Text>Timing: {recommendation.inorganic.timing}</Text>
                <Text>Note: {recommendation.inorganic.note}</Text>
              </>
            )}
            {recommendation.organic && (
              <>
                <Text style={[styles.title, { marginTop: 10 }]}>Organic Alternative</Text>
                <Text>Type: {recommendation.organic.type}</Text>
                <Text>Dosage: {recommendation.organic.dosage}</Text>
                <Text>Note: {recommendation.organic.note}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Container: {
    padding: 20,
    backgroundColor: Colors.white,
    minHeight: "100%"
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10
  },
  picker: {
    marginBottom: 15
  },
  btn: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 20,
    marginTop: 20
  },
  btnText: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 18
  },
  recommendationBox: {
    marginTop: 30,
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 10
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5
  }
});

export default Fertilizer;
