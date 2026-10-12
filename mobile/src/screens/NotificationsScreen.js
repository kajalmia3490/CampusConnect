import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const NotificationsScreen = () => {
  const { refreshUnread } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (n) => {
    try {
      await api.markNotificationRead(n.notification_id);
      fetchNotifications();
      refreshUnread();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
      refreshUnread();
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Notice':
        return { name: 'alert-circle-outline', color: '#DC2626', bg: '#FEE2E2' };
      case 'Assignment':
        return { name: 'checkbox-outline', color: '#D97706', bg: '#FEF3C7' };
      case 'Complaint':
        return { name: 'construct-outline', color: '#2563EB', bg: '#EFF6FF' };
      case 'Event':
        return { name: 'sparkles-outline', color: '#7C3AED', bg: '#F5F3FF' };
      default:
        return { name: 'notifications-outline', color: '#059669', bg: '#D1FAE5' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notification Center</Text>
          <Text style={styles.headerSub}>Campus Alerts & System Updates</Text>
        </View>

        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.readAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySub}>No new notifications at this time.</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const iconConfig = getTypeIcon(n.type);

            return (
              <TouchableOpacity
                key={n.notification_id}
                style={[styles.card, !n.is_read && styles.unreadCard]}
                onPress={() => !n.is_read && handleMarkRead(n)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
                  <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, !n.is_read && styles.unreadTitle]}>{n.title}</Text>
                    {!n.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.cardMessage}>{n.message}</Text>
                  <Text style={styles.cardTime}>
                    {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  readAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
