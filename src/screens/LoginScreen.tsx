import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedMobile = await AsyncStorage.getItem('savedMobile');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedMobile && savedPassword) {
        setMobile(savedMobile);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (e) {
      console.error('Failed to load credentials', e);
    }
  };

  const saveCredentials = async (mobile: string, password: string) => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedMobile', mobile);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedMobile');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (e) {
      console.error('Failed to save credentials', e);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!mobile.trim()) {
      setError('Enter your mobile number');
      return;
    }
    if (!password) {
      setError('Enter your password');
      return;
    }
    setLoading(true);
    const ok = await login(mobile, password);
    setLoading(false);
    if (ok) {
      await saveCredentials(mobile, password);
    } else {
      setError('Invalid mobile or password. Use 10+ digits and 4+ char password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.logo}>DealerTribe</Text>
        <Text style={styles.tagline}>Agent network for Pakistan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.welcome}>Sign in to continue</Text>

        <InputField
          label="Mobile Number"
          placeholder="03XX XXXXXXX"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
          maxLength={15}
        />
        <InputField
          label="Password"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.rememberRow}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </Pressable>
          <Pressable onPress={() => {}} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </View>

        <Button title="Login" onPress={handleLogin} loading={loading} />

        <Pressable onPress={() => navigation.navigate('SignUp' as never)} style={styles.signupLink}>
          <Text style={styles.signupLinkText}>
            Don't have an account? Sign Up
          </Text>
        </Pressable>

        <Text style={styles.hint}>
          Demo: any 10+ digit number with 4+ character password
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.headerBg,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  forgotLink: {
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  signupLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
  signupLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
