import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const AdminScreen = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview'); // 'overview', 'users', 'depts'
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!');
  const [newRole, setNewRole] = useState('STUDENT');
  const [newDeptId, setNewDeptId] = useState(1);
  const [newSem, setNewSem] = useState('6');
  const [newSec, setNewSec] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Dept Modal
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter, searchUser]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, deptRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers({
          role: userRoleFilter === 'All' ? undefined : userRoleFilter,
          search: searchUser.trim() || undefined,
        }),
        api.getDepartments(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (deptRes.success) setDepartments(deptRes.departments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (u) => {
    try {
      const res = await api.toggleUserStatus(u.user_id);
      if (res.success) {
        Alert.alert('Updated', `User status changed to ${res.user.is_active ? 'Active' : 'Inactive'}`);
        fetchAdminData();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCreateUser = async () => {
    if (!newUid || !newName || !newEmail || !newPassword) {
      Alert.alert('Required', 'University ID, Name, Email, and Password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createAdminUser({
        university_id: newUid,
        full_name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        department_id: newDeptId,
        semester: parseInt(newSem) || 1,
        section: newSec || '1',
      });

      if (res.success) {
        Alert.alert('Created', 'User created in MS SQL Server database.');
        setUserModalVisible(false);
        setNewUid('');
        setNewName('');
        setNewEmail('');
        fetchAdminData();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDept = async () => {
    if (!deptCode || !deptName) {
      Alert.alert('Required', 'Department Code and Name are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createDepartment({
        department_code: deptCode,
        department_name: deptName,
      });

      if (res.success) {
        Alert.alert('Created', 'Department added successfully.');
        setDeptModalVisible(false);
        setDeptCode('');
        setDeptName('');
        fetchAdminData();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.primaryDark} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Administrator Control Hub</Text>
            <Text style={styles.headerSub}>Campus Metrics, Users & Permissions</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setUserModalVisible(true)}>
          <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'overview' && styles.activeTabBtn]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'users' && styles.activeTabBtn]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.activeTabText]}>Users ({users.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'depts' && styles.activeTabBtn]}
          onPress={() => setSelectedTab('depts')}
        >
          <Text style={[styles.tabText, selectedTab === 'depts' && styles.activeTabText]}>Departments</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {selectedTab === 'overview' && (
          <>
            <Text style={styles.sectionHeading}>Campus System Metrics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
                <Text style={styles.statNumber}>{stats?.total_students || 0}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                <Text style={styles.statNumber}>{stats?.total_teachers || 0}</Text>
                <Text style={styles.statLabel}>Faculty Members</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
                <Text style={styles.statNumber}>{stats?.total_courses || 0}</Text>
                <Text style={styles.statLabel}>Active Courses</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.statNumber}>{stats?.pending_complaints || 0}</Text>
                <Text style={styles.statLabel}>Open Complaints</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#EC4899' }]}>
                <Text style={styles.statNumber}>{stats?.upcoming_events || 0}</Text>
                <Text style={styles.statLabel}>Upcoming Events</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#14B8A6' }]}>
                <Text style={styles.statNumber}>{stats?.active_lost_found || 0}</Text>
                <Text style={styles.statLabel}>Active Lost/Found</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Management Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={() => setUserModalVisible(true)}>
                <Ionicons name="person-add" size={24} color={COLORS.primary} />
                <Text style={styles.actionCardText}>Register User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => setDeptModalVisible(true)}>
                <Ionicons name="business" size={24} color="#059669" />
                <Text style={styles.actionCardText}>New Department</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => setSelectedTab('users')}>
                <Ionicons name="list" size={24} color="#7C3AED" />
                <Text style={styles.actionCardText}>Manage Directory</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {selectedTab === 'users' && (
          <>
            {/* Filter Pills */}
            <View style={styles.rolePillsRow}>
              {['All', 'STUDENT', 'TEACHER', 'STAFF', 'ADMIN'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePill, userRoleFilter === r && styles.activeRolePill]}
                  onPress={() => setUserRoleFilter(r)}
                >
                  <Text style={[styles.rolePillText, userRoleFilter === r && styles.activeRolePillText]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ID, name, email..."
                value={searchUser}
                onChangeText={setSearchUser}
              />
            </View>

            {/* Users List */}
            {users.map((u) => (
              <View key={u.user_id} style={styles.userCard}>
                <View style={styles.userCardHeader}>
                  <View>
                    <Text style={styles.userName}>{u.full_name}</Text>
                    <Text style={styles.userUid}>{u.university_id} • {u.email}</Text>
                  </View>
                  <StatusBadge label={u.role} size="small" />
                </View>

                <View style={styles.userFooter}>
                  <Text style={styles.userDept}>
                    {u.department_code || 'General Staff'} {u.semester ? `• Sem ${u.semester}` : ''}
                  </Text>

                  <TouchableOpacity
                    style={[styles.statusToggle, u.is_active ? styles.activeUserToggle : styles.inactiveUserToggle]}
                    onPress={() => handleToggleUser(u)}
                  >
                    <Text style={styles.statusToggleText}>
                      {u.is_active ? 'Active Account' : 'Deactivated'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {selectedTab === 'depts' && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionHeading}>Academic Departments</Text>
              <TouchableOpacity style={styles.smallAddBtn} onPress={() => setDeptModalVisible(true)}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.smallAddBtnText}>Add Dept</Text>
              </TouchableOpacity>
            </View>

            {departments.map((d) => (
              <View key={d.department_id} style={styles.deptCard}>
                <View style={styles.deptCodeBadge}>
                  <Text style={styles.deptCodeText}>{d.department_code}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.deptNameText}>{d.department_name}</Text>
                  <Text style={styles.deptStatsText}>
                    {d.students_count || 0} Students • {d.teachers_count || 0} Faculty • {d.courses_count || 0} Courses
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* User Create Modal */}
      <Modal visible={userModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Campus User</Text>
              <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Role</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                {['STUDENT', 'TEACHER', 'STAFF', 'ADMIN'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.formChip, newRole === r && styles.activeFormChip]}
                    onPress={() => setNewRole(r)}
                  >
                    <Text style={[styles.formChipText, newRole === r && styles.activeFormChipText]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>University ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 20244203099 or T-2005"
                value={newUid}
                onChangeText={setNewUid}
              />

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Full Name"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="user@bubt.edu.bd"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Initial Password</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Password123!"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Save User to Database</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dept Create Modal */}
      <Modal visible={deptModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Department</Text>
              <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Department Code</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. ME, CE, TEXTILE"
              value={deptCode}
              onChangeText={setDeptCode}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Department Full Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Mechanical Engineering"
              value={deptName}
              onChangeText={setDeptName}
            />

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateDept} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Create Department</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  actionCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 6,
  },
  rolePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeRolePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeRolePillText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userUid: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  userDept: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeUserToggle: {
    backgroundColor: COLORS.successLight,
  },
  inactiveUserToggle: {
    backgroundColor: COLORS.dangerLight,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  smallAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  smallAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  deptCodeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deptCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  deptNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deptStatsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFormChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  formChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeFormChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
