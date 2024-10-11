import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { db } from '../firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CryptoJS from 'crypto-js';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

const LoginScreen = () => {
  const navigation = useNavigation();

  // State for input fields and loading indicator
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ username: false, password: false }); // State for input errors

  // Handle login form submission
  const handleLogin = async () => {
    // Validate inputs
    if (!username || !password) {
      setError({
        username: !username,
        password: !password,
      });
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true); // Show loading indicator (modal)

    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Invalid username or password');
      } else {
        // Assuming the user exists in the collection
        const userData = querySnapshot.docs[0].data();
        
        // Hash the entered password
        const hashedPassword = CryptoJS.SHA256(password).toString();

        // Compare the hashed entered password with the stored hashed password
        if (hashedPassword === userData.password) {
          // Store user data in AsyncStorage (excluding password)
          await AsyncStorage.setItem('userDetails', JSON.stringify({
            username: userData.username,
            u_id: userData.u_id,
            phone: userData.phone,
            name: userData.name,
          }));

          // Navigate to Home screen
          navigation.navigate('Home');
        } else {
          Alert.alert('Error', 'Invalid username or password');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not log in. Please try again.');
      console.error('Error fetching document: ', error);
    } finally {
      setLoading(false); // Hide loading indicator (modal)
    }
  };

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <SimpleLineIcons name="login" size={38} color="#0077B6" style={styles.icon} />
      </View>

      {/* Custom Modal for loading spinner */}
      <Modal transparent={true} animationType="none" visible={loading}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#0077B6" />
            <Text style={styles.title1}>Just a moment, verifying your details...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, error.username && { borderColor: 'red' }]}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError({ ...error, username: false });
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, error.password && { borderColor: 'red' }]}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError({ ...error, password: false });
          }}
          secureTextEntry
        />
      </View>

      <View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.text2}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
  
      <View>
        <Text style={styles.text1}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.text3}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', // Align text and icon in a row
    justifyContent: 'space-between', // Push items to far ends
    alignItems: 'center', // Center items vertically
    marginBottom: 100,
    marginHorizontal: 10,
    height: 50, // Adjust the height of the header to fit the icon
  },
  icon: {
    marginRight: 10,
    width: '13%', // The icon will take up 15% of the available width
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#E9F7FA',
  },
  title: {
    fontSize: 34,
    textAlign: 'Left',
    fontFamily: 'Inter-Black',
    width: '75%', // Ensure the title only takes 75% of the available space
  },
  title1: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 15,
    margin: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  input: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    marginTop: 10,
    margin: 10,
    fontSize:17
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  text1: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Montserrat-Medium',
  },
  text2: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 25,
    marginBottom:10,
    color: '#0077B6',
    fontFamily: 'Montserrat-SemiBold',
    textDecorationLine: 'underline',
  },
  text3: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    marginBottom:10,
    color: '#0077B6',
    fontFamily: 'Montserrat-SemiBold',
    textDecorationLine: 'underline',
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  // Modal Styles
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 180,
    width: 280,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;
