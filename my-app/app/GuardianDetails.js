import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard'; // Correct import for expo-clipboard
import { db } from '../firebaseConfig'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { useRoute, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const GuardianDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const router = useRouter();

  // Get userId from route params (this is the document ID/recovery code)
  const { userId } = route.params;

  // State for guardian input fields
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [showRecoveryCode, setShowRecoveryCode] = useState(false); // To toggle modal for recovery code

  const handleGuardianDetails = async () => {
    if (!guardianName || !guardianPhone) {
      Alert.alert('Please fill in all the fields.');
      return;
    }

    try {
      const defaultMessage = `I'm within 2km of my destination.`; // Default message template

      // Update user document with guardian details and default message
      await updateDoc(doc(db, 'users', userId), {
        guardianName,
        guardianPhone,
        guardianSMS: defaultMessage,
      });

      // Show the recovery code in a modal
      setShowRecoveryCode(true);
    } catch (error) {
      Alert.alert('Error', 'Could not save guardian details. Please try again.');
      console.error("Error updating document: ", error);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setStringAsync(userId); // Copy the code to clipboard using expo-clipboard
    Alert.alert('Copied', 'Recovery code copied to clipboard.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.subtitle}>Create an account to get started</Text>
        <Text style={styles.title2}>Guardian Details</Text>
        <View style={styles.divider} />

        {/* Guardian Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Guardian Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter guardian's name"
            value={guardianName}
            onChangeText={setGuardianName}
          />
        </View>

        {/* Guardian Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Guardian Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter guardian's phone number"
            value={guardianPhone}
            onChangeText={setGuardianPhone}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGuardianDetails}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Recovery Code Modal */}
        <Modal
          transparent={true}
          visible={showRecoveryCode}
          animationType="fade"
          onRequestClose={() => setShowRecoveryCode(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Your Recovery Code</Text>
              <Text style={styles.modalTitle1}>Please save this information in a secure location. It will be required if you need to reset your password</Text>
              <TextInput
                style={styles.recoveryCodeInput}
                value={userId} // Display the userId as the recovery code
                editable={false}
                selectTextOnFocus={false} // Disable editing
              />
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Text style={styles.copyButtonText}>Copy Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.okButton}
                onPress={() => {
                  setShowRecoveryCode(false);
                  router.push('/Login');
                }}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
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
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 10, 
    marginTop:-100,
    fontFamily: 'Inter-Black'
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#71727A',
    marginBottom: 75, 
    fontFamily: 'Inter-Regular'
  },
  title2: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  divider: {
    height: 3,
    backgroundColor: '#0077B6',
    marginBottom: 50,
    width: '15%', 
    alignSelf: 'center'
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  input: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    marginTop: 5,
    marginHorizontal: 10,
    marginBottom:15
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalTitle1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  recoveryCodeInput: {
    height: 40,
    borderColor: '#0077B6',
    borderWidth: 2,
    paddingHorizontal: 8,
    marginBottom: 15,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',
    color:'#000'
  },
  copyButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  okButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  okButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default GuardianDetailsScreen;
