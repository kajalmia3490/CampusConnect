import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const Header = ({ onNotificationPress, onProfilePress }) => {
  const { user, unreadNotifications } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'TEACHER':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'STAFF':
        return { bg: '#E0E7FF', text: '#4F46E5' };
      default:
        return { bg: '#D1FAE5', text: '#059669' };
    }
  };

  const roleStyle = getRoleBadgeStyle(user?.role);
  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CC';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.brandIcon}>
          <Ionicons name="school" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.appName}>CampusConnect</Text>
            {user?.role && (
              <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
                <Text style={[styles.roleText, { color: roleStyle.text }]}>{user.role}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>BUBT Student & Campus Services</Text>
        </View>
      </View>

      <View style={styles.right}>
        {/* Notification Bell */}
        <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Avatar */}
        <TouchableOpacity style={styles.avatar} onPress={onProfilePress} activeOpacity={0.7}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOWS.small,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: -0.3,
  },
  roleBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
