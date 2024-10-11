import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <Image
          source={require('../assets/images/on board.png')} // video file
          shouldPlay
          resizeMode="contain"
          isLooping={true}  // If you don't want it to loop
          style={styles.image}
        />

      {/* Welcome Text Section */}
      <Text style={[styles.title, { fontFamily: 'Montserrat-SemiBold' }]}>Welcome</Text>
      <Text style={[styles.subtitle, { fontFamily: 'Montserrat-SemiBold' }]}>Abroad!</Text>
      <View style={styles.divider} />

      {/* Description Section */}
      <Text style={[styles.description, { fontFamily: 'Montserrat-Medium' }]}>
        Your trusted companion for stress-free bus travel. Set destination alarms, get weather updates, and notify loved ones when you arrive safely.  
      </Text>
      <Text style={[styles.description1, { fontFamily: 'Montserrat-Medium' }]}>
        Let's get started!
      </Text>

      {/* Buttons Section */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/OnBoarding1')} // Navigate to SignUp screen
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button2}
        onPress={() => router.push('/Login')}
      >
        <Text style={styles.buttonText1}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  video: {
    width: '85%',
    height: '37%',
    marginBottom:5,
    marginTop:10
  },
  image: {
    width: 280,
    height: 280,
    marginBottom: 20,
    marginTop:35
  },
  title: {
    fontSize: 34,
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 22,
    color: '#666666',
    marginBottom: 7,
  },
  description: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  description1: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 20,
    paddingHorizontal: 130,
    borderRadius: 20,
    marginBottom: 20,
    
  },
  button2: {
    backgroundColor: '#E9F7FA',
    paddingVertical: 20,
    paddingHorizontal: 130,
    borderRadius: 20,
    marginBottom: 20,
    borderColor:'#0077B6',
    borderWidth: 3,  
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  buttonText1: {
    color: '#000',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  divider: {
    height: 3,
    backgroundColor: '#0077B6',
    marginBottom: 20,
    width: '12%',
    alignSelf: 'center',
  },
});

export default WelcomeScreen;
