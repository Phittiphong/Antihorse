import React, {useState} from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Platform, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Alert 
} from 'react-native';
import firebase from '../../firebase';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log('Login successful:', userCredential.user.uid);
      // ไม่ต้องแสดง Alert เพราะ auth state listener จะจัดการ navigation
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      Alert.alert('Login Failed', errorMessage);    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24}}>
          <Image source={require('../../images/logo.png')} style={{width: 128, height: 128, marginBottom: 24}} resizeMode="contain" />
          <Text style={{fontSize: 50, fontWeight: 'bold', color: '#DC2626', marginBottom: 8}}>ANTIHORSE</Text>
          <Text style={{fontSize: 20, color: '#6B7280', marginBottom: 24, textAlign: 'center', fontWeight: 'bold'}}>"ปลอดภัยจากบัญชีม้าถ้าทุกคนช่วยกันดูดม้า"</Text>
          <View style={{width: '100%', marginTop: 16, marginBottom: 8}}>
            <View style={{flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16}}>
              <Text style={{marginRight: 8, color: '#EF4444'}}>👤</Text>
              <TextInput
                style={{flex: 1, fontSize: 16, color: '#1f2937'}}
                placeholder="Username"
                placeholderTextColor="#EF4444"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8}}>
              <Text style={{marginRight: 8, color: '#EF4444'}}>🔒</Text>
              <TextInput
                style={{flex: 1, fontSize: 16, color: '#1f2937'}}
                placeholder="Password"
                placeholderTextColor="#EF4444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{width: 16, height: 16, borderWidth: 1, borderColor: '#EF4444', borderRadius: 4, marginRight: 8, backgroundColor: '#EF4444'}} />
                <Text style={{fontSize: 12, color: '#6B7280'}}>Remember Password</Text>
              </View>
            </View>            <TouchableOpacity 
              style={{
                backgroundColor: isLoading ? '#9CA3AF' : '#DC2626', 
                borderRadius: 12, 
                paddingVertical: 12, 
                marginBottom: 8
              }} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={{
                color: 'white', 
                fontSize: 18, 
                fontWeight: 'bold', 
                textAlign: 'center'
              }}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 8}}>
              <Text style={{color: '#6B7280', fontSize: 14}}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={{color: '#DC2626', fontSize: 14, fontWeight: 'bold'}}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
