import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "react-native-gesture-handler";

import { AuthProvider } from "./src/services/AuthContext";
import { RiderProvider } from "./src/context/riderContext";
import { CustomerProvider } from "./src/context/customerContext";
import { PusherProvider } from "./src/context/PusherContext";
import Navigation from "./src/navigation/Navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider>
          <RiderProvider>
            <CustomerProvider>
              <PusherProvider
                    handleBookedMatch={(ride) => {
                      Alert.alert(
                        "Ride Match",
                        "You have found a Match!",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              // Navigation will be handled by the Navigation component
                              // which has access to useNavigation
                            }
                          }
                        ]
                      );
                    }}
                  >
                <Navigation />
              </PusherProvider>
            </CustomerProvider>
          </RiderProvider>
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  ); 
}