import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Image */}
      <Image
        source={require('../assets/images/alarm.png')} // Change to your image
        style={styles.image}
      />

      {/* Text and Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>RideAwake</Text>
        <Text style={styles.subtitle}>Will Wake you There</Text>
        <Text style={styles.description}>
          Set alarms that go off automatically when you're near your destination
        </Text>
      
      {/* Navigation controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/OnBoarding2')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F7FA', // Light blue background to match your design
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  image: {
    width: '140%',
    height: '75%', // Make sure the image takes more than half the screen
    resizeMode: 'contain',
    marginTop:-35
  },
  textContainer: {
    backgroundColor: '#ffff',
    width: '110%',
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderTopLeftRadius: 100,  // Increased for a circular top
    borderTopRightRadius: 100, // Increased for a circular top
    position: 'relative',
    top: -80, // Lift the text container up a bit to cover part of the image
    borderWidth: 5,
    borderColor: '#000',
    overflow: 'hidden',  // To make sure the content stays within the container
  },
  
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-SemiBold',
    color: '#000', // Black color for title
    marginBottom: 12,
    marginTop:-25
  },
  subtitle: {
    fontSize: 20,
    color: '#065681', // Blue color for the subtitle
    fontFamily: 'Montserrat-Medium',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#5a5a5a', // Greyish text
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    paddingBottom: 20,
    marginTop:50
  },
  skipButton: {
    color: '#333',
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: '#ffff',
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 2,            
    borderColor: '#0077B6',
  },
  dotActive: {
    width: 10,
    height: 10,
    backgroundColor: '#0077B6',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default OnboardingScreen;
