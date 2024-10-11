import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomSplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          // If user details exist in local storage, navigate to Home
          navigation.replace('Home'); // Replace 'Home' with your main screen
        } else {
          // If no user details, navigate to splash
          navigation.replace('splash'); // Replace 'Splash' with your onboarding or login screen
        }
      } catch (error) {
        console.error('Error checking local storage', error);
        // Fallback in case of error, can redirect to splash/login
        navigation.replace('splash');
      }
    };

    // Run the check after the animation or loading time
    setTimeout(() => {
      checkUserDetails();
    }, 3500); // Adjust this timeout based on your animation length

  }, []);

  return (
    <View style={styles.container}>
      {/* Example with a GIF */}
      <Image
        source={require('../assets/images/RideAwake.gif')} // Your splash GIF
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FBFC', // Same background as splash
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CustomSplashScreen;
