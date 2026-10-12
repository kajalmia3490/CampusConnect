import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const EventsScreen = ({ onBack }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Add Event Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [org, setOrg] = useState('BUBT Student Affairs');
  const [venue, setVenue] = useState('International Conference Hall');
  const [capacity, setCapacity] = useState('200');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getEvents();
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (ev) => {
    try {
      if (ev.is_user_registered) {
        const res = await api.unregisterEvent(ev.event_id);
        if (res.success) {
          Alert.alert('Cancelled', 'Your event registration was cancelled.');
          fetchEvents();
        }
      } else {
        const res = await api.registerEvent(ev.event_id);
        if (res.success) {
          Alert.alert('Confirmed', 'Registration confirmed! See you at the event.');
          fetchEvents();
        }
      }
    } catch (e) {
      Alert.alert('Registration Status', e.message);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !desc || !venue) {
      Alert.alert('Required', 'Please fill in Title, Description, and Venue.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createEvent({
        title,
        description: desc,
        organizer: org,
        venue,
        capacity: parseInt(capacity) || 100,
        event_date: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      });

      if (res.success) {
        setModalVisible(false);
        setTitle('');
        setDesc('');
        fetchEvents();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

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
            <Text style={styles.headerTitle}>Campus Events & Activities</Text>
            <Text style={styles.headerSub}>Discover, Join & Network</Text>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Event</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Events List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No upcoming events scheduled</Text>
          </View>
        ) : (
          events.map((ev) => {
            const isRegistered = Boolean(ev.is_user_registered);
            const isFull = (ev.registered_count || 0) >= ev.capacity;
            const progress = Math.min(1, (ev.registered_count || 0) / (ev.capacity || 1));

            return (
              <View key={ev.event_id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>
                      {new Date(ev.event_date).toLocaleDateString([], { day: '2-digit' })}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {new Date(ev.event_date).toLocaleDateString([], { month: 'short' }).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.headerInfo}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Text style={styles.organizerText}>Organized by {ev.organizer}</Text>
                  </View>
                </View>

                <Text style={styles.descText}>{ev.description}</Text>

                <View style={styles.venueRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.venueText}>{ev.venue}</Text>
                </View>

                {/* Capacity Progress Bar */}
                <View style={styles.capSection}>
                  <View style={styles.capLabelRow}>
                    <Text style={styles.capLabel}>Attendee Capacity</Text>
                    <Text style={styles.capStats}>
                      {ev.registered_count || 0} / {ev.capacity} spots filled
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                  </View>
                </View>

                {/* RSVP / Registration Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isRegistered ? styles.cancelBtn : (isFull ? styles.fullBtn : styles.registerBtn)
                  ]}
                  onPress={() => handleRegister(ev)}
                  disabled={!isRegistered && isFull}
                >
                  <Ionicons
                    name={isRegistered ? 'checkmark-circle' : 'ticket-outline'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionBtnText}>
                    {isRegistered ? 'Registered (Tap to Cancel)' : (isFull ? 'Event Full' : 'Register for Event')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Admin Add Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Host Campus Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Annual Programming Contest 2026"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Organizing Club / Office</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. BUBT IT Club & CSE Dept"
                value={org}
                onChangeText={setOrg}
              />

              <Text style={styles.inputLabel}>Venue</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Campus Auditorium, Building 1"
                value={venue}
                onChangeText={setVenue}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, { height: 70 }]}
                placeholder="Event agenda, keynote guests, and activities..."
                value={desc}
                onChangeText={setDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Max Attendee Capacity</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 200"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
              />
            </ScrollView>

            <TouchableOpacity style={styles.publishBtn} onPress={handleCreateEvent} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.publishBtnText}>Publish Event</Text>
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  dateBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  headerInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  organizerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  venueText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  capSection: {
    marginBottom: 14,
  },
  capLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  capStats: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelBtn: {
    backgroundColor: '#059669',
  },
  fullBtn: {
    backgroundColor: COLORS.textMuted,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  publishBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
