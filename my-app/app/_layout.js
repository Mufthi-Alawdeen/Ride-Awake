import React from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen'; // To control the splash screen
import { useFonts } from 'expo-font';
import { View, ActivityIndicator,TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons from expo/vector-icons

// Keep the splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Inter-Black': require('../assets/fonts/Inter_18pt-Black.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
  });

  // Show loading screen while fonts are being loaded
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Hide the splash screen once fonts are loaded
  SplashScreen.hideAsync();

  return (
    <Stack
    screenOptions={({ navigation }) => ({
      headerStyle: {
        backgroundColor: '#E9F7FA',  // Global header background color
      },
      headerTintColor: '#0077B6',  // Global text color for the back button and header
      headerTitleStyle: {
        fontFamily: 'Montserrat-SemiBold',  // Custom font for header title
        fontSize: 18,  // Font size for title
      },
      headerTitleAlign: 'center',  // Center align the title globally

      // Customize back button globally
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}  // Navigate back when pressed
          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}
        >
          {/* Custom back icon */}
          <Ionicons name="chevron-back-circle" size={35} color="#0077B6" />
        </TouchableOpacity>
      ),
    })}
  >
      {/* Splash and index screens */}
      <Stack.Screen
        name="splash"
        options={{ headerShown: false }} // Hide header for splash screen
      />
      <Stack.Screen
        name="index"
        options={{ headerShown: false }} // Hide header for index route
      />

      {/* Authentication screens */}
      <Stack.Screen
        name="SignUpScreen"
        options={{ headerShown: false }} // Customize header title for SignUp
      />
      <Stack.Screen
        name="GuardianDetails"
        options={{ headerShown: false }} // Customize header title for SignUp
      />
      <Stack.Screen
        name="Settings"
        options={{ title: "" }} // Customize header title for SignUp
      />
      <Stack.Screen
        name="ForgotPassword"
        options={{ title: "" }} // Customize header title for SignUp
      />
      <Stack.Screen
        name="Login"
        options={{ title: "" , headerShown: false }} // Customize header title for Login
      />

      {/* Onboarding screens */}
      <Stack.Screen
        name="OnBoarding1"
        options={{ headerShown: false  }} // Customize Onboarding1 header
      />
      <Stack.Screen
        name="OnBoarding2"
        options={{ headerShown: false  }} // Customize Onboarding2 header
      />
      <Stack.Screen
        name="OnBoarding3"
        options={{ headerShown: false  }} // Customize Onboarding3 header
      />

      {/* Main app screens */}
      <Stack.Screen
        name="Home"
        options={{
          title: 'RideAwake',
          headerLeft: null, // Disable the back button on the Home screen
          headerBackVisible: false,
        }}
      />

      {/* Other app screens */}
      <Stack.Screen
        name="ScheduledTrips"
        options={{ title: "" }} // Customize Scheduled Trips header
      />
      <Stack.Screen
        name="UserProfile"
        options={{ title: "" }} // Customize Profile header
      />
      <Stack.Screen
        name="Weather"
        options={{ title: "" }} // Customize Weather header
      />
      <Stack.Screen
        name="ScheduledTripsDetails"
        options={{ title: "" }} // Customize Scheduled Trips Details header
      />
      <Stack.Screen
        name="EditTrip"
        options={{ title: "Edit Trip" }} // Customize Edit Trip header
      />
      <Stack.Screen
        name="WeatherUpdates"
        options={{ title: "Weather Updates" }} // Customize Weather Updates header
      />
    </Stack>
  );
}
