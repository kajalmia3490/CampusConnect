import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

import { RoutineScreen } from './RoutineScreen';
import { CoursesScreen } from './CoursesScreen';
import { MaterialsScreen } from './MaterialsScreen';
import { AssignmentsScreen } from './AssignmentsScreen';
import { EventsScreen } from './EventsScreen';
import { ComplaintsScreen } from './ComplaintsScreen';
import { LostFoundScreen } from './LostFoundScreen';
import { NoticesScreen } from './NoticesScreen';
import { AdminScreen } from './AdminScreen';

export const ServicesScreen = ({ initialService = null, onResetInitial }) => {
  const { user } = useAuth();
  const [activeService, setActiveService] = useState(initialService);

  const handleBackToHub = () => {
    setActiveService(null);
    if (onResetInitial) onResetInitial();
  };

  if (activeService === 'routine') return <RoutineScreen onBack={handleBackToHub} />;
  if (activeService === 'courses') return <CoursesScreen onBack={handleBackToHub} />;
  if (activeService === 'materials') return <MaterialsScreen onBack={handleBackToHub} />;
  if (activeService === 'assignments') return <AssignmentsScreen onBack={handleBackToHub} />;
  if (activeService === 'events') return <EventsScreen onBack={handleBackToHub} />;
  if (activeService === 'complaints') return <ComplaintsScreen onBack={handleBackToHub} />;
  if (activeService === 'lostfound') return <LostFoundScreen onBack={handleBackToHub} />;
  if (activeService === 'notices') return <NoticesScreen onBack={handleBackToHub} />;
  if (activeService === 'admin') return <AdminScreen onBack={handleBackToHub} />;

  const services = [
    {
      id: 'routine',
      title: 'Class Routine',
      subtitle: 'Daily & weekly timetable, room numbers, and teachers',
      icon: 'calendar-outline',
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      id: 'courses',
      title: 'Course Management',
      subtitle: 'Enrolled courses, credits, syllabus, and faculty',
      icon: 'book-outline',
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      id: 'materials',
      title: 'Learning Materials',
      subtitle: 'Lecture notes, slides, PDFs, and source code files',
      icon: 'folder-open-outline',
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    {
      id: 'assignments',
      title: 'Assignments & Tasks',
      subtitle: 'Submit coursework, view marks and teacher feedback',
      icon: 'document-text-outline',
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      id: 'events',
      title: 'Campus Events',
      subtitle: 'Hackathons, carnivals, sports week & RSVP tickets',
      icon: 'sparkles-outline',
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
    {
      id: 'complaints',
      title: 'Campus Complaints',
      subtitle: 'Lab & facility issues with visual status timeline',
      icon: 'construct-outline',
      color: '#DC2626',
      bg: '#FEF2F2',
    },
    {
      id: 'lostfound',
      title: 'Lost & Found Hub',
      subtitle: 'Report lost IDs, keys, electronics and recover items',
      icon: 'search-outline',
      color: '#0D9488',
      bg: '#F0FDFA',
    },
    {
      id: 'notices',
      title: 'Official Notices',
      subtitle: 'University and department circulars and announcements',
      icon: 'newspaper-outline',
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
  ];

  if (user?.role === 'ADMIN') {
    services.push({
      id: 'admin',
      title: 'Admin Management Hub',
      subtitle: 'Users directory, system metrics, departments & controls',
      icon: 'shield-checkmark-outline',
      color: '#7C2D12',
      bg: '#FFEDD5',
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>University Services Hub</Text>
        <Text style={styles.subtitle}>Unified portal for academic & campus workflows</Text>
      </View>

      <View style={styles.grid}>
        {services.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => setActiveService(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={26} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
