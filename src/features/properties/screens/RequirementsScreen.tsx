import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  SIZE_UNITS,
  TWIN_CITIES_AREAS,
  getSocieties,
  getPhasesForSociety,
  getBlocksForPhase,
} from '@/constants/societies';
import { Requirement, PropertyType, City } from '@/types';
import { colors } from '@/theme/colors';
import { RootStackParamList } from '@/navigation/types';

type RootNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface RequirementFormData {
  propertyType: PropertyType | '';
  city: City | '';
  area: string;
  society: string;
  phase: string;
  block: string;
  size: string;
  sizeUnit: string;
  minPrice: string;
  maxPrice: string;
  description: string;
}

const initialForm: RequirementFormData = {
  propertyType: '',
  city: '',
  area: '',
  society: '',
  phase: '',
  block: '',
  size: '',
  sizeUnit: 'Marla',
  minPrice: '',
  maxPrice: '',
  description: '',
};

export function RequirementsScreen() {
  const nav = useNavigation<RootNav>();
  const { addRequirement, profile, requirements } = useApp();
  const { role } = useAuth();
  const navigation = useNavigation();
  const [form, setForm] = useState<RequirementFormData>(initialForm);

  // Guests cannot post requirements
  if (role === 'guest') {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Post Requirement"
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
            You must be logged in to post a requirement.
          </Text>
          <Button
            title="Go to Login"
            onPress={() => nav.navigate('Login')}
            style={styles.guestBtn}
          />
        </View>
      </View>
    );
  }

  // Check monthly limit (3 per month)
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyCount = requirements.filter(
    (r: Requirement) => r.agentId === profile.id && r.createdAt.startsWith(currentMonth)
  ).length;

  if (monthlyCount >= 3) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Post Requirement"
          subtitle="Limit reached"
          left={
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.guestContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.guestTitle}>Monthly Limit Reached</Text>
          <Text style={styles.guestText}>
            You can post maximum 3 requirements per month. Try again next month.
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.guestBtn}
          />
        </View>
      </View>
    );
  }

  const canPost = form.propertyType && form.city && form.area;

  const handlePost = () => {
    if (!canPost) {
      Alert.alert('Missing fields', 'Please fill in Property Type, City, and Area.');
      return;
    }

    const newRequirement: Requirement = {
      id: `req_${Date.now()}`,
      agentId: profile.id,
      agentName: profile.name,
      agentAgency: profile.agency,
      propertyType: form.propertyType as PropertyType,
      city: form.city as City,
      area: form.area,
      society: form.society || undefined,
      phase: form.phase || undefined,
      block: form.block || undefined,
      size: form.size || undefined,
      sizeUnit: form.sizeUnit || undefined,
      minPrice: form.minPrice || undefined,
      maxPrice: form.maxPrice || undefined,
      description: form.description || undefined,
      createdAt: new Date().toISOString(),
    };

    addRequirement(newRequirement);
    Alert.alert('Posted!', 'Your requirement is now live on the feed.', [
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
        title="Post Requirement"
        subtitle={`Monthly limit: ${monthlyCount}/3`}
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
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

        <InputField
          label="Area (Required)"
          placeholder="e.g. Bahria Town, DHA, Gulberg"
          value={form.area}
          onChangeText={(area) => setForm((prev) => ({ ...prev, area }))}
        />

        {form.city && (
          <>
            <Text style={styles.section}>Society (Optional)</Text>
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
            <Text style={styles.section}>Phase (Optional)</Text>
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
            <Text style={styles.section}>Block (Optional)</Text>
            <View style={styles.chipRow}>
              {getBlocksForPhase(form.city as City, form.society, form.phase).map((block) => (
                <TagChip
                  key={block}
                  label={block}
                  selected={form.block === block}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      block,
                    }))
                  }
                />
              ))}
            </View>
          </>
        )}

        <InputField
          label="Size (Optional)"
          placeholder="e.g. 10"
          keyboardType="numeric"
          value={form.size}
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

        <InputField
          label="Min Price (Optional)"
          placeholder="e.g. 10000000"
          keyboardType="numeric"
          value={form.minPrice}
          onChangeText={(minPrice) => setForm((prev) => ({ ...prev, minPrice }))}
        />

        <InputField
          label="Max Price (Optional)"
          placeholder="e.g. 20000000"
          keyboardType="numeric"
          value={form.maxPrice}
          onChangeText={(maxPrice) => setForm((prev) => ({ ...prev, maxPrice }))}
        />

        <InputField
          label="Description (Optional)"
          placeholder="Additional details..."
          value={form.description}
          onChangeText={(description) =>
            setForm((prev) => ({ ...prev, description }))
          }
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />

        <View style={styles.review}>
          <Text style={styles.reviewTitle}>Review</Text>
          <Text style={styles.reviewLine}>
            {form.propertyType} · {form.city}
          </Text>
          <Text style={styles.reviewLine}>
            Area: {form.area}
          </Text>
          {form.society && (
            <Text style={styles.reviewLine}>
              {form.society} {form.phase ? `· ${form.phase}` : ''}{' '}
              {form.block ? `· ${form.block}` : ''}
            </Text>
          )}
          {form.size && (
            <Text style={styles.reviewLine}>
              Size: {form.size} {form.sizeUnit}
            </Text>
          )}
          {(form.minPrice || form.maxPrice) && (
            <Text style={styles.reviewLine}>
              Budget: {form.minPrice || 'Any'} - {form.maxPrice || 'Any'}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Post Requirement" onPress={handlePost} disabled={!canPost} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
