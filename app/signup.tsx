import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { supabase, WEB_REDIRECT } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

type Strength = 'none' | 'weak' | 'moderate' | 'strong';

function getPasswordStrength(password: string): Strength {
  if (!password) return 'none';
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 3) return 'moderate';
  return 'strong';
}

const strengthLabel: Record<Strength, string> = {
  none: '',
  weak: 'Weak password',
  moderate: 'Moderate password',
  strong: 'Strong password',
};

const strengthColor: Record<Strength, string> = {
  none: Colors.lightGray,
  weak: '#E74C3C',
  moderate: '#F39C12',
  strong: '#27AE60',
};

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
  const router = useRouter();

  const emailTouched = email.length > 0;
  const emailOk = isValidEmail(email);
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const canSubmit = emailOk && password.length >= 8 && !loading;

  const onSignup = async () => {
    setMessage('');
    if (!emailOk) {
      setMessageError(true);
      setMessage('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setMessageError(true);
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.replace('/dashboard');
        return;
      }

      router.push({
        pathname: '/verify',
        params: { email: email.trim() },
      });
    } catch (error: any) {
      setMessageError(true);
      setMessage(error.message || 'Sign up failed. Please try again.');
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
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessageError(true);
      setMessage(
        error.message ||
          `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed. Configure it in Supabase first.`
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
          <Text style={defaultStyles.header}>Let's get started!</Text>
          <Text style={defaultStyles.descriptionText}>
            Create your account with your email and password
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
              placeholder="Password (min 8 characters)"
              placeholderTextColor={Colors.gray}
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            {password.length > 0 && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBars}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor:
                          strength === 'none'
                            ? Colors.lightGray
                            : strengthColor.weak,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor:
                          strength === 'moderate' || strength === 'strong'
                            ? strengthColor[strength]
                            : Colors.lightGray,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor:
                          strength === 'strong'
                            ? strengthColor.strong
                            : Colors.lightGray,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.strengthText, { color: strengthColor[strength] }]}>
                  {strengthLabel[strength]}
                </Text>
              </View>
            )}
          </View>

          {!!message && (
            <Text
              style={[
                styles.message,
                messageError ? styles.messageError : styles.messageOk,
              ]}>
              {message}
            </Text>
          )}

          <Link href="/login" replace asChild>
            <TouchableOpacity>
              <Text style={defaultStyles.textLink}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </Link>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[
              defaultStyles.pillButton,
              canSubmit ? styles.enabled : styles.disabled,
              { marginBottom: 12 },
            ]}
            disabled={!canSubmit}
            onPress={onSignup}>
            <Text style={defaultStyles.buttonText}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={{ color: Colors.gray, fontSize: 16 }}>or</Text>
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
            style={[styles.providerButton, { marginBottom: 24 }]}>
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text style={styles.providerText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 28,
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
    marginBottom: 4,
  },
  strengthWrap: {
    gap: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: '600',
  },
  message: {
    marginBottom: 12,
    fontSize: 14,
  },
  messageError: {
    color: '#E74C3C',
  },
  messageOk: {
    color: '#27AE60',
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
    marginBottom: 8,
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
    marginTop: 12,
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
