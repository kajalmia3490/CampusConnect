import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/theme';

export const TopWave = ({ onPlusPress, showPlus = true }) => {
  return (
    <View style={styles.topWaveContainer}>
      {/* Blue wave background */}
      <View style={styles.blueWave}>
        <View style={styles.goldRibbon} />
      </View>

      {/* Top right plus icon */}
      {showPlus && (
        <TouchableOpacity style={styles.plusBtn} onPress={onPlusPress} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const BottomWave = () => {
  return (
    <View style={styles.bottomWaveContainer} pointerEvents="none">
      <View style={styles.bottomGold} />
      <View style={styles.bottomBlue} />
    </View>
  );
};

const styles = StyleSheet.create({
  topWaveContainer: {
    height: 70,
    width: '100%',
    backgroundColor: '#1E40AF',
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  blueWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1D3BB9',
  },
  goldRibbon: {
    position: 'absolute',
    top: 18,
    left: 45,
    width: 60,
    height: 8,
    backgroundColor: '#FBBF24',
    borderRadius: 4,
    transform: [{ rotate: '-8deg' }],
  },
  plusBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 110,
    height: 50,
    overflow: 'hidden',
    borderBottomRightRadius: 36,
  },
  bottomGold: {
    position: 'absolute',
    bottom: 12,
    right: -10,
    width: 90,
    height: 25,
    backgroundColor: '#FBBF24',
    borderTopLeftRadius: 30,
    transform: [{ rotate: '-12deg' }],
  },
  bottomBlue: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 95,
    height: 48,
    backgroundColor: '#1D3BB9',
    borderTopLeftRadius: 40,
    transform: [{ rotate: '-10deg' }],
  },
});
