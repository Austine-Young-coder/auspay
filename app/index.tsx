
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { useAssets } from 'expo-asset';
import { ResizeMode, Video } from 'expo-av';
import { Link } from 'expo-router';
import { Platform } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Page = () => {
  const [assets] = useAssets([require('@/assets/videos/intro.mp4')]);

  return (
    <View style={styles.container}>
{assets && (
  <Video
    resizeMode={ResizeMode.COVER}
    isMuted
    isLooping
    shouldPlay
    source={{ uri: assets[0].uri }}
    style={styles.video}
    //for web sizing
    videoStyle={
      Platform.OS === 'web'
        ? {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }
        : undefined
    }
  />
)}

      <View style={styles.content}>
        <Text style={styles.header}>
          Ready to change the way you money?
        </Text>
      </View>

      <View style={styles.buttons}>
        <Link
          href="/login"
          style={[
            defaultStyles.pillButton,
            { flex: 1, backgroundColor: Colors.dark },
          ]}
          asChild
        >
          <TouchableOpacity>
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        </Link>

        <Link
          href="/signup"
          style={[
            defaultStyles.pillButton,
            { flex: 1, backgroundColor: '#fff' },
          ]}
          asChild
        >
          <TouchableOpacity>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#101114',
  },
  video: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
},
  content: {
    marginTop: 80,
    padding: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  signupText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '500',
  },
});

export default Page;
