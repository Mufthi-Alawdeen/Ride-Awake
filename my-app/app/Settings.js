import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';  // Update import statement
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icons
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

const SettingsScreen = () => {
  const [smsBody, setSmsBody] = useState('');
  const [predefinedOptions, setPredefinedOptions] = useState([
    'You are within 2km of your destination.',
    'The destination is near. Stay alert!',
    'Approaching destination: you are within 2km.',
  ]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch user details and current SMS body from Firestore
    const fetchUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        const parsedUserDetails = userDetails ? JSON.parse(userDetails) : null;

        if (parsedUserDetails && parsedUserDetails.u_id) {
          const userDoc = await getDoc(doc(db, 'users', parsedUserDetails.u_id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setSmsBody(userData.guardianSMS || predefinedOptions[0]); // Set current or default message
          }
        }
      } catch (error) {
        console.error('Error fetching user data: ', error);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle saving the new SMS body
  const handleSave = async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const parsedUserDetails = userDetails ? JSON.parse(userDetails) : null;

      if (parsedUserDetails && parsedUserDetails.u_id) {
        await updateDoc(doc(db, 'users', parsedUserDetails.u_id), {
          guardianSMS: smsBody,
        });
        Alert.alert('Success', 'Message updated successfully!');
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save the message.');
      console.error('Error updating document: ', error);
    }
  };

  const currentScreen = 'Settings'; // Highlight the current screen in navbar

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            {/* Title with icon */}
            <View style={styles.titleContainer}>
            <Text style={styles.title}>Guardian Message</Text>
            <Entypo name="new-message" size={35} color="#0077B6" style={styles.icon} />
            </View>

            <Text style={styles.label}>Predefined Messages</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={smsBody}
                onValueChange={(itemValue) => setSmsBody(itemValue)}
                style={styles.picker}
              >
                {predefinedOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Custom Message</Text>
            <TextInput
              style={styles.input}
              value={smsBody}
              onChangeText={setSmsBody}
              placeholder="Enter custom message"
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Customize Message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.navItem, currentScreen === 'Home' && styles.activeItem]}>
            <Icon name="home-outline" size={25} color={currentScreen === 'Home' ? '#000' : '#fff'} />
            {currentScreen === 'Home' && <View style={styles.underline} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ScheduledTripsDetails')} style={[styles.navItem, currentScreen === 'ScheduledTripsDetails' && styles.activeItem]}>
            <Icon name="calendar-outline" size={25} color={currentScreen === 'ScheduledTripsDetails' ? '#000' : '#fff'} />
            {currentScreen === 'ScheduledTripsDetails' && <View style={styles.underline} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={[styles.navItem, currentScreen === 'UserProfile' && styles.activeItem]}>
            <Icon name="person-outline" size={25} color={currentScreen === 'UserProfile' ? '#000' : '#fff'} />
            {currentScreen === 'UserProfile' && <View style={styles.underline} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.navItem, currentScreen === 'Settings' && styles.activeItem]}>
            <FontAwesome6 name="message" size={25} color={currentScreen === 'Settings' ? '#000' : '#fff'} />
            {currentScreen === 'Settings' && <View style={styles.underline} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F7FA',
  },
  scrollContainer: {
    paddingBottom: 100, // Ensure space for navbar
  },
  innerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align icon on the left and title on the right
    marginBottom: 50,
    marginTop:40
  },
  title: {
    fontSize: 26,
    textAlign: 'right', // Align title text to the right
    marginRight: 10,
    margin:10,
    fontFamily: 'Inter-Black',
  },
  icon: {
    marginLeft: 10, // Adjust for spacing on the left
    margin:10
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    margin: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  pickerContainer: {
    margin: 10,
    borderColor: '#0077B6',
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: '#E9F7FA',
    marginBottom: 30,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 20,
    backgroundColor: '#E9F7FA',
    margin: 10,
    fontSize:16
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 17,
    backgroundColor: '#367DA3',
    position: 'absolute',
    bottom: -5,
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  activeItem: {
    transform: [{ translateY: -3 }],
  },
  underline: {
    width: '70%',
    height: 3,
    backgroundColor: '#000',
    marginTop: 5,
  },
});

export default SettingsScreen;
