import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
  RefreshControl
} from "react-native";
import { Button } from "react-native-paper";
import userService from '../../services/auth&services';

const DeliveryConfirmationScreen = ({navigation}) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchLatestAvailableRide = async () => {
    try {
      const ride = await userService.checkActiveBook();
      setBookDetails(ride.rideDetails);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve the latest available ride.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAvailableRide();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Navigate to Home screen
    navigation.navigate("Home");
    setRefreshing(false);
  }, [navigation]);

  const handleCancel = async () => {
    
    console.log("Attempting to cancel ride");
    
    setIsLoading(true);
    try {
      const response = await userService.cancel_ride(bookDetails.ride_id);
      console.log("Cancel ride response:", response.data);
  
      if (response.data && response.data.message) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Home"); // Redirect to home screen or wherever appropriate
      } else {
        Alert.alert("Error", "Failed to cancel the ride. Please try again.");
      }
    } catch (error) {
      console.error("Failed to Cancel Ride", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", error.response.data.error || "This ride is no longer available.");
        navigation.goBack(); // Go back to the previous screen
      } else {
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading || !bookDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
    contentContainerStyle={styles.scrollViewContent}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
  >
    <ImageBackground
      source={{ uri: "https://your-map-image-url.com" }} // Replace with your map image URL or local asset
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{bookDetails.ride_type}</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>Successfully Matched</Text>
          <Text style={styles.statusMessage}>Rider is on the way...</Text>
          <Text style={styles.subTitle}>Rider Details</Text>
          <Text style={styles.detailText}>{bookDetails.rider ? `${bookDetails.rider.first_name} ${bookDetails.rider.last_name}` : 'N/A'}</Text>
          <Text style={styles.detailText}>{bookDetails.rider.mobile_number}</Text>
          <Text style={styles.detailText}>Motor: Yamaha Sniper 150</Text>
        </View>
        <View>
        <TouchableOpacity>
            <Button style={styles.returnHomeButton}>
              <Text style={{ color: "white" }}>Contact Rider</Text>
            </Button>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel}>
            <Button style={styles.returnHomeButton}>
              <Text style={{ color: "white" }}>Cancel</Text>
            </Button>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
  },
  container: {
    backgroundColor: "#FFD700",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5, // For Android shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  messageContainer: {
    alignItems: "center",
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  returnHomeButton: {
    marginTop: 20,
    backgroundColor: "#140F1F",
    borderRadius: 5,
    justifyContent: "flex-end",
  },
});

export default DeliveryConfirmationScreen;
