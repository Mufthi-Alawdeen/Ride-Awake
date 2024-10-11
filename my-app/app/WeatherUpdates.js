import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const WeatherDetails = () => {
  const route = useRoute();
  const { trip } = route.params;
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalTripTime = (tripDate, tripTime) => {
    const tripDateTime = new Date(`${tripDate}T${tripTime}`);
    return tripDateTime.toISOString().split('.')[0];
  };

  const fetchWeatherDetails = async () => {
    try {
      const tripDate = new Date(trip.date);
      const currentDate = new Date();
      const daysDifference = Math.ceil((tripDate - currentDate) / (1000 * 60 * 60 * 24));

      if (daysDifference < -10) {
        // Trip is more than 10 days in the past, show no data available
        setWeatherData('past');
        setLoading(false);
        return;
      }

      const apiDaysLimit = 10;  // WeatherAPI only provides 10-day forecast

      if (daysDifference > apiDaysLimit) {
        // For dates more than 10 days in the future, show no data available
        setWeatherData('future');
        setLoading(false);
        return;
      }

      // Valid future date within 10 days, fetch data
      const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
        params: {
          key: 'bb95dda17e5044e5aa081455240110',
          q: trip.destination,
          days: daysDifference + 1,
          hour: true,
        },
      });

      setWeatherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
      Alert.alert('Error', 'Could not fetch weather data. Please try again later.');
    }
  };

  useEffect(() => {
    fetchWeatherDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (weatherData === 'past') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Weather data is not available for past dates.</Text>
      </View>
    );
  }

  if (weatherData === 'future') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Weather data is not available for dates beyond 10 days in the future.</Text>
      </View>
    );
  }

  const forecast = weatherData?.forecast?.forecastday || [];
  if (forecast.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Weather data is not available for this location.</Text>
      </View>
    );
  }

  const localTripTime = getLocalTripTime(trip.date, trip.time);
  const tripForecast = forecast.find(day => day.date === trip.date);

  if (!tripForecast) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No forecast data found for the scheduled date.</Text>
      </View>
    );
  }

  const relevantHours = tripForecast.hour.filter((hourData) => {
    const forecastTime = new Date(hourData.time).toISOString().split('.')[0];
    const timeDifference = Math.abs(new Date(forecastTime) - new Date(localTripTime)) / (1000 * 60 * 60);
    return timeDifference <= 2;
  });

  const beforeTripWeather = forecast[0]; // Forecast for 1 day before
  const afterTripWeather = forecast[2]; // Forecast for 1 day after

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weather Forecast for {trip.destination.split(',').slice(0,4).join(', ')}</Text>

      {/* Display weather data for the hours around the scheduled time */}
      <View style={styles.weatherRow}>
        {relevantHours.length > 0 ? (
          relevantHours.map((hourData, index) => (
            <View key={index} style={styles.weatherCard}>
              <Text style={styles.sectionTitle}>
                {new Date(hourData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Image
                source={{ uri: `https:${hourData.condition.icon}` }}
                style={styles.weatherIcon}
              />
              <Text style={styles.conditionText}>{hourData.condition.text}</Text>
              <Text style={styles.detailText}>Temp: {hourData.temp_c}°C</Text>
              <Text style={styles.detailText}>Chance of Rain: {hourData.chance_of_rain}%</Text>
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No relevant hourly weather data found for the scheduled time.</Text>
        )}
      </View>

      <View> 
        <Text style={styles.Text1} > Weather Summary for Surrounding Days </Text>
      </View>
      
      {/* Day Before and Day After Forecast */}
      <View style={styles.weatherRow}>
        {beforeTripWeather && (
          <View style={styles.weatherCard1}>
            <Text style={styles.sectionTitle1}>A Day Before</Text>
            <Image
              source={{ uri: `https:${beforeTripWeather.day.condition.icon}` }}
              style={styles.weatherIcon}
            />
            <Text style={styles.conditionText1}>{beforeTripWeather.day.condition.text}</Text>
            <Text style={styles.detailText1}>Avg Temp: {beforeTripWeather.day.avgtemp_c}°C</Text>
            <Text style={styles.detailText1}>Chance of Rain: {beforeTripWeather.day.daily_chance_of_rain}%</Text>
          </View>
        )}

        {afterTripWeather && (
          <View style={styles.weatherCard1}>
            <Text style={styles.sectionTitle1}>A Day After</Text>
            <Image
              source={{ uri: `https:${afterTripWeather.day.condition.icon}` }}
              style={styles.weatherIcon}
            />
            <Text style={styles.conditionText1}>{afterTripWeather.day.condition.text}</Text>
            <Text style={styles.detailText1}>Avg Temp: {afterTripWeather.day.avgtemp_c}°C</Text>
            <Text style={styles.detailText1}>Chance of Rain: {afterTripWeather.day.daily_chance_of_rain}%</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#E9F7FA',
  },
  title: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Montserrat-SemiBold',
  },
  Text1: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Montserrat-SemiBold',
    marginTop:10
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allow the items to wrap into the next row
    marginBottom: 20,
  },
  weatherCard: {
    backgroundColor: '#0077B6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: '49%', // Ensure two cards fit in one row
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
    color: '#E9F7FA',
    marginTop: 8,
    fontFamily: 'Montserrat-SemiBold'

  },
  conditionText: {
    fontSize: 15,
    color: '#E9F7FA',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  weatherIcon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginVertical: 10,
  },
  detailText: {
    fontSize: 15,
    color: '#E9F7FA',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#E9F7FA'
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  weatherCard1: {
    backgroundColor: '#E9F7FA',
    borderColor:'#0077B6',
    borderWidth:2,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: '48%', // Ensure two cards fit in one row
  },
  sectionTitle1: {
    fontSize: 17,
    marginBottom: 8,
    textAlign: 'center',
    color: '#0077B6',
    marginTop: 8,
    fontFamily: 'Montserrat-SemiBold'

  },
  conditionText1: {
    fontSize: 14,
    color: '#0077B6',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  detailText1: {
    fontSize: 14,
    color: '#0077B6',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default WeatherDetails;
