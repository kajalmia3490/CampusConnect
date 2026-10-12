import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TopWave, BottomWave } from '../components/DesignFrame';

export const HomeScreen = ({ onNavigateService, onOpenNotice, onOpenAssignment }) => {
  const { user, quickLogin } = useAuth();
  
  // Dashboard view mode:
  // 'selection' matches Page 3 ("Welcome back! How can I help you? Are you? Student | Admin | Teacher")
  // 'role_dashboard' matches Pages 4, 5, 6 (Top selected role card + 6 grid cards with progress bars)
  const [viewMode, setViewMode] = useState('role_dashboard');
  const [selectedRole, setSelectedRole] = useState(user?.role || 'STUDENT');

  const [todayCount, setTodayCount] = useState(4);
  const [coursesCount, setCoursesCount] = useState(4);
  const [noticesCount, setNoticesCount] = useState(3);
  const [complaintsCount, setComplaintsCount] = useState(2);
  const [assignmentsCount, setAssignmentsCount] = useState(2);
  const [eventsCount, setEventsCount] = useState(2);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [selectedRole]);

  const fetchMetrics = async () => {
    try {
      const [rRes, cRes, nRes, aRes, cmpRes, evRes] = await Promise.all([
        api.getTodayRoutines(),
        api.getCourses({ my_courses: 'true' }),
        api.getNotices(),
        api.getAssignments(),
        api.getComplaints(),
        api.getEvents(),
      ]);

      if (rRes.success) setTodayCount((rRes.routines || []).length || 4);
      if (cRes.success) setCoursesCount((cRes.courses || []).length || 4);
      if (nRes.success) setNoticesCount((nRes.notices || []).length || 3);
      if (aRes.success) setAssignmentsCount((aRes.assignments || []).length || 2);
      if (cmpRes.success) setComplaintsCount((cmpRes.complaints || []).length || 1);
      if (evRes.success) setEventsCount((evRes.events || []).length || 2);
    } catch (e) {
      // background fetch
    }
  };

  const handleRoleSelect = (roleName, demoId, demoPwd) => {
    setSelectedRole(roleName);
    setViewMode('role_dashboard');
    if (demoId && demoPwd) {
      quickLogin(demoId, demoPwd);
    }
  };

  // Get current role card styling for Pages 4, 5, 6
  const getRoleHeaderConfig = () => {
    switch (selectedRole) {
      case 'ADMIN':
        return {
          bg: '#10B981',
          icon: 'settings-sharp',
          label: 'Admin',
        };
      case 'TEACHER':
        return {
          bg: '#1D3BB9',
          icon: 'person',
          label: 'Teacher',
        };
      default:
        return {
          bg: '#FFA928',
          icon: 'school',
          label: 'Student',
        };
    }
  };

  const roleConfig = getRoleHeaderConfig();

  // Grid cards configuration matching Pages 4, 5, 6
  const gridCards = [
    {
      id: 'routine',
      title: 'Basics',
      subtitle: 'Class Routine',
      metric: `${todayCount} / 5`,
      icon: 'document-text',
      iconColor: '#FFA928',
      barColor: '#FBBF24',
      progress: Math.min(1, todayCount / 5),
    },
    {
      id: 'courses',
      title: 'Occupations',
      subtitle: 'Courses',
      metric: `${coursesCount} / 5`,
      icon: 'school',
      iconColor: '#EF4444',
      barColor: '#EF4444',
      progress: Math.min(1, coursesCount / 5),
    },
    {
      id: 'notices',
      title: 'Conversation',
      subtitle: 'Notices',
      metric: `${noticesCount} / 5`,
      icon: 'chatbubble',
      iconColor: '#3B82F6',
      barColor: '#3B82F6',
      progress: Math.min(1, noticesCount / 5),
    },
    {
      id: 'complaints',
      title: 'Places',
      subtitle: 'Complaints',
      metric: `${complaintsCount} / 5`,
      icon: 'location',
      iconColor: '#10B981',
      barColor: '#10B981',
      progress: Math.min(1, complaintsCount / 5),
    },
    {
      id: 'assignments',
      title: 'Family members',
      subtitle: 'Assignments',
      metric: `${assignmentsCount} / 5`,
      icon: 'people',
      iconColor: '#A855F7',
      barColor: '#A855F7',
      progress: Math.min(1, assignmentsCount / 5),
    },
    {
      id: 'events',
      title: 'Foods',
      subtitle: 'Campus Events',
      metric: `${eventsCount} / 5`,
      icon: 'nutrition',
      iconColor: '#2563EB',
      barColor: '#2563EB',
      progress: Math.min(1, eventsCount / 5),
    },
  ];

  return (
    <View style={styles.screenWrapper}>
      {/* Top Signature Blue Wave */}
      <TopWave onPlusPress={() => setViewMode(viewMode === 'selection' ? 'role_dashboard' : 'selection')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {viewMode === 'selection' ? (
            /* ===================================================
               PAGE 3 DESIGN: Home / Role Selector ("Are you?")
               =================================================== */
            <View style={styles.page3Container}>
              {/* Profile Bar */}
              <View style={styles.profileRow}>
                <View style={styles.yellowAvatar}>
                  <Ionicons name="person" size={26} color="#FFFFFF" />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{user?.full_name || 'Martha Stewart'}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={12} color="#1E293B" />
                    <Text style={styles.locationText}>Dhaka • BUBT</Text>
                  </View>
                </View>
              </View>

              {/* Welcome Back Heading */}
              <Text style={styles.welcomeTitle}>Welcome back!</Text>

              {/* Hero Lesson / Assistance Card */}
              <View style={styles.heroCard}>
                <View style={styles.heroLeft}>
                  <View style={styles.intermediatePill}>
                    <Text style={styles.intermediateText}>Intermediate</Text>
                  </View>
                  <Text style={styles.howHelpTitle}>How can{"\n"}I help you?</Text>
                  <Text style={styles.instructorTag}>{user?.full_name || 'Martha Stewart'}</Text>
                  <View style={styles.milestoneRow}>
                    <View style={styles.redDiamond} />
                    <Text style={styles.milestoneText}>
                      Take this lesson to earn{"\n"}a new milestone
                    </Text>
                  </View>
                </View>

                {/* Hero Illustration / Icon */}
                <View style={styles.heroRight}>
                  <View style={styles.assistantCircle}>
                    <Ionicons name="person-circle" size={80} color="#254EDB" />
                    <View style={styles.speechBubble}>
                      <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </View>

              {/* Section: Are you? */}
              <Text style={styles.areYouTitle}>Are you?</Text>

              {/* 3 Role Selection Cards */}
              <View style={styles.roleSelectionGrid}>
                {/* 1. Student Card */}
                <TouchableOpacity
                  style={[styles.roleCard, { backgroundColor: '#FFA928' }]}
                  onPress={() => handleRoleSelect('STUDENT', '20244203028', 'Password123!')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="school" size={40} color="#FFFFFF" />
                  <Text style={styles.roleCardText}>Student</Text>
                </TouchableOpacity>

                {/* 2. Admin Card */}
                <TouchableOpacity
                  style={[styles.roleCard, { backgroundColor: '#10B981' }]}
                  onPress={() => handleRoleSelect('ADMIN', 'ADMIN-001', 'Password123!')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="settings-sharp" size={40} color="#FFFFFF" />
                  <Text style={styles.roleCardText}>Admin</Text>
                </TouchableOpacity>

                {/* 3. Teacher Card */}
                <TouchableOpacity
                  style={[styles.roleCard, { backgroundColor: '#1D3BB9' }]}
                  onPress={() => handleRoleSelect('TEACHER', 'T-1001', 'Password123!')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                  <Text style={styles.roleCardText}>Teacher</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ===================================================
               PAGES 4, 5, 6 DESIGN: Selected Role Dashboard
               =================================================== */
            <View style={styles.dashboardContainer}>
              {/* Selected Role Badge in Top Center */}
              <TouchableOpacity
                style={[styles.topRoleBadge, { backgroundColor: roleConfig.bg }]}
                onPress={() => setViewMode('selection')}
                activeOpacity={0.8}
              >
                <Ionicons name={roleConfig.icon} size={32} color="#FFFFFF" />
                <Text style={styles.topRoleLabel}>{roleConfig.label}</Text>
              </TouchableOpacity>

              {/* Switch Role Hint */}
              <TouchableOpacity onPress={() => setViewMode('selection')} style={styles.switchRoleHint}>
                <Text style={styles.switchRoleText}>Tap badge or here to switch role ⇄</Text>
              </TouchableOpacity>

              {/* 2x3 Grid of 6 Elevated Cards */}
              <View style={styles.cardGrid}>
                {gridCards.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridCardItem}
                    onPress={() => onNavigateService && onNavigateService(item.id)}
                    activeOpacity={0.8}
                  >
                    {/* Centered Colored Icon */}
                    <View style={styles.cardIconWrap}>
                      <Ionicons name={item.icon} size={28} color={item.iconColor} />
                    </View>

                    {/* Title */}
                    <Text style={styles.cardItemTitle}>{item.title}</Text>
                    <Text style={styles.cardItemSub}>{item.subtitle}</Text>

                    {/* Metric e.g. 4 / 5 */}
                    <Text style={styles.cardItemMetric}>{item.metric}</Text>

                    {/* Bottom Progress Bar */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: item.barColor,
                            width: `${item.progress * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Decorative Wave */}
        <BottomWave />
      </View>
    );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 55,
  },

  /* Page 3 Styles */
  page3Container: {
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  yellowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...SHADOWS.card,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  heroCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    ...SHADOWS.card,
  },
  heroLeft: {
    flex: 1,
  },
  intermediatePill: {
    backgroundColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  intermediateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  howHelpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 6,
  },
  instructorTag: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginBottom: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDiamond: {
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    transform: [{ rotate: '45deg' }],
  },
  milestoneText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  heroRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantCircle: {
    position: 'relative',
  },
  speechBubble: {
    position: 'absolute',
    top: 2,
    right: -2,
    backgroundColor: '#93C5FD',
    borderRadius: 12,
    padding: 2,
  },
  areYouTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  roleSelectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    height: 100,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    ...SHADOWS.card,
  },
  roleCardText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },

  /* Pages 4, 5, 6 Styles */
  dashboardContainer: {
    alignItems: 'center',
    width: '100%',
  },
  topRoleBadge: {
    width: 90,
    height: 82,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 6,
    ...SHADOWS.card,
  },
  topRoleLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  switchRoleHint: {
    marginBottom: 16,
  },
  switchRoleText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 14,
  },
  gridCardItem: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.card,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  cardItemSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardItemMetric: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  progressBarTrack: {
    width: '85%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
