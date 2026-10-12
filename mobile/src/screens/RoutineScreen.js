import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export const RoutineScreen = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutines();
  }, [selectedDay]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const res = await api.getRoutines({
        day_of_week: selectedDay,
        department_id: user?.department_id || 1,
        semester: user?.semester || 6,
      });
      if (res.success) {
        setRoutines(res.routines || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>Class Routine & Timetable</Text>
          <Text style={styles.headerSub}>
            {user?.department_code || 'CSE'} • Semester {user?.semester || 6} • Sec {user?.section || '1'}
          </Text>
        </View>
      </View>

      {/* Day Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, isSelected && styles.activeDayTab]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, isSelected && styles.activeDayText]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Routine Cards */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : routines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No classes scheduled for {selectedDay}</Text>
            <Text style={styles.emptySub}>Check another day or contact department office for schedule updates.</Text>
          </View>
        ) : (
          routines.map((r) => (
            <View key={r.routine_id} style={styles.card}>
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                <Text style={styles.timeText}>{r.start_time} - {r.end_time}</Text>
              </View>

              <View style={styles.cardMain}>
                <View style={styles.courseRow}>
                  <Text style={styles.courseCode}>{r.course_code}</Text>
                  <View style={styles.roomBadge}>
                    <Ionicons name="location-outline" size={12} color={COLORS.primaryDark} />
                    <Text style={styles.roomText}>{r.room_number}</Text>
                  </View>
                </View>
                <Text style={styles.courseTitle}>{r.course_title}</Text>
                
                <View style={styles.footerRow}>
                  <View style={styles.teacherRow}>
                    <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.teacherText}>{r.teacher_name || 'Faculty Assigned'}</Text>
                  </View>
                  <Text style={styles.creditText}>{r.credits} Credits</Text>
                </View>
              </View>
            </View>
          ))
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
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
  dayScroll: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dayScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeDayTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardMain: {
    padding: 14,
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teacherText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  creditText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
