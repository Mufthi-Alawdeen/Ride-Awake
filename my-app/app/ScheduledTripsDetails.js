import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, Modal,Image } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Notifications from 'expo-notifications';

const ScheduledTripsDetails = () => {
  const [scheduledTrips, setScheduledTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const showDeleteModal = (tripId) => {
    setSelectedTripId(tripId);
    setIsModalVisible(true);
  };

  // Request notification permissions
  async function requestNotificationPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission not granted for notifications');
    }
  }

  // Automatically send notification for expired trips
  async function sendExpiredNotification(item) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Trip Expired',
        body: `Your trip to ${item.destination} has expired.`,
      },
      trigger: null, // Send immediately
    });
  }

  // Check if the trip is expired
  const isTripExpired = (trip) => {
    const currentTime = new Date();
    const tripDate = new Date(`${trip.date}T${trip.time}`);
    return currentTime > tripDate;
  };

  // Send notification for expired trips only once
  const handleNotificationForExpiredTrip = async (trip) => {
    if (isTripExpired(trip) && !trip.notificationSent) {
      // Send the notification
      await sendExpiredNotification(trip);

      // Update the trip document to mark that the notification was sent
      const tripRef = doc(db, 'scheduledTrips', trip.id);
      await updateDoc(tripRef, { notificationSent: true });
    }
  };

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // Fetch trips from Firestore and check for expired trips
  const fetchScheduledTrips = async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const parsedUserDetails = userDetails ? JSON.parse(userDetails) : null;

      if (!parsedUserDetails || !parsedUserDetails.u_id) {
        Alert.alert('Error', 'User ID not found.');
        return;
      }

      const userId = parsedUserDetails.u_id;
      const tripsCollection = collection(db, 'scheduledTrips');
      const q = query(tripsCollection, where('u_id', '==', userId));
      const querySnapshot = await getDocs(q);

      const trips = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check if any trips are expired and handle notification
      trips.forEach((trip) => {
        if (!trip.notificationSent) { // Only check trips that haven't had a notification sent
          handleNotificationForExpiredTrip(trip);
        }
      });

      setScheduledTrips(trips);
    } catch (error) {
      console.error('Error fetching scheduled trips: ', error);
      Alert.alert('Error', 'Could not retrieve scheduled trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refetch data when screen is focused (e.g., after editing or deleting a trip)
  useFocusEffect(
    React.useCallback(() => {
      fetchScheduledTrips();
    }, [])
  );

  const handleDeleteTrip = async () => {
    try {
      if (selectedTripId) {
        await deleteDoc(doc(db, 'scheduledTrips', selectedTripId));  // Delete the selected trip
        fetchScheduledTrips();  // Refresh the list after deletion
      }
    } catch (error) {
      console.error('Error deleting trip: ', error);
      Alert.alert('Error', 'Could not delete the trip. Please try again.');
    } finally {
      setIsModalVisible(false);
      setSelectedTripId(null);
    }
  };

  // Function to navigate to the EditTrip page
  const handleEditTrip = (trip) => {
    navigation.navigate('EditTrip', { trip }); // Pass trip object to EditTrip
  };

  // Function to navigate to the Weather Details page
  const handleWeatherDetails = (trip) => {
    navigation.navigate('WeatherUpdates', { trip }); // Pass trip object to WeatherDetails
  };

  const currentScreen = 'ScheduledTripsDetails'; // Highlight the current screen in navbar

  // If loading, show an ActivityIndicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonTitleContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonIcon} />
        </View>

        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.skeletonTripItem}>
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />

            <View style={styles.skeletonButtonContainer}>
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        ))}

        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="home-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="calendar-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="person-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FontAwesome6 name="message" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scheduledTrips.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTripsText}>No scheduled trips found.</Text>
      </View>
    );
  }
  // Render scheduled trips
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Trips</Text>
        <MaterialIcons name="watch-later" size={40} color="#0077B6" />
      </View>

      {/* FlatList to display scheduled trips */}
      <FlatList
        data={scheduledTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isTripExpired(item);

          // Send notification if the trip is expired
          if (expired) sendExpiredNotification(item);

          return (
            <View style={[styles.tripItem, expired && styles.expiredTrip]}>
              {/* Display "Trip expired" if the trip is expired */}
            {expired && (
              <Text style={styles.expiredText}>Trip expired</Text>
            )}
            <Text style={styles.tripText}>Destination: {item.destination.split(',').slice(0, 4).join(', ')}</Text>
            <Text style={styles.tripText}>Date: {item.date}</Text>
            <Text style={styles.tripText}>
              Time: {new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          
            
          
            {/* Display weather updates button if weather updates are enabled */}
            {item.weatherUpdate && (
              <TouchableOpacity onPress={() => handleWeatherDetails(item)}>
                <Text style={styles.tripText}>Weather Updates: Enabled</Text>
              </TouchableOpacity>
            )}
          
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleEditTrip(item)} style={styles.editButton}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
          
              {item.weatherUpdate && (
                <TouchableOpacity onPress={() => handleWeatherDetails(item)}>
                  <View style={styles.iconContainer}>
                    <Image source={require('../assets/images/weather1.gif')} style={styles.icon} />
                  </View>
                </TouchableOpacity>
              )}
          
              <TouchableOpacity onPress={() => showDeleteModal(item.id)} style={styles.deleteButton}>
                <Text style={styles.buttonText1}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Delete confirmation modal */}
      <Modal transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this trip?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleDeleteTrip}>
                <Text style={styles.modalButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fixed Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.navItem, currentScreen === 'Home' && styles.activeItem]}>
          <Icon style={styles.navicon} name="home-outline" size={25} color={currentScreen === 'Home' ? '#000' : '#fff'} />
          {currentScreen === 'Home' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ScheduledTripsDetails')} style={[styles.navItem, currentScreen === 'ScheduledTripsDetails' && styles.activeItem]}>
          <Icon name="calendar-outline" size={25} color={currentScreen === 'ScheduledTripsDetails' ? '#000' : '#fff'} />
          {currentScreen === 'ScheduledTripsDetails' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={[styles.navItem, currentScreen === 'UserProfile' && styles.activeItem]}>
          <Icon style={styles.navicon} name="person-outline" size={25} color={currentScreen === 'UserProfile' ? '#000' : '#fff'} />
          {currentScreen === 'UserProfile' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.navItem, currentScreen === 'Settings' && styles.activeItem]}>
          <FontAwesome6 name="message" size={25} color={currentScreen === 'Settings' ? '#000' : '#fff'} />
          {currentScreen === 'Settings' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
    margin: 10,
    backgroundColor:'#E9F7FA'
  },
  title: {
    fontSize: 30,
    textAlign: 'left',
    fontFamily: 'Inter-Black',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E9F7FA',
  },
  tripItem: {
    backgroundColor: '#0077B6',
    padding: 24,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 10,
  },
  tripText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
  },
  icon: {
    width: 43,
    height: 43,
  },
  noTripsText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#777',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  expiredTrip: {
    backgroundColor: '#A1CFE8',  // Example color for expired trips
  },
  
  editButton: {
    backgroundColor: '#F5FBFC',
    padding: 15,
    borderRadius: 20,
    height:49
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 20,
    height:49
  },
  buttonText: {
    color: '#0077B6',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  buttonText1: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  expiredText: {
    fontSize: 18,
    color: '#FF0000',  // Red color for expired trips text
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 8,
    textAlign:'center',
    marginBottom:10
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 17,
    backgroundColor: '#367DA3',
    position: 'absolute',
    bottom: -5,
    width: '111%',
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
  iconContainer: {
    width: 66,
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0077B6',
  },
  skeletonTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  skeletonTitle: {
    width: '40%',
    height: 30,
    backgroundColor: '#C4E0EF', // Light gray for skeleton
    borderRadius: 8,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#C4E0EF', // Light gray for skeleton
    borderRadius: 20,
  },
  skeletonTripItem: {
    backgroundColor: '#C4E0EF', // Light gray for skeleton
    padding: 24,
    marginVertical: 10,
    borderRadius: 10,
  },
  skeletonText: {
    width: '80%',
    height: 20,
    backgroundColor: '#E1F5FF', // Lighter gray for text skeletons
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#C4E0EF'
  },
  skeletonButton: {
    width: '45%',
    height: 40,
    backgroundColor: '#E1F5FF', // Lighter gray for button skeletons
    borderRadius: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-SemiBold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#0077B6',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default ScheduledTripsDetails;
