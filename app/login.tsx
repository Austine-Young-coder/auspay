import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { supabase, WEB_REDIRECT } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
  const router = useRouter();

  const emailTouched = email.length > 0;
  const emailOk = isValidEmail(email);
  const canSubmit = emailOk && password.length > 0 && !loading;

  const onSignIn = async () => {
    setMessage('');
    if (!emailOk) {
      setMessage('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      router.replace('/dashboard');
    } catch (error: any) {
      setMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onOAuth = async (provider: 'google' | 'apple') => {
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: WEB_REDIRECT,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage(
        error.message ||
          `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed.`
      );
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <View style={defaultStyles.container}>
          <Text style={defaultStyles.header}>Welcome back</Text>
          <Text style={defaultStyles.descriptionText}>
            Enter the email and password for your account
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailTouched && !emailOk && styles.inputError,
              ]}
              placeholder="Email address"
              placeholderTextColor={Colors.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {emailTouched && !emailOk && (
              <Text style={styles.fieldError}>Enter a valid email address</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.gray}
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {!!message && <Text style={styles.message}>{message}</Text>}

          <TouchableOpacity
            style={[
              defaultStyles.pillButton,
              canSubmit ? styles.enabled : styles.disabled,
              { marginBottom: 20 },
            ]}
            disabled={!canSubmit}
            onPress={onSignIn}>
            <Text style={defaultStyles.buttonText}>
              {loading ? 'Signing in...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={{ color: Colors.gray, fontSize: 20 }}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            onPress={() => onOAuth('google')}
            disabled={loading}
            style={styles.providerButton}>
            <Ionicons name="logo-google" size={24} color="#000" />
            <Text style={styles.providerText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onOAuth('apple')}
            disabled={loading}
            style={styles.providerButton}>
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text style={styles.providerText}>Continue with Apple</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 24 }}>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={defaultStyles.textLink}>
                  Don't have an account? Sign up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 40,
    gap: 12,
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 20,
    borderRadius: 16,
    fontSize: 18,
    color: Colors.dark,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  fieldError: {
    color: '#E74C3C',
    fontSize: 13,
    marginTop: -4,
  },
  message: {
    color: '#E74C3C',
    marginBottom: 12,
    fontSize: 14,
  },
  enabled: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.primaryMuted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 16,
  },
  providerText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Page;
