import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const BottomNav = ({ activeTab, onTabSelect }) => {
  const { unreadNotifications } = useAuth();

  const tabs = [
    { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'services', label: 'Services', icon: 'grid-outline', activeIcon: 'grid' },
    { key: 'notifications', label: 'Alerts', icon: 'notifications-outline', activeIcon: 'notifications', badge: unreadNotifications },
    { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabSelect(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? '#1D3BB9' : '#94A3B8'}
              />
              {Boolean(tab.badge && tab.badge > 0) && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    padding: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  activeLabel: {
    color: '#1D3BB9',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1D3BB9',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
});
