import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Function to select the appropriate GIF based on the weather condition
const weatherConditionToGif = (condition) => {
  switch (condition) {
    case 'Clear':
      return require('../assets/images/cloud.gif');
    case 'Sunny':
      return require('../assets/images/cloudy sun.gif'); // GIF for clear skies
    case 'Partly cloudy':
    case 'Cloudy':
    case 'Fog':
      return require('../assets/images/cloud.gif'); // GIF for partly cloudy
    case 'Rain':
    case 'Light rain':
    case 'Heavy rain':
      return require('../assets/images/rain.gif'); // GIF for rain
    case 'Thunderstorm':
      return require('../assets/images/thunder.gif'); // GIF for thunderstorms
    case 'Patchy rain nearby':
    case 'Light rain shower': 
    case 'Light drizzle': 
      return require('../assets/images/drizzle.gif');
    default:
      return require('../assets/images/cloud.gif'); // Fallback GIF for unknown conditions
  }
};

const WeatherPage = () => {
  const route = useRoute();
  const { latitude, longitude, destination } = route.params; // Added destination

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch detailed weather data for the destination
  const fetchWeatherDetails = async () => {
    try {
      const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
        params: {
          key: 'bb95dda17e5044e5aa081455240110', // Replace with your WeatherAPI key
          q: `${latitude},${longitude}`,
          hours: 4, // Fetch next 4 hours of weather data
        },
      });

      setWeatherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching detailed weather data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherDetails();
  }, []);

  if (loading) {
    // Show a skeleton-like sketch while data is loading
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonTitleBar} />
        <View style={styles.skeletonWeatherContainer}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonWeatherDetails}>
            <View style={styles.skeletonTextBlock} />
            <View style={styles.skeletonTextBlock} />
            <View style={styles.skeletonTextBlock} />
          </View>
        </View>
        <View style={styles.skeletonForecastContainer}>
          <View style={styles.skeletonForecastRow}>
            <View style={styles.skeletonForecastBox} />
            <View style={styles.skeletonForecastBox} />
          </View>
          <View style={styles.skeletonForecastRow}>
            <View style={styles.skeletonForecastBox} />
            <View style={styles.skeletonForecastBox} />
          </View>
        </View>
      </View>
    );
  }

  // Extract current weather and forecast data from the fetched weather data
  const { current, forecast } = weatherData;
  const currentHour = new Date().getHours(); // Get current hour

  const forecastHours = forecast.forecastday[0].hour.slice(currentHour, currentHour + 6);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.titleContainer}>
        <Text style={styles.title1}>Weather</Text>
        <MaterialCommunityIcons name="weather-cloudy" size={40} color="#0077B6" />
      </View>
      
      {/* Destination at the top */}
      <Text style={styles.destinationTitle}>
        Destination: {destination.split(',')[2]} {/* Only display the first part of the destination */}
      </Text>

      <Text style={styles.title}>Current Weather</Text>

      {/* Current Weather */}
      <View style={styles.currentWeatherContainer}>
        <Image 
          source={weatherConditionToGif(current.condition.text)} // Use GIF based on weather condition
          style={styles.weatherIcon}
        />
        <View>
          <Text style={styles.currentTemperature}>{current.temp_c}°C</Text>
          <Text style={styles.conditionText}>Condition: {current.condition.text}</Text>
          <Text style={styles.conditionText}>Chance of Rain: {current.precip_mm || 0}%</Text>
          <Text style={styles.windSpeedText}>Windspeed: {current.wind_kph} km/h</Text>
          <Text style={styles.humidityText}>Humidity: {current.humidity}%</Text>
        </View>
      </View>

      {/* Hourly Forecast */}
      <View>
        <Text style={styles.hourlyTitle}>Next 4 Hours Forecast</Text>
        <View style={styles.hourlyRowContainer}>
          {forecastHours.map((hourData, index) => (
            <View key={index} style={styles.hourlyBox}>
              <Text style={styles.hourText}>{hourData.time.split(' ')[1]}</Text>
              <Image 
                source={weatherConditionToGif(hourData.condition.text)} // Use GIF based on hourly condition
                style={styles.hourlyIcon} 
              />
              <View style={styles.hourlyDetails}>
                <Text style={styles.hourlyTemp}>{hourData.temp_c}°C</Text>
                <Text style={styles.hourlyCondition}>{hourData.condition.text}</Text>
                <Text style={styles.hourlyChanceOfRain}>Rain: {hourData.chance_of_rain}%</Text>
                <Text style={styles.hourlyWind}>Wind: {hourData.wind_kph} km/h</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
};

// Styles for WeatherPage
const styles = StyleSheet.create({
  // Skeleton styles for loading state
  skeletonContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E9F7FA',
  },
  skeletonTitleBar: {
    height: 30,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 25,
    alignSelf: 'center',
  },
  skeletonWeatherContainer: {
    flexDirection: 'row',
    backgroundColor: '#C4E0EF',
    width: 370,
    borderRadius: 10,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
  },
  skeletonIcon: {
    width: 120,
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginRight: 10,
  },
  skeletonWeatherDetails: {
    justifyContent: 'space-between',
  },
  skeletonTextBlock: {
    width: 120,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonForecastContainer: {
    marginTop: 20,
  },
  skeletonForecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  skeletonForecastBox: {
    width: '48%',
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  
  // Actual content styles below
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 35,
    marginTop: 20,
    margin: 10,
  },
  title1: {
    fontSize: 30,
    textAlign: 'left',
    fontFamily: 'Inter-Black',
  },
  container: {
    padding: 16,
    backgroundColor: '#E9F7FA',
  },
  destinationTitle: {
    fontSize: 19,
    marginBottom: 20,
    textAlign: 'center', // Center the destination name
    fontFamily: 'Montserrat-SemiBold',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  currentWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
    backgroundColor: '#0077B6',
    width: 370,
    borderRadius: 10,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  weatherIcon: {
    width: 120,
    height: 120,
    marginRight: 10,
  },
  currentTemperature: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F5FBFC',
    fontFamily: 'Montserrat-SemiBold',
  },
  conditionText: {
    fontSize: 17,
    marginTop: 5,
    color: '#F5FBFC',
    fontFamily: 'Montserrat-SemiBold',
  },
  windSpeedText: {
    fontSize: 17,
    marginTop: 5,
    color: '#F5FBFC',
    fontFamily: 'Montserrat-SemiBold',
  },
  humidityText: {
    fontSize: 17,
    marginTop: 5,
    color: '#F5FBFC',
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  hourlyTitle: {
    fontSize: 19,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 20,
  },
  hourlyRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Wrap the rows if they exceed screen width
    justifyContent: 'space-between', // Add spacing between items
  },
  hourlyBox: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F5FBFC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '48%', // Set width to fit two items in one row
    borderColor: '#0077B6',
    borderWidth: 2,
  },
  hourlyIcon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  hourText: {
    fontSize: 20,
    color: '#0077B6',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 10,
    marginTop: 7,
  },
  hourlyDetails: {
    alignItems: 'center', // Center details inside each box
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077B6',
    fontFamily: 'Montserrat-SemiBold',
  },
  hourlyCondition: {
    fontSize: 15,
    color: '#0077B6',
    marginTop: 5,
    fontFamily: 'Montserrat-SemiBold',
  },
  hourlyChanceOfRain: {
    fontSize: 15,
    color: '#0077B6',
    marginTop: 5,
    fontFamily: 'Montserrat-SemiBold',
  },
  hourlyWind: {
    fontSize: 14,
    color: '#0077B6',
    marginTop: 5,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default WeatherPage;
