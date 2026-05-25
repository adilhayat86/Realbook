import React, { useState, useRef } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TagChip } from '@/components/TagChip';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  CITIES,
  PROPERTY_TYPES,
  SPECIAL_TAGS,
  SIZE_UNITS,
  TWIN_CITIES_AREAS,
  getSocieties,
  getPhasesForSociety,
  getBlocksForPhase,
  POSSESSION_STATUS,
  REGISTRY_STATUS,
  MAP_STATUS,
  DUES_STATUS,
  NOC_STATUS,
} from '@/constants/societies';
import { PostFormData, PropertyType, SpecialTag, City } from '@/types';
import { colors } from '@/theme/colors';

const initialForm: PostFormData = {
  propertyType: '',
  city: '',
  society: '',
  phase: '',
  block: '',
  price: '',
  size: '',
  sizeUnit: 'Marla',
  possessionStatus: '',
  registryStatus: '',
  mapStatus: '',
  duesStatus: '',
  nocStatus: '',
  tags: [],
  description: '',
  images: [],
  // Property-specific fields
  level: '',
  facing: '',
  streetWidth: '',
  corner: false,
  parkFacing: false,
  mainBoulevard: false,
  approval: '',
  commercialActivity: '',
  multiStorey: false,
  basement: false,
  currentlyRented: false,
  rentalIncome: '',
  vacatingTimeline: '',
  construction: '',
  yearsOld: undefined,
  quality: '',
  furnished: '',
  floors: undefined,
  servantQuarter: false,
  separateGate: false,
  floorNumber: undefined,
  totalFloors: undefined,
  parking: undefined,
  lift: false,
  apartmentType: '',
  generator: false,
  shopFloor: '',
  mezzanine: false,
  officeFloor: undefined,
  dimensions: '',
  mapAttachment: '',
  googleLocation: '',
  boundaryWall: false,
  tubeWell: false,
  balanceAmount: '',
  statementAttachment: '',
  ballotDone: false,
  possessionExpected: '',
  industrialEstate: '',
  gas: false,
  water: false,
  roadAccess: false,
  rooftopAccess: false,
  rooftopArea: '',
  privateElevator: false,
  pool: false,
  gym: false,
  views: [],
};

const STEPS = ['Post Listing'];

export function PostScreen() {
  const { addListing, profile } = useApp();
  const { role } = useAuth();
  const navigation = useNavigation();
  const [form, setForm] = useState<PostFormData>(initialForm);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Guests cannot post listings
  if (role === 'guest') {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Post Listing"
          subtitle="Login required"
          left={
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.textMuted} />
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestText}>
            You must be logged in to post a listing.
          </Text>
          <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.guestBtn}
          />
        </View>
      </View>
    );
  }

  const handleAddImage = () => {
    if (Platform.OS === 'web') {
      // Web: trigger hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setForm((prev) => ({
                  ...prev,
                  images: [...prev.images, event.target!.result as string],
                }));
              }
            };
            reader.readAsDataURL(file);
          });
        }
      };
      input.click();
    } else {
      // Native: use mock for now (would use expo-image-picker in production)
      const mockImages = ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'];
      const newImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (tag: SpecialTag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handlePost = () => {
    addListing(form);
    Alert.alert('Posted!', 'Your listing is now live on the feed.', [
      {
        text: 'OK',
        onPress: () => {
          setForm(initialForm);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Post Listing"
        subtitle="Add new property listing"
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.section}>Property Type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map((type) => (
            <TagChip
              key={type}
              label={type}
              selected={form.propertyType === type}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  propertyType: type as PropertyType,
                }))
              }
            />
          ))}
        </View>
        <InputField
          label="Size"
          placeholder="e.g. 10"
          value={form.size}
          keyboardType="numeric"
          onChangeText={(size) => setForm((prev) => ({ ...prev, size }))}
        />
        <Text style={styles.section}>Size Unit</Text>
        <View style={styles.chipRow}>
          {SIZE_UNITS.map((unit) => (
            <TagChip
              key={unit}
              label={unit}
              selected={form.sizeUnit === unit}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  sizeUnit: unit,
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>City</Text>
        <View style={styles.chipRow}>
          {CITIES.map((city) => (
            <TagChip
              key={city}
              label={city}
              selected={form.city === city}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  city: city as City,
                  society: '',
                  phase: '',
                  block: '',
                }))
              }
            />
          ))}
        </View>
        {form.city && (
          <>
            <Text style={styles.section}>Society</Text>
            <View style={styles.chipRow}>
              {getSocieties(form.city as City).map((society) => (
                <TagChip
                  key={society}
                  label={society}
                  selected={form.society === society}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      society,
                      phase: '',
                      block: '',
                    }))
                  }
                />
              ))}
            </View>
          </>
        )}
        {form.society && (
          <>
            <Text style={styles.section}>Phase / Sector</Text>
            <View style={styles.chipRow}>
              {getPhasesForSociety(form.city as City, form.society).map((phase) => (
                <TagChip
                  key={phase}
                  label={phase}
                  selected={form.phase === phase}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      phase,
                      block: '',
                    }))
                  }
                />
              ))}
            </View>
          </>
        )}
        {form.phase && (
          <>
            <Text style={styles.section}>Block</Text>
            <View style={styles.chipRow}>
              {getBlocksForPhase(form.city as City, form.society, form.phase).map((block) => (
                <TagChip
                  key={block}
                  label={block}
                  selected={form.block === block}
                  onPress={() => setForm((prev) => ({ ...prev, block }))}
                />
              ))}
            </View>
          </>
        )}
        <InputField
          label="Price (Rs)"
          placeholder="e.g. 18500000"
          keyboardType="numeric"
          value={form.price}
          onChangeText={(price) => setForm((prev) => ({ ...prev, price }))}
        />

        <Text style={styles.section}>Photos</Text>
        <View style={styles.imageUploadContainer}>
          {form.images.map((image, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <Pressable
                style={styles.removeImageBtn}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={styles.addImageBtn}
            onPress={handleAddImage}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add" size={32} color={colors.primary} />
            <Text style={styles.addImageText}>Add Photo</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Possession Status</Text>
        <View style={styles.chipRow}>
          {POSSESSION_STATUS.map((status) => (
            <TagChip
              key={status}
              label={status}
              selected={form.possessionStatus === status}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  possessionStatus: status as any,
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Registry Status</Text>
        <View style={styles.chipRow}>
          {REGISTRY_STATUS.map((status) => (
            <TagChip
              key={status}
              label={status}
              selected={form.registryStatus === status}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  registryStatus: status as any,
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Map Status</Text>
        <View style={styles.chipRow}>
          {MAP_STATUS.map((status) => (
            <TagChip
              key={status}
              label={status}
              selected={form.mapStatus === status}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  mapStatus: status as any,
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Dues Status</Text>
        <View style={styles.chipRow}>
          {DUES_STATUS.map((status) => (
            <TagChip
              key={status}
              label={status}
              selected={form.duesStatus === status}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  duesStatus: status as any,
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>NOC Status</Text>
        <View style={styles.chipRow}>
          {NOC_STATUS.map((status) => (
            <TagChip
              key={status}
              label={status}
              selected={form.nocStatus === status}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  nocStatus: status as any,
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Special Tags</Text>
        <View style={styles.chipRow}>
          {SPECIAL_TAGS.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={form.tags.includes(tag as SpecialTag)}
              onPress={() => toggleTag(tag as SpecialTag)}
            />
          ))}
        </View>

        <InputField
          label="Description (optional)"
          placeholder="Additional details..."
          value={form.description}
          onChangeText={(description) =>
            setForm((prev) => ({ ...prev, description }))
          }
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />

        {form.propertyType === 'Residential Plot' && (
          <>
            <Text style={styles.section}>Plot Details</Text>
            <InputField
              label="Level"
              placeholder="e.g. Level / Raised / Lowered"
              value={form.level || ''}
              onChangeText={(level) => setForm((prev) => ({ ...prev, level }))}
            />
            <InputField
              label="Facing"
              placeholder="North / South / East / West"
              value={form.facing || ''}
              onChangeText={(facing) => setForm((prev) => ({ ...prev, facing }))}
            />
            <InputField
              label="Street Width (feet)"
              placeholder="e.g. 40"
              keyboardType="numeric"
              value={form.streetWidth || ''}
              onChangeText={(streetWidth) => setForm((prev) => ({ ...prev, streetWidth }))}
            />
          </>
        )}

        {form.propertyType === 'Commercial Plot' && (
          <>
            <Text style={styles.section}>Commercial Details</Text>
            <InputField
              label="Approval"
              placeholder="LDA / RDA / CDA / DHA / Bahria / Unapproved"
              value={form.approval || ''}
              onChangeText={(approval) => setForm((prev) => ({ ...prev, approval }))}
            />
          </>
        )}

        {form.propertyType === 'House' && (
          <>
            <Text style={styles.section}>House Details</Text>
            <InputField
              label="Construction"
              placeholder="Brand New / Used"
              value={form.construction || ''}
              onChangeText={(construction) => setForm((prev) => ({ ...prev, construction }))}
            />
            <InputField
              label="Quality"
              placeholder="Grey / Partially / Fully finished"
              value={form.quality || ''}
              onChangeText={(quality) => setForm((prev) => ({ ...prev, quality }))}
            />
            <InputField
              label="Furnished"
              placeholder="Furnished / Unfurnished / Semi"
              value={form.furnished || ''}
              onChangeText={(furnished) => setForm((prev) => ({ ...prev, furnished }))}
            />
          </>
        )}

        {form.propertyType === 'Apartment / Flat' && (
          <>
            <Text style={styles.section}>Apartment Details</Text>
            <InputField
              label="Floor Number"
              placeholder="e.g. 3"
              keyboardType="numeric"
              value={form.floorNumber ? String(form.floorNumber) : ''}
              onChangeText={(floorNumber) => setForm((prev) => ({ ...prev, floorNumber: parseInt(floorNumber) || undefined }))}
            />
            <InputField
              label="Total Floors"
              placeholder="e.g. 10"
              keyboardType="numeric"
              value={form.totalFloors ? String(form.totalFloors) : ''}
              onChangeText={(totalFloors) => setForm((prev) => ({ ...prev, totalFloors: parseInt(totalFloors) || undefined }))}
            />
            <InputField
              label="Parking Spots"
              placeholder="e.g. 1"
              keyboardType="numeric"
              value={form.parking ? String(form.parking) : ''}
              onChangeText={(parking) => setForm((prev) => ({ ...prev, parking: parseInt(parking) || undefined }))}
            />
          </>
        )}

        {form.propertyType === 'Farm House' && (
          <>
            <Text style={styles.section}>Farm House Details</Text>
            <InputField
              label="Dimensions (length x width feet)"
              placeholder="MANDATORY"
              value={form.dimensions || ''}
              onChangeText={(dimensions) => setForm((prev) => ({ ...prev, dimensions }))}
            />
          </>
        )}

        {form.propertyType === 'File' && (
          <>
            <Text style={styles.section}>File Details</Text>
            <InputField
              label="Balance Amount (₨)"
              placeholder="MANDATORY"
              keyboardType="numeric"
              value={form.balanceAmount || ''}
              onChangeText={(balanceAmount) => setForm((prev) => ({ ...prev, balanceAmount }))}
            />
          </>
        )}

        {form.propertyType === 'Industrial Plot' && (
          <>
            <Text style={styles.section}>Industrial Details</Text>
            <InputField
              label="Industrial Estate Name"
              placeholder="MANDATORY"
              value={form.industrialEstate || ''}
              onChangeText={(industrialEstate) => setForm((prev) => ({ ...prev, industrialEstate }))}
            />
          </>
        )}

        {form.propertyType === 'Penthouse' && (
          <>
            <Text style={styles.section}>Penthouse Details</Text>
            <InputField
              label="Floor Number"
              placeholder="e.g. 10"
              keyboardType="numeric"
              value={form.floorNumber ? String(form.floorNumber) : ''}
              onChangeText={(floorNumber) => setForm((prev) => ({ ...prev, floorNumber: parseInt(floorNumber) || undefined }))}
            />
            <InputField
              label="Total Floors"
              placeholder="e.g. 12"
              keyboardType="numeric"
              value={form.totalFloors ? String(form.totalFloors) : ''}
              onChangeText={(totalFloors) => setForm((prev) => ({ ...prev, totalFloors: parseInt(totalFloors) || undefined }))}
            />
            <InputField
              label="Rooftop Area (sqft)"
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={form.rooftopArea || ''}
              onChangeText={(rooftopArea) => setForm((prev) => ({ ...prev, rooftopArea }))}
            />
          </>
        )}

        <View style={styles.review}>
          <Text style={styles.reviewTitle}>Review</Text>
          <Text style={styles.reviewLine}>
            {form.propertyType} · {form.size} {form.sizeUnit}
          </Text>
          <Text style={styles.reviewLine}>
            {form.city} · {form.society}
          </Text>
          <Text style={styles.reviewLine}>
            {form.phase} {form.block ? `· ${form.block}` : ''}
          </Text>
          <Text style={styles.reviewPrice}>Rs {form.price}</Text>
          {form.possessionStatus && (
            <Text style={styles.reviewLine}>
              Possession: {form.possessionStatus}
            </Text>
          )}
          {form.images.length > 0 && (
            <Text style={styles.reviewLine}>
              {form.images.length} photo{form.images.length !== 1 ? 's' : ''}
            </Text>
          )}
          {form.tags.length > 0 && (
            <View style={styles.chipRow}>
              {form.tags.map((t) => (
                <TagChip key={t} label={t} small />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Post Listing"
          onPress={handlePost}
          disabled={!form.propertyType || !form.size || !form.city || !form.society || !form.phase || !form.price}
          style={styles.postBtn}
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
  progress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dotActive: {
    backgroundColor: colors.primaryLight,
  },
  dotDone: {
    backgroundColor: colors.accent,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dotTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imageUploadContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  imageScroll: {
    flexDirection: 'row',
    flexGrow: 0,
    marginRight: 8,
  },
  imageScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageItem: {
    marginRight: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 2,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    zIndex: 10,
  },
  addImageText: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  review: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  reviewLine: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  reviewPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  postBtn: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  guestBtn: {
    width: '100%',
  },
});
