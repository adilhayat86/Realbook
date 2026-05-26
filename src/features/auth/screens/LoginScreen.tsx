import React, { useEffect, useState } from 'react';
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
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export function LoginScreen() {
  const { login, resetPassword, getRememberedLogin } = useAuth();
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRememberedLogin() {
      const remembered = await getRememberedLogin();
      if (!mounted || !remembered) return;
      setMobile(remembered.mobile);
      setPassword(remembered.passcode);
      setRememberMe(true);
    }

    void loadRememberedLogin();

    return () => {
      mounted = false;
    };
  }, [getRememberedLogin]);

  const handleLogin = async () => {
    setError('');
    setNotice('');
    if (!mobile.trim()) {
      setError('Enter your mobile number');
      return;
    }
    if (!password) {
      setError('Enter your password');
      return;
    }
    setLoading(true);
    const ok = await login(mobile, password, rememberMe);
    setLoading(false);
    if (!ok) {
      setError('Invalid mobile or password. Use 10+ digits and 4+ char password.');
    }
  };

  const handleAdminDemoLogin = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    const adminMobile = '03000000000';
    const adminPassword = '';
    const ok = await login(adminMobile, adminPassword, rememberMe);
    setLoading(false);
    if (ok) {
      setMobile(adminMobile);
      setPassword(adminPassword);
    } else {
      setError('Could not open admin demo account.');
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setNotice('');
    if (!mobile.trim()) {
      setError('Enter your mobile number first, then tap Forgot Password.');
      return;
    }

    setLoading(true);
    const ok = await resetPassword(mobile);
    setLoading(false);
    if (!ok) {
      setError('Password reset is not available for this mobile number.');
      return;
    }

    setPassword('1234');
    setNotice('Password reset for demo. Use 1234 to login.');
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
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.rememberRow}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setRememberMe(!rememberMe)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Remember me"
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </Pressable>
          <Pressable
            onPress={handleForgotPassword}
            style={styles.forgotLink}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </View>

        <Button title="Login" onPress={handleLogin} loading={loading} />

        <Button
          title="Admin Demo Login"
          onPress={handleAdminDemoLogin}
          loading={loading}
          variant="secondary"
          style={styles.adminBtn}
        />

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
  notice: {
    color: colors.primary,
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
  adminBtn: {
    marginTop: 12,
  },
  signupLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
