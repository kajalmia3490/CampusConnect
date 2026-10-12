import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MaterialsScreen = ({ onBack, preselectedCourseId }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileType, setNewFileType] = useState('PDF');
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchCoursesList();
  }, [search]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.getMaterials({
        search: search.trim() || undefined,
        course_id: preselectedCourseId || undefined,
      });
      if (res.success) {
        setMaterials(res.materials || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const res = await api.getCourses({ my_courses: 'false' });
      if (res.success && res.courses) {
        setCourses(res.courses);
        if (!selectedCourseId && res.courses.length > 0) {
          setSelectedCourseId(res.courses[0].course_id);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleUpload = async () => {
    if (!newTitle || !newFileUrl || !selectedCourseId) {
      Alert.alert('Required Fields', 'Title, Course, and File URL are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.uploadMaterial({
        course_id: selectedCourseId,
        title: newTitle,
        topic: newTopic,
        description: newDesc,
        file_url: newFileUrl,
        file_type: newFileType,
      });

      if (res.success) {
        setModalVisible(false);
        setNewTitle('');
        setNewTopic('');
        setNewDesc('');
        setNewFileUrl('');
        fetchMaterials();
      }
    } catch (e) {
      Alert.alert('Upload Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

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
            <Text style={styles.headerTitle}>Learning Materials</Text>
            <Text style={styles.headerSub}>Lecture Notes, Slides & Code</Text>
          </View>
        </View>

        {isTeacherOrAdmin && (
          <TouchableOpacity style={styles.uploadBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by topic, keyword or title..."
          value={search}
          onChangeText={setSearch}
        />
        {Boolean(search) && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Materials List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : materials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No materials uploaded yet</Text>
            <Text style={styles.emptySub}>Teachers will share study resources, handouts, and slides here.</Text>
          </View>
        ) : (
          materials.map((m) => (
            <View key={m.material_id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.fileIcon, { backgroundColor: m.file_type === 'ZIP' ? '#FEF3C7' : '#EFF6FF' }]}>
                  <Ionicons
                    name={m.file_type === 'ZIP' ? 'archive-outline' : 'document-text-outline'}
                    size={22}
                    color={m.file_type === 'ZIP' ? '#D97706' : COLORS.primary}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.topicRow}>
                    <Text style={styles.courseTag}>{m.course_code}</Text>
                    {m.topic && <Text style={styles.topicText}>• {m.topic}</Text>}
                  </View>
                  <Text style={styles.matTitle}>{m.title}</Text>
                  {m.description && <Text style={styles.matDesc}>{m.description}</Text>}
                  <Text style={styles.matMeta}>
                    By {m.uploader_name} • {new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => Alert.alert('Resource URL', m.file_url)}
              >
                <Ionicons name="download-outline" size={16} color={COLORS.primary} />
                <Text style={styles.downloadText}>Access Material ({m.file_type || 'PDF'})</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Learning Material</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Select Course</Text>
              <View style={styles.courseSelector}>
                {courses.map((c) => (
                  <TouchableOpacity
                    key={c.course_id}
                    style={[styles.courseChip, selectedCourseId === c.course_id && styles.activeCourseChip]}
                    onPress={() => setSelectedCourseId(c.course_id)}
                  >
                    <Text style={[styles.courseChipText, selectedCourseId === c.course_id && styles.activeCourseChipText]}>
                      {c.course_code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Material Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Chapter 3: SQL Triggers and Indexes"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Topic / Unit Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Database Systems"
                value={newTopic}
                onChangeText={setNewTopic}
              />

              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.formInput, { height: 60 }]}
                placeholder="Brief summary of covered concepts..."
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <Text style={styles.inputLabel}>File URL / Cloud Drive Link</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://drive.google.com/... or PDF URL"
                value={newFileUrl}
                onChangeText={setNewFileUrl}
              />

              <Text style={styles.inputLabel}>File Type</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['PDF', 'ZIP', 'DOCX', 'SLIDES'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, newFileType === type && styles.activeTypeChip]}
                    onPress={() => setNewFileType(type)}
                  >
                    <Text style={[styles.typeText, newFileType === type && styles.activeTypeText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleUpload} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Publish Material</Text>
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  courseTag: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topicText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  matTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  matDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  matMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
    paddingHorizontal: 20,
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
    marginBottom: 16,
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
  courseSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  courseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCourseChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  courseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCourseChipText: {
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
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTypeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
