import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

const CATEGORIES = ['ID Card', 'Electronics', 'Books/Notebooks', 'Wallet/Keys', 'Personal Belongings', 'Other'];

export const LostFoundScreen = ({ onBack }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('All'); // 'All', 'Lost', 'Found'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [itemType, setItemType] = useState('Lost');
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState(CATEGORIES[0]);
  const [itemLoc, setItemLoc] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemContact, setItemContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [filterType, search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.getLostFound({
        type: filterType === 'All' ? undefined : filterType,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!itemTitle || !itemLoc || !itemDesc || !itemContact) {
      Alert.alert('Required Fields', 'Title, Location, Description, and Contact information are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createLostFound({
        type: itemType,
        title: itemTitle,
        category: itemCategory,
        location: itemLoc,
        description: itemDesc,
        contact_info: itemContact,
      });

      if (res.success) {
        Alert.alert('Posted', `${itemType} notice posted to campus community.`);
        setModalVisible(false);
        setItemTitle('');
        setItemLoc('');
        setItemDesc('');
        setItemContact('');
        fetchItems();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkClaimed = async (item) => {
    try {
      const res = await api.updateLostFoundStatus(item.item_id, 'Claimed');
      if (res.success) {
        Alert.alert('Updated', 'Item marked as resolved / claimed.');
        fetchItems();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
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
            <Text style={styles.headerTitle}>Lost & Found Hub</Text>
            <Text style={styles.headerSub}>Recover & Return Campus Belongings</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.reportBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.reportBtnText}>Report Item</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Lost', 'Found'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, filterType === t && styles.activeFilterBtn]}
            onPress={() => setFilterType(t)}
          >
            <Text style={[styles.filterText, filterType === t && styles.activeFilterText]}>
              {t === 'All' ? 'All Items' : `${t} Items`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keyword, item name, or location..."
          value={search}
          onChangeText={setSearch}
        />
        {Boolean(search) && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Items List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>No active lost or found notices at this time.</Text>
          </View>
        ) : (
          items.map((it) => (
            <View key={it.item_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, it.type === 'Lost' ? styles.lostBadge : styles.foundBadge]}>
                  <Text style={[styles.typeText, it.type === 'Lost' ? styles.lostText : styles.foundText]}>
                    {it.type.toUpperCase()}
                  </Text>
                </View>
                <StatusBadge label={it.status} size="small" />
              </View>

              <Text style={styles.itemTitle}>{it.title}</Text>
              <Text style={styles.itemCategory}>Category: {it.category}</Text>
              <Text style={styles.itemDesc}>{it.description}</Text>

              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.locText}>Location: {it.location}</Text>
              </View>

              <View style={styles.contactBox}>
                <Ionicons name="call-outline" size={14} color={COLORS.primary} />
                <Text style={styles.contactText}>Contact: {it.contact_info}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.posterText}>
                  Posted by {it.poster_name} on {new Date(it.item_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>

                {it.status === 'Active' && (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleMarkClaimed(it)}>
                    <Text style={styles.claimBtnText}>Mark Resolved</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Lost or Found Item</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Notice Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeBtn, itemType === 'Lost' && styles.activeLostBtn]}
                  onPress={() => setItemType('Lost')}
                >
                  <Text style={[styles.typeBtnText, itemType === 'Lost' && styles.activeTypeBtnText]}>Lost Something</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, itemType === 'Found' && styles.activeFoundBtn]}
                  onPress={() => setItemType('Found')}
                >
                  <Text style={[styles.typeBtnText, itemType === 'Found' && styles.activeTypeBtnText]}>Found Something</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Item Name / Headline</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Blue HP Laptop Bag or Calculator"
                value={itemTitle}
                onChangeText={setItemTitle}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.catChips}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, itemCategory === cat && styles.activeChip]}
                    onPress={() => setItemCategory(cat)}
                  >
                    <Text style={[styles.chipText, itemCategory === cat && styles.activeChipText]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Location Found / Last Seen</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Ground Floor Cafeteria or Lab 402"
                value={itemLoc}
                onChangeText={setItemLoc}
              />

              <Text style={styles.inputLabel}>Description & Identifying Marks</Text>
              <TextInput
                style={[styles.formInput, { height: 70 }]}
                placeholder="Color, brand, keychains, stickers, or specific condition..."
                value={itemDesc}
                onChangeText={setItemDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Your Contact Information</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Phone number, WhatsApp, or Student ID"
                value={itemContact}
                onChangeText={setItemContact}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Post Notice to Campus</Text>
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
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  reportBtnText: {
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
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lostBadge: {
    backgroundColor: '#FEE2E2',
  },
  foundBadge: {
    backgroundColor: '#D1FAE5',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  lostText: {
    color: '#DC2626',
  },
  foundText: {
    color: '#059669',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 6,
    gap: 6,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  posterText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  claimBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.borderLight,
  },
  claimBtnText: {
    fontSize: 11,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeLostBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  activeFoundBtn: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeTypeBtnText: {
    color: COLORS.textPrimary,
  },
  catChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
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
  submitBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
