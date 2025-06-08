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
  Alert,
  ScrollView 
} from 'react-native';
import { auth } from '../../firebase';

interface RegisterScreenProps {
  onBackToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = async () => {
    // Check if auth is properly initialized
    if (!auth) {
      Alert.alert('Error', 'Firebase authentication is not available');
      return;
    }

    // Validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }    setIsLoading(true);

    try {
      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;      // Update user profile with display name
      await user.updateProfile({
        displayName: fullName,
      });

      console.log('Registration successful:', user.uid);
      // ไม่ต้องแสดง Alert หรือ navigate manual เพราะ auth state listener จะจัดการ
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'An error occurred during registration';
      
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20}}>
            <Image 
              source={require('../../images/logo.png')} 
              style={{width: 100, height: 100, marginBottom: 20}} 
              resizeMode="contain" 
            />
            <Text style={{fontSize: 28, fontWeight: 'bold', color: '#DC2626', marginBottom: 8}}>
              Create Account
            </Text>            <Text style={{fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center'}}>
              Join ANTIHORSE today
            </Text>
            
            <View style={{width: '100%'}}>
              <View style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#EF4444', 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                marginBottom: 16
              }}>
                <Text style={{marginRight: 8, color: '#EF4444'}}>👤</Text>
                <TextInput
                  style={{flex: 1, fontSize: 16, color: '#1f2937'}}
                  placeholder="Full Name"
                  placeholderTextColor="#EF4444"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#EF4444', 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                marginBottom: 16
              }}>
                <Text style={{marginRight: 8, color: '#EF4444'}}>📧</Text>
                <TextInput
                  style={{flex: 1, fontSize: 16, color: '#1f2937'}}
                  placeholder="Email"
                  placeholderTextColor="#EF4444"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#EF4444', 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                marginBottom: 16
              }}>
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

              <View style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#EF4444', 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                marginBottom: 24
              }}>
                <Text style={{marginRight: 8, color: '#EF4444'}}>🔒</Text>
                <TextInput
                  style={{flex: 1, fontSize: 16, color: '#1f2937'}}
                  placeholder="Confirm Password"
                  placeholderTextColor="#EF4444"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={{
                  backgroundColor: isLoading ? '#9CA3AF' : '#DC2626', 
                  borderRadius: 12, 
                  paddingVertical: 12, 
                  marginBottom: 16
                }} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={{
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 8}}>
                <Text style={{color: '#6B7280', fontSize: 14}}>Already have an account? </Text>
                <TouchableOpacity onPress={onBackToLogin}>
                  <Text style={{color: '#DC2626', fontSize: 14, fontWeight: 'bold'}}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;