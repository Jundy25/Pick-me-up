import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text } from 'react-native-paper';
import { RiderContext } from "../../context/riderContext";
import riderMarker from "../../../assets/rider.png";
import customerMarker from "../../../assets/customer.png";

const NearbyCustomersMap = ({ availableRides, onClose, navigation }) => {
  const { riderCoords } = useContext(RiderContext);
  const [region, setRegion] = useState({
    latitude: riderCoords.latitude,
    longitude: riderCoords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleMarkerPress = (ride) => {
    navigation.navigate("BookingDetails", { ride });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        provider={PROVIDER_GOOGLE}
      >
        {/* Rider Marker */}
        <Marker
          coordinate={{
            latitude: riderCoords.latitude,
            longitude: riderCoords.longitude,
          }}
          title="Your Location"
        >
          <Image source={riderMarker} style={styles.markerIcon} />
        </Marker>

        {/* Customer Markers */}
        {availableRides.map((ride, index) => {
          // Ensure ridelocations exist 
          if (!ride.customer_latitude || ! ride.customer_longitude) {
            console.warn(`Ride ${ride.ride_id} has no ridelocations.`);
            return null; // Skip this ride
          }

          // Parse coordinates
          const customerLat = parseFloat(ride.customer_latitude);
          const customerLong = parseFloat(ride.customer_longitude);

          // Check for valid coordinates
          if (isNaN(customerLat) || isNaN(customerLong)) {
            console.warn(`Invalid coordinates for ride ${ride.ride_id}:`, customerLat, customerLong);
            return null; // Skip if invalid
          }

          return (
            <Marker
              key={ride.ride_id || `ride-marker-${index}`}
              coordinate={{
                latitude: customerLat,
                longitude: customerLong,
              }}
              title={`${ride.first_name} ${ride.last_name}`}
              description={ride.ride_type}
              onCalloutPress={() => handleMarkerPress(ride)}
            >
              <Image source={customerMarker} style={styles.markerIcon} />
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  map: {
    flex: 1,
  },
  markerIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NearbyCustomersMap;
