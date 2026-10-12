import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

export const StatusBadge = ({ label, size = 'medium' }) => {
  const norm = (label || '').toLowerCase();

  let bg = COLORS.borderLight;
  let text = COLORS.textSecondary;

  if (['urgent', 'danger', 'late', 'rejected'].includes(norm)) {
    bg = COLORS.dangerLight;
    text = COLORS.danger;
  } else if (['high', 'in progress', 'under review', 'pending', 'active'].includes(norm)) {
    bg = COLORS.warningLight;
    text = COLORS.warning;
  } else if (['resolved', 'graded', 'submitted', 'completed', 'claimed', 'returned', 'normal', 'low'].includes(norm)) {
    bg = COLORS.successLight;
    text = COLORS.success;
  } else if (['upcoming', 'open', 'academic', 'general', 'exam'].includes(norm)) {
    bg = COLORS.infoLight;
    text = COLORS.info;
  }

  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.badgeSmall]}>
      <Text style={[styles.text, { color: text }, isSmall && styles.textSmall]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});
