/**
 * First run.
 *
 * Four short steps: a welcome, the pet's details, a suggested routine they can
 * tune, then a hand-off. No demo data is ever written — everything the owner
 * sees after this is something they chose.
 */

import React, { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { CATEGORY_EMOJI, SPECIES, Species, dateKey, formatRecurrence, formatTime } from '../domain';
import { StarterTask, starterPack } from '../suggestions';
import { radius, space, type } from '../theme';
import { Card, Field, Label, PawButton, ProgressBar, Subtitle, Text, Title } from '../ui';

export function Onboarding() {
  const { palette: p, savePet, addStarterTasks, finishOnboarding, notify } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const pack = useMemo(() => starterPack(species), [species]);
  // `null` means untouched, so the recommended set stays live as the species changes.
  const [picked, setPicked] = useState<string[] | null>(null);
  const selected = picked ?? pack.filter(task => task.recommended).map(task => task.id);

  const togglePick = (task: StarterTask) => {
    setPicked(selected.includes(task.id) ? selected.filter(id => id !== task.id) : [...selected, task.id]);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const createPet = () => {
    savePet({ name: name.trim(), species, breed: breed.trim(), birthday: birthday.trim() || undefined, photoUri });
    setStep(3);
  };

  const finish = async () => {
    const chosen = pack.filter(task => selected.includes(task.id));
    if (chosen.length) {
      addStarterTasks(
        chosen.map(task => ({
          title: task.title,
          category: task.category,
          time: task.time,
          recurrence: task.recurrence,
          durationMinutes: task.durationMinutes,
          startDate: dateKey(),
        })),
      );
    }
    if (Platform.OS !== 'web') {
      await Notifications.requestPermissionsAsync().catch(() => undefined);
    }
    finishOnboarding();
    notify({ emoji: '\u{1F389}', title: `${name.trim() || 'Your pet'} is all set!`, body: 'Tap a task to tick it off and earn your first XP.' });
  };

  const speciesPreset = SPECIES.find(item => item.species === species) ?? SPECIES[0];

  return (
    <View style={{ flex: 1, backgroundColor: p.canvas }}>
      <View style={{ paddingHorizontal: space.lg, paddingTop: 14 }}>
        <ProgressBar percent={(step + 1) / 4} />
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 24 }}>
            <Text style={{ fontSize: 74 }}>{'\u{1F43E}'}</Text>
            <Title style={{ marginTop: 12, textAlign: 'center', fontSize: 30 }}>Welcome to Pawday</Title>
            <Subtitle style={{ textAlign: 'center', marginTop: 10, fontSize: 15 }}>
              A gentle daily rhythm for the little one who depends on you — and a scrapbook of everything worth remembering.
            </Subtitle>
            <View style={{ gap: 12, marginTop: 26, width: '100%' }}>
              {[
                { emoji: '\u{23F0}', title: 'Never miss a meal or a med', body: 'Reminders that fit your real day.' },
                { emoji: '\u{1F3AF}', title: 'Earn XP, levels and streaks', body: 'Daily quests make the routine genuinely fun.' },
                { emoji: '\u{1FA7A}', title: 'One home for their health', body: 'Weight, jabs, vet visits and symptoms.' },
                { emoji: '\u{1F512}', title: 'Private by default', body: 'Everything stays on your device.' },
              ].map(item => (
                <Card key={item.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: p.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={type('captionMd', p.ink)}>{item.title}</Text>
                    <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>{item.body}</Text>
                  </View>
                </Card>
              ))}
            </View>
            <PawButton label="Let's meet your pet" icon="arrow-forward" onPress={() => setStep(1)} style={{ marginTop: 26, width: '100%' }} />
          </View>
        )}

        {step === 1 && (
          <View>
            <Title>Who are we caring for?</Title>
            <Subtitle style={{ marginTop: 6 }}>Pick the kind of companion and we will suggest a routine that suits them.</Subtitle>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              {SPECIES.map(item => {
                const active = item.species === species;
                return (
                  <Pressable
                    key={item.species}
                    onPress={() => {
                      setSpecies(item.species);
                      setPicked(null);
                    }}
                    style={{
                      width: '30%',
                      minWidth: 96,
                      flexGrow: 1,
                      alignItems: 'center',
                      paddingVertical: 16,
                      borderRadius: radius.lg,
                      backgroundColor: active ? p.surfaceCard : p.surfaceDoc,
                      borderWidth: 2,
                      borderColor: active ? p.primary : p.hairline,
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
                    <Text style={[type('buttonMd', p.ink), { marginTop: 6 }]}>{item.species}</Text>
                  </Pressable>
                );
              })}
            </View>
            <PawButton label="Next" icon="arrow-forward" onPress={() => setStep(2)} style={{ marginTop: 26 }} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Title>Tell us about them</Title>
            <Subtitle style={{ marginTop: 6 }}>Only the name is required — the rest can wait.</Subtitle>
            <View style={{ alignItems: 'center', marginTop: 18 }}>
              <Pressable
                onPress={pickPhoto}
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: 54,
                  backgroundColor: p.surfaceSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: p.hairline,
                  overflow: 'hidden',
                }}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <>
                    <Text style={{ fontSize: 40 }}>{speciesPreset.emoji}</Text>
                    <Text style={[type('utilityXs', p.body), { marginTop: 2 }]}>ADD PHOTO</Text>
                  </>
                )}
              </Pressable>
            </View>
            <Label>NAME</Label>
            <Field value={name} onChange={setName} placeholder="Mochi" autoFocus />
            <Label>BREED OR TYPE</Label>
            <Field value={breed} onChange={setBreed} placeholder="Shiba Inu" />
            <Label>BIRTHDAY (YYYY-MM-DD)</Label>
            <Field value={birthday} onChange={setBirthday} placeholder="2023-04-18" />
            <PawButton label="Continue" icon="arrow-forward" onPress={createPet} disabled={!name.trim()} style={{ marginTop: 24 }} />
            <Pressable onPress={() => setStep(1)} style={{ alignItems: 'center', marginTop: 14 }}>
              <Text style={type('buttonMd', p.body)}>Back</Text>
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View>
            <Title>A routine to start from</Title>
            <Subtitle style={{ marginTop: 6 }}>
              These are the tasks most {species.toLowerCase()} owners need. Untick anything that is not you — you can change all of it later.
            </Subtitle>
            <View style={{ gap: 10, marginTop: 18 }}>
              {pack.map(task => {
                const active = selected.includes(task.id);
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => togglePick(task)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: radius.lg,
                      backgroundColor: active ? p.surfaceSoft : p.surfaceCard,
                      borderWidth: 1.5,
                      borderColor: active ? p.primary : p.hairline,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{CATEGORY_EMOJI[task.category]}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={type('captionMd', p.ink)}>{task.title}</Text>
                      <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
                        {formatTime(task.time)} · {formatRecurrence(task.recurrence).toLowerCase()}
                      </Text>
                    </View>
                    <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={active ? p.primary : p.mute} />
                  </Pressable>
                );
              })}
            </View>
            <Card style={{ marginTop: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }} tint={p.surfaceSoft}>
              <Text style={{ fontSize: 20 }}>{'\u{1F4A1}'}</Text>
              <Text style={[type('captionSm', p.body), { flex: 1 }]}>
                {selected.length} task{selected.length === 1 ? '' : 's'} selected. Free Pawday keeps six per pet, which covers most daily routines.
              </Text>
            </Card>
            <PawButton label={`Start caring for ${name.trim() || 'them'}`} icon="sparkles" onPress={finish} style={{ marginTop: 22 }} />
            <Pressable onPress={finish} style={{ alignItems: 'center', marginTop: 14 }}>
              <Text style={type('buttonMd', p.body)}>Skip — I'll build it myself</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
