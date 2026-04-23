import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getToken } from '@/lib/auth';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { logger } from '@/lib/logger';
import { AuthStackParamList, AppStackParamList } from '@/lib/navigation';

// Screens
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import AccountsListScreen from '@/screens/accounts/AccountsListScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppStackParamList>();
const MODULE = 'App';

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// App Stack with Tabs
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Tableau de bord',
          tabBarLabel: 'Accueil',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />
      <Tab.Screen
        name="AccountsTab"
        component={AccountsListScreen}
        options={{
          title: 'Comptes',
          tabBarLabel: 'Comptes',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarLabel: 'Notifications',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation based on auth state
function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        setIsAuthenticated(!!token);
        await logger.info(MODULE, `Auth status: ${!!token}`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        await logger.error(MODULE, 'Auth check error', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

// Main App with AuthProvider
export default function App() {
  const [loggerReady, setLoggerReady] = useState(false);

  useEffect(() => {
    const initLogger = async () => {
      await logger.initialize();
      await logger.info(MODULE, 'Application démarrée');
      setLoggerReady(true);
    };

    initLogger();
  }, []);

  if (!loggerReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
