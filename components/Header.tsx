import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.iconCircle}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.hint}>Tizimga kirish</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },

  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  hint: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
});
