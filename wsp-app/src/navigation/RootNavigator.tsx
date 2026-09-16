import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';
import { isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useAccent } from '../components/ui';

import ConfigNeededScreen from '../screens/ConfigNeededScreen';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LogScreen from '../screens/LogScreen';
import ProgramScreen from '../screens/ProgramScreen';
import ProgressScreen from '../screens/ProgressScreen';
import LearnScreen from '../screens/LearnScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Log: 'add-circle-outline',
  Program: 'clipboard-outline',
  Progress: 'stats-chart-outline',
  Learn: 'book-outline',
  Coach: 'chatbubble-outline',
};

function MainTabs() {
  const accent = useAccent();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: palette.dim,
        tabBarStyle: { backgroundColor: palette.card, borderTopColor: palette.border },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name]} size={size ?? 20} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Program" component={ProgramScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Coach" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: palette.bg, card: palette.card, border: palette.border, text: palette.text },
};

export default function RootNavigator() {
  const { session, authLoading, profile, dataLoading } = useApp();

  if (!isSupabaseConfigured) return <ConfigNeededScreen />;
  if (authLoading) return <SplashScreen />;
  if (!session) return <AuthScreen />;
  if (dataLoading || !profile) return <SplashScreen message="Setting up your profile" />;
  if (!profile.name) return <OnboardingScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}
