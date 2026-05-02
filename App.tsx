import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { logger } from '@/lib/logger';
import { AuthStackParamList, TabParamList, AppStackParamList } from '@/lib/navigation';

// Screens
import LoginScreenMinimal from '@/screens/auth/LoginScreenMinimal';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import AccountsListScreen from '@/screens/accounts/AccountsListScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import CreateAccountScreen from '@/screens/accounts/CreateAccountScreen';
import AccountDetailScreen from '@/screens/accounts/AccountDetailScreen';

const MODULE = 'App';
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Auth Stack
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreenMinimal} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Tabs Navigator
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          backgroundColor: '#fff',
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Tableau de bord',
          tabBarLabel: 'Accueil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />
      <Tab.Screen
        name="AccountsTab"
        component={AccountsListScreen}
        options={{
          title: 'Comptes',
          tabBarLabel: 'Comptes',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💼</Text>,
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarLabel: 'Notifications',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔔</Text>,
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />
    </Tab.Navigator>
  );
}

// App Stack with Tabs + Detail/Create screens
function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AppStack.Screen
        name="HomeStack"
        component={AppTabs}
      />
      <AppStack.Screen
        name="CreateAccount"
        component={CreateAccountScreen as any}
        options={{
          presentation: 'card',
        }}
      />
      <AppStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen as any}
        options={{
          presentation: 'card',
        }}
      />
    </AppStack.Navigator>
  );
}

// Navigation based on auth state
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

// Main App with AuthProvider
export default function App() {
  const [loggerReady, setLoggerReady] = useState(false);

  useEffect(() => {
    const initLogger = async () => {
      try {
        await logger.initialize();
      } catch (error) {
        console.error('[App] Error initializing logger:', error);
      } finally {
        setLoggerReady(true);
      }
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
