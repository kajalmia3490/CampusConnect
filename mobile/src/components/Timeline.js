import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

export const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No timeline history available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((item, index) => {
        const isLast = index === events.length - 1;
        const isCurrent = index === events.length - 1;

        return (
          <View key={item.timeline_id || index} style={styles.row}>
            {/* Left Dot and Line */}
            <View style={styles.indicatorContainer}>
              <View style={[styles.dot, isCurrent && styles.activeDot]}>
                {isCurrent && <View style={styles.innerDot} />}
              </View>
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.status}>{item.status}</Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.remarks}>{item.remarks}</Text>
              {item.updater_name && (
                <Text style={styles.updater}>
                  Updated by: {item.updater_name} ({item.updater_role || 'Staff'})
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  indicatorContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  remarks: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  updater: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  empty: {
    padding: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
