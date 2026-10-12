import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

const CATEGORIES = ['All', 'Academic', 'Exam', 'Holiday', 'General'];

export const NoticesScreen = ({ onBack, selectedNoticeInitial }) => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [detailNotice, setDetailNotice] = useState(selectedNoticeInitial || null);

  // Publish Modal (for Admin & Teacher)
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCat, setNewCat] = useState('Academic');
  const [newPriority, setNewPriority] = useState('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [activeCat, search]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.getNotices({
        category: activeCat === 'All' ? undefined : activeCat,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setNotices(res.notices || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!newTitle || !newContent) {
      Alert.alert('Required', 'Title and Content are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createNotice({
        title: newTitle,
        content: newContent,
        category: newCat,
        priority: newPriority,
        department_id: user?.department_id || null,
      });

      if (res.success) {
        Alert.alert('Published', 'Notice published to campus board.');
        setPublishModalVisible(false);
        setNewTitle('');
        setNewContent('');
        fetchNotices();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPublish = user?.role === 'ADMIN' || user?.role === 'TEACHER';

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
            <Text style={styles.headerTitle}>Official Campus Notices</Text>
            <Text style={styles.headerSub}>BUBT Announcements & Circulars</Text>
          </View>
        </View>

        {canPublish && (
          <TouchableOpacity style={styles.publishBtn} onPress={() => setPublishModalVisible(true)}>
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.publishBtnText}>Publish</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catScrollContent}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.catBtn, activeCat === c && styles.activeCatBtn]}
            onPress={() => setActiveCat(c)}
          >
            <Text style={[styles.catText, activeCat === c && styles.activeCatText]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search circulars, exams, schedules..."
          value={search}
          onChangeText={setSearch}
        />
        {Boolean(search) && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Notices List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : notices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No notices found</Text>
          </View>
        ) : (
          notices.map((n) => (
            <TouchableOpacity
              key={n.notice_id}
              style={[styles.card, n.priority === 'Urgent' && styles.urgentCard]}
              onPress={() => setDetailNotice(n)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <StatusBadge label={n.priority} size="small" />
                  <View style={styles.catChip}>
                    <Text style={styles.catChipText}>{n.category}</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>
                  {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
              </View>

              <Text style={styles.noticeTitle}>{n.title}</Text>
              <Text style={styles.noticeSnippet} numberOfLines={2}>{n.content}</Text>

              <View style={styles.authorRow}>
                <Ionicons name="person-circle-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.authorText}>
                  {n.author_name} ({n.author_role})
                  {n.department_code ? ` • ${n.department_code}` : ' • All Campus'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={Boolean(detailNotice)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                  <StatusBadge label={detailNotice?.priority} />
                  <View style={styles.catChip}>
                    <Text style={styles.catChipText}>{detailNotice?.category}</Text>
                  </View>
                </View>
                <Text style={styles.detailTitle}>{detailNotice?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailNotice(null)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingVertical: 10 }}>
              <Text style={styles.detailContent}>{detailNotice?.content}</Text>

              <View style={styles.noticeMetaBox}>
                <Text style={styles.metaLabel}>Published By:</Text>
                <Text style={styles.metaValue}>{detailNotice?.author_name} ({detailNotice?.author_role})</Text>

                <Text style={[styles.metaLabel, { marginTop: 8 }]}>Date of Publication:</Text>
                <Text style={styles.metaValue}>
                  {detailNotice && new Date(detailNotice.created_at).toLocaleString()}
                </Text>

                {detailNotice?.department_name && (
                  <>
                    <Text style={[styles.metaLabel, { marginTop: 8 }]}>Target Department:</Text>
                    <Text style={styles.metaValue}>{detailNotice.department_name}</Text>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Publish Modal */}
      <Modal visible={publishModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publish Official Notice</Text>
              <TouchableOpacity onPress={() => setPublishModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Notice Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Midterm Seat Plan Fall 2026"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {['Academic', 'Exam', 'Holiday', 'General'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.formChip, newCat === c && styles.activeFormChip]}
                    onPress={() => setNewCat(c)}
                  >
                    <Text style={[styles.formChipText, newCat === c && styles.activeFormChipText]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Priority Level</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {['Normal', 'High', 'Urgent'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.formChip, newPriority === p && styles.activeFormChip]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={[styles.formChipText, newPriority === p && styles.activeFormChipText]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notice Content & Instructions</Text>
              <TextInput
                style={[styles.formInput, { height: 110 }]}
                placeholder="Complete announcement text..."
                value={newContent}
                onChangeText={setNewContent}
                multiline
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Broadcast to Campus</Text>
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
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  catScroll: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  catScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCatBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCatText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 12,
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
    color: COLORS.textPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catChip: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  noticeSnippet: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorText: {
    fontSize: 11,
    color: COLORS.textMuted,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
    lineHeight: 22,
  },
  detailContent: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  noticeMetaBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
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
