
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = async () => {
    console.log('=== LOGIN BUTTON PRESSED ===');
    console.log('Email:', email);
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in...');
      await signIn(email, password);
      
      console.log('Login successful, navigating to home');
      Alert.alert(
        'Welcome Back! 👋',
        'You have successfully logged in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/(home)/'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
          </Pressable>

          <View style={styles.header}>
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.logoContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="sparkles" size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Sign in to GTM Store
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }]}>
                <IconSymbol name="envelope.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }]}>
                <IconSymbol name="lock.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <IconSymbol 
                    name={showPassword ? "eye.slash.fill" : "eye.fill"} 
                    size={20} 
                    color={theme.dark ? '#98989D' : '#666'} 
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#999', '#666'] : ['#FF6B9D', '#C44569']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
              <Text style={[styles.dividerText, { color: theme.dark ? '#98989D' : '#666' }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            </View>

            <Pressable
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
            >
              <Text style={[styles.signupText, { color: theme.dark ? '#98989D' : '#666' }]}>
                Don&apos;t have an account?{' '}
                <Text style={styles.signupTextBold}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupTextBold: {
    fontWeight: '700',
    color: '#FF6B9D',
  },
});
