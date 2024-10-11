import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import OnboardingScreen from './app/OnBoarding1';
import SignUpScreen from './app/SignUpScreen';
import GuardianDetailsScreen from './app/GuardianDetails';
import WelcomeScreen from './app/index'; // Sign-in screen

const Stack = createStackNavigator();

const App = () => {


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }} // Hides header for onboarding
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ title: 'Sign Up' }} // Adds a title to the sign-up screen
        />
        <Stack.Screen 
          name="GuardianDetails" 
          component={GuardianDetailsScreen} 
          options={{ title: 'Guardian Details' }} // Adds a title for the guardian details
        />
        <Stack.Screen 
          name="SignIn" 
          component={WelcomeScreen} 
          options={{ title: 'Welcome' }} // Title for sign-in screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
