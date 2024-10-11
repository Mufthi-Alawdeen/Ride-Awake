import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,Alert,Image , Modal, Animated,PanResponder  } from 'react-native';
import { Audio } from 'expo-av';  // Import sound module from expo-av
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import navigation
import { db } from '../firebaseConfig'; 
import { collection, addDoc,getDoc,doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure this is imported
import { useRouter } from 'expo-router'; 
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { BlurView } from 'expo-blur'; 
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

const HomePage = () => {
  const navigation = useNavigation();
  const [wakeUpModalVisible, setWakeUpModalVisible] = useState(false);
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);  // Track SMS send success
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [updateAllowed, setUpdateAllowed] = useState(true); //
  const [location, setLocation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state
  const slideAnim = useState(new Animated.Value(-250))[0]; // Animation state
  const router = useRouter();
  const [address, setAddress] = useState('Loading...');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [route, setRoute] = useState([]);
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [weather, setWeather] = useState({
    temperature: null,
    condition: '',
    chanceOfRain: null, // Initialized with null to indicate no data
  });   
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [totalDistance, setTotalDistance] = useState(null);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [showWeatherInfo, setShowWeatherInfo] = useState(false);
  const [smsSent, setSmsSent] = useState(false); // Track if SMS has been sent
  const sound = useRef(null);
  const [modalVisible, setModalVisible] = useState(false); // Initialize modalVisible as false

  const locationRef = useRef(location);

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      // Slide out (close)
      Animated.timing(slideAnim, {
        toValue: -250, // Slide off the screen to the left
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSidebarOpen(false));
    } else {
      setIsSidebarOpen(true);
      // Slide in (open)
      Animated.timing(slideAnim, {
        toValue: 0, // Slide into view from the left
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };



  const modalPosition = useRef(new Animated.Value(200)).current; // Set initial value to 300 (partially visible)

const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderMove: (evt, gestureState) => {
      // Prevent the modal from going below 300 (collapsed state)
      if (gestureState.dy > 0 && modalPosition._value < 200) {
        Animated.timing(modalPosition, {
          toValue: 250, // Set to partially visible (collapsed)
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else if (gestureState.dy < 0 && modalPosition._value > 0) {
        // Swipe up to reveal the full modal
        Animated.timing(modalPosition, {
          toValue: 0, // Fully show the modal
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 50) {
        // Swipe down far enough to stop at 300 (collapsed state)
        Animated.timing(modalPosition, {
          toValue: 200, // Don't let the modal fully disappear, stop it at 300 (partially visible)
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else if (gestureState.dy < -50) {
        // Swipe up far enough to fully reveal the modal
        Animated.timing(modalPosition, {
          toValue: 0, // Fully expand the modal
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    },
  })
).current;

  

  // Play sound function
  const playSound = async () => {
    try {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3'),  // Path to your alarm sound
        {
          shouldPlay: true,
          isLooping: true,  // Set this to true to enable looping
        }
      );
      sound.current = soundObject;
      await sound.current.playAsync();  // Start playing the sound in a loop
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  

  const stopSound = async () => {
    if (sound.current) {
      await sound.current.stopAsync();  // Stop the sound playback
      await sound.current.unloadAsync();  // Unload the sound to free up resources
      sound.current = null;  // Reset sound reference
    }
  };
  
  

  const sendSMS = async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const parsedUserDetails = userDetails ? JSON.parse(userDetails) : null;
      const userDoc = await getDoc(doc(db, 'users', parsedUserDetails.u_id));
  
      if (userDoc.exists()) {
        const smsBody = userDoc.data().guardianSMS || 'User is within 2km of their destination.'; // Retrieve updated SMS body
        const message = `${smsBody}`;
  
        const response = await axios.post('https://rideawake.vercel.app/api/send-sms', {
          to: '+94767210055',
          message: message,
        });
        
        
  
        console.log('SMS sent successfully', response.data);
      }
    } catch (error) {
      console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    }
  }; 

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Permission to access location was denied.');
          return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        locationRef.current = currentLocation;
        setLocation(currentLocation);
  
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
  
        // Set marker but slightly offset it from the current location
        setDestinationMarker({
          latitude: currentLocation.coords.latitude + 0.01,  // Offset by 0.005 to make it easier to drag
          longitude: currentLocation.coords.longitude + 0.01,
        });
  
        // Fetch the address using reverse geocoding
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&format=json`);
        if (response.data && response.data.display_name) {
          setAddress(response.data.display_name);  // Set the address for the current location
        } else {
          setAddress('Unknown location');
        }
  
      } catch (error) {
        Alert.alert('Error', 'Failed to get current location');
      }
    })();
  }, []);
  
  
  useEffect(() => {
    if (query.length > 2) {
      // Fetch places based on the query
      const fetchPlaces = async () => {
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`);
          setPlaces(response.data);
        } catch (error) {
          console.warn('Error fetching places:', error);
        }
      };

      fetchPlaces();
    } else {
      setPlaces([]);
    }
  }, [query]);

  const fetchRouteFromTomTom = async (startCoords, endCoords) => {
    try {
      const response = await axios.get(
        `https://api.tomtom.com/routing/1/calculateRoute/${startCoords.latitude},${startCoords.longitude}:${endCoords.latitude},${endCoords.longitude}/json`,
        {
          params: {
            key: 'xoQ0gnTgcvHdyLqvNNvGvOvJYelNZKqB',
            travelMode: 'car',
          },
        }
      );
  
      const route = response.data.routes[0].legs[0].points.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));
  
      setRoute(route);
  
      // Convert the total distance from meters to kilometers
      const totalDistanceInKm = response.data.routes[0].summary.lengthInMeters / 1000;
      setTotalDistance(totalDistanceInKm.toFixed(2));  // Store total distance in kilometers
  
      // Assuming an average speed of 30 km/h
      const speedInKmH = 30;  // 30 kilometers per hour
      const estimatedTimeInHours = totalDistanceInKm / speedInKmH;  // Time in hours
      const estimatedTimeInMinutes = estimatedTimeInHours * 60;  // Convert hours to minutes
  
      setFormattedEstimatedTime(Math.round(estimatedTimeInMinutes));
      
      // Set the estimated time in minutes
  
    } catch (error) {
      console.warn('Error fetching route from TomTom:', error);
    }
  };

  const setFormattedEstimatedTime = (estimatedTimeInMinutes) => {
    const hours = Math.floor(estimatedTimeInMinutes / 60);
    const minutes = estimatedTimeInMinutes % 60;
  
    // Display time in "X hr and Y min" or "Y min" format, handling pluralization and edge cases
    if (hours > 0) {
      setEstimatedTime(`${hours} hr${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`);
    } else {
      setEstimatedTime(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
  };

   // Calculate distance between two coordinates (Haversine formula)
   const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };


  // Function to check proximity only if tracking is enabled
// Function to check proximity only if tracking is enabled
const checkProximity = (currentCoords, destinationCoords) => {
  if (!destinationCoords || smsSent || !tracking) return; // Skip if tracking is disabled or SMS already sent

  const distance = calculateDistance(
    currentCoords.latitude,
    currentCoords.longitude,
    destinationCoords.latitude,
    destinationCoords.longitude
  );

  // Check if the user is within 2km of the destination
  if (distance <= 2) {
    setTracking(false);
  }
};



const fetchWeather = async (lat, lon) => {
  try {
    const weatherResponse = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: 'bb95dda17e5044e5aa081455240110', // Replace with your WeatherAPI key
        q: `${lat},${lon}`,
        days: 1, // Fetch forecast for today
      },
    });

    // Extract current weather and forecast data
    const currentWeather = weatherResponse.data.current;
    const forecast = weatherResponse.data.forecast.forecastday[0].hour;

    // Get the chance of rain for the next 4 hours
    const nextFourHoursForecast = forecast.slice(0, 4); // Assuming current time is hour[0] in the data
    const chanceOfRain = nextFourHoursForecast.map(hour => hour.chance_of_rain).reduce((a, b) => Math.max(a, b), 0); // Get the highest chance of rain

    // Update state with both weather data and chance of rain
    setWeather({
      temperature: currentWeather.temp_c,
      condition: currentWeather.condition.text,  // Use the text description directly
      windspeed: currentWeather.wind_kph,
      chanceOfRain: chanceOfRain, // Get chance of rain from forecast
    });
  } catch (error) {
    console.warn('Error fetching weather:', error);
  }
};


const handlePlaceSelect = async (place) => {
  if (!place || !place.lat || !place.lon) return;
  const { lat, lon } = place;

  setDestinationMarker({
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
  });

  setRegion({
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  setQuery(''); // Clear search bar after selecting
  setPlaces([]); // Clear places list

  // Reverse geocode the coordinates to get the address
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const selectedAddress = response.data.display_name;
    setSelectedDestination(selectedAddress);  // Set the address to display

    // Fetch and display the route
    await fetchRouteFromTomTom(locationRef.current.coords, { latitude: parseFloat(lat), longitude: parseFloat(lon) });
  } catch (error) {
    console.warn('Error reverse geocoding:', error);
    setSelectedDestination('Unknown Location');  // Fallback if reverse geocoding fails
  }

  setShowScheduleOptions(true); // Show schedule options after selection
};


useEffect(() => {
  if (!tracking || !location || !destinationMarker) {
    return; // Only track if necessary
  }
  checkProximity(location.coords, destinationMarker);
}, [location, destinationMarker, tracking]);

const handleScheduleNow = async () => {
  if (!destinationMarker) return; // Ensure a destination is selected

  try {
    // Fetch the route from the current location to the destination
    await fetchRouteFromTomTom(locationRef.current.coords, destinationMarker);

    // Fetch the weather for the destination
    await fetchWeather(destinationMarker.latitude, destinationMarker.longitude);

    // Hide the schedule options and set up the modal to show
    setShowScheduleOptions(false);
    setShowWeatherInfo(true); // Display weather info and route details
    setModalVisible(true); // Show the modal after scheduling

    // Initially show only weather and route info, and hide the cancel button
    Animated.timing(modalPosition, {
      toValue: 300, // Set the modal to show partial content (weather and route)
      duration: 300, // Animate the modal to slide up
      useNativeDriver: false,
    }).start();

    setUpdateAllowed(false);
    setTimeout(() => {
      setUpdateAllowed(true); // Allow updates after 5 minutes
    }, 300000);

    // Check if the user is within 2km of the destination after calculating the route
    if (totalDistance && totalDistance <= 2) {
      setTimeout(() => {
        playSound(); // Play the alert sound
        setWakeUpModalVisible(true); // Show the wake-up modal instead of alert
      }, 2500); // Delay the modal by 2.5 seconds
    }
  } catch (error) {
    console.error('Error scheduling trip:', error);
    setErrorModalVisible(true); // Show error modal instead of alert
  }
};

// The onPress function for the 'I’m Awake' button in the wake-up modal
const handleWakeUpPress = async () => {
  stopSound(); // Stop the alert sound
  try {
    await sendSMS(); // Send an SMS to notify the guardian
    setWakeUpModalVisible(false); // Hide the wake-up modal
    setSmsSentSuccess(true); // Show the SMS success modal
  } catch (error) {
    console.error('Error sending SMS:', error);
    setErrorModalVisible(true); // Show error modal if SMS fails
  }
};

 

  const handleScheduleLater = async () => {
    if (selectedDestination) {
      try {
        // Save the destination to Firestore
        const docRef = await addDoc(collection(db, 'scheduledTrips'), {
          destination: selectedDestination,
        });
  
        // Navigate to the ScheduleLaterScreen and pass the destination and doc ID
        navigation.navigate('ScheduledTrips', { docId: docRef.id, destination: selectedDestination });
      } catch (error) {
        console.error('Error saving trip: ', error);
      }
    } else {
      alert("Please select a destination first.");
    }
  };
  

  // Function to handle updating the destination
  const handleUpdateDestination = () => {
    if (!updateAllowed) {
      return; // Simply return if updates are not allowed (no alert or feedback)
    }
  
    Alert.alert(
      'Update Destination',
      'Are you sure you want to update the destination?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Reset tracking and other trip-related data
            setTracking(false);
            setSelectedDestination(null); // Clear the selected destination
            setRoute([]); // Clear the route
            setWeather(null); // Clear the weather info
            setEstimatedTime(null); // Clear the estimated time
            setTotalDistance(null); // Clear the total distance
            setShowWeatherInfo(false); // Hide the weather info section
            setShowScheduleOptions(false); // Hide schedule options
  
            // Keep the destination marker and make it draggable
            setDestinationMarker((prevMarker) => prevMarker || destinationMarker); // Ensure the marker remains if it exists
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  
  
 // Function to handle canceling the trip
 const handleCancelTrip = () => {
  Alert.alert(
    'Cancel Trip',
    'Are you sure you want to cancel the trip?',
    [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          // Reset trip-related state, but keep the destination marker visible
          setTracking(false);
          setSelectedDestination(null); // Clear the selected destination name or label
          setRoute([]); // Clear the route
          setWeather(null); // Clear the weather info
          setEstimatedTime(null); // Clear the estimated time
          setTotalDistance(null); // Clear the total distance
          setShowWeatherInfo(false); // Hide weather info
          setModalVisible(false); // Hide the modal

          // Keep the destination marker on the map, but do not remove it
          if (destinationMarker) {
            setDestinationMarker({ ...destinationMarker }); // Retain the marker's current position
          }
        },
      },
    ],
    { cancelable: false }
  );
};


  const weatherConditionToGif = (condition) => {
    switch (condition) {
      case 'Clear':
      case 'Sunny':
        return require('../assets/images/cloudy sun.gif'); // GIF for clear skies
      case 'Partly cloudy':
      case 'Cloudy':
      case 'Mist':
      case 'Fog':
        return require('../assets/images/cloud.gif'); // GIF for partly cloudy
      case 'Moderate rain':
      case 'Patchy light rain':
      case 'Light drizzle':
        return require('../assets/images/drizzle.gif'); // GIF for partly cloudy
      case 'Rain':
      case 'Light rain':
      case 'Heavy rain':
      case 'Moderate or heavy rain shower':
        return require('../assets/images/rain.gif'); // GIF for rain
      case 'Thunderstorm':
        return require('../assets/images/Cloudy night.gif'); // GIF for thunderstorms
      default:
        return require('../assets/images/Cloudy night.gif'); // Fallback GIF for unknown conditions
    }
  };
  
  const handleMarkerDragEnd = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestinationMarker({ latitude, longitude });
  
    // Reverse geocode the coordinates to get the address
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const selectedAddress = response.data.display_name;
      setSelectedDestination(selectedAddress);  // Set the address to display
  
      // Fetch and display the route
      await fetchRouteFromTomTom(locationRef.current.coords, { latitude, longitude });
    } catch (error) {
      console.warn('Error reverse geocoding:', error);
      setSelectedDestination('Unknown Location');  // Fallback if reverse geocoding fails
    }
  
    setShowScheduleOptions(true); // Show schedule options after marker drag
  };
  

  return (
    <View style={styles.container}>
      {/* Sidebar toggle button */}

      <View style={styles.container1}> 
      <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          Current Location:
        </Text>
        <Text style={styles.locationText}>
          {errorMsg ? errorMsg : address.split(',').slice(0,2).join(',')}
        </Text>
      </View>

      {/* Sidebar Modal */}
      <Modal transparent={true} visible={isSidebarOpen} animationType="none">
        {/* Blurred Background */}
        <BlurView intensity={150} style={styles.modalBackground} onTouchEnd={toggleSidebar} />

        {/* Sidebar Content */}
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.sidebarContent}>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/UserProfile')}>
              <Icon name="person-circle-outline" size={40} color="#0077B6" />
              <Text style={styles.sidebarItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/Settings')}>
              <FontAwesome6 name="message" size={32} color="#0077B6" />
              <Text style={styles.sidebarItemText1}>Guardian Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/ScheduledTripsDetails')}>
              <Icon name="calendar-outline" size={40} color="#0077B6" />
              <Text style={styles.sidebarItemText}>Scheduled Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity
          style={[styles.button, styles.sidebarItem2]}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to log out?', // Message
              [
                {
                  text: 'Cancel',
                  style: 'cancel', // No action taken
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    try {
                      // Remove user details from local storage and navigate to the login screen
                      await AsyncStorage.removeItem('userDetails');
                      navigation.navigate('Login');
                    } catch (error) {
                      console.error('Error clearing local storage: ', error);
                      Alert.alert('Error', 'Could not log out. Please try again.');
                    }
                  },
                },
              ],
              { cancelable: true } // Allows dismissing the alert by tapping outside
            );
          }}
        >
          <SimpleLineIcons name="logout" size={32} color="red" />
          <Text style={styles.sidebarItemText2}>Logout</Text>
        </TouchableOpacity>

          </View>
        </Animated.View>
      </Modal>

      {selectedDestination ? (
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateDestination}>
        <View style={styles.selectedDestinationContainer}>
          <Text style={styles.selectedDestinationText}>
            Destination: {selectedDestination.split(',').slice(0,2).join(',')}
          </Text>
        </View>
        </TouchableOpacity>
    ) : (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search or Drag The Marker To Set Destination "
          value={query}
          onChangeText={setQuery}
        />
        <FlatList
          data={places}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePlaceSelect(item)}>
              <Text style={styles.placeItem}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}
    </View>

    <MapView style={styles.map} region={region}>
      {location && (
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Current Location"
        />
      )}

      {destinationMarker && (
        <Marker
          coordinate={destinationMarker}
          draggable
          onDragEnd={handleMarkerDragEnd}
          title="Destination"
        >
          <View style={styles.markerWrap}>
            <Image
              source={require('../assets/images/pin.png')}
              style={styles.marker}
            />
          </View>
        </Marker>
      )}

      {route.length > 0 && (
        <Polyline coordinates={route} strokeWidth={2} strokeColor="blue" />
      )}
    </MapView>

    {showScheduleOptions && selectedDestination && (
        <View style={styles.scheduleOptionsContainer}>
          <TouchableOpacity style={styles.scheduleNowButton} onPress={handleScheduleNow}>
            <Text style={styles.scheduleButtonText}>Schedule Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scheduleLaterButton} onPress={handleScheduleLater}>
            <Text style={styles.scheduleButtonText2}>Schedule Later</Text>
          </TouchableOpacity>
        </View>
      )}

    {/* Modal */}


    <Modal transparent={true} visible={wakeUpModalVisible} animationType="fade">
  <View style={styles.modalContainer1}>
    <View style={styles.modalContent1}>
    <Image
              source={require('../assets/images/alarm1.gif')}
              style={styles.alarm}
      />
      <Text style={styles.km} >You are within 2km of your destination!</Text>
      <TouchableOpacity
        style={styles.okButton}
        onPress={handleWakeUpPress}  // Trigger the wake-up action here
      >
        <Text style={styles.okButtonText}>I’m Awake</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    <Modal transparent={true} visible={errorModalVisible} animationType="fade">
  <View style={styles.modalContainer1}>
    <View style={styles.modalContent1}>
      <Text style={styles.notifyTitle}>Error</Text>
      <Text>Failed to send SMS or schedule the trip. Please try again.</Text>
      <TouchableOpacity
        style={styles.okButton}
        onPress={() => setErrorModalVisible(false)}  // Close the error modal
      >
        <Text style={styles.okButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


<Modal transparent={true} visible={smsSentSuccess} animationType="fade">
  <View style={styles.modalContainer1}>
    <View style={styles.modalContent1}>
    <Image
              source={require('../assets/images/sms.gif')}
              style={styles.alarm}
      />
      <Text style={styles.km} >Message successfully sent to guardian..</Text>
      
      <TouchableOpacity
        style={styles.okButton}
        onPress={() => setSmsSentSuccess(false)}  // Close the success modal
      >
        <Text style={styles.okButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



    {/* Modal */}
    {modalVisible && (
  <Animated.View
    {...panResponder.panHandlers}
    style={[styles.modalContainer, { transform: [{ translateY: modalPosition }] }]}
  >
    {/* Drag handle */}
    <View style={styles.modalHandle} />

    {/* Modal content showing weather and route info */}
    <View style={styles.modalContent}>
      {weather && weather.condition && (
        <>
          <TouchableOpacity 
            style={styles.weatherInfo}
            onPress={() => {
              if (destinationMarker && selectedDestination) {
                navigation.navigate('Weather', { 
                  latitude: destinationMarker.latitude, 
                  longitude: destinationMarker.longitude, 
                  destination: selectedDestination 
                });
              } else {
                Alert.alert("Error", "Please select a destination first.");
              }
            }}
          >
            <Image 
              source={weatherConditionToGif(weather.condition)}
              style={styles.weatherIcon} 
            />
          </TouchableOpacity>

          <Text style={styles.routeInfo}>
            Total Distance
          </Text>
          <Text style={styles.routeInfo2}>
            {totalDistance !== null ? `${totalDistance} km` : 'Calculating...'}
          </Text>
          <Text style={styles.routeInfo}>
            Estimated Time
          </Text>
          <Text style={styles.routeInfo1}>
            {estimatedTime !== null ? `${estimatedTime}` : 'Calculating...'}
          </Text>

          <TouchableOpacity 
            style={styles.weatherInfo}
            onPress={() => {
              if (destinationMarker && selectedDestination) {
                navigation.navigate('Weather', { 
                  latitude: destinationMarker.latitude, 
                  longitude: destinationMarker.longitude, 
                  destination: selectedDestination 
                });
              } else {
                Alert.alert("Error", "Please select a destination first.");
              }
            }}
          >
          <Text style={styles.weatherCondition}>Condition: {weather.condition}</Text>
          {weather.chanceOfRain !== undefined && (
            <Text style={styles.weatherCondition1}>Chance of Rain: {weather.chanceOfRain}%</Text>
          )}
          </TouchableOpacity>
        </>
      )}
      

      {/* Cancel button, ensure it's responsive */}
      <TouchableOpacity style={[styles.cancelTripButton, { zIndex: 10 }]} onPress={handleCancelTrip}>
        <Text style={styles.cancelTripButtonText}>Cancel Trip</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
)}

    </View>
  );
};

const styles = StyleSheet.create({
    km:{
      fontSize:19,
      textAlign:'center',
      fontFamily: 'Montserrat-SemiBold'

    },

    alarm:{
      alignSelf:'center',
      width:120,
      height:120

    },
    modalContainer1: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for modal overlay
    },
    modalContent1: {
      backgroundColor: 'white',
      padding: 30,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    okButton: {
      backgroundColor: '#0077B6', // Blue color for button
      paddingVertical: 15,
      paddingHorizontal: 35,
      borderRadius: 5,
      marginTop: 20,
    },
    okButtonText: {
      color: 'white',
      fontSize: 20,
    },
  map: {
    flex: 1,
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50, // Control the outer wrapper size
    height: 50, // Control the outer wrapper size
  },
  marker: {
    width: 40, // Adjust the marker image width
    height: 40, // Adjust the marker image height
    resizeMode: 'contain', // To make sure the image scales properly
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor:'#E9F7FA'
  },
  container1: {
    padding: 18,
    backgroundColor:'#E9F7FA',
    borderBottomRightRadius:15,
    borderBottomLeftRadius:12,
    // iOS shadow properties
    shadowColor: '#000', 
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,  // Adjust the shadow's transparency
    shadowRadius: 6,     // How much the shadow spreads (blur)
    
    // Android shadow (via elevation)
    elevation: 6,        // Elevation adds shadow for Android (higher number = bigger shadow)
    marginTop:-10,
  },
  weatherIcon: {
    width: 130,
    height: 130,
    marginLeft:15,  // Space between the image and text
    marginBottom: -20,
  },
  locationContainer: {
    marginBottom: 10,
    marginLeft:50
  },
  locationText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    textAlign:'center',
    marginTop:10
  },
  inputContainer: {
    marginBottom: 2,
    width: 350,
    alignSelf: 'center',
    marginTop: 10,
    // iOS shadow properties
    shadowColor: '#000', 
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,  // Adjust the shadow's transparency
    shadowRadius: 6,     // How much the shadow spreads (blur)
    
    // Android shadow (via elevation)
    elevation: 6,        // Elevation adds shadow for Android (higher number = bigger shadow)
  
    // Optional: background color so the shadow can be visible
    backgroundColor: '#fff',  // Set the background color (ensure it's not transparent for shadow to be visible)
    borderRadius: 10,         // Optional: Rounded corners
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  placeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
  selectedDestinationContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderColor:'#0077B6',
    borderWidth:2
  },
  selectedDestinationText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  routeInfo: {
    fontSize: 19,
    color: '#fff',
    textAlign: 'right',
    marginBottom:10,
    fontFamily: 'Inter-Black',
    right:10,
    top:-112
  },
  routeInfo1: {
    fontSize: 25,
    color: '#fff',
    textAlign: 'right',
    marginBottom:10,
    fontFamily: 'Montserrat-SemiBold',
    right:-5,
    top:-120
  },
  routeInfo2: {
    fontSize: 25,
    color: '#fff',
    textAlign: 'right',
    marginBottom:10,
    fontFamily: 'Montserrat-SemiBold',
    right:15,
    top:-120
  },
  scheduleOptionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scheduleNowButton: {
    padding: 13,
    backgroundColor: '#0077B6',
    borderRadius: 20,
  },
  scheduleLaterButton: {
    padding: 10,
    backgroundColor: '#F5FBFC',
    borderRadius: 20,
    marginTop:12,
    borderColor:'#0077B6',
    borderWidth:2
  },
  scheduleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  scheduleButtonText2: {
    color: '#0077B6',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  weatherContainer: {
    padding: 10,
    backgroundColor: '#0077B6',
    borderRadius: 5,
    marginTop: 10,
    flexDirection: 'row',  // Ensure the gif and weather info are side-by-side
    alignItems: 'center',
  },
  weatherDetails: {
    flexDirection: 'row', // Make GIF and details aligned horizontally
    alignItems: 'center',
  },
  weatherInfo: {
    justifyContent: 'flex-start', // Align weather text to the start of the view
    padding: 5
  },
  weatherText: {
    fontSize: 16,
    marginTop:-70,
    fontFamily: 'Montserrat-SemiBold',
    color:'#fff',
    marginBottom:10,
    textAlign:'right'
  },
  weatherCondition: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom:40,
    textAlign:'left',
    marginTop:-90,
  },
  weatherCondition1: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom:20,
    textAlign:'left',
    marginTop:-90,
  },
  updateButton: {
    marginTop: 10,
    borderRadius: 5,
  },
  updateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  selectedDestinationContainer1: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedDestinationText1: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 15,
    borderRadius: 10,
  },
  menuButtonText: {
    fontSize: 30,
    color: '#0077B6',

  },
  sidebar: {
    position: 'absolute',
    width: 250,
    height: '100%',
    backgroundColor: '#E9F7FA',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 20,
    left: 0, // Sidebar will slide in from the left
  },
  sidebarContent: {
    padding: 20,
  },
  sidebarItem: {
    paddingVertical: 3,
    flexDirection:'row',
    marginTop:50
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#0077B6',
    marginTop:10,
    marginLeft:10,
    fontFamily: 'Montserrat-SemiBold'
  },
  sidebarItem2: {
    paddingVertical: 3,
    flexDirection:'row',
    marginTop:430
  },
  sidebarItemText2: {
    fontSize: 19,
    color: 'red',
    marginTop:5,
    marginLeft:15,
    fontFamily: 'Inter-Black'
  },
  sidebarItemText1: {
    fontSize: 16,
    color: '#0077B6',
    marginTop:5,
    marginLeft:12,
    fontFamily: 'Montserrat-SemiBold'
  },
  modalBackground: {
    flex: 1,
  },
  icon1: {
    marginLeft: 5, // Adjust for spacing on the right
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 325,  // Set a minimum height  
    backgroundColor: '#367DA3', // Same as your theme color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 30,
  },
  modalContent: {
    alignItems: 'left',
  },
  cancelTripButton: {
    marginTop: -40,
    paddingVertical: 20,
    backgroundColor: '#A11313',
    borderRadius: 20,
    margin:15,
    zIndex: 10, // Ensure the button is above other elements
  borderWidth: 2, // Add a border for debugging
  },
  cancelTripButtonText: {
    color: '#E9F7FA',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'center'
  },
});

export default HomePage;
