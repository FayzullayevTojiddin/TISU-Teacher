import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.iconCircle} accessible accessibilityRole="image">
        <Text style={styles.iconText} numberOfLines={2} adjustsFontSizeToFit>
          Termiz Iqtisodiyot va Servis{"\n"}Universiteti
        </Text>
      </View>
      <Text style={styles.hint}>Tizimga kirish</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerWrap: { width: '100%', alignItems: 'center', marginTop: 24, marginBottom: 20 },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0B74FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  iconText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 14 },
  hint: { marginTop: 12, fontSize: 18, fontWeight: '600', color: '#222' },
});