import React, { useState } from 'react';
import { View, Text, Alert, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const EditTrip = () => {
  const route = useRoute();
  const { trip } = route.params; // Get the trip data from params
  const navigation = useNavigation();
  
  const [date, setDate] = useState(new Date(trip.date));
  const [time, setTime] = useState(trip.time); // Use string for time instead of Date object
  const [weatherUpdate, setWeatherUpdate] = useState(trip.weatherUpdate || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Format time manually to avoid invalid format issues
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes, 0);
    const options = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Colombo' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  // Format date manually for displaying
  const formatDateForDisplay = (dateObj) => {
    return new Intl.DateTimeFormat('en-US', { 
      timeZone: 'Asia/Colombo', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(dateObj);
  };

  // Handle date change
  const onChangeDate = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  // Handle time change
  const onChangeTime = (event, selectedTime) => {
    if (selectedTime) {
      const selectedHour = selectedTime.getHours().toString().padStart(2, '0');
      const selectedMinute = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${selectedHour}:${selectedMinute}:00`; // Format the time as HH:mm:ss
      setTime(formattedTime);
    }
    setShowTimePicker(false);
  };

  // Validate and save changes
  const handleSaveChanges = async () => {
    const currentTime = new Date();
  
    // Ensure no past dates
    if (date < currentTime.setHours(0, 0, 0, 0)) {
      Alert.alert('Invalid Date', 'You cannot select a past date.');
      return;
    }
  
    const selectedDate = new Date(date);
    const selectedTime = new Date(`${selectedDate.toDateString()} ${time}`);
  
    if (selectedDate.toDateString() === currentTime.toDateString() && selectedTime < currentTime) {
      Alert.alert('Invalid Time', 'You cannot select a past time for today.');
      return;
    }
  
    try {
      const tripRef = doc(db, 'scheduledTrips', trip.id);
  
      // Format date and time for Firestore without any UTC conversion
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Get the date part only

      await updateDoc(tripRef, {
        date: formattedDate, // Save date as YYYY-MM-DD
        time: time, // Save the time as a string (HH:mm:ss)
        weatherUpdate, // Boolean value
      });
  
      Alert.alert('Success', 'Trip updated successfully!');
      navigation.navigate('ScheduledTripsDetails', { updated: true });
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Error', 'Could not update the trip. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Display the destination as static text */}
      <Text style={styles.destinationText}>Destination : {trip.destination.split(',').slice(0, 4).join(', ')}</Text>

      <View style={styles.container1}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.buttonText}>{date ? formatDateForDisplay(date) : 'Select Date'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()} // Disable past dates
            onChange={onChangeDate}
          />
        )}
      </View>

      <View style={styles.container2}>
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.buttonText}>{formatTime(time)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={new Date(`${date.toDateString()} ${time}`)}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}
      </View>

      <View style={styles.weatherUpdateContainer}>
        <Text style={styles.label}>Weather Update</Text>
        <Switch
          value={weatherUpdate}
          onValueChange={(value) => setWeatherUpdate(value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }} 
          thumbColor={weatherUpdate ? '#0077B6' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.button1} onPress={handleSaveChanges}>
        <Text style={styles.buttonText1}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E9F7FA',
  },
  buttonText: {
    color: '#0077B6',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  buttonText1: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  container1: {
    padding: 5,
    backgroundColor: '#E9F7FA',
    marginBottom: 20,
    marginTop: 15,
  },
  container2: {
    padding: 5,
    backgroundColor: '#E9F7FA',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
    margin: 10,
  },
  destinationText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    marginTop:20,
    fontFamily: 'Montserrat-SemiBold',
  },
  weatherUpdateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    marginBottom: 35,
  },
  button: {
    backgroundColor: '#E9F7FA',
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    margin: 10,
    borderColor: '#0077B6',
    borderWidth: 2,
  },
  button1: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    margin: 10,
  },
});

export default EditTrip;
