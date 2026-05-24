import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { FeedStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'ListingDetail'>;

interface Offer {
  id: string;
  listingId: string;
  agentId: string;
  agentName: string;
  amount: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export function OffersScreen({ navigation, route }: Props) {
  const { listings, profile } = useApp();
  const { role } = useAuth();
  const nav = useNavigation();
  const { listingId } = route.params;
  const listing = listings.find((l) => l.id === listingId);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  
  // Mock offers data
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      listingId: listingId,
      agentId: 'a2',
      agentName: 'Sara Malik',
      amount: 17500000,
      message: 'Interested in this property. Can we negotiate?',
      createdAt: '2 hours ago',
      status: 'pending',
    },
    {
      id: '2',
      listingId: listingId,
      agentId: 'a3',
      agentName: 'Usman Ali',
      amount: 18000000,
      message: 'Ready to close deal quickly.',
      createdAt: '5 hours ago',
      status: 'countered',
    },
  ]);

  // Guests cannot make offers
  const handleSendOffer = () => {
    if (role === 'guest') {
      Alert.alert('Login Required', 'Please login to make offers.');
      return;
    }
    
    if (!offerAmount.trim()) {
      Alert.alert('Error', 'Please enter an offer amount.');
      return;
    }

    const amount = parseInt(offerAmount.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    const newOffer: Offer = {
      id: Date.now().toString(),
      listingId: listingId,
      agentId: profile.id,
      agentName: profile.name,
      amount,
      message: offerMessage.trim(),
      createdAt: 'Just now',
      status: 'pending',
    };

    setOffers([newOffer, ...offers]);
    setOfferAmount('');
    setOfferMessage('');
    Alert.alert('Success', 'Your offer has been sent.');
  };

  const handleAcceptOffer = (offerId: string) => {
    setOffers(prev => prev.map(o => 
      o.id === offerId ? { ...o, status: 'accepted' as const } : o
    ));
    Alert.alert('Offer Accepted', 'The offer has been accepted.');
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(prev => prev.map(o => 
      o.id === offerId ? { ...o, status: 'rejected' as const } : o
    ));
    Alert.alert('Offer Rejected', 'The offer has been rejected.');
  };

  const handleCounterOffer = (offerId: string) => {
    Alert.prompt(
      'Counter Offer',
      'Enter your counter offer amount:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: (amount: string | undefined) => {
            if (amount) {
              setOffers(prev => prev.map(o => 
                o.id === offerId ? { ...o, status: 'countered' as const, amount: parseInt(amount, 10) } : o
              ));
              Alert.alert('Counter Offer Sent', 'Your counter offer has been sent.');
            }
          }
        },
      ],
      'plain-text'
    );
  };

  if (!listing) {
    return (
      <View style={styles.container}>
        <BackHeader title="Offers" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const renderOffer = ({ item }: { item: Offer }) => {
    const isOwnOffer = item.agentId === profile.id;
    const isListingOwner = listing.agentId === profile.id;

    return (
      <View style={styles.offerCard}>
        <View style={styles.offerHeader}>
          <View style={styles.offerAgent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.agentName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.agentName}>{item.agentName}</Text>
              <Text style={styles.offerTime}>{item.createdAt}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'accepted' ? colors.primary : item.status === 'rejected' ? colors.error : colors.tagBg }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status === 'accepted' || item.status === 'rejected' ? '#fff' : colors.primary }
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.offerDetails}>
          <Text style={styles.offerAmount}>₨{item.amount.toLocaleString()}</Text>
          {item.message && <Text style={styles.offerMessage}>{item.message}</Text>}
        </View>

        {isListingOwner && item.status === 'pending' && (
          <View style={styles.offerActions}>
            <Pressable 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => handleRejectOffer(item.id)}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Reject</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, styles.counterBtn]} 
              onPress={() => handleCounterOffer(item.id)}
            >
              <Ionicons name="swap-horizontal" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Counter</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, styles.acceptBtn]} 
              onPress={() => handleAcceptOffer(item.id)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Offers" onBack={() => navigation.goBack()} />
      
      <View style={styles.header}>
        <Text style={styles.listingTitle}>{listing.propertyType}</Text>
        <Text style={styles.listingLocation}>
          {listing.city} · {listing.society} · {listing.phase}
        </Text>
        <Text style={styles.listingPrice}>₨{listing.price.toLocaleString()}</Text>
      </View>

      <View style={styles.newOfferSection}>
        <Text style={styles.sectionTitle}>Make an Offer</Text>
        <TextInput
          style={styles.offerInput}
          placeholder="Offer Amount (₨)"
          placeholderTextColor={colors.textMuted}
          value={offerAmount}
          onChangeText={setOfferAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.offerInput, styles.messageInput]}
          placeholder="Message (optional)"
          placeholderTextColor={colors.textMuted}
          value={offerMessage}
          onChangeText={setOfferMessage}
          multiline
        />
        <Pressable style={styles.sendBtn} onPress={handleSendOffer}>
          <Text style={styles.sendBtnText}>Send Offer</Text>
        </Pressable>
      </View>

      <View style={styles.offersSection}>
        <Text style={styles.sectionTitle}>Offers ({offers.length})</Text>
        <FlatList
          data={offers}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.offersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No offers yet</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  newOfferSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  offerInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  offersSection: {
    flex: 1,
    padding: 16,
  },
  offersList: {
    gap: 12,
  },
  offerCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerAgent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  offerTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  offerDetails: {
    marginBottom: 12,
  },
  offerAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  offerMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  counterBtn: {
    backgroundColor: colors.textSecondary,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
