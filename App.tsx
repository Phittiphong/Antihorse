/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StatusBar, useColorScheme, View, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import LoginScreen from './screens/auth/login';
import RegisterScreen from './screens/auth/register';
import DepositScreen from './screens/main/deposit';
import TransferScreen from './screens/main/transfer';
import HistoryScreen from './screens/main/history';
import HomeScreen from './screens/main/home';
import NotificationsScreen from './screens/main/notifications';
import SettingsScreen from './screens/main/settings';
import firebase from './firebase';

type ScreenType = 'login' | 'register' | 'deposit' | 'transfer' | 'history' | 'home' | 'notification' | 'setting';

function BottomBar({ currentScreen, onNavigate }: { currentScreen: ScreenType, onNavigate: (screen: ScreenType) => void }) {
  const iconStyle = (active: boolean) => ({ fontSize: 26, color: active ? '#1E40AF' : '#222' });
  const tabStyle = (active: boolean) => ({ alignItems: 'center' as const, flex: 1, backgroundColor: active ? '#E0E7FF' : 'transparent', borderTopWidth: active ? 2 : 0, borderTopColor: active ? '#1E40AF' : 'transparent', paddingTop: 4 });
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', elevation: 8 }}>
      <TouchableOpacity onPress={() => onNavigate('home')} style={tabStyle(currentScreen === 'home')}>
        <Text style={iconStyle(currentScreen === 'home')}>{'🏠'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('deposit')} style={tabStyle(currentScreen === 'deposit')}>
        <Text style={iconStyle(currentScreen === 'deposit')}>{'💵'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('transfer')} style={tabStyle(currentScreen === 'transfer')}>
        <Text style={iconStyle(currentScreen === 'transfer')}>{'🔄'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('notification')} style={tabStyle(currentScreen === 'notification')}>
        <Text style={iconStyle(currentScreen === 'notification')}>{'🔔'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('setting')} style={tabStyle(currentScreen === 'setting')}>
        <Text style={iconStyle(currentScreen === 'setting')}>{'⚙️'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'deposit' | 'transfer' | 'history' | 'home' | 'notification' | 'setting'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [didShowPinVerifyModal, setDidShowPinVerifyModal] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      setTimeout(() => {
        if (user) {
          console.log('User authenticated, navigating to home');
          setIsAuthenticated(true);
          setCurrentScreen('home');
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

  const navigateToHistory = () => {
    setCurrentScreen('history');
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  type ScreenType = 'login' | 'register' | 'deposit' | 'transfer' | 'history' | 'home' | 'notification' | 'setting';
  const handleBottomBarNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
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
    if (isAuthenticated && currentScreen === 'home') {
      return <HomeScreen onNavigateToHistory={navigateToHistory} />;
    }
    if (isAuthenticated && currentScreen === 'deposit') {
      return <DepositScreen onNavigateToTransfer={navigateToTransfer} onNavigateToHistory={navigateToHistory} isPinVerified={isPinVerified} setIsPinVerified={setIsPinVerified} didShowPinVerifyModal={didShowPinVerifyModal} setDidShowPinVerifyModal={setDidShowPinVerifyModal} />;
    }
    if (isAuthenticated && currentScreen === 'transfer') {
      return <TransferScreen onBackToDeposit={navigateToDeposit} />;
    }
    if (isAuthenticated && currentScreen === 'history') {
      return <HistoryScreen onBack={navigateToHome} />;
    }
    if (isAuthenticated && currentScreen === 'notification') {
      return <NotificationsScreen />;
    }
    if (isAuthenticated && currentScreen === 'setting') {
      return <SettingsScreen />;
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
      <View style={{flex: 1}}>
        {renderScreen()}
      </View>
      {isAuthenticated && ['deposit','transfer','history','home','notification','setting'].includes(currentScreen) && (
        <BottomBar currentScreen={currentScreen} onNavigate={handleBottomBarNavigate} />
      )}
    </SafeAreaView>
  );
}

export default App;
