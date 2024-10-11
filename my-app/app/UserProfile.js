import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../firebaseConfig'; // Adjust path if needed
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // To get user ID from storage
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icons
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const UserProfile = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    username: '',
    guardianName: '',
    guardianPhone: '',
  });

  const fetchUserProfile = async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (!userDetails) {
        throw new Error('User details not found in AsyncStorage');
      }
      const parsedUserDetails = JSON.parse(userDetails);

      if (!parsedUserDetails.u_id) {
        return;
      }

      // Retrieve user data from Firestore using the user ID (u_id)
      const userDocRef = doc(db, 'users', parsedUserDetails.u_id);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || '',
          phone: data.phone || '',
          username: data.username || '',
          guardianName: data.guardianName || '',
          guardianPhone: data.guardianPhone || '',
        });
      } else {
        Alert.alert('Error', 'User profile not found.');
      }
    } catch (error) {
      console.error('Error fetching user details: ', error);
      Alert.alert('Error', 'Could not fetch profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const parsedUserDetails = JSON.parse(userDetails);

      // Reference to the user document
      const userDocRef = doc(db, 'users', parsedUserDetails.u_id);

      // Update user details (excluding password)
      await updateDoc(userDocRef, {
        name: userData.name,
        phone: userData.phone,
        username: userData.username,
        guardianName: userData.guardianName,
        guardianPhone: userData.guardianPhone,
      });

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
      Alert.alert('Error', 'Could not update profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        {/* Profile title skeleton */}
        <View style={styles.skeletonTitleContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonIcon} />
        </View>
        {/* Name input skeleton */}
        <View style={styles.skeletonInput} />
        {/* Phone input skeleton */}
        <View style={styles.skeletonInput} />
        {/* Username input skeleton */}
        <View style={styles.skeletonInput} />
        {/* Guardian Name input skeleton */}
        <View style={styles.skeletonInput} />
        {/* Guardian Phone input skeleton */}
        <View style={styles.skeletonInput} />
        {/* Save Changes button skeleton */}
        <View style={styles.skeletonButton} />
        {/* Logout button skeleton */}
        <View style={styles.skeletonButton} />
      </View>
    );
  }
  

  const currentScreen = 'UserProfile'; // Logic for determining the active screen

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust layout based on the platform
      style={{ flex: 1 }} >
        
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            {/* Title with icon */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Profile</Text>
              <Icon name="person-circle-outline" size={45} color="#0077B6" style={styles.icon} />
            </View>

            {/* Name input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
              />
            </View>

            {/* Phone input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => setUserData({ ...userData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Username input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={userData.username}
                onChangeText={(text) => setUserData({ ...userData, username: text })}
              />
            </View>

            {/* Guardian Name input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Guardian Name</Text>
              <TextInput
                style={styles.input}
                value={userData.guardianName}
                onChangeText={(text) => setUserData({ ...userData, guardianName: text })}
              />
            </View>

            {/* Guardian Phone input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Guardian Phone</Text>
              <TextInput
                style={styles.input}
                value={userData.guardianPhone}
                onChangeText={(text) => setUserData({ ...userData, guardianPhone: text })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Save Changes</Text>
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
            {currentScreen === 'ScheduledTrips' && <View style={styles.underline} />}
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
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#E9F7FA',  // Background color for the loading skeleton
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  // Skeleton title container with flex to space elements apart
  skeletonTitleContainer: {
    flexDirection: 'row',       // Row layout for title and icon
    justifyContent: 'space-between',  // Title on the left, icon on the right
    alignItems: 'center',
    marginBottom: 30,
  },
  skeletonTitle: {
    width: '40%',
    height: 30,
    backgroundColor: '#C4E0EF',
    borderRadius: 8,
  },
  skeletonIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#C4E0EF',
    borderRadius: 22.5,  // Circular shape
  },
  skeletonInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#C4E0EF',
    borderRadius: 8,
    marginBottom: 50,
  },
  skeletonButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#C4E0EF',
    borderRadius: 8,
    marginBottom: 20,
  },
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
    justifyContent: 'space-between', // Adjusted to space-between
    marginBottom: 60,
    marginTop: 30,
    margin: 10,
  },
  title: {
    fontSize: 32,
    marginBottom: 0,
    textAlign: 'left',
    fontFamily: 'Inter-Black',
  },
  icon: {
    marginRight: 10, // Adjust for spacing on the right
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
    margin: 10,
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    marginBottom: 10,
    margin: 10,
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    margin:10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold'
  },
  logoutButton: {
    backgroundColor: '#FF0000',
    marginTop: 15,
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 17,
    backgroundColor: '#367DA3',
    position: 'absolute',
    bottom: -5,
    width: '100%',
    borderTopLeftRadius: 15, // Increased for a circular top
    borderTopRightRadius: 15, // Increased for a circular top
  },
  navItem: {
    alignItems: 'center',
  },
  activeItem: {
    transform: [{ translateY: -4 }], // Lift the active icon
  },
  underline: {
    width: '70%',
    height: 3,
    backgroundColor: '#000',
    marginTop: 5,
  },
});

export default UserProfile;
