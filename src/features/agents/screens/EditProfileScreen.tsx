import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { profile, updateProfile } = useApp();
  const [name, setName] = useState(profile.name);
  const [agency, setAgency] = useState(profile.agency);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio);

  const handleSave = () => {
    updateProfile({ name, agency, city, bio });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title="Edit Profile"
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <InputField
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
        <InputField
          label="Agency"
          value={agency}
          onChangeText={setAgency}
          placeholder="Agency name"
        />
        <InputField
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Lahore, Karachi, Islamabad..."
        />
        <InputField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell agents about your expertise"
          multiline
          numberOfLines={4}
          style={styles.bio}
        />
        <View style={styles.actions}>
          <Button title="Save Changes" onPress={handleSave} />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancel}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: 16,
    paddingBottom: 32,
  },
  bio: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
  cancel: {
    marginTop: 4,
  },
});
