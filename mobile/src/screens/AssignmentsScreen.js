import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const AssignmentsScreen = ({ onBack }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Assignment Modal (for Teachers)
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-10-25');
  const [newMarks, setNewMarks] = useState('25');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Teacher Review Submissions Modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marksGiven, setMarksGiven] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.getAssignments();
      if (res.success) {
        setAssignments(res.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.getCourses({ my_courses: 'false' });
      if (res.success && res.courses) {
        setCourses(res.courses);
        if (res.courses.length > 0) setSelectedCourseId(res.courses[0].course_id);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleOpenSubmit = (a) => {
    setActiveAssignment(a);
    setSubmissionText('');
    setSubmissionUrl('');
    setSubmitModalVisible(true);
  };

  const handleSubmitWork = async () => {
    if (!submissionText && !submissionUrl) {
      Alert.alert('Submission Input', 'Please enter text notes or your project file URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitAssignment(activeAssignment.assignment_id, {
        submission_text: submissionText,
        file_url: submissionUrl,
      });

      if (res.success) {
        Alert.alert('Success', 'Assignment submitted successfully!');
        setSubmitModalVisible(false);
        fetchAssignments();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newTitle || !newDesc || !selectedCourseId) {
      Alert.alert('Required Fields', 'Course, Title, and Description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createAssignment({
        course_id: selectedCourseId,
        title: newTitle,
        description: newDesc,
        due_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        total_marks: parseInt(newMarks) || 20,
      });

      if (res.success) {
        setCreateModalVisible(false);
        setNewTitle('');
        setNewDesc('');
        fetchAssignments();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReview = async (a) => {
    try {
      setLoading(true);
      const res = await api.getAssignmentById(a.assignment_id);
      if (res.success) {
        setAssignmentDetails(res.assignment);
        setReviewModalVisible(true);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!gradingSubmission || marksGiven === '') {
      Alert.alert('Required', 'Please enter marks.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.gradeSubmission(gradingSubmission.submission_id, {
        marks_obtained: parseFloat(marksGiven),
        feedback: teacherFeedback,
      });

      if (res.success) {
        Alert.alert('Graded', 'Submission marked successfully!');
        setGradingSubmission(null);
        setMarksGiven('');
        setTeacherFeedback('');
        // Refresh details
        const refreshed = await api.getAssignmentById(assignmentDetails.assignment_id);
        if (refreshed.success) {
          setAssignmentDetails(refreshed.assignment);
        }
        fetchAssignments();
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
            <Text style={styles.headerTitle}>Coursework & Assignments</Text>
            <Text style={styles.headerSub}>Manage Submissions & Feedback</Text>
          </View>
        </View>

        {isTeacherOrAdmin && (
          <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModalVisible(true)}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createBtnText}>New Task</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Assignment List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : assignments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No assignments currently active</Text>
            <Text style={styles.emptySub}>All coursework is completed or none published yet.</Text>
          </View>
        ) : (
          assignments.map((a) => (
            <View key={a.assignment_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.courseTag}>
                  <Text style={styles.courseTagText}>{a.course_code}</Text>
                </View>
                {user?.role === 'STUDENT' ? (
                  <StatusBadge label={a.my_submission_status || 'Pending'} size="small" />
                ) : (
                  <View style={styles.subCountBadge}>
                    <Ionicons name="people-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.subCountText}>{a.total_submissions_count || 0} Submissions</Text>
                  </View>
                )}
              </View>

              <Text style={styles.assignTitle}>{a.title}</Text>
              <Text style={styles.assignDesc}>{a.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.dueRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.danger} />
                  <Text style={styles.dueText}>
                    Deadline: {new Date(a.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.marksBadge}>{a.total_marks} Marks</Text>
              </View>

              {/* Student status display if graded */}
              {user?.role === 'STUDENT' && a.my_marks_obtained !== null && a.my_marks_obtained !== undefined && (
                <View style={styles.gradedBox}>
                  <View style={styles.gradedHeader}>
                    <Text style={styles.gradedLabel}>Instructor Evaluation:</Text>
                    <Text style={styles.gradedScore}>{a.my_marks_obtained} / {a.total_marks}</Text>
                  </View>
                  {a.my_feedback && <Text style={styles.gradedFeedback}>"{a.my_feedback}"</Text>}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {user?.role === 'STUDENT' ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, a.my_submission_status ? styles.resubmitBtn : styles.submitBtn]}
                    onPress={() => handleOpenSubmit(a)}
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>
                      {a.my_submission_status ? 'Update Submission' : 'Submit Solution'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => handleOpenReview(a)}
                  >
                    <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.reviewBtnText}>Review & Grade Submissions</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Student Submit Modal */}
      <Modal visible={submitModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Assignment</Text>
              <TouchableOpacity onPress={() => setSubmitModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>{activeAssignment?.title}</Text>

            <Text style={styles.inputLabel}>Submission Comments / Solution Notes</Text>
            <TextInput
              style={[styles.formInput, { height: 90 }]}
              placeholder="Explain your approach, team member contributions, or instructions..."
              value={submissionText}
              onChangeText={setSubmissionText}
              multiline
            />

            <Text style={styles.inputLabel}>Project Repository / File URL</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. https://github.com/kajal/CampusConnect or Google Drive link"
              value={submissionUrl}
              onChangeText={setSubmissionUrl}
            />

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSubmitWork}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Confirm & Turn In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Teacher Create Assignment Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Assignment</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Select Course</Text>
              <View style={styles.courseChipRow}>
                {courses.map((c) => (
                  <TouchableOpacity
                    key={c.course_id}
                    style={[styles.chip, selectedCourseId === c.course_id && styles.activeChip]}
                    onPress={() => setSelectedCourseId(c.course_id)}
                  >
                    <Text style={[styles.chipText, selectedCourseId === c.course_id && styles.activeChipText]}>
                      {c.course_code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Assignment Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Lab Task 4: Normalization & Stored Procedures"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Description & Requirements</Text>
              <TextInput
                style={[styles.formInput, { height: 80 }]}
                placeholder="Detailed instructions for students..."
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Total Marks</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 20"
                value={newMarks}
                onChangeText={setNewMarks}
                keyboardType="numeric"
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleCreateAssignment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Publish Assignment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Teacher Review & Grading Modal */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submissions Review</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>{assignmentDetails?.title}</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {!assignmentDetails?.submissions || assignmentDetails.submissions.length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginVertical: 30 }}>
                  No student submissions received yet.
                </Text>
              ) : (
                assignmentDetails.submissions.map((sub) => (
                  <View key={sub.submission_id} style={styles.subItemCard}>
                    <View style={styles.subItemHeader}>
                      <View>
                        <Text style={styles.studentName}>{sub.student_name}</Text>
                        <Text style={styles.studentUid}>{sub.university_id} • Sec {sub.section}</Text>
                      </View>
                      <StatusBadge label={sub.status} size="small" />
                    </View>

                    {sub.submission_text && (
                      <Text style={styles.subTextContent}>"{sub.submission_text}"</Text>
                    )}

                    {sub.file_url && (
                      <Text style={styles.subUrlText}>Link: {sub.file_url}</Text>
                    )}

                    {sub.marks_obtained !== null && (
                      <Text style={styles.subGradeText}>
                        Current Score: {sub.marks_obtained} / {assignmentDetails.total_marks}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={styles.gradeToggleBtn}
                      onPress={() => {
                        setGradingSubmission(sub);
                        setMarksGiven(sub.marks_obtained !== null ? String(sub.marks_obtained) : '');
                        setTeacherFeedback(sub.feedback || '');
                      }}
                    >
                      <Text style={styles.gradeToggleText}>
                        {gradingSubmission?.submission_id === sub.submission_id ? 'Editing Grade ▲' : 'Grade / Feedback ▼'}
                      </Text>
                    </TouchableOpacity>

                    {/* Inline Grading Form */}
                    {gradingSubmission?.submission_id === sub.submission_id && (
                      <View style={styles.gradingBox}>
                        <Text style={styles.inputLabel}>Enter Marks (Out of {assignmentDetails.total_marks}):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="e.g. 18"
                          value={marksGiven}
                          onChangeText={setMarksGiven}
                          keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Teacher Feedback:</Text>
                        <TextInput
                          style={[styles.formInput, { height: 60 }]}
                          placeholder="Provide constructive comments..."
                          value={teacherFeedback}
                          onChangeText={setTeacherFeedback}
                          multiline
                        />

                        <TouchableOpacity style={styles.saveGradeBtn} onPress={handleGrade}>
                          <Text style={styles.saveGradeText}>Save Grade & Notify Student</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courseTagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  subCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  assignTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  assignDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  marksBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gradedBox: {
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  gradedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gradedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  gradedScore: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.success,
  },
  gradedFeedback: {
    fontSize: 12,
    color: '#065F46',
    fontStyle: 'italic',
  },
  actionRow: {
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  resubmitBtn: {
    backgroundColor: COLORS.secondary,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  reviewBtnText: {
    color: COLORS.primary,
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
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  courseChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeChipText: {
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
    marginTop: 10,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  subItemCard: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  studentUid: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  subTextContent: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  subUrlText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    marginBottom: 6,
  },
  subGradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 6,
  },
  gradeToggleBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  gradeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  gradingBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  saveGradeBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveGradeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
