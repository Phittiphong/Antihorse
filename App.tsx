/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StatusBar, useColorScheme, View, ActivityIndicator, Text} from 'react-native';
import LoginScreen from './screens/auth/login';
import RegisterScreen from './screens/auth/register';
import DepositScreen from './screens/main/deposit';
import TransferScreen from './screens/main/transfer';
import { auth } from './firebase';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'deposit' | 'transfer'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      setTimeout(() => {
        if (user) {
          console.log('User authenticated, navigating to deposit');
          setIsAuthenticated(true);
          setCurrentScreen('deposit');
        } else {
          console.log('User not authenticated, navigating to login');
          setIsAuthenticated(false);
          setCurrentScreen('login');
        }
        setIsLoading(false);
      }, 100);
    });

    return unsubscribe;
  }, []);

  const navigateToRegister = () => {
    setCurrentScreen('register');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const navigateToTransfer = () => {
    setCurrentScreen('transfer');
  };

  const navigateToDeposit = () => {
    setCurrentScreen('deposit');
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC'}}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={{marginTop: 16, fontSize: 16, color: '#6B7280'}}>Loading...</Text>
        </View>
      );
    }

    if (isAuthenticated && currentScreen === 'deposit') {
      return <DepositScreen onNavigateToTransfer={navigateToTransfer} />;
    }

    if (isAuthenticated && currentScreen === 'transfer') {
      return <TransferScreen onBackToDeposit={navigateToDeposit} />;
    }
    
    if (currentScreen === 'login') {
      return <LoginScreen onNavigateToRegister={navigateToRegister} />;
    }
    
    return <RegisterScreen onBackToLogin={navigateToLogin} />;
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      {renderScreen()}
    </SafeAreaView>
  );
}

export default App;
