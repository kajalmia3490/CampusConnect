import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';

const CATEGORIES = [
  'Lab Equipment',
  'Classroom Facilities',
  'IT/Network',
  'Cafeteria',
  'Sanitation/Washroom',
  'Library',
  'Security',
  'Other',
];

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Resolved'];

export const ComplaintsScreen = ({ onBack }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Expanded Complaint Detail
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Submit Complaint Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState(CATEGORIES[0]);
  const [newPri, setNewPri] = useState('Medium');
  const [newDesc, setNewDesc] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update Status Modal (for Staff & Admin)
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('In Progress');
  const [statusRemarks, setStatusRemarks] = useState('');

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchComplaints();
  }, [activeFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.getComplaints({
        status: activeFilter === 'All' ? undefined : activeFilter,
      });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (c) => {
    try {
      setDetailLoading(true);
      setSelectedComplaint(c);
      const res = await api.getComplaintById(c.complaint_id);
      if (res.success) {
        setSelectedComplaint(res.complaint);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateComplaint = async () => {
    if (!newTitle || !newDesc || !newLoc) {
      Alert.alert('Required Fields', 'Title, Location, and Description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createComplaint({
        title: newTitle,
        category: newCat,
        priority: newPri,
        location: newLoc,
        description: newDesc,
      });

      if (res.success) {
        Alert.alert('Registered', 'Complaint submitted. Campus maintenance team has been alerted.');
        setCreateModalVisible(false);
        setNewTitle('');
        setNewDesc('');
        setNewLoc('');
        fetchComplaints();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;

    try {
      setIsSubmitting(true);
      const res = await api.updateComplaintStatus(selectedComplaint.complaint_id, {
        status: updatedStatus,
        remarks: statusRemarks,
      });

      if (res.success) {
        Alert.alert('Updated', `Ticket status updated to ${updatedStatus}`);
        setUpdateModalVisible(false);
        setStatusRemarks('');
        // Refresh details & list
        handleOpenDetail(selectedComplaint);
        fetchComplaints();
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
            <Text style={styles.headerTitle}>Campus Complaints & Issues</Text>
            <Text style={styles.headerSub}>Real-time Maintenance & Support</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newBtn} onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newBtnText}>File Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.activeFilterBtn]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Complaints List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptySub}>No active maintenance tickets matching your filter.</Text>
          </View>
        ) : (
          complaints.map((c) => (
            <TouchableOpacity
              key={c.complaint_id}
              style={styles.card}
              onPress={() => handleOpenDetail(c)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.catBadge}>
                  <Text style={styles.catText}>{c.category}</Text>
                </View>
                <StatusBadge label={c.status} size="small" />
              </View>

              <Text style={styles.cmpTitle}>{c.title}</Text>
              <Text style={styles.cmpDesc} numberOfLines={2}>{c.description}</Text>

              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.locText}>{c.location}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerDate}>
                  Reported: {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
                <View style={styles.trackRow}>
                  <Text style={styles.trackText}>View Live Timeline</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.primaryLight} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detailed Ticket & Timeline Modal */}
      <Modal visible={Boolean(selectedComplaint)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.ticketId}>Ticket #{selectedComplaint?.complaint_id}</Text>
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedComplaint?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingVertical: 8 }}>
              {/* Status and Category Chips */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <StatusBadge label={selectedComplaint?.status} />
                <View style={styles.priChip}>
                  <Text style={styles.priChipText}>{selectedComplaint?.priority} Priority</Text>
                </View>
              </View>

              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{selectedComplaint?.location}</Text>

              <Text style={styles.detailLabel}>Full Issue Description</Text>
              <Text style={styles.detailDesc}>{selectedComplaint?.description}</Text>

              {/* Staff Assigned */}
              {selectedComplaint?.staff_name && (
                <View style={styles.assignedBox}>
                  <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.assignedText}>Assigned Staff: {selectedComplaint.staff_name}</Text>
                </View>
              )}

              {/* Visual Status Timeline */}
              <View style={styles.timelineSection}>
                <View style={styles.timelineHeader}>
                  <Ionicons name="git-commit-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.timelineTitle}>Visual Status Timeline</Text>
                </View>
                <Timeline events={selectedComplaint?.timeline || []} />
              </View>
            </ScrollView>

            {/* If Staff or Admin: Update Status Button */}
            {isStaffOrAdmin && (
              <TouchableOpacity
                style={styles.updateStatusBtn}
                onPress={() => {
                  setUpdatedStatus(selectedComplaint?.status || 'In Progress');
                  setUpdateModalVisible(true);
                }}
              >
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text style={styles.updateStatusText}>Update Ticket Status & Remarks</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Staff Update Status Action Sheet */}
      <Modal visible={updateModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Maintenance Status</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>New Status</Text>
            <View style={styles.statusChipRow}>
              {['Under Review', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.stChip, updatedStatus === st && styles.activeStChip]}
                  onPress={() => setUpdatedStatus(st)}
                >
                  <Text style={[styles.stText, updatedStatus === st && styles.activeStText]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Official Remarks / Actions Taken</Text>
            <TextInput
              style={[styles.formInput, { height: 80 }]}
              placeholder="e.g. AC technician inspected and replaced compressor coil..."
              value={statusRemarks}
              onChangeText={setStatusRemarks}
              multiline
            />

            <TouchableOpacity style={styles.confirmUpdateBtn} onPress={handleUpdateStatus} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmUpdateText}>Record Status & Notify User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* File Complaint Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File Maintenance Ticket</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catOption, newCat === cat && styles.activeCatOption]}
                      onPress={() => setNewCat(cat)}
                    >
                      <Text style={[styles.catOptionText, newCat === cat && styles.activeCatOptionText]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.inputLabel}>Issue Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Projector in Room 402 flickering"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Campus Location</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Building 2, 4th Floor, Lab 402"
                value={newLoc}
                onChangeText={setNewLoc}
              />

              <Text style={styles.inputLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.formInput, { height: 80 }]}
                placeholder="Describe what is broken, when it started, and impact..."
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Urgency / Priority</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['Low', 'Medium', 'High'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priOption, newPri === p && styles.activePriOption]}
                    onPress={() => setNewPri(p)}
                  >
                    <Text style={[styles.priOptionText, newPri === p && styles.activePriOptionText]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.confirmUpdateBtn} onPress={handleCreateComplaint} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmUpdateText}>Submit Ticket</Text>
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cmpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cmpDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  footerDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
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
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  priChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  assignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    gap: 6,
  },
  assignedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timelineSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  updateStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    marginTop: 10,
  },
  updateStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
  statusChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  stChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeStChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeStText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmUpdateBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  confirmUpdateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  catOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCatOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCatOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activePriOption: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  priOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activePriOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
