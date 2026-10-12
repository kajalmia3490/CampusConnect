import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { TopWave, BottomWave } from '../components/DesignFrame';

export const AuthScreen = () => {
  const { login, register, quickLogin } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  // Form states
  const [username, setUsername] = useState('20244203028');
  const [pinCode, setPinCode] = useState('Password123!');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('STUDENT');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !pinCode) {
      setErrorMsg('Please enter user name and PIN/password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await login(username, pinCode);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please enter your Name, Email address, and Password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await register({
      university_id: 'BUBT-' + Math.floor(100000 + Math.random() * 900000),
      full_name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      department_id: 1,
      semester: 6,
      section: '1',
    });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <View style={styles.outerCanvas}>
      <View style={styles.phoneContainer}>
        {/* Top Wave Banner */}
        <TopWave showPlus={!isLoginView} onPlusPress={() => setIsLoginView(true)} />

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {isLoginView ? (
            /* ===================================================
               PAGE 1 DESIGN: Log In Screen
               =================================================== */
            <View style={styles.pageContainer}>
              {/* Big Blue Circle Avatar */}
              <View style={styles.bigCircleWrapper}>
                <View style={styles.bigBlueCircle}>
                  <Ionicons name="person" size={54} color="rgba(255,255,255,0.4)" />
                </View>
              </View>

              {/* Error Message */}
              {Boolean(errorMsg) && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Form Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>User name</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Student ID, Teacher ID or Email"
                  placeholderTextColor="#94A3B8"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Enter login PIN code</Text>
                <TextInput
                  style={styles.pillInput}
                  placeholder="PIN code or Password"
                  placeholderTextColor="#94A3B8"
                  value={pinCode}
                  onChangeText={setPinCode}
                  secureTextEntry
                />
              </View>

              {/* Create Account Link */}
              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => { setIsLoginView(false); setErrorMsg(''); }}
              >
                <Text style={styles.linkText}>
                  Still without account? <Text style={styles.linkHighlight}>Create one</Text>
                </Text>
              </TouchableOpacity>

              {/* Log In Button */}
              <TouchableOpacity
                style={styles.bluePillBtn}
                onPress={handleLogin}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.bluePillBtnText}>Log in</Text>
                )}
              </TouchableOpacity>

              {/* Quick Demo Logins Helper */}
              <View style={styles.demoBox}>
                <Text style={styles.demoHeading}>Demo 1-Click Login:</Text>
                <View style={styles.demoPills}>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={styles.demoPill}
                      onPress={() => {
                        setUsername(acc.id);
                        setPinCode(acc.password);
                        quickLogin(acc.id, acc.password);
                      }}
                    >
                      <Text style={styles.demoPillText}>{acc.label.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            /* ===================================================
               PAGE 2 DESIGN: Create your account Screen
               =================================================== */
            <View style={styles.pageContainer}>
              {/* Circular Avatar with Yellow Ring */}
              <View style={styles.avatarYellowRing}>
                <View style={styles.avatarBlueInner}>
                  <Ionicons name="woman" size={54} color="#FFFFFF" />
                </View>
              </View>

              {/* Headings */}
              <Text style={styles.createTitle}>Create your account</Text>
              <Text style={styles.createSub}>
                From classes to campus services{"\n"}we help you to manage it all.
              </Text>

              {/* Error Message */}
              {Boolean(errorMsg) && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Inputs */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Name"
                  placeholderTextColor="#94A3B8"
                  value={regName}
                  onChangeText={setRegName}
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Email address"
                  placeholderTextColor="#94A3B8"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                />
              </View>

              {/* Role selector */}
              <View style={styles.roleRow}>
                {['STUDENT', 'TEACHER', 'STAFF'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, regRole === r && styles.activeRoleChip]}
                    onPress={() => setRegRole(r)}
                  >
                    <Text style={[styles.roleChipText, regRole === r && styles.activeRoleChipText]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sign Up Button (Gold/Amber Pill) */}
              <TouchableOpacity
                style={styles.goldPillBtn}
                onPress={handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.goldPillBtnText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Already have account link */}
              <TouchableOpacity
                style={[styles.linkContainer, { marginTop: 18 }]}
                onPress={() => { setIsLoginView(true); setErrorMsg(''); }}
              >
                <Text style={styles.linkText}>
                  Already have account? <Text style={styles.linkHighlight}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Decorative Wave */}
        <BottomWave />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerCanvas: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  phoneContainer: {
    width: '100%',
    maxWidth: 400,
    height: '96%',
    maxHeight: 740,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.glow,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 60,
  },
  pageContainer: {
    alignItems: 'center',
    width: '100%',
  },
  bigCircleWrapper: {
    marginTop: 18,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBlueCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#274CDB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#274CDB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  avatarYellowRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  avatarBlueInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#254EDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  createSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 6,
  },
  pillInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#355AE3',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  linkContainer: {
    marginVertical: 14,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  linkHighlight: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  bluePillBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#274CDB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#274CDB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  bluePillBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  goldPillBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#F59E0B',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 6,
  },
  goldPillBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  activeRoleChip: {
    backgroundColor: '#254EDB',
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeRoleChipText: {
    color: '#FFFFFF',
  },
  demoBox: {
    marginTop: 22,
    alignItems: 'center',
    width: '100%',
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  demoPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#254EDB',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
