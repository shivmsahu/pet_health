import React, { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CareReminder,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  JournalMoment,
  MOODS,
  Mood,
  Pet,
  RECURRENCES,
  SPECIES,
  Species,
  dateKey,
  formatRecurrence,
  fromDisplayWeight,
} from '../domain';
import { radius, space, type } from '../theme';
import { Chip, ChipRow, Field, Label, PawButton, Sheet, Text } from '../ui';
import { HealthForm } from './Health';

const TIME_PRESETS = ['06:30', '08:00', '09:30', '12:00', '15:00', '17:30', '19:00', '21:00'];

export function ReminderSheet({ visible, editing, onClose }: { visible: boolean; editing?: CareReminder; onClose: () => void }) {
  const { saveReminder, palette: p } = useApp();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState<CareReminder['category']>('Food');
  const [recurrence, setRecurrence] = useState<CareReminder['recurrence']>('daily');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(editing?.title ?? '');
    setTime(editing?.time ?? '08:00');
    setCategory(editing?.category ?? 'Food');
    setRecurrence(editing?.recurrence ?? 'daily');
    setDuration(editing?.durationMinutes ? String(editing.durationMinutes) : '');
    setNotes(editing?.notes ?? '');
  }, [editing, visible]);

  const save = () => {
    if (!title.trim()) return;
    void saveReminder(
      {
        title: title.trim(),
        time,
        category,
        recurrence,
        durationMinutes: duration ? Number(duration) : undefined,
        notes: notes.trim() || undefined,
        startDate: editing?.startDate ?? dateKey(),
        paused: false,
      },
      editing?.id,
    );
    onClose();
  };

  return (
    <Sheet visible={visible} title={editing ? 'Edit care task' : 'Add a care task'} onClose={onClose}>
      <Label>WHAT NEEDS DOING?</Label>
      <Field value={title} onChange={setTitle} placeholder="Evening walk" autoFocus />
      <Label>CATEGORY</Label>
      <ChipRow>
        {CATEGORIES.map(item => (
          <Chip key={item} label={item} emoji={CATEGORY_EMOJI[item]} selected={category === item} onPress={() => setCategory(item)} />
        ))}
      </ChipRow>
      <Label>TIME</Label>
      <Field value={time} onChange={setTime} placeholder="08:00" />
      <View style={{ marginTop: 8 }}>
        <ChipRow>
          {TIME_PRESETS.map(preset => (
            <Chip key={preset} label={preset} selected={time === preset} onPress={() => setTime(preset)} />
          ))}
        </ChipRow>
      </View>
      <Label>REPEATS</Label>
      <ChipRow>
        {RECURRENCES.map(item => (
          <Chip key={item} label={formatRecurrence(item)} selected={recurrence === item} onPress={() => setRecurrence(item)} />
        ))}
      </ChipRow>
      <Label>DURATION IN MINUTES (OPTIONAL)</Label>
      <Field value={duration} onChange={setDuration} placeholder="30" keyboardType="numeric" />
      <Label>NOTES (OPTIONAL)</Label>
      <Field value={notes} onChange={setNotes} placeholder="Half a scoop, no chicken" multiline />
      <PawButton label={editing ? 'Save changes' : 'Add to routine'} onPress={save} disabled={!title.trim()} style={{ marginTop: space.lg }} />
    </Sheet>
  );
}

export function MomentSheet({ visible, editing, onClose }: { visible: boolean; editing?: JournalMoment; onClose: () => void }) {
  const { saveMoment, palette: p, today } = useApp();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<Mood | undefined>();
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) return;
    setTitle(editing?.title ?? '');
    setNote(editing?.note ?? '');
    setMood(editing?.mood);
    setPhotoUri(editing?.photoUri);
  }, [editing, visible]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const save = () => {
    if (!title.trim()) return;
    saveMoment({ title: title.trim(), note: note.trim(), mood, photoUri, date: editing?.date ?? today }, editing?.id);
    onClose();
  };

  return (
    <Sheet visible={visible} title={editing ? 'Edit moment' : 'Save a little moment'} onClose={onClose}>
      <Pressable
        onPress={pickPhoto}
        style={{
          height: 160,
          borderRadius: radius.lg,
          backgroundColor: p.surfaceSoft,
          borderWidth: 1.5,
          borderStyle: photoUri ? 'solid' : 'dashed',
          borderColor: photoUri ? p.hairline : p.mute,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginTop: 12,
        }}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={28} color={p.mute} />
            <Text style={[type('captionXs', p.body), { marginTop: 6 }]}>Add a photo</Text>
          </>
        )}
      </Pressable>
      <Label>TITLE</Label>
      <Field value={title} onChange={setTitle} placeholder="Best beach day!" autoFocus />
      <Label>HOW WERE THEY?</Label>
      <ChipRow>
        {MOODS.map(item => (
          <Chip key={item.mood} label={item.label} emoji={item.emoji} selected={mood === item.mood} onPress={() => setMood(mood === item.mood ? undefined : item.mood)} />
        ))}
      </ChipRow>
      <Label>NOTE</Label>
      <Field value={note} onChange={setNote} placeholder="Finally chased the waves." multiline />
      <PawButton label="Save moment" onPress={save} disabled={!title.trim()} style={{ marginTop: space.lg }} />
    </Sheet>
  );
}

export function PetSheet({ visible, editing, onClose }: { visible: boolean; editing?: Pet; onClose: () => void }) {
  const { savePet, palette: p } = useApp();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) return;
    setName(editing?.name ?? '');
    setSpecies(editing?.species ?? 'Dog');
    setBreed(editing?.breed ?? '');
    setBirthday(editing?.birthday ?? '');
    setVetName(editing?.vetName ?? '');
    setVetPhone(editing?.vetPhone ?? '');
    setMicrochipId(editing?.microchipId ?? '');
    setNotes(editing?.notes ?? '');
    setPhotoUri(editing?.photoUri);
  }, [editing, visible]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const save = () => {
    if (!name.trim()) return;
    const preset = SPECIES.find(item => item.species === species);
    savePet(
      {
        name: name.trim(),
        species,
        breed: breed.trim(),
        birthday: birthday.trim() || undefined,
        vetName: vetName.trim() || undefined,
        vetPhone: vetPhone.trim() || undefined,
        microchipId: microchipId.trim() || undefined,
        notes: notes.trim() || undefined,
        photoUri,
        emoji: preset?.emoji,
        color: preset?.color,
      },
      editing?.id,
    );
    onClose();
  };

  return (
    <Sheet visible={visible} title={editing ? `Edit ${editing.name}` : 'Add a pet'} onClose={onClose}>
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <Pressable
          onPress={pickPhoto}
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            backgroundColor: p.surfaceSoft,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: p.hairline,
          }}
        >
          {photoUri ? <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} /> : <Ionicons name="camera-outline" size={26} color={p.mute} />}
        </Pressable>
      </View>
      <Label>NAME</Label>
      <Field value={name} onChange={setName} placeholder="Mochi" autoFocus={!editing} />
      <Label>SPECIES</Label>
      <ChipRow>
        {SPECIES.map(item => (
          <Chip key={item.species} label={item.species} emoji={item.emoji} selected={species === item.species} onPress={() => setSpecies(item.species)} />
        ))}
      </ChipRow>
      <Label>BREED OR TYPE</Label>
      <Field value={breed} onChange={setBreed} placeholder="Shiba Inu" />
      <Label>BIRTHDAY (YYYY-MM-DD)</Label>
      <Field value={birthday} onChange={setBirthday} placeholder="2023-04-18" />
      <Label>VET NAME</Label>
      <Field value={vetName} onChange={setVetName} placeholder="Riverside Vets" />
      <Label>VET PHONE</Label>
      <Field value={vetPhone} onChange={setVetPhone} placeholder="+1 555 0134" keyboardType="phone-pad" />
      <Label>MICROCHIP ID</Label>
      <Field value={microchipId} onChange={setMicrochipId} placeholder="985141000000000" />
      <Label>ANYTHING A SITTER SHOULD KNOW</Label>
      <Field value={notes} onChange={setNotes} placeholder="Scared of the hoover. Loves the blue ball." multiline />
      <PawButton label={editing ? 'Save changes' : 'Add pet'} onPress={save} disabled={!name.trim()} style={{ marginTop: space.lg }} />
    </Sheet>
  );
}

export function HealthSheet({ visible, form, onClose }: { visible: boolean; form: HealthForm; onClose: () => void }) {
  const app = useApp();
  const { palette: p, state, today } = app;
  const unit = state.settings.weightUnit;
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [date, setDate] = useState(today);
  const [severity, setSeverity] = useState<1 | 2 | 3>(1);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Food');

  useEffect(() => {
    if (!visible) return;
    setA('');
    setB('');
    setC('');
    setDate(today);
    setSeverity(1);
    setExpenseCategory('Food');
  }, [form, today, visible]);

  const titles: Record<HealthForm, string> = {
    weight: 'Log a weigh-in',
    vaccination: 'Add a vaccination',
    visit: 'Add a vet visit',
    symptom: 'Log a symptom',
    expense: 'Add an expense',
  };

  const save = () => {
    if (form === 'weight') {
      const value = Number(a);
      if (!value) return;
      app.addWeight({ date, kg: fromDisplayWeight(value, unit), note: b.trim() || undefined });
    } else if (form === 'vaccination') {
      if (!a.trim()) return;
      app.addVaccination({ name: a.trim(), givenDate: date, dueDate: b.trim() || undefined, notes: c.trim() || undefined });
    } else if (form === 'visit') {
      if (!a.trim()) return;
      app.addVisit({ date, reason: a.trim(), diagnosis: b.trim() || undefined, cost: c ? Number(c) : undefined });
    } else if (form === 'symptom') {
      if (!a.trim()) return;
      app.addSymptom({ date, symptom: a.trim(), severity, notes: b.trim() || undefined });
    } else {
      const amount = Number(a);
      if (!amount) return;
      app.addExpense({ date, amount, category: expenseCategory, note: b.trim() || undefined });
    }
    app.notify({ emoji: '\u{1F4BE}', title: 'Saved', body: 'Added to the health vault.' });
    onClose();
  };

  return (
    <Sheet visible={visible} title={titles[form]} onClose={onClose}>
      {form === 'weight' && (
        <>
          <Label>WEIGHT IN {unit.toUpperCase()}</Label>
          <Field value={a} onChange={setA} placeholder={unit === 'kg' ? '8.4' : '18.5'} keyboardType="decimal-pad" autoFocus />
          <Label>DATE</Label>
          <Field value={date} onChange={setDate} placeholder={today} />
          <Label>NOTE (OPTIONAL)</Label>
          <Field value={b} onChange={setB} placeholder="Weighed at the vet" />
        </>
      )}

      {form === 'vaccination' && (
        <>
          <Label>VACCINE NAME</Label>
          <Field value={a} onChange={setA} placeholder="Rabies booster" autoFocus />
          <Label>GIVEN ON</Label>
          <Field value={date} onChange={setDate} placeholder={today} />
          <Label>NEXT DUE (OPTIONAL)</Label>
          <Field value={b} onChange={setB} placeholder="2027-08-24" />
          <Label>NOTES (OPTIONAL)</Label>
          <Field value={c} onChange={setC} placeholder="Left shoulder, no reaction" multiline />
        </>
      )}

      {form === 'visit' && (
        <>
          <Label>REASON FOR VISIT</Label>
          <Field value={a} onChange={setA} placeholder="Annual check-up" autoFocus />
          <Label>DATE</Label>
          <Field value={date} onChange={setDate} placeholder={today} />
          <Label>DIAGNOSIS OR OUTCOME</Label>
          <Field value={b} onChange={setB} placeholder="All clear, teeth need watching" multiline />
          <Label>COST (OPTIONAL)</Label>
          <Field value={c} onChange={setC} placeholder="85" keyboardType="decimal-pad" />
        </>
      )}

      {form === 'symptom' && (
        <>
          <Label>WHAT DID YOU NOTICE?</Label>
          <Field value={a} onChange={setA} placeholder="Limping on back left leg" autoFocus />
          <Label>DATE</Label>
          <Field value={date} onChange={setDate} placeholder={today} />
          <Label>HOW BAD?</Label>
          <ChipRow>
            {([1, 2, 3] as const).map(level => (
              <Chip
                key={level}
                label={['Mild', 'Moderate', 'Serious'][level - 1]}
                emoji={['\u{1F7E1}', '\u{1F7E0}', '\u{1F534}'][level - 1]}
                selected={severity === level}
                onPress={() => setSeverity(level)}
              />
            ))}
          </ChipRow>
          <Label>NOTES (OPTIONAL)</Label>
          <Field value={b} onChange={setB} placeholder="Started after the park" multiline />
        </>
      )}

      {form === 'expense' && (
        <>
          <Label>AMOUNT</Label>
          <Field value={a} onChange={setA} placeholder="42.50" keyboardType="decimal-pad" autoFocus />
          <Label>CATEGORY</Label>
          <ChipRow>
            {EXPENSE_CATEGORIES.map(item => (
              <Chip key={item} label={item} selected={expenseCategory === item} onPress={() => setExpenseCategory(item)} />
            ))}
          </ChipRow>
          <Label>DATE</Label>
          <Field value={date} onChange={setDate} placeholder={today} />
          <Label>NOTE (OPTIONAL)</Label>
          <Field value={b} onChange={setB} placeholder="Monthly kibble" />
        </>
      )}

      <PawButton label="Save" onPress={save} style={{ marginTop: space.lg }} />
    </Sheet>
  );
}
