import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Username input, Step 2: Recovery Code, Step 3: Password inputs
  const [userDocId, setUserDocId] = useState(null); // To store the Firestore document ID
  const [userId, setUserId] = useState(null); // To store the recovery code (u_id)
  const navigation = useNavigation();

  // Step 1: Check if username exists
  const handleUsernameCheck = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username.');
      return;
    }

    try {
      // Query the Firestore collection for the given username
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Username does not exist.');
        return;
      }

      // If the username exists, extract the document ID and u_id for further steps
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        setUserDocId(doc.id); // Store Firestore document ID
        setUserId(userData.u_id); // Store the recovery code (u_id) for validation
      });

      // Proceed to step 2 (ask for recovery code)
      setStep(2);
    } catch (error) {
      console.error('Error checking username:', error);
      Alert.alert('Error', 'Could not verify username. Please try again.');
    }
  };

  // Step 2: Check if recovery code matches the stored `u_id`
  const handleRecoveryCodeCheck = () => {
    if (recoveryCode !== userId) {
      Alert.alert('Error', 'Recovery code is incorrect.');
      return;
    }

    // Proceed to step 3 (ask for new password)
    setStep(3);
  };

  // Step 3: Validate passwords and reset password
  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // Hash the new password
      const hashedPassword = CryptoJS.SHA256(newPassword).toString(CryptoJS.enc.Hex);

      // Update the user's password in the database
      const userDocRef = doc(db, 'users', userDocId); // Use the stored document ID
      await updateDoc(userDocRef, {
        password: hashedPassword,
      });

      Alert.alert('Success', 'Password reset successfully!');

      // Navigate to login page after successful reset
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Could not reset the password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {/* Step 1: Check Username */}
      {step === 1 && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleUsernameCheck}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Step 2: Enter Recovery Code */}
      {step === 2 && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recovery Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your recovery code"
              value={recoveryCode}
              onChangeText={setRecoveryCode}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRecoveryCodeCheck}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Step 3: Enter New Password and Confirm Password */}
      {step === 3 && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E9F7FA',
  },
  title: {
    fontSize: 28,
    textAlign: 'left',
    fontFamily: 'Inter-Black',
    position: 'absolute',  // Set the position to absolute
    top: 60,               // Set the top offset (adjust as needed)
    left: 20,              // Set the left offset to position it in the left corner
  },  
  inputContainer: {
    marginBottom: 16,
    marginTop:-50
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
    margin:10
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    margin:10,
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    margin:15
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
