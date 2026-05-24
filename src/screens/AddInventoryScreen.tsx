import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { Button } from '../components/Button';
import { FeedStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'AddInventory'>;

export function AddInventoryScreen({ navigation }: Props) {
  const goToPost = () => {
    navigation.goBack();
    navigation.getParent()?.navigate('Post');
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Add Inventory" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name="add-circle" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Post a new listing</Text>
        <Text style={styles.desc}>
          Add plots, houses, flats, or commercial property to your inventory in
          3 simple steps — property details, location & price, then tags.
        </Text>
        <Button title="Start Posting" onPress={goToPost} style={styles.btn} />
        <Button title="Back to Feed" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 10 },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  btn: { width: '100%', marginBottom: 10 },
});
