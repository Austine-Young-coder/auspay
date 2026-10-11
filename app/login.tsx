
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { supabase } from '@/lib/supabase';
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
  Alert,
} from 'react-native';

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
  const router = useRouter();

  const onSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
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
      Alert.alert('Login failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onOAuth = async (provider: 'google' | 'apple') => {
    Alert.alert(
      `${provider === 'google' ? 'Google' : 'Apple'} sign-in`,
      'This sign-in option needs to be configured in Supabase before it can be used.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Welcome back</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter the email address and password associated with your account
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={Colors.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

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

        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            email.trim() && password ? styles.enabled : styles.disabled,
            { marginBottom: 20 },
          ]}
          disabled={loading}
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
          style={styles.providerButton}>
          <Ionicons name="logo-google" size={24} color="#000" />
          <Text style={styles.providerText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOAuth('apple')}
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
