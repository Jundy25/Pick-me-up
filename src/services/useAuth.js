import { useContext, useCallback, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from "./AuthContext";
import userService from "./auth&services";
import Toast from "react-native-root-toast";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ToastAndroid,
  Alert
} from "react-native";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  const [baseFare, setBaseFare] = useState(null);
  const [additionalFareRate, setAdditionalFareRate] = useState(null);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const showToast = (message = "Something went wrong") => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.LONG,
      ToastAndroid.CENTER
    );
  };

  const {
    isAuthenticated,
    setIsAuthenticated,
    userRole,
    setUserRole,
    userStatus,
    setUserStatus,
    token,
    setToken,
    userId,
    setUserId,
    loading,
    setLoading,
  } = context;

  const fetchFareData = useCallback(async () => {
    try {
      const response = await userService.getFare();
      setBaseFare(response.first_2km);
      setAdditionalFareRate(response.exceeding_2km);
      return {
        baseFare: response.first_2km,
        additionalFareRate: response.exceeding_2km
      };
    } catch (error) {
      console.error("Error fetching fare data:", error);
      Alert.alert("Error", "Failed to fetch fare data.");
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(
    async (token, role, user_id, status) => {
      try {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", role.toString());
        await AsyncStorage.setItem("status", status ? status.toString() : "");
        if (user_id !== undefined && user_id !== null) {
          await AsyncStorage.setItem("user_id", user_id.toString());
        }
        setIsAuthenticated(true);
        setUserRole(parseInt(role, 10));
        setUserStatus(status);
        setToken(token);
        setUserId(user_id);
        console.log("Login successful:", {
          isAuthenticated: true,
          userRole: parseInt(role, 10),
          user_id,
          status,
        });
      } catch (error) {
        console.error("Error during login:", error);
      }
    },
    [setIsAuthenticated, setUserRole, setUserStatus, setToken, setUserId]
  );

  // Logout function 
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.clear(); // Clear all authentication-related items
      setIsAuthenticated(false);
      setUserRole(null);
      setUserStatus(null);
      setToken(null);
      setUserId(null);
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [setIsAuthenticated, setUserRole, setUserStatus, setToken, setUserId]);

  // Token validation function
  const checkToken = useCallback(async () => {
    setLoading(true); // Show loading state while checking token
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        console.log("No token found, user not authenticated");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
  
      // Call the backend API to validate the token
      const response = await userService.checkToken(storedToken);
  
      if (response && response.status === 200) {
        console.log("Token is valid, user authenticated");
  
        // Extract user data directly from the response
        const { role, status, user_id } = response.data;
  
        setIsAuthenticated(true);
        setUserRole(role);
        setUserId(user_id);
        setUserStatus(status);
        setToken(storedToken);
      } else {
        console.log("Invalid or expired token");
        await logout();
      }
    } catch (error) {
      console.log("Error during token validation:", error);
      Alert.alert(
        "Logged Out",
        "Session Expired or Account Logged In on another device."
      );
      await logout();
    } finally {
      setLoading(false); // Remove loading state
    }
  }, [logout, setIsAuthenticated, setLoading, setUserRole, setUserId, setUserStatus, setToken]);

  // // Automatically check token when the app loads
  // useEffect(() => {
  //   checkToken();
  // }, [checkToken]);

  return {
    isAuthenticated,
    userRole,
    userStatus,
    userId,
    token,
    login,
    logout,
    checkToken,
    loading,
    fetchFareData,
    baseFare,
    additionalFareRate,
  };
};
