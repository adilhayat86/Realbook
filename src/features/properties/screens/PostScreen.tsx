import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
  DUES_STATUS,
  MAP_STATUS,
  NOC_STATUS,
  POSSESSION_STATUS,
  PROPERTY_TYPES,
  REGISTRY_STATUS,
  SIZE_UNITS,
  SPECIAL_TAGS,
  getBlocksForPhase,
  getPhasesForSociety,
  getSocieties,
} from '@/constants/societies';
import { City, PostFormData, PropertyType, Requirement, SpecialTag } from '@/types';
import { colors } from '@/theme/colors';
import {
  BottomSheetSelector,
  ExpandableSection,
  OptionCard,
  PostProgress,
  PostStepLayout,
  SelectorButton,
  UnitInput,
} from '@/features/properties/components/PostWizardComponents';

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
  level: '',
  facing: '',
  streetWidth: '',
  plotNumberOne: '',
  plotNumberTwo: '',
  streetNumber: '',
  sizeEach: '',
  sizeEachUnit: 'Kanal',
  totalSize: '',
  totalSizeUnit: 'Kanal',
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

const STEPS = [
  { title: 'Property Basics', shortTitle: 'Basics' },
  { title: 'Price & Area', shortTitle: 'Price' },
  { title: 'Property Features', shortTitle: 'Features' },
  { title: 'Photos & Description', shortTitle: 'Photos' },
  { title: 'Preview & Submit', shortTitle: 'Preview' },
];

const QUICK_PROPERTY_TYPES: Array<{ label: string; value: PropertyType; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'Plot', value: 'Residential Plot', icon: 'map-outline' },
  { label: 'Pair Plot', value: 'Pair Plot', icon: 'layers-outline' },
  { label: 'House', value: 'House', icon: 'home-outline' },
];

const FEATURE_TAGS: SpecialTag[] = [
  'Corner',
  'Park Facing',
  'Main Boulevard',
  'On Biana',
  'Direct Owner',
  'Merging Possible',
  'Gated',
  'Sun Facing',
];

const SELECTOR_OPTIONS = {
  propertyType: PROPERTY_TYPES,
  city: CITIES,
  sizeUnit: SIZE_UNITS,
  possessionStatus: POSSESSION_STATUS,
  registryStatus: REGISTRY_STATUS,
  mapStatus: MAP_STATUS,
  duesStatus: DUES_STATUS,
  nocStatus: NOC_STATUS,
};

type SelectorKey =
  | 'propertyType'
  | 'city'
  | 'society'
  | 'phase'
  | 'block'
  | 'sizeUnit'
  | 'sizeEachUnit'
  | 'totalSizeUnit'
  | 'possessionStatus'
  | 'registryStatus'
  | 'mapStatus'
  | 'duesStatus'
  | 'nocStatus'
  | 'requirementPropertyType'
  | 'requirementCity'
  | 'requirementSociety'
  | 'requirementPhase'
  | 'requirementSizeUnit';

type PostMode = 'choice' | 'inventory' | 'requirement';
type RequirementUrgency = 'Normal' | 'Urgent';

interface RequirementFormData {
  propertyType: PropertyType | '';
  city: City | '';
  society: string;
  phase: string;
  size: string;
  sizeUnit: string;
  minPrice: string;
  maxPrice: string;
  description: string;
  urgency: RequirementUrgency;
}

const initialRequirementForm: RequirementFormData = {
  propertyType: '',
  city: '',
  society: '',
  phase: '',
  size: '',
  sizeUnit: 'Marla',
  minPrice: '',
  maxPrice: '',
  description: '',
  urgency: 'Normal',
};

const SELECTOR_TITLES: Record<SelectorKey, string> = {
  propertyType: 'Property Type',
  city: 'City',
  society: 'Society',
  phase: 'Phase / Sector',
  block: 'Block',
  sizeUnit: 'Size Unit',
  sizeEachUnit: 'Size Each Unit',
  totalSizeUnit: 'Total Size Unit',
  possessionStatus: 'Possession',
  registryStatus: 'Registry',
  mapStatus: 'Map',
  duesStatus: 'Dues',
  nocStatus: 'NOC',
  requirementPropertyType: 'Property Type',
  requirementCity: 'City',
  requirementSociety: 'Society',
  requirementPhase: 'Phase / Sector',
  requirementSizeUnit: 'Size Unit',
};

export function PostScreen() {
  const { addListing, addRequirement, profile } = useApp();
  const { logout, role } = useAuth();
  const navigation = useNavigation();
  const [postMode, setPostMode] = useState<PostMode>('choice');
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<PostFormData>(initialForm);
  const [requirementForm, setRequirementForm] =
    useState<RequirementFormData>(initialRequirementForm);
  const [formError, setFormError] = useState('');
  const [requirementError, setRequirementError] = useState('');
  const [requirementFeedback, setRequirementFeedback] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeSelector, setActiveSelector] = useState<SelectorKey | null>(null);

  const isPairPlot = form.propertyType === 'Pair Plot';
  const isPlot = form.propertyType === 'Residential Plot' || form.propertyType === 'Pair Plot';
  const isHouse = form.propertyType === 'House' || form.propertyType === 'Farm House';
  const isCommercial =
    form.propertyType === 'Commercial Plot' ||
    form.propertyType === 'Shop' ||
    form.propertyType === 'Office' ||
    form.propertyType === 'Industrial Plot';
  const isApartment = form.propertyType === 'Apartment / Flat' || form.propertyType === 'Penthouse';

  const societies = useMemo(
    () => (form.city ? getSocieties(form.city as City) : []),
    [form.city]
  );
  const phases = useMemo(
    () => (form.city && form.society ? getPhasesForSociety(form.city as City, form.society) : []),
    [form.city, form.society]
  );
  const blocks = useMemo(
    () =>
      form.city && form.society && form.phase
        ? getBlocksForPhase(form.city as City, form.society, form.phase)
        : [],
    [form.city, form.society, form.phase]
  );
  const requirementSocieties = useMemo(
    () => (requirementForm.city ? getSocieties(requirementForm.city as City) : []),
    [requirementForm.city]
  );
  const requirementPhases = useMemo(
    () =>
      requirementForm.city && requirementForm.society
        ? getPhasesForSociety(requirementForm.city as City, requirementForm.society)
        : [],
    [requirementForm.city, requirementForm.society]
  );

  const cannotPost = role === 'guest' || role === 'pending_agent' || role === 'banned';

  if (cannotPost) {
    const blockedCopy =
      role === 'guest'
        ? {
            subtitle: 'Login required',
            title: 'Login Required',
            text: 'You must be logged in to post inventory or requirements.',
            button: 'Go to Login',
          }
        : role === 'pending_agent'
          ? {
              subtitle: 'Approval required',
              title: 'Pending Approval',
              text: 'Admin must approve your dealer profile before you can post inventory or requirements.',
              button: 'Back to Feed',
            }
          : {
              subtitle: 'Account restricted',
              title: 'Posting Disabled',
              text: 'This account cannot post right now.',
              button: 'Back to Feed',
            };

    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Post"
          subtitle={blockedCopy.subtitle}
          left={
            <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.textMuted} />
          <Text style={styles.guestTitle}>{blockedCopy.title}</Text>
          <Text style={styles.guestText}>{blockedCopy.text}</Text>
          <Button
            title={blockedCopy.button}
            onPress={() =>
              role === 'guest'
                ? logout()
                : (navigation as any).navigate('Feed')
            }
            style={styles.guestBtn}
          />
        </View>
      </View>
    );
  }

  const updateForm = (patch: Partial<PostFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const updateRequirementForm = (patch: Partial<RequirementFormData>) => {
    setRequirementForm((prev) => ({ ...prev, ...patch }));
  };

  const openChoice = () => {
    setPostMode('choice');
    setFormError('');
    setRequirementError('');
    setRequirementFeedback('');
    setActiveSelector(null);
  };

  const openInventoryFlow = () => {
    setPostMode('inventory');
    setFormError('');
    setRequirementFeedback('');
  };

  const openRequirementFlow = () => {
    setPostMode('requirement');
    setRequirementError('');
    setRequirementFeedback('');
  };

  const selectPropertyType = (propertyType: PropertyType) => {
    setForm((prev) => ({
      ...prev,
      propertyType,
      ...(propertyType === 'Pair Plot'
        ? {
            size: prev.totalSize || '',
            sizeUnit: prev.totalSizeUnit || prev.sizeUnit,
            sizeEachUnit: prev.sizeEachUnit || 'Kanal',
            totalSizeUnit: prev.totalSizeUnit || prev.sizeUnit,
          }
        : {
            plotNumberOne: '',
            plotNumberTwo: '',
            streetNumber: '',
            sizeEach: '',
            sizeEachUnit: 'Kanal',
            totalSize: '',
            totalSizeUnit: 'Kanal',
          }),
    }));
  };

  const setPairTotalSize = (totalSize: string) => {
    updateForm({ totalSize, size: totalSize });
  };

  const setPairTotalSizeUnit = (totalSizeUnit: string) => {
    updateForm({ totalSizeUnit, sizeUnit: totalSizeUnit });
  };

  const toggleTag = (tag: SpecialTag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((item) => item !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAddImage = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files) {
          Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              if (readerEvent.target?.result) {
                setForm((prev) => ({
                  ...prev,
                  images: [...prev.images, readerEvent.target!.result as string],
                }));
              }
            };
            reader.readAsDataURL(file);
          });
        }
      };
      input.click();
    } else {
      const mockImages = ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'];
      const newImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      updateForm({ images: [...form.images, newImage] });
    }
  };

  const handleRemoveImage = (index: number) => {
    updateForm({ images: form.images.filter((_, itemIndex) => itemIndex !== index) });
  };

  const validateStep = (step = currentStep): string => {
    if (step === 0) {
      if (!form.propertyType) return 'Please select a property type.';
      if (!form.city) return 'Please select a city.';
      if (!form.society) return 'Please select a society.';
      if (!form.phase) return 'Please select a phase or sector.';
    }

    if (step === 1) {
      if (!form.price) return 'Please add price before continuing.';
      if (isPairPlot) {
        if (!form.plotNumberOne) return 'Please add plot 1 number.';
        if (!form.plotNumberTwo) return 'Please add plot 2 number.';
        if (!form.sizeEach) return 'Please add size each.';
        if (!form.totalSize) return 'Please add total size.';
      } else if (!form.size) {
        return 'Please add property size.';
      }
    }

    return '';
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setFormError(error);
      return;
    }

    setFormError('');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    const finalError = validateStep(0) || validateStep(1);
    if (finalError) {
      setFormError(finalError);
      return;
    }

    setIsPosting(true);
    addListing(form);
    setForm(initialForm);
    setCurrentStep(0);
    setPostMode('choice');

    setTimeout(() => {
      setIsPosting(false);
      (navigation as any).navigate('Feed');
    }, 250);
  };

  const handleBack = () => {
    setFormError('');
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const validateRequirement = () => {
    if (!requirementForm.propertyType) return 'Please select a property type.';
    if (!requirementForm.city) return 'Please select a city.';
    if (!requirementForm.description.trim()) return 'Please add requirement details.';
    return '';
  };

  const handleRequirementSubmit = () => {
    const error = validateRequirement();
    if (error) {
      setRequirementError(error);
      setRequirementFeedback('');
      return;
    }

    setRequirementError('');
    setRequirementFeedback('');
    setIsPosting(true);

    const area =
      requirementForm.society ||
      requirementForm.phase ||
      requirementForm.city ||
      'Open area';

    const newRequirement: Requirement = {
      id: `req_${Date.now()}`,
      agentId: profile.id,
      agentName: profile.name,
      agentAgency: profile.agency,
      propertyType: requirementForm.propertyType as PropertyType,
      city: requirementForm.city as City,
      area,
      society: requirementForm.society || undefined,
      phase: requirementForm.phase || undefined,
      size: requirementForm.size || undefined,
      sizeUnit: requirementForm.size ? requirementForm.sizeUnit : undefined,
      minPrice: requirementForm.minPrice || undefined,
      maxPrice: requirementForm.maxPrice || undefined,
      description: requirementForm.description.trim(),
      urgency: requirementForm.urgency,
      createdAt: new Date().toISOString(),
    };

    addRequirement(newRequirement);
    setRequirementForm(initialRequirementForm);
    setRequirementFeedback('Requirement posted. It will appear in the feed.');

    setTimeout(() => {
      setIsPosting(false);
      setPostMode('choice');
      (navigation as any).navigate('Feed');
    }, 300);
  };

  const selectOption = (value: string) => {
    if (!activeSelector) return;

    if (activeSelector === 'propertyType') {
      selectPropertyType(value as PropertyType);
    } else if (activeSelector === 'city') {
      updateForm({ city: value as City, society: '', phase: '', block: '' });
    } else if (activeSelector === 'society') {
      updateForm({ society: value, phase: '', block: '' });
    } else if (activeSelector === 'phase') {
      updateForm({ phase: value, block: '' });
    } else if (activeSelector === 'block') {
      updateForm({ block: value });
    } else if (activeSelector === 'sizeUnit') {
      updateForm({ sizeUnit: value });
    } else if (activeSelector === 'sizeEachUnit') {
      updateForm({ sizeEachUnit: value });
    } else if (activeSelector === 'totalSizeUnit') {
      setPairTotalSizeUnit(value);
    } else if (activeSelector === 'requirementPropertyType') {
      updateRequirementForm({ propertyType: value as PropertyType });
    } else if (activeSelector === 'requirementCity') {
      updateRequirementForm({ city: value as City, society: '', phase: '' });
    } else if (activeSelector === 'requirementSociety') {
      updateRequirementForm({ society: value, phase: '' });
    } else if (activeSelector === 'requirementPhase') {
      updateRequirementForm({ phase: value });
    } else if (activeSelector === 'requirementSizeUnit') {
      updateRequirementForm({ sizeUnit: value });
    } else {
      updateForm({ [activeSelector]: value });
    }

    setActiveSelector(null);
  };

  const selectorOptions = (() => {
    switch (activeSelector) {
      case 'propertyType':
        return SELECTOR_OPTIONS.propertyType;
      case 'city':
        return SELECTOR_OPTIONS.city;
      case 'society':
        return societies;
      case 'phase':
        return phases;
      case 'block':
        return blocks;
      case 'sizeUnit':
      case 'sizeEachUnit':
      case 'totalSizeUnit':
        return SELECTOR_OPTIONS.sizeUnit;
      case 'requirementPropertyType':
        return SELECTOR_OPTIONS.propertyType;
      case 'requirementCity':
        return SELECTOR_OPTIONS.city;
      case 'requirementSociety':
        return requirementSocieties;
      case 'requirementPhase':
        return requirementPhases;
      case 'requirementSizeUnit':
        return SELECTOR_OPTIONS.sizeUnit;
      case 'possessionStatus':
        return SELECTOR_OPTIONS.possessionStatus;
      case 'registryStatus':
        return SELECTOR_OPTIONS.registryStatus;
      case 'mapStatus':
        return SELECTOR_OPTIONS.mapStatus;
      case 'duesStatus':
        return SELECTOR_OPTIONS.duesStatus;
      case 'nocStatus':
        return SELECTOR_OPTIONS.nocStatus;
      default:
        return [];
    }
  })();

  const selectorValue = (() => {
    if (!activeSelector) return '';

    switch (activeSelector) {
      case 'requirementPropertyType':
        return requirementForm.propertyType;
      case 'requirementCity':
        return requirementForm.city;
      case 'requirementSociety':
        return requirementForm.society;
      case 'requirementPhase':
        return requirementForm.phase;
      case 'requirementSizeUnit':
        return requirementForm.sizeUnit;
      default:
        return String(form[activeSelector as keyof PostFormData] || '');
    }
  })();
  const selectorTitle = activeSelector ? SELECTOR_TITLES[activeSelector] : '';
  const selectorSearchable =
    activeSelector === 'society' ||
    activeSelector === 'phase' ||
    activeSelector === 'block' ||
    activeSelector === 'requirementSociety' ||
    activeSelector === 'requirementPhase';

  const renderChoice = () => (
    <View style={styles.choiceBody}>
      <View style={styles.choicePanel}>
        <Text style={styles.choiceTitle}>What do you want to post?</Text>
        <Pressable
          style={styles.choiceOption}
          onPress={openInventoryFlow}
          accessibilityRole="button"
          accessibilityLabel="Post Inventory. Add a property listing or available inventory"
        >
          <View style={styles.choiceIcon}>
            <Ionicons name="business-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.choiceCopy}>
            <Text style={styles.choiceOptionTitle}>Post Inventory</Text>
            <Text style={styles.choiceSubtitle}>Add a property listing / available inventory</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable
          style={styles.choiceOption}
          onPress={openRequirementFlow}
          accessibilityRole="button"
          accessibilityLabel="Create Requirement. Post a buyer need or demand"
        >
          <View style={styles.choiceIcon}>
            <Ionicons name="megaphone-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.choiceCopy}>
            <Text style={styles.choiceOptionTitle}>Create Requirement</Text>
            <Text style={styles.choiceSubtitle}>Post a buyer need / demand</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );

  const renderRequirementFlow = () => (
    <View style={styles.requirementShell}>
      <ScrollView
        style={styles.stepScroll}
        contentContainerStyle={styles.requirementContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Requirement Basics</Text>
        <SelectorButton
          label="Property Type"
          value={requirementForm.propertyType}
          placeholder="Select property type"
          accessibilityLabel="Requirement property type"
          onPress={() => setActiveSelector('requirementPropertyType')}
        />
        <SelectorButton
          label="City"
          value={requirementForm.city}
          placeholder="Select city"
          accessibilityLabel="Requirement city"
          onPress={() => setActiveSelector('requirementCity')}
        />
        <SelectorButton
          label="Society"
          value={requirementForm.society}
          placeholder={requirementForm.city ? 'Select society if needed' : 'Select city first'}
          accessibilityLabel="Requirement society"
          disabled={!requirementForm.city}
          onPress={() => setActiveSelector('requirementSociety')}
        />
        <SelectorButton
          label="Phase / Sector"
          value={requirementForm.phase}
          placeholder={requirementForm.society ? 'Select phase if needed' : 'Select society first'}
          accessibilityLabel="Requirement phase or sector"
          disabled={!requirementForm.society}
          onPress={() => setActiveSelector('requirementPhase')}
        />

        <Text style={styles.sectionTitle}>Need Details</Text>
        <UnitInput
          label="Size"
          value={requirementForm.size}
          unit={requirementForm.sizeUnit}
          placeholder="Optional"
          onChangeText={(size) => updateRequirementForm({ size })}
          onUnitPress={() => setActiveSelector('requirementSizeUnit')}
        />
        <View style={styles.twoColumn}>
          <InputField
            label="Min Budget"
            placeholder="Optional"
            keyboardType="numeric"
            value={requirementForm.minPrice}
            onChangeText={(minPrice) => updateRequirementForm({ minPrice })}
          />
          <InputField
            label="Max Budget"
            placeholder="Optional"
            keyboardType="numeric"
            value={requirementForm.maxPrice}
            onChangeText={(maxPrice) => updateRequirementForm({ maxPrice })}
          />
        </View>
        <Text style={styles.sectionTitle}>Urgency</Text>
        <View style={styles.chipRow}>
          {(['Normal', 'Urgent'] as RequirementUrgency[]).map((urgency) => (
            <TagChip
              key={urgency}
              label={urgency}
              selected={requirementForm.urgency === urgency}
              onPress={() => updateRequirementForm({ urgency })}
            />
          ))}
        </View>
        <InputField
          label="Requirement Details"
          placeholder="Example: Buyer needs 10 Marla plot in DHA Phase 2, possession preferred..."
          value={requirementForm.description}
          onChangeText={(description) => updateRequirementForm({ description })}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <View style={styles.previewCard}>
          <Text style={styles.cardTitle}>Preview</Text>
          <Text style={styles.previewLine}>
            {requirementForm.propertyType || 'Property'} in {requirementForm.city || 'City'}
          </Text>
          {requirementForm.society ? (
            <Text style={styles.previewLine}>
              {requirementForm.society}
              {requirementForm.phase ? ` - ${requirementForm.phase}` : ''}
            </Text>
          ) : null}
          {requirementForm.size ? (
            <Text style={styles.previewLine}>
              Size: {requirementForm.size} {requirementForm.sizeUnit}
            </Text>
          ) : null}
          {(requirementForm.minPrice || requirementForm.maxPrice) ? (
            <Text style={styles.previewLine}>
              Budget: {requirementForm.minPrice || 'Any'} - {requirementForm.maxPrice || 'Any'}
            </Text>
          ) : null}
          <TagChip label={requirementForm.urgency} small />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {requirementError ? <Text style={styles.error}>{requirementError}</Text> : null}
        {requirementFeedback ? <Text style={styles.success}>{requirementFeedback}</Text> : null}
        <View style={styles.footerActions}>
          <Button title="Back" variant="outline" onPress={openChoice} style={styles.backButton} />
          <Button
            title={isPosting ? 'Posting...' : 'Post Requirement'}
            onPress={handleRequirementSubmit}
            loading={isPosting}
            disabled={isPosting}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );

  const renderBasics = () => (
    <>
      <Text style={styles.sectionTitle}>What are you listing?</Text>
      <View style={styles.quickTypeRow}>
        {QUICK_PROPERTY_TYPES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            icon={item.icon}
            selected={form.propertyType === item.value}
            onPress={() => selectPropertyType(item.value)}
          />
        ))}
      </View>
      <SelectorButton
        label="Property Type"
        value={form.propertyType}
        placeholder="Select property type"
        onPress={() => setActiveSelector('propertyType')}
      />
      <View style={styles.locationCard}>
        <Text style={styles.cardTitle}>Location</Text>
        <SelectorButton
          label="City"
          value={form.city}
          placeholder="Select city"
          onPress={() => setActiveSelector('city')}
        />
        <SelectorButton
          label="Society"
          value={form.society}
          placeholder={form.city ? 'Select society' : 'Select city first'}
          disabled={!form.city}
          onPress={() => setActiveSelector('society')}
        />
        <SelectorButton
          label="Phase / Sector"
          value={form.phase}
          placeholder={form.society ? 'Select phase or sector' : 'Select society first'}
          disabled={!form.society}
          onPress={() => setActiveSelector('phase')}
        />
        <SelectorButton
          label="Block"
          value={form.block}
          placeholder={form.phase ? 'Select block if available' : 'Select phase first'}
          disabled={!form.phase || blocks.length === 0}
          onPress={() => setActiveSelector('block')}
        />
      </View>
    </>
  );

  const renderPriceAndArea = () => (
    <>
      <InputField
        label="Price (Rs)"
        placeholder="e.g. 18500000"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(price) => updateForm({ price })}
      />
      {isPairPlot ? (
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Pair Plot Area</Text>
          <Text style={styles.helperText}>Two adjacent or in-row plots sold together.</Text>
          <View style={styles.twoColumn}>
            <InputField
              label="Plot 1 Number"
              placeholder="23"
              value={form.plotNumberOne || ''}
              onChangeText={(plotNumberOne) => updateForm({ plotNumberOne })}
            />
            <InputField
              label="Plot 2 Number"
              placeholder="24"
              value={form.plotNumberTwo || ''}
              onChangeText={(plotNumberTwo) => updateForm({ plotNumberTwo })}
            />
          </View>
          <InputField
            label="Street Number"
            placeholder="e.g. 24"
            value={form.streetNumber || ''}
            onChangeText={(streetNumber) => updateForm({ streetNumber })}
          />
          <UnitInput
            label="Size Each"
            value={form.sizeEach || ''}
            unit={form.sizeEachUnit || 'Kanal'}
            placeholder="1"
            onChangeText={(sizeEach) => updateForm({ sizeEach })}
            onUnitPress={() => setActiveSelector('sizeEachUnit')}
          />
          <UnitInput
            label="Total Size"
            value={form.totalSize || ''}
            unit={form.totalSizeUnit || 'Kanal'}
            placeholder="2"
            onChangeText={setPairTotalSize}
            onUnitPress={() => setActiveSelector('totalSizeUnit')}
          />
        </View>
      ) : (
        <UnitInput
          label="Size"
          value={form.size}
          unit={form.sizeUnit}
          placeholder="10"
          onChangeText={(size) => updateForm({ size })}
          onUnitPress={() => setActiveSelector('sizeUnit')}
        />
      )}
    </>
  );

  const renderPropertySpecificFields = () => {
    if (isPlot) {
      return (
        <ExpandableSection title={isPairPlot ? 'Plot Condition' : 'Plot Details'} defaultOpen>
          <InputField
            label="Level"
            placeholder="Level / Raised / Lowered"
            value={form.level || ''}
            onChangeText={(level) => updateForm({ level })}
          />
          <InputField
            label="Facing"
            placeholder="North / South / East / West"
            value={form.facing || ''}
            onChangeText={(facing) => updateForm({ facing })}
          />
          <InputField
            label="Street Width (feet)"
            placeholder="40"
            keyboardType="numeric"
            value={form.streetWidth || ''}
            onChangeText={(streetWidth) => updateForm({ streetWidth })}
          />
        </ExpandableSection>
      );
    }

    if (isHouse) {
      return (
        <ExpandableSection title="House Details" defaultOpen>
          <InputField
            label="Construction"
            placeholder="Brand New / Used"
            value={form.construction || ''}
            onChangeText={(construction) => updateForm({ construction })}
          />
          <InputField
            label="Quality"
            placeholder="Grey / Partially / Fully finished"
            value={form.quality || ''}
            onChangeText={(quality) => updateForm({ quality })}
          />
          <InputField
            label="Furnished"
            placeholder="Furnished / Semi / Unfurnished"
            value={form.furnished || ''}
            onChangeText={(furnished) => updateForm({ furnished })}
          />
          <View style={styles.twoColumn}>
            <InputField
              label="Floors"
              placeholder="2"
              keyboardType="numeric"
              value={form.floors ? String(form.floors) : ''}
              onChangeText={(floors) => updateForm({ floors: parseInt(floors, 10) || undefined })}
            />
            <InputField
              label="Years Old"
              placeholder="5"
              keyboardType="numeric"
              value={form.yearsOld ? String(form.yearsOld) : ''}
              onChangeText={(yearsOld) => updateForm({ yearsOld: parseInt(yearsOld, 10) || undefined })}
            />
          </View>
        </ExpandableSection>
      );
    }

    if (isCommercial) {
      return (
        <ExpandableSection title="Commercial Details" defaultOpen>
          <InputField
            label="Approval"
            placeholder="CDA / RDA / DHA / Bahria / Unapproved"
            value={form.approval || ''}
            onChangeText={(approval) => updateForm({ approval })}
          />
          <InputField
            label="Commercial Activity"
            placeholder="Market / Main road / Office area"
            value={form.commercialActivity || ''}
            onChangeText={(commercialActivity) => updateForm({ commercialActivity })}
          />
          <InputField
            label="Rental Income"
            placeholder="Optional"
            keyboardType="numeric"
            value={form.rentalIncome || ''}
            onChangeText={(rentalIncome) => updateForm({ rentalIncome })}
          />
        </ExpandableSection>
      );
    }

    if (isApartment) {
      return (
        <ExpandableSection title="Apartment Details" defaultOpen>
          <View style={styles.twoColumn}>
            <InputField
              label="Floor Number"
              placeholder="3"
              keyboardType="numeric"
              value={form.floorNumber ? String(form.floorNumber) : ''}
              onChangeText={(floorNumber) => updateForm({ floorNumber: parseInt(floorNumber, 10) || undefined })}
            />
            <InputField
              label="Total Floors"
              placeholder="10"
              keyboardType="numeric"
              value={form.totalFloors ? String(form.totalFloors) : ''}
              onChangeText={(totalFloors) => updateForm({ totalFloors: parseInt(totalFloors, 10) || undefined })}
            />
          </View>
          <InputField
            label="Parking Spots"
            placeholder="1"
            keyboardType="numeric"
            value={form.parking ? String(form.parking) : ''}
            onChangeText={(parking) => updateForm({ parking: parseInt(parking, 10) || undefined })}
          />
          {form.propertyType === 'Penthouse' ? (
            <InputField
              label="Rooftop Area (sqft)"
              placeholder="500"
              keyboardType="numeric"
              value={form.rooftopArea || ''}
              onChangeText={(rooftopArea) => updateForm({ rooftopArea })}
            />
          ) : null}
        </ExpandableSection>
      );
    }

    return null;
  };

  const renderFeatures = () => (
    <>
      <Text style={styles.sectionTitle}>Quick Features</Text>
      <View style={styles.chipRow}>
        {FEATURE_TAGS.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            selected={form.tags.includes(tag)}
            onPress={() => toggleTag(tag)}
          />
        ))}
      </View>
      <Text style={styles.sectionTitle}>Status</Text>
      <SelectorButton
        label="Possession"
        value={form.possessionStatus}
        placeholder="Select possession"
        onPress={() => setActiveSelector('possessionStatus')}
      />
      <SelectorButton
        label="Registry"
        value={form.registryStatus}
        placeholder="Select registry status"
        onPress={() => setActiveSelector('registryStatus')}
      />
      <ExpandableSection title="More Status Options">
        <SelectorButton
          label="Map"
          value={form.mapStatus}
          placeholder="Select map status"
          onPress={() => setActiveSelector('mapStatus')}
        />
        <SelectorButton
          label="Dues"
          value={form.duesStatus}
          placeholder="Select dues status"
          onPress={() => setActiveSelector('duesStatus')}
        />
        <SelectorButton
          label="NOC"
          value={form.nocStatus}
          placeholder="Select NOC status"
          onPress={() => setActiveSelector('nocStatus')}
        />
      </ExpandableSection>
      {renderPropertySpecificFields()}
    </>
  );

  const renderPhotos = () => (
    <>
      <Text style={styles.sectionTitle}>Photos</Text>
      <View style={styles.imageUploadContainer}>
        {form.images.map((image, index) => (
          <View key={`${image}-${index}`} style={styles.imageItem}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <Pressable
              style={styles.removeImageBtn}
              onPress={() => handleRemoveImage(index)}
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
            </Pressable>
          </View>
        ))}
        <Pressable
          style={styles.addImageBtn}
          onPress={handleAddImage}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Add property photo"
        >
          <Ionicons name="add" size={32} color={colors.primary} />
          <Text style={styles.addImageText}>Add Photo</Text>
        </Pressable>
      </View>
      <InputField
        label="Description"
        placeholder="Add useful details for agents and buyers..."
        value={form.description}
        onChangeText={(description) => updateForm({ description })}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />
      <ExpandableSection title="Advanced Notes">
        <InputField
          label="Google Location"
          placeholder="Paste location link if available"
          value={form.googleLocation || ''}
          onChangeText={(googleLocation) => updateForm({ googleLocation })}
        />
        <InputField
          label="Vacating Timeline"
          placeholder="Immediate / 1 month / 3 months"
          value={form.vacatingTimeline || ''}
          onChangeText={(vacatingTimeline) => updateForm({ vacatingTimeline })}
        />
      </ExpandableSection>
    </>
  );

  const pairSummary = isPairPlot
    ? `Plots ${form.plotNumberOne || '?'} & ${form.plotNumberTwo || '?'}${
        form.streetNumber ? ` - Street ${form.streetNumber}` : ''
      }`
    : '';

  const renderPreview = () => (
    <>
      <View style={styles.reviewNotice}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryDark} />
        <Text style={styles.reviewNoticeText}>
          Review carefully before publishing. Realbook will run final listing checks before saving.
        </Text>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View>
            <Text style={styles.previewTitle}>{form.propertyType || 'Property'}</Text>
            <Text style={styles.previewSubtitle}>
              {form.city || 'City'} - {form.society || 'Society'}
            </Text>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => setCurrentStep(0)}
            accessibilityRole="button"
            accessibilityLabel="Edit basics"
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>
        <Text style={styles.previewPrice}>Rs {form.price || '-'}</Text>
        <Text style={styles.previewLine}>
          {form.size || '-'} {form.sizeUnit}
        </Text>
        {isPairPlot ? (
          <>
            <Text style={styles.previewLine}>{pairSummary}</Text>
            <Text style={styles.previewLine}>
              {form.sizeEach || '?'} {form.sizeEachUnit} each - {form.totalSize || '?'} {form.totalSizeUnit} total
            </Text>
          </>
        ) : null}
        <Text style={styles.previewLine}>
          {form.phase || 'Phase'}{form.block ? ` - ${form.block}` : ''}
        </Text>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.cardTitle}>Features</Text>
          <Pressable
            style={styles.editButton}
            onPress={() => setCurrentStep(2)}
            accessibilityRole="button"
            accessibilityLabel="Edit features"
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {form.tags.length > 0 ? (
            form.tags.map((tag) => <TagChip key={tag} label={tag} small />)
          ) : (
            <Text style={styles.emptyText}>No feature tags selected</Text>
          )}
        </View>
        {form.possessionStatus ? <Text style={styles.previewLine}>Possession: {form.possessionStatus}</Text> : null}
        {form.registryStatus ? <Text style={styles.previewLine}>Registry: {form.registryStatus}</Text> : null}
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.cardTitle}>Photos & Description</Text>
          <Pressable
            style={styles.editButton}
            onPress={() => setCurrentStep(3)}
            accessibilityRole="button"
            accessibilityLabel="Edit photos and description"
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>
        {form.images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {form.images.map((image, index) => (
              <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.previewImage} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No photos added</Text>
        )}
        {form.description ? <Text style={styles.descriptionPreview}>{form.description}</Text> : null}
      </View>
    </>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasics();
      case 1:
        return renderPriceAndArea();
      case 2:
        return renderFeatures();
      case 3:
        return renderPhotos();
      case 4:
        return renderPreview();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={
          postMode === 'inventory'
            ? 'Post Inventory'
            : postMode === 'requirement'
              ? 'Create Requirement'
              : 'Post'
        }
        subtitle={
          postMode === 'inventory'
            ? 'Guided property posting'
            : postMode === 'requirement'
              ? 'Post a buyer need'
              : 'Choose a posting type'
        }
        left={
          postMode === 'choice' ? null : (
            <Pressable onPress={openChoice} accessibilityRole="button" accessibilityLabel="Back to post choices">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          )
        }
      />
      {postMode === 'choice' ? renderChoice() : null}
      {postMode === 'inventory' ? (
        <>
          <PostProgress steps={STEPS} currentStep={currentStep} />
          <PostStepLayout
            error={formError}
            isFirst={currentStep === 0}
            isLast={currentStep === STEPS.length - 1}
            posting={isPosting}
            onBack={handleBack}
            onNext={handleNext}
          >
            {renderStep()}
          </PostStepLayout>
        </>
      ) : null}
      {postMode === 'requirement' ? renderRequirementFlow() : null}
      <BottomSheetSelector
        visible={Boolean(activeSelector)}
        title={selectorTitle}
        options={selectorOptions}
        selected={selectorValue}
        searchable={selectorSearchable}
        onSelect={selectOption}
        onClose={() => setActiveSelector(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  choiceBody: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  choicePanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  choiceTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  choiceOption: {
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCopy: {
    flex: 1,
  },
  choiceOptionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  choiceSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  requirementShell: {
    flex: 1,
  },
  stepScroll: {
    flex: 1,
  },
  requirementContent: {
    padding: 16,
    paddingBottom: 28,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  locationCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  imageUploadContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  imageItem: {
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 84,
    height: 84,
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
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addImageText: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  previewCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 12,
  },
  reviewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.tagBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  reviewNoticeText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  previewSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  previewPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  previewLine: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 19,
  },
  editButton: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.inputBg,
  },
  footer: {
    padding: 16,
    paddingBottom: 22,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flex: 0.45,
  },
  nextButton: {
    flex: 1,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionPreview: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
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
