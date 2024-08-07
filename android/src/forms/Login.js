import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text, Dialog, Portal } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you have this package installed
import { useAuth } from "../services/useAuth";
import userService from "../services/auth&services";

const Login = ({ navigation }) => {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [token, setToken] = useState(""); // Token state
  const { login } = useAuth();
  const [hideEntry, setHideEntry] = useState(true);

  const handleLogin = async () => {
    setError("");
  
    if (!user_name || !password) {
      setError("Please input required credentials");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const { token: receivedToken, role } = await userService.login(user_name, password);
      setToken(receivedToken);
  
      if (role === 3) {
        setSelectedRole(role);
        setShowDialog(true);
      } else if (role === 4 || role === 1 || role === 2) {
        await login(receivedToken, role);
        navigation.replace(role === 3 ? "RiderStack" : "CustomerStack");
      } else {
        setError("An error occurred during login");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Incorrect username or password");
        } else if (err.response.status === 404) {
          setError("Username and Password do not match");
        } else {
          setError(err.response.data?.message || "An error occurred during login");
        }
      } else if (err.request) {
        setError("Network error, please try again later");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleRoleSelection = async (role) => {
    await login(token, role);
    setShowDialog(false);
    navigation.replace(role === 3 ? "RiderStack" : "CustomerStack");
  };

  const toggleSecureEntry = () => {
    setHideEntry(!hideEntry);
  };

  return (
    <ImageBackground
      source={require("../pictures/PMU_Rider_Back.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>PICKME UP</Text>
          <Text style={styles.subtitle}>Pick you up wherever you are</Text>
        </View>

        <TextInput
          style={styles.input}
          label="Username"
          value={user_name}
          onChangeText={setUsername}
          mode="outlined"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hideEntry}
            mode="outlined"
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.iconContainer}>
            <Icon name={hideEntry ? "visibility-off" : "visibility"} size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonText}
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register Here</Text>
          </TouchableOpacity>
        </View>

        <Portal>
          <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Select Role</Dialog.Title>
            <Dialog.Content>
              <Button mode="contained" style={styles.dialogButton} onPress={() => handleRoleSelection(3)}>
                Rider
              </Button>
              <Button mode="contained" style={styles.dialogButton} onPress={() => handleRoleSelection(4)}>
                Customer
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
    backgroundColor: "black",
    paddingVertical: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFC533",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFC533",
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    padding: 5,
    backgroundColor: "#000",
  },
  buttonText: {
    color: "#FFC533",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#fff",
  },
  registerLink: {
    color: "#0000EE",
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
    padding: 25,
  },
  dialog: {
    backgroundColor: "#000",
    borderRadius: 10,
  },
  dialogTitle: {
    color: "#FFC533",
  },
  dialogButton: {
    marginTop: 10,
    backgroundColor: "#FFC533",
    color: "#000",
  },
});

export default Login;
