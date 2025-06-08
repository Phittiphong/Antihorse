/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {SafeAreaView, StatusBar, useColorScheme} from 'react-native';
import LoginScreen from './screens/auth/login';
import RegisterScreen from './screens/auth/register';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  const navigateToRegister = () => {
    setCurrentScreen('register');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      {currentScreen === 'login' ? (
        <LoginScreen onNavigateToRegister={navigateToRegister} />
      ) : (
        <RegisterScreen onBackToLogin={navigateToLogin} />
      )}
    </SafeAreaView>
  );
}

export default App;
