import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons'; // Import icons
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CheckBox } from 'react-native-elements'; // Import CheckBox

// Using default parameters instead of default props
const ScheduledTrips = ({ docId = '', destination = '' } = {}) => {
  const route = useRoute();
  const navigation = useNavigation();

  // If the parameters are passed via route, they'll override the default parameters
  const { docId: routeDocId = docId, destination: routeDestination = destination } = route.params || {};

  const finalDocId = routeDocId;
  const finalDestination = routeDestination;

  if (!finalDocId || !finalDestination) {
    return (
      <View>
        <Text>Error: Missing trip information.</Text>
      </View>
    );
  }

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [weatherUpdate, setWeatherUpdate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserDetails = await AsyncStorage.getItem('userDetails');
        if (storedUserDetails) {
          const userDetails = JSON.parse(storedUserDetails);
          if (userDetails.u_id) {
            setUserId(userDetails.u_id);
          } else {
            Alert.alert('Error', 'User ID not found. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Error fetching user ID: ', error);
      }
    };

    fetchUserId();
  }, []);

  // Format date and time to Sri Lanka timezone
  const formatDateToSriLanka = (dateObj) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  const formatTimeToSriLanka = (dateObj) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);

    // Adjust selected date and check if it's in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize the current date to midnight

    if (currentDate.setHours(0, 0, 0, 0) < today.getTime()) {
      Alert.alert('Invalid Date', 'You cannot select a past date.');
    } else {
      setDate(currentDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);

    const selectedDate = new Date(date);
    const today = new Date();
    
    // If the selected date is today, ensure time is not in the past
    if (selectedDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0) && currentTime < today) {
      Alert.alert('Invalid Time', 'You cannot select a past time for today.');
    } else {
      setTime(currentTime);
    }
  };

  const saveScheduledTripDetails = async () => {
    try {
      // Adjust date and time according to Sri Lanka timezone before saving
      const sriLankaDateTime = new Date(date.getTime() + (330 * 60 * 1000)); // 330 minutes for Sri Lanka (UTC+5:30)
      const formattedDate = sriLankaDateTime.toISOString().split('T')[0];
      const formattedTime = sriLankaDateTime.toTimeString().split(' ')[0];

      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      const tripRef = doc(db, 'scheduledTrips', finalDocId);
      await updateDoc(tripRef, {
        date: formattedDate,
        time: formattedTime,
        weatherUpdate: weatherUpdate,
        u_id: userId,
      });

      Alert.alert('Success', 'Trip scheduled successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating trip: ', error);
      Alert.alert('Error', 'Could not save trip details. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Title with icon */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Schedule Trip</Text>
          <Ionicons name="calendar-outline" size={35} color="#0077B6" />
        </View>

        {/* Subheading */}
        <Text style={styles.subheading}>Trip Details</Text>
        <View style={styles.separator} />

        {/* Destination */}
        <Text style={styles.label1}>Schedule Trip to : {finalDestination.split(',').slice(0, 2).join(', ')}</Text>

        {/* Date Picker */}
        <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity style={styles.inputField} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>{formatDateToSriLanka(date)}</Text>
          <FontAwesome name="calendar" size={24} color="#0077B6" style={styles.icon} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()} // Disable past dates
            onChange={onDateChange}
          />
        )}

        {/* Time Picker */}
        <Text style={styles.label}>Select Time:</Text>
        <TouchableOpacity style={styles.inputField} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.inputText}>{formatTimeToSriLanka(time)}</Text>
          <MaterialIcons name="access-time" size={24} color="#0077B6" style={styles.icon} />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        {/* Weather update checkbox */}
        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Get Weather Updates?"
            checked={weatherUpdate}
            onPress={() => setWeatherUpdate(!weatherUpdate)}
            checkedColor="#0077B6"
            uncheckedColor="#0077B6"
            containerStyle={styles.checkbox}
            size={30} // Increase the checkbox size
            textStyle={styles.checkboxText} // Apply custom text styling
          />
        </View>

        <Text style={styles.infoText}>
          * Weather Updates Only available for the trip which is scheduled within 10 days from the current date.
        </Text>

        {/* Save button */}
        <TouchableOpacity style={styles.button1} onPress={saveScheduledTripDetails}>
          <Text style={styles.buttonText1}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexGrow: 1,
    backgroundColor: '#E9F7FA',
  },
  container: {
    paddingBottom: 20,
    justifyContent: 'center',
    margin: 6,
    backgroundColor: '#E9F7FA',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 45,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Black',
    color: '#000',
  },
  subheading: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  separator: {
    height: 3,
    backgroundColor: '#0077B6',
    marginBottom: 20,
    width: '15%',
    alignSelf: 'center',
  },
  label1: {
    fontSize: 17,
    marginVertical: 10,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 40,
  },
  label: {
    fontSize: 17,
    marginVertical: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  inputField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#000',
    paddingVertical: 12,
    marginBottom: 15,
    borderBottomWidth: 2,
    paddingHorizontal: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Montserrat-SemiBold',
  },
  icon: {
    marginLeft: 10,
  },
  checkboxContainer: {
    marginVertical: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  button1: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText1: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  checkboxText: {
    fontSize: 18, // Set larger font size
    color: '#000', // Optional: text color
  },
});

export default ScheduledTrips;
