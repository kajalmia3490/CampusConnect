import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CoursesScreen = ({ onBack, onSelectCourse }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filterMy, setFilterMy] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [filterMy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.getCourses({
        my_courses: filterMy ? 'true' : 'false',
        department_id: user?.department_id || 1,
      });
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>Academic Courses</Text>
          <Text style={styles.headerSub}>Curriculum & Enrolled Modules</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filterMy && styles.activeFilterBtn]}
          onPress={() => setFilterMy(true)}
        >
          <Text style={[styles.filterText, filterMy && styles.activeFilterText]}>My Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, !filterMy && styles.activeFilterBtn]}
          onPress={() => setFilterMy(false)}
        >
          <Text style={[styles.filterText, !filterMy && styles.activeFilterText]}>All Dept Courses</Text>
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No courses found</Text>
          </View>
        ) : (
          courses.map((c) => (
            <TouchableOpacity
              key={c.course_id}
              style={styles.card}
              onPress={() => onSelectCourse && onSelectCourse(c)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.badgeCode}>
                  <Text style={styles.codeText}>{c.course_code}</Text>
                </View>
                <View style={styles.badgeSem}>
                  <Text style={styles.semText}>Sem {c.semester}</Text>
                </View>
              </View>

              <Text style={styles.courseTitle}>{c.course_title}</Text>

              <View style={styles.teacherRow}>
                <Ionicons name="person-circle-outline" size={16} color={COLORS.primaryLight} />
                <Text style={styles.teacherName}>Instructor: {c.teacher_name || 'Assigned Faculty'}</Text>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Ionicons name="school-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metricText}>{c.credits} Credits</Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metricText}>{c.materials_count || 0} Materials</Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="checkbox-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metricText}>{c.assignments_count || 0} Assignments</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCode: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  badgeSem: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  semText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 10,
  },
});
