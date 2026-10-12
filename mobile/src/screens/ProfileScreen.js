import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { api, getBaseUrl, setCustomApiUrl } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const ProfileScreen = () => {
  const { user, logout, quickLogin } = useAuth();

  // Server API URL Modal
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(getBaseUrl());
  const [currentUrl, setCurrentUrl] = useState(getBaseUrl());

  // Change Password Modal
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleChangePassword = async () => {
    if (!currPassword || !newPassword) {
      Alert.alert('Required', 'Please enter your current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    try {
      setIsChangingPwd(true);
      const res = await api.changePassword({
        currentPassword: currPassword,
        newPassword,
      });

      if (res.success) {
        Alert.alert('Success', 'Password updated successfully!');
        setPwdModalVisible(false);
        setCurrPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSaveApiUrl = () => {
    setCustomApiUrl(apiUrlInput);
    setCurrentUrl(getBaseUrl());
    setServerModalVisible(false);
    Alert.alert('Backend Updated', `API endpoint set to:\n${getBaseUrl()}`);
  };

  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CC';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.badgeRow}>
          <StatusBadge label={user?.role} />
          <View style={styles.idChip}>
            <Text style={styles.idChipText}>ID: {user?.university_id}</Text>
          </View>
        </View>
      </View>

      {/* Academic Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Academic Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color={COLORS.primary} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{user?.department_name || 'General Administration'}</Text>
          </View>
        </View>

        {user?.role === 'STUDENT' && (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={18} color={COLORS.secondary} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Semester & Section</Text>
                <Text style={styles.infoValue}>Semester {user?.semester || 6} • Section {user?.section || '1'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="ribbon-outline" size={18} color="#D97706" />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Degree Program</Text>
                <Text style={styles.infoValue}>B.Sc. in Computer Science & Engineering</Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={COLORS.success} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user?.phone || '+880 1700-000000'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Role Switcher for Live Demonstration */}
      <View style={styles.sectionCard}>
        <View style={styles.roleHeaderRow}>
          <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Switch Role (Demonstration)</Text>
        </View>
        <Text style={styles.roleSub}>1-Click switch accounts to test role-based access for SDP-3:</Text>

        <View style={styles.roleGrid}>
          {DEMO_ACCOUNTS.map((acc) => {
            const isCurrent = user?.university_id === acc.id;
            return (
              <TouchableOpacity
                key={acc.id}
                style={[styles.roleSwitchBtn, isCurrent && styles.activeRoleSwitchBtn]}
                onPress={() => quickLogin(acc.id, acc.password)}
              >
                <Text style={[styles.roleSwitchText, isCurrent && styles.activeRoleSwitchText]}>
                  {acc.label} {isCurrent ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Security & Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Security & Preferences</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => { setApiUrlInput(getBaseUrl()); setServerModalVisible(true); }}>
          <View style={styles.menuLeft}>
            <Ionicons name="server-outline" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.menuText}>Backend Server URL</Text>
              <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{currentUrl}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setPwdModalVisible(true)}>
          <View style={styles.menuLeft}>
            <Ionicons name="key-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <View style={styles.menuLeft}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.menuText, { color: COLORS.danger }]}>Sign Out</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* SDP-3 Info */}
      <View style={styles.sdpCard}>
        <Text style={styles.sdpTitle}>CampusConnect • SDP-3 Project</Text>
        <Text style={styles.sdpDesc}>
          Department of Computer Science and Engineering{"\n"}
          Bangladesh University of Business and Technology (BUBT){"\n"}
          React Native • Node.js Express • MS SQL Server
        </Text>
      </View>

      {/* Change Password Modal */}
      <Modal visible={pwdModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Password</Text>
              <TouchableOpacity onPress={() => setPwdModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter current password"
              value={currPassword}
              onChangeText={setCurrPassword}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.pwdSubmitBtn} onPress={handleChangePassword} disabled={isChangingPwd}>
              {isChangingPwd ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.pwdSubmitText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Backend Server URL Modal */}
      <Modal visible={serverModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server URL</Text>
              <TouchableOpacity onPress={() => setServerModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 4 }]}>API Base URL (e.g. Render, Tunnel, or Local):</Text>
            <TextInput
              style={styles.formInput}
              placeholder="https://your-backend.onrender.com/api"
              value={apiUrlInput}
              onChangeText={setApiUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6, alignItems: 'center' }}
                onPress={() => setApiUrlInput('https://bright-toys-glow.loca.lt/api')}
              >
                <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>Use Live Tunnel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 6, alignItems: 'center' }}
                onPress={() => setApiUrlInput('http://localhost:5000/api')}
              >
                <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' }}>Localhost</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.pwdSubmitBtn, { marginTop: 12 }]} onPress={handleSaveApiUrl}>
              <Text style={styles.pwdSubmitText}>Save & Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.small,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idChip: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleSwitchBtn: {
    width: '48%',
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  activeRoleSwitchBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  roleSwitchText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeRoleSwitchText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sdpCard: {
    padding: 16,
    alignItems: 'center',
  },
  sdpTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sdpDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
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
  pwdSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  pwdSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
