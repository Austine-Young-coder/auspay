
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login');
        return;
      }

      setEmail(data.user.email ?? '');
    });
  }, [router]);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Logout failed', error.message);
      return;
    }

    router.replace('/login');
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#ffffff',
      }}
    >
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#111111' }}>
        AUSPAY
      </Text>

      <Text style={{ marginTop: 12, marginBottom: 24, color: '#444444' }}>
        Signed in as {email}
      </Text>

      <Text style={{ marginBottom: 24, color: '#666666' }}>
        Your dashboard will be built here.
      </Text>

      <TouchableOpacity
        onPress={onLogout}
        style={{
          backgroundColor: '#111111',
          borderRadius: 24,
          paddingVertical: 14,
          paddingHorizontal: 28,
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
          Log out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
