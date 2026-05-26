import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

type SignupStep = 'documents' | 'details' | 'password' | 'pending';

export function SignUpScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [step, setStep] = useState<SignupStep>('documents');
  
  // Step 1: Documents
  const [visitingCardFront, setVisitingCardFront] = useState('');
  const [visitingCardBack, setVisitingCardBack] = useState('');
  const [cnicFront, setCnicFront] = useState('');
  const [cnicBack, setCnicBack] = useState('');
  
  // Step 2: Details
  const [name, setName] = useState('');
  const [agency, setAgency] = useState('');
  const [city, setCity] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  
  // Step 3: Password
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const expertiseOptions = [
    'Residential Plots',
    'Commercial Plots',
    'Houses',
    'Apartments/Flats',
    'Shops',
    'Offices',
    'Farm Houses',
    'Files',
    'Industrial Plots',
  ];

  const toggleExpertise = (area: string) => {
    setExpertiseAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  const handleNext = async () => {
    setFormError('');

    if (step === 'documents') {
      if (!visitingCardFront || !visitingCardBack || !cnicFront || !cnicBack) {
        setFormError('Please upload all required documents.');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      if (!name.trim() || !agency.trim() || !city.trim() || !officeAddress.trim()) {
        setFormError('Please fill name, agency, city, and office address.');
        return;
      }
      if (expertiseAreas.length === 0) {
        setFormError('Please select at least one expertise area.');
        return;
      }
      setStep('password');
    } else if (step === 'password') {
      if (!mobile.trim()) {
        setFormError('Please enter your mobile number.');
        return;
      }
      if (mobile.replace(/\D/g, '').length < 10) {
        setFormError('Please enter a valid mobile number.');
        return;
      }
      if (!password) {
        setFormError('Please enter a password.');
        return;
      }
      if (password.length < 4) {
        setFormError('Password must be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      const ok = await register({
        name,
        mobile,
        passcode: password,
        agency,
        city,
        expertiseAreas,
      });
      setSubmitting(false);
      if (!ok) {
        setFormError('Could not create account. Please check your details.');
        return;
      }
      setStep('pending');
    }
  };

  const handleBack = () => {
    setFormError('');
    if (step === 'details') setStep('documents');
    else if (step === 'password') setStep('details');
    else if (step === 'pending') setStep('password');
  };

  const handleUpload = (type: 'visitingCardFront' | 'visitingCardBack' | 'cnicFront' | 'cnicBack') => {
    if (type === 'visitingCardFront') setVisitingCardFront('uploaded');
    else if (type === 'visitingCardBack') setVisitingCardBack('uploaded');
    else if (type === 'cnicFront') setCnicFront('uploaded');
    else if (type === 'cnicBack') setCnicBack('uploaded');
  };

  const goToLogin = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.stepIndicator}>
          Step {step === 'documents' ? 1 : step === 'details' ? 2 : step === 'password' ? 3 : 4} of 4
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {step === 'documents' && (
          <>
            <Text style={styles.sectionTitle}>Upload Documents</Text>
            <Text style={styles.sectionSubtitle}>
              Visiting Card (Public) + CNIC (Admin Only)
            </Text>

            <Text style={styles.label}>Visiting Card Front</Text>
            <Pressable
              style={styles.uploadBtn}
              onPress={() => handleUpload('visitingCardFront')}
            >
              <Ionicons
                name={visitingCardFront ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={32}
                color={visitingCardFront ? colors.primary : colors.textMuted}
              />
              <Text style={styles.uploadBtnText}>
                {visitingCardFront ? 'Uploaded' : 'Upload'}
              </Text>
            </Pressable>

            <Text style={styles.label}>Visiting Card Back</Text>
            <Pressable
              style={styles.uploadBtn}
              onPress={() => handleUpload('visitingCardBack')}
            >
              <Ionicons
                name={visitingCardBack ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={32}
                color={visitingCardBack ? colors.primary : colors.textMuted}
              />
              <Text style={styles.uploadBtnText}>
                {visitingCardBack ? 'Uploaded' : 'Upload'}
              </Text>
            </Pressable>

            <Text style={styles.label}>CNIC Front (Admin Only)</Text>
            <Pressable
              style={styles.uploadBtn}
              onPress={() => handleUpload('cnicFront')}
            >
              <Ionicons
                name={cnicFront ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={32}
                color={cnicFront ? colors.primary : colors.textMuted}
              />
              <Text style={styles.uploadBtnText}>
                {cnicFront ? 'Uploaded' : 'Upload'}
              </Text>
            </Pressable>

            <Text style={styles.label}>CNIC Back (Admin Only)</Text>
            <Pressable
              style={styles.uploadBtn}
              onPress={() => handleUpload('cnicBack')}
            >
              <Ionicons
                name={cnicBack ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={32}
                color={cnicBack ? colors.primary : colors.textMuted}
              />
              <Text style={styles.uploadBtnText}>
                {cnicBack ? 'Uploaded' : 'Upload'}
              </Text>
            </Pressable>
          </>
        )}

        {step === 'details' && (
          <>
            <Text style={styles.sectionTitle}>Your Details</Text>

            <InputField
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />

            <InputField
              label="Agency Name"
              placeholder="Enter your agency name"
              value={agency}
              onChangeText={setAgency}
            />

            <InputField
              label="City"
              placeholder="e.g. Rawalpindi"
              value={city}
              onChangeText={setCity}
            />

            <InputField
              label="Office Address"
              placeholder="Enter your office address"
              value={officeAddress}
              onChangeText={setOfficeAddress}
            />

            <Text style={styles.label}>Expertise Areas (Select at least one)</Text>
            <View style={styles.expertiseContainer}>
              {expertiseOptions.map((area) => (
                <Pressable
                  key={area}
                  style={[
                    styles.expertiseChip,
                    expertiseAreas.includes(area) && styles.expertiseChipActive,
                  ]}
                  onPress={() => toggleExpertise(area)}
                >
                  <Text
                    style={[
                      styles.expertiseChipText,
                      expertiseAreas.includes(area) && styles.expertiseChipTextActive,
                    ]}
                  >
                    {area}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 'password' && (
          <>
            <Text style={styles.sectionTitle}>Set Password</Text>

            <InputField
              label="Mobile Number"
              placeholder="e.g. 03001234567"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
            />

            <InputField
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </>
        )}

        {step === 'pending' && (
          <View style={styles.pendingContainer}>
            <Ionicons name="time-outline" size={64} color={colors.primary} />
            <Text style={styles.pendingTitle}>Pending Approval</Text>
            <Text style={styles.pendingText}>
              Your account has been submitted for admin review.
            </Text>
            <Text style={styles.pendingText}>
              Admin will approve within 24 hours.
            </Text>
            <Text style={styles.pendingNote}>
              Your demo account is saved as pending. You can return to login and sign in with this mobile and password.
            </Text>
            <Button title="Back to Login" onPress={goToLogin} style={styles.pendingButton} />
          </View>
        )}

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
      </ScrollView>

      {step !== 'pending' && (
        <View style={styles.footer}>
          {step !== 'documents' && (
            <Button
              title="Back"
              variant="outline"
              onPress={handleBack}
              style={styles.backBtn}
            />
          )}
          <Button
            title={step === 'password' ? 'Submit' : 'Next'}
            onPress={handleNext}
            loading={submitting}
            style={styles.nextBtn}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.headerBg,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerBackBtn: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  stepIndicator: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadBtnText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  expertiseChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  expertiseChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  expertiseChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  expertiseChipTextActive: {
    color: '#fff',
  },
  pendingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  pendingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  pendingNote: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  pendingButton: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 10,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});
