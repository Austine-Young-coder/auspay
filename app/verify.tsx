import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const Page = () => {
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const email = (emailParam || '').trim();
  const router = useRouter();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

  const onChangeDigit = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const full = next.join('');
      if (full.length === 6) {
        verify(full);
      }
    }
  };

  const onKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verify = async (token?: string) => {
    const otp = (token ?? code.join('')).trim();
    setMessage('');

    if (!email) {
      setMessageError(true);
      setMessage('Missing email. Go back and sign up again.');
      return;
    }
    if (otp.length !== 6) {
      setMessageError(true);
      setMessage('Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        });
        if (retry.error) throw error;
        if (retry.data.session) {
          router.replace('/dashboard');
          return;
        }
      }

      if (data?.session) {
        router.replace('/dashboard');
        return;
      }

      setMessageError(true);
      setMessage('Code accepted but no session. Try logging in.');
    } catch (error: any) {
      setMessageError(true);
      setMessage(error.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email) return;
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setMessageError(false);
      setMessage('A new code was sent to your email.');
    } catch (error: any) {
      setMessageError(true);
      setMessage(error.message || 'Could not resend code.');
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
        <Text style={defaultStyles.header}>Check your email</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter the 6-digit code we sent to{'\n'}
          <Text style={{ fontWeight: '700', color: Colors.dark }}>{email || 'your email'}</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={styles.codeBox}
              value={digit}
              onChangeText={(t) => onChangeDigit(t, index)}
              onKeyPress={({ nativeEvent }) =>
                onKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
            />
          ))}
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

        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            code.join('').length === 6 && !loading
              ? styles.enabled
              : styles.disabled,
            { marginTop: 20 },
          ]}
          disabled={code.join('').length !== 6 || loading}
          onPress={() => verify()}>
          <Text style={defaultStyles.buttonText}>
            {loading ? 'Verifying...' : 'Confirm code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onResend}
          disabled={loading}
          style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={defaultStyles.textLink}>Resend code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/signup')}
          style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: Colors.gray }}>Wrong email? Sign up again</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  codeRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 6,
  marginTop: 36,
  marginBottom: 16,
  flexWrap: 'nowrap',
},
codeBox: {
  width: 44,
  height: 52,
  borderRadius: 12,
  backgroundColor: Colors.lightGray,
  textAlign: 'center',
  fontSize: 20,
  fontWeight: '700',
  color: Colors.dark,
},
  message: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
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
});

export default Page;
