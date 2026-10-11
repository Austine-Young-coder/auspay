
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { supabase } from '@/lib/supabase';
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

  const onSignup = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid password', 'Use at least 6 characters.');
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
      } else {
        Alert.alert(
          'Check your email',
          'Your account was created. Confirm your email before logging in.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Sign up failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Let's get started!</Text>
        <Text style={defaultStyles.descriptionText}>
          Create your account with your email address and password
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
            email.trim() && password ? styles.enabled : styles.disabled,
            { marginBottom: 20 },
          ]}
          disabled={loading}
          onPress={onSignup}>
          <Text style={defaultStyles.buttonText}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Text>
        </TouchableOpacity>
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
});

export default Page;
