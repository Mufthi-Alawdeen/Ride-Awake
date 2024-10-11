import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const OnboardingScreen2 = () => {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/message.png')}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>RideAwake</Text>
        <Text style={styles.subtitle}>Will Notify When you are reached</Text>
        <Text style={styles.description}>
        Automatically notify a guardian when you arrive safely at your destination.
        </Text>
    
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('NextScreen')}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dotActive} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/OnBoarding3')}
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
    width: '200%',
    height: '75%', // Make sure the image takes more than half the screen
    resizeMode: 'contain',
    marginTop:-45
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
    fontSize: 18,
    color: '#065681', // Blue color for the subtitle
    marginBottom: 12,
    fontFamily: 'Montserrat-SemiBold',
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

export default OnboardingScreen2;
