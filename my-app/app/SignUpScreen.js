import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CryptoJS from 'crypto-js';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon for showing password toggle

const SignUpScreen = () => {
  const navigation = useNavigation();

  // State for input fields and loading indicator
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility

  // Clear user details on screen load to avoid showing old user data
  useEffect(() => {
    setName('');
    setPhone('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }, []); 

  // Function to check if username or phone already exists in Firestore
  const checkIfUserExists = async () => {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username),
      where('phone', '==', phone)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Handle form submission
  const handleSignUp = async () => {
    if (!name || !phone || !username || !password || !confirmPassword) {
      Alert.alert('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    setLoading(true);
    setModalVisible(true); // Show modal when the user starts the sign-up process

    try {
      // Check if username or phone already exists (for new users)
      const userExists = await checkIfUserExists();
      if (userExists) {
        Alert.alert('Username or phone number already exists');
        setLoading(false);
        setModalVisible(false); // Hide modal when user already exists
        return;
      }

      // Hash the password using CryptoJS
      const hashedPassword = CryptoJS.SHA256(password).toString();

      // Add new user data to Firestore
      const newUser = await addDoc(collection(db, 'users'), {
        name,
        phone,
        username,
        password: hashedPassword,
      });

      const u_id = newUser.id;

      // Store user data in AsyncStorage for future use
      const userData = { name, phone, username, u_id };
      await AsyncStorage.setItem('userDetails', JSON.stringify(userData));

      // Reset the form
      setName('');
      setPhone('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      // Navigate to GuardianDetailsScreen
      navigation.navigate('GuardianDetails', { userId: u_id, name, phone, username });
    } catch (error) {
      Alert.alert('Error', 'Could not sign up. Please try again.');
      console.error('Error adding document: ', error);
    } finally {
      setLoading(false);
      setModalVisible(false); // Hide modal after the sign-up process is done
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={[styles.title, { fontFamily: 'Inter-Black' }]}>Sign Up</Text>
        <Text style={[styles.title1, { fontFamily: 'Inter-Regular' }]}>Create an account to get started</Text>
        <Text style={[styles.title2, { fontFamily: 'Montserrat-Medium' }]}>Personal Details</Text>
        <View style={styles.divider} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            // placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            // placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            // placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              // placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#0077B6"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              // placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#0077B6"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        {/* Modal for Loading */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#0077B6" />
              <Text style={styles.loadingText}>Please wait. We're Setting You Up...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E9F7FA',
  },
  title: {
    fontSize: 30,
    marginTop: 80,
    textAlign: 'left',
    marginLeft: 7,
  },
  title1: {
    fontSize: 16,
    marginBottom: 35,
    textAlign: 'left',
    color: '#71727A',
    marginLeft: 7,
  },
  title2: {
    fontSize: 21,
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 30,
  },
  inputContainer: {
    marginBottom: 16,
    margin:2
  },
  divider: {
    height: 3,
    backgroundColor: '#0077B6',
    marginBottom: 60,
    width: '15%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 8,
    margin: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  input: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    marginTop: 6,
    margin: 10,
    marginBottom: 12,
    flex: 1,
    fontSize:18
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginLeft:-2
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#0077B6',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default SignUpScreen;
