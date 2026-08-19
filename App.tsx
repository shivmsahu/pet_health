import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORIES,
  CareReminder,
  calculatePoints,
  calculateStreak,
  dateKey,
  formatDate,
  formatRecurrence,
  isCompleted,
  JournalMoment,
  newMoment,
  newPet,
  newReminder,
  PawdayState,
  progressForDate,
  RECURRENCES,
  remindersForDate,
  shiftDate,
  toggleCompletion,
} from './src/domain';
import { loadState, saveState } from './src/storage';

type Tab = 'Home' | 'Schedule' | 'Journal' | 'Awards';

const ink = '#30342F';
const cream = '#FFF9F1';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export default function App() {
  const [state, setState] = useState<PawdayState | null>(null);
  const [tab, setTab] = useState<Tab>('Home');
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [petManagerVisible, setPetManagerVisible] = useState(false);
  const [petFormVisible, setPetFormVisible] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [reminderFormVisible, setReminderFormVisible] = useState(false);
  const [momentFormVisible, setMomentFormVisible] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [petDraft, setPetDraft] = useState({ name: '', kind: 'Dog', emoji: '🐕' });
  const [reminderDraft, setReminderDraft] = useState({ title: '', time: '08:00', category: 'Food' as CareReminder['category'], recurrence: 'daily' as CareReminder['recurrence'] });
  const [momentDraft, setMomentDraft] = useState({ title: '', note: '', photoUri: undefined as string | undefined });

  useEffect(() => { loadState().then(setState); }, []);

  useEffect(() => {
    if (state) void saveState(state);
  }, [state]);

  const pet = state?.pets.find(item => item.id === state.selectedPetId) ?? state?.pets[0];
  const today = dateKey();
  const dates = useMemo(() => Array.from({ length: 5 }, (_, index) => shiftDate(today, index - 1)), [today]);

  const updateState = (updater: (current: PawdayState) => PawdayState) => setState(current => current ? updater(current) : current);

  const toggleTask = (reminderId: string, key: string) => updateState(current => ({
    ...current,
    reminders: current.reminders.map(reminder => reminder.id === reminderId ? toggleCompletion(reminder, key) : reminder),
  }));

  const manageReminder = (reminder: CareReminder) => Alert.alert(reminder.title, 'What would you like to do?', [
    { text: 'Cancel', style: 'cancel' },
    { text: reminder.paused ? 'Resume' : 'Pause', onPress: () => updateState(current => ({ ...current, reminders: current.reminders.map(item => item.id === reminder.id ? { ...item, paused: !item.paused } : item) })) },
    { text: 'Edit', onPress: () => { setEditingReminderId(reminder.id); setReminderDraft({ title: reminder.title, time: reminder.time, category: reminder.category, recurrence: reminder.recurrence }); setReminderFormVisible(true); } },
    { text: 'Remove', style: 'destructive', onPress: async () => { if (reminder.notificationId && Platform.OS !== 'web') await Notifications.cancelScheduledNotificationAsync(reminder.notificationId).catch(() => undefined); updateState(current => ({ ...current, reminders: current.reminders.filter(item => item.id !== reminder.id) })); } },
  ]);

  const addReminder = async () => {
    if (!pet || !reminderDraft.title.trim()) return;
    const reminder = newReminder({ petId: pet.id, title: reminderDraft.title.trim(), category: reminderDraft.category, time: reminderDraft.time, recurrence: reminderDraft.recurrence, startDate: selectedDate });
    const existing = editingReminderId ? state?.reminders.find(item => item.id === editingReminderId) : undefined;
    if (existing?.notificationId && Platform.OS !== 'web') await Notifications.cancelScheduledNotificationAsync(existing.notificationId).catch(() => undefined);
    const nextReminder = existing ? { ...existing, title: reminder.title, category: reminder.category, time: reminder.time, recurrence: reminder.recurrence, startDate: reminder.startDate, paused: false } : reminder;
    updateState(current => ({ ...current, reminders: existing ? current.reminders.map(item => item.id === existing.id ? nextReminder : item) : [...current.reminders, nextReminder] }));
    setReminderFormVisible(false);
    setEditingReminderId(null);
    setReminderDraft({ title: '', time: '08:00', category: 'Food', recurrence: 'daily' });
    const notificationId = await scheduleReminderNotification(nextReminder, pet.name);
    if (notificationId) updateState(current => ({ ...current, reminders: current.reminders.map(item => item.id === nextReminder.id ? { ...item, notificationId } : item) }));
  };

  const addMoment = () => {
    if (!pet || !momentDraft.title.trim()) return;
    const moment = newMoment({ petId: pet.id, title: momentDraft.title.trim(), note: momentDraft.note.trim(), date: today, photoUri: momentDraft.photoUri });
    updateState(current => ({ ...current, moments: [moment, ...current.moments] }));
    setMomentFormVisible(false);
    setMomentDraft({ title: '', note: '', photoUri: undefined });
  };

  const addPet = () => {
    if (!petDraft.name.trim()) return;
    if (editingPetId) {
      updateState(current => ({ ...current, pets: current.pets.map(item => item.id === editingPetId ? { ...item, name: petDraft.name.trim(), kind: petDraft.kind, emoji: petDraft.emoji } : item) }));
    } else {
      const created = newPet({ name: petDraft.name.trim(), kind: `${petDraft.kind} · new friend`, emoji: petDraft.emoji, color: '#F5D6AE' });
      updateState(current => ({ ...current, pets: [...current.pets, created], selectedPetId: created.id }));
    }
    setPetFormVisible(false);
    setPetManagerVisible(false);
    setEditingPetId(null);
    setPetDraft({ name: '', kind: 'Dog', emoji: '🐕' });
  };

  const managePet = (managedPet: PawdayState['pets'][number]) => {
    if (!state) return;
    const snapshot = state;
    Alert.alert(managedPet.name, 'Manage this pet profile.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Edit', onPress: () => { setEditingPetId(managedPet.id); setPetDraft({ name: managedPet.name, kind: managedPet.kind.replace(' · new friend', ''), emoji: managedPet.emoji }); setPetManagerVisible(false); setPetFormVisible(true); } },
    { text: 'Delete', style: 'destructive', onPress: () => {
      if (snapshot.pets.length === 1) { Alert.alert('Keep one friend', 'Pawday needs at least one pet profile.'); return; }
      const remaining = snapshot.pets.filter(item => item.id !== managedPet.id);
      updateState(current => ({ ...current, pets: remaining, reminders: current.reminders.filter(item => item.petId !== managedPet.id), moments: current.moments.filter(item => item.petId !== managedPet.id), selectedPetId: current.selectedPetId === managedPet.id ? remaining[0].id : current.selectedPetId }));
    } },
    ]);
  };

  const selectPet = (id: string) => {
    updateState(current => ({ ...current, selectedPetId: id }));
    setPetManagerVisible(false);
  };

  if (!state || !pet) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header pet={pet} onPress={() => setPetManagerVisible(true)} />
          {tab === 'Home' && <Home pet={pet} reminders={state.reminders} date={today} onToggle={toggleTask} onSeeSchedule={() => setTab('Schedule')} />}
          {tab === 'Schedule' && <Schedule pet={pet} reminders={state.reminders} date={selectedDate} dates={dates} onDate={setSelectedDate} onToggle={toggleTask} onManage={manageReminder} onAdd={() => { setEditingReminderId(null); setReminderFormVisible(true); }} />}
          {tab === 'Journal' && <Journal pet={pet} moments={state.moments} onAdd={() => setMomentFormVisible(true)} onDelete={moment => updateState(current => ({ ...current, moments: current.moments.filter(item => item.id !== moment.id) }))} />}
          {tab === 'Awards' && <Awards pet={pet} reminders={state.reminders} moments={state.moments} />}
        </ScrollView>
        <TabBar selected={tab} onSelect={setTab} />
      </View>
      <PetManager visible={petManagerVisible} pets={state.pets} selectedPetId={pet.id} onSelect={selectPet} onManage={managePet} onAdd={() => { setEditingPetId(null); setPetManagerVisible(false); setPetFormVisible(true); }} onClose={() => setPetManagerVisible(false)} />
      <PetForm visible={petFormVisible} editing={Boolean(editingPetId)} draft={petDraft} onChange={setPetDraft} onClose={() => { setEditingPetId(null); setPetFormVisible(false); }} onSave={addPet} />
      <ReminderForm visible={reminderFormVisible} editing={Boolean(editingReminderId)} draft={reminderDraft} onChange={setReminderDraft} onClose={() => { setEditingReminderId(null); setReminderFormVisible(false); }} onSave={addReminder} />
      <MomentForm visible={momentFormVisible} draft={momentDraft} onChange={draft => setMomentDraft(current => ({ ...current, ...draft }))} onClose={() => setMomentFormVisible(false)} onSave={addMoment} />
    </SafeAreaView>
  );
}

async function scheduleReminderNotification(reminder: CareReminder, petName: string): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return undefined;
    }
    const [hour, minute] = reminder.time.split(':').map(Number);
    let trigger: Notifications.NotificationTriggerInput;
    if (reminder.recurrence === 'once') {
      const when = new Date(`${reminder.startDate}T${reminder.time}:00`);
      trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when };
    } else if (reminder.recurrence === 'weekly') {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: new Date(`${reminder.startDate}T12:00:00`).getDay() + 1, hour, minute };
    } else if (reminder.recurrence === 'monthly') {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: Number(reminder.startDate.slice(-2)), hour, minute };
    } else {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
    }
    return await Notifications.scheduleNotificationAsync({ content: { title: `${petName}'s care reminder`, body: reminder.title, sound: undefined }, trigger });
  } catch {
    // Notifications are an enhancement; the in-app schedule remains available if the OS rejects scheduling.
  }
  return undefined;
}

function LoadingScreen() {
  return <SafeAreaView style={styles.safe}><View style={styles.loading}><Text style={styles.loadingEmoji}>🐾</Text><Text style={styles.loadingText}>Getting Pawday ready…</Text></View></SafeAreaView>;
}

function Header({ pet, onPress }: { pet: PawdayState['pets'][number]; onPress: () => void }) {
  const greeting = new Date().getHours() < 12 ? 'Good morning!' : new Date().getHours() < 18 ? 'Good afternoon!' : 'Good evening!';
  return <View style={styles.header}><View><Text style={styles.eyebrow}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text><Text style={styles.greeting}>{greeting} <Text>☀️</Text></Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Switch pet, currently ${pet.name}`} style={styles.avatar} onPress={onPress}><Text style={styles.avatarEmoji}>{pet.emoji}</Text><View style={styles.onlineDot} /></Pressable></View>;
}

function PetCard({ pet }: { pet: PawdayState['pets'][number] }) {
  return <View style={[styles.petCard, { backgroundColor: `${pet.color}55` }]}><View style={[styles.petArt, { backgroundColor: `${pet.color}88` }]}><View style={styles.sun} /><Text style={styles.petEmoji}>{pet.emoji}</Text><Text style={styles.sparkle}>✦</Text></View><View style={styles.petInfo}><Text style={styles.petName}>{pet.name}</Text><Text style={styles.petMeta}>{pet.kind}</Text><View style={styles.moodPill}><Text style={styles.moodText}>●  Feeling pawsome</Text></View></View><Ionicons name="chevron-forward" size={18} color="#6E716B" /></View>;
}

function Home({ pet, reminders, date, onToggle, onSeeSchedule }: { pet: PawdayState['pets'][number]; reminders: CareReminder[]; date: string; onToggle: (id: string, date: string) => void; onSeeSchedule: () => void }) {
  const tasks = remindersForDate(reminders, pet.id, date);
  const progress = progressForDate(reminders, pet.id, date);
  const streak = calculateStreak(reminders, pet.id, date);
  return <><PetCard pet={pet} /><View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Today's care</Text><Text style={styles.sectionSub}>{progress.completed} of {progress.total} completed</Text></View><Pressable onPress={onSeeSchedule}><Text style={styles.link}>See schedule</Text></Pressable></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress.percent * 100}%` }]} /></View>{tasks.length ? <View style={styles.activityList}>{tasks.map(task => <ActivityRow key={task.id} reminder={task} date={date} onToggle={onToggle} />)}</View> : <EmptyState title="A gentle day ahead" body="No care reminders are scheduled for today." action="Add a reminder" onPress={onSeeSchedule} />}<View style={styles.streakCard}><View style={styles.streakIcon}><Text style={{ fontSize: 25 }}>🔥</Text></View><View style={{ flex: 1 }}><Text style={styles.streakTitle}>{streak} day care streak!</Text><Text style={styles.streakText}>Keep showing up for your best friend.</Text></View><Text style={styles.streakCount}>{streak}</Text></View><View style={styles.tip}><Text style={styles.tipIcon}>💡</Text><View style={{ flex: 1 }}><Text style={styles.tipLabel}>DAILY TAIL-WAG</Text><Text style={styles.tipText}>A sniffy walk is enriching, too. Let {pet.name} choose the route today!</Text></View></View></>;
}

function ActivityRow({ reminder, date, onToggle, onManage }: { reminder: CareReminder; date: string; onToggle: (id: string, date: string) => void; onManage?: (reminder: CareReminder) => void }) {
  const done = isCompleted(reminder, date);
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} style={[styles.activity, reminder.paused && { opacity: 0.5 }]} onPress={() => onToggle(reminder.id, date)} onLongPress={() => onManage?.(reminder)}><View style={[styles.activityIcon, { backgroundColor: `${CATEGORY_COLORS[reminder.category]}35` }]}><Ionicons name={CATEGORY_ICONS[reminder.category] as keyof typeof Ionicons.glyphMap} size={22} color={CATEGORY_COLORS[reminder.category]} /></View><View style={{ flex: 1 }}><Text style={[styles.activityTitle, done && styles.doneText]}>{reminder.title}{reminder.paused ? ' · Paused' : ''}</Text><Text style={styles.activityTime}>{formatTime(reminder.time)}{reminder.durationMinutes ? ` · ${reminder.durationMinutes} min` : ''}</Text></View><View style={[styles.check, done && styles.checked]}>{done && <Ionicons name="checkmark" size={17} color="white" />}</View></Pressable>;
}

function Schedule({ pet, reminders, date, dates, onDate, onToggle, onManage, onAdd }: { pet: PawdayState['pets'][number]; reminders: CareReminder[]; date: string; dates: string[]; onDate: (date: string) => void; onToggle: (id: string, date: string) => void; onManage: (reminder: CareReminder) => void; onAdd: () => void }) {
  const tasks = remindersForDate(reminders, pet.id, date);
  return <><Text style={styles.pageTitle}>Care schedule</Text><Text style={styles.pageIntro}>A calm rhythm for happy, healthy pets.</Text><View style={styles.dateStrip}>{dates.map(value => <Pressable accessibilityRole="button" key={value} onPress={() => onDate(value)} style={[styles.dateCell, value === date && styles.dateActive]}><Text style={[styles.dateText, value === date && { color: 'white' }]}>{new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}{`\n${Number(value.slice(-2))}`}</Text></Pressable>)}</View><Text style={styles.timelineLabel}>{date === dateKey() ? 'TODAY' : formatDate(date, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()} · {tasks.length} TASKS</Text>{tasks.length ? <View style={styles.activityList}>{tasks.map(task => <ActivityRow key={task.id} reminder={task} date={date} onToggle={onToggle} onManage={onManage} />)}</View> : <EmptyState title="Nothing scheduled" body="Build a rhythm that works for you and your pet." action="Add care reminder" onPress={onAdd} />}<Pressable style={styles.primaryButton} onPress={onAdd}><Ionicons name="add" size={20} color="white" /><Text style={styles.primaryText}>Add care reminder</Text></Pressable><Text style={styles.helperText}>Tip: long-press a reminder to edit, pause, or remove it.</Text></>;
}

function Journal({ pet, moments, onAdd, onDelete }: { pet: PawdayState['pets'][number]; moments: JournalMoment[]; onAdd: () => void; onDelete: (moment: JournalMoment) => void }) {
  const petMoments = moments.filter(moment => moment.petId === pet.id).sort((a, b) => b.date.localeCompare(a.date));
  return <><View style={styles.pageTitleRow}><View><Text style={styles.pageTitle}>Little moments</Text><Text style={styles.pageIntro}>Your scrapbook of happy days.</Text></View><Pressable accessibilityLabel="Add a journal moment" style={styles.addRound} onPress={onAdd}><Ionicons name="add" size={25} color="white" /></Pressable></View>{petMoments.length ? <View style={styles.memoryGrid}>{petMoments.map((moment, index) => <Pressable key={moment.id} onLongPress={() => Alert.alert('Delete moment?', `Remove “${moment.title}” from the scrapbook?`, [{ text: 'Keep it', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => onDelete(moment) }])} style={[styles.memoryCard, index === 0 && styles.memoryWide, { transform: [{ rotate: index % 2 ? '1.5deg' : '-1deg' }] }]}>{moment.photoUri ? <Image source={{ uri: moment.photoUri }} style={styles.memoryPhoto} /> : <View style={[styles.photoPlaceholder, { backgroundColor: ['#A7D7E5', '#E8C3A6', '#BFD5A4'][index % 3] }]}><Text style={styles.memoryEmoji}>{['🌊', '💤', '🎾'][index % 3]}</Text><View style={styles.tape} /></View>}<Text style={styles.memoryDate}>{formatDate(moment.date, { month: 'short', day: 'numeric' }).toUpperCase()}</Text><Text style={styles.memoryTitle}>{moment.title}</Text>{moment.note ? <Text style={styles.memoryNote}>{moment.note}</Text> : null}</Pressable>)}</View> : <EmptyState title="Start your scrapbook" body="Save the tiny moments you never want to forget." action="Add a moment" onPress={onAdd} />}<Pressable style={styles.dashedAdd} onPress={onAdd}><Ionicons name="camera-outline" size={25} color="#B36D54" /><Text style={styles.dashedText}>Add a little moment</Text></Pressable><Text style={styles.helperText}>Tip: long-press a card to delete it.</Text></>;
}

function Awards({ pet, reminders, moments }: { pet: PawdayState['pets'][number]; reminders: CareReminder[]; moments: JournalMoment[] }) {
  const streak = calculateStreak(reminders, pet.id);
  const points = calculatePoints(reminders, moments, pet.id);
  const walks = reminders.filter(reminder => reminder.petId === pet.id && reminder.category === 'Walk').reduce((sum, reminder) => sum + reminder.completionDates.length, 0);
  const memoryCount = moments.filter(moment => moment.petId === pet.id).length;
  const awards = [{ icon: '🌱', name: 'Fresh start', desc: 'Complete your first care task', unlocked: points >= 10 }, { icon: '🔥', name: 'On a roll', desc: 'Keep a 7-day care streak', unlocked: streak >= 7 }, { icon: '🗺️', name: 'Trail buddy', desc: 'Log 10 walks together', unlocked: walks >= 10 }, { icon: '📸', name: 'Memory maker', desc: 'Save 12 scrapbook moments', unlocked: memoryCount >= 12 }];
  const level = Math.min(10, Math.floor(points / 100) + 1);
  return <><Text style={styles.pageTitle}>Paw-some progress</Text><Text style={styles.pageIntro}>Tiny wins make a beautiful life together.</Text><View style={styles.levelCard}><Text style={styles.levelEmoji}>🏵️</Text><View style={{ flex: 1 }}><Text style={styles.levelLabel}>LEVEL {level}</Text><Text style={styles.levelTitle}>Thoughtful Human</Text><View style={styles.xpTrack}><View style={[styles.xpFill, { width: `${Math.min(100, points % 100)}%` }]} /></View><Text style={styles.xpText}>{points % 100} / 100 kindness points</Text></View></View><Text style={styles.timelineLabel}>BADGES · {awards.filter(award => award.unlocked).length} OF {awards.length}</Text><View style={styles.badgeGrid}>{awards.map(award => <View key={award.name} style={[styles.badge, !award.unlocked && styles.locked]}><Text style={styles.badgeEmoji}>{award.icon}</Text><Text style={styles.badgeName}>{award.name}</Text><Text style={styles.badgeDesc}>{award.desc}</Text>{!award.unlocked && <Ionicons style={styles.lock} name="lock-closed" size={13} color="#969990" />}</View>)}</View></>;
}

function TabBar({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const tabs: { name: Tab; icon: keyof typeof Ionicons.glyphMap }[] = [{ name: 'Home', icon: 'home-outline' }, { name: 'Schedule', icon: 'calendar-outline' }, { name: 'Journal', icon: 'images-outline' }, { name: 'Awards', icon: 'ribbon-outline' }];
  return <View style={styles.tabBar}>{tabs.map(item => <Pressable accessibilityRole="tab" accessibilityState={{ selected: selected === item.name }} key={item.name} style={styles.tab} onPress={() => onSelect(item.name)}><Ionicons name={selected === item.name ? item.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap : item.icon} size={22} color={selected === item.name ? '#B6634B' : '#999B95'} /><Text style={[styles.tabText, selected === item.name && styles.tabSelected]}>{item.name}</Text></Pressable>)}</View>;
}

function PetManager({ visible, pets, selectedPetId, onSelect, onManage, onAdd, onClose }: { visible: boolean; pets: PawdayState['pets']; selectedPetId: string; onSelect: (id: string) => void; onManage: (pet: PawdayState['pets'][number]) => void; onAdd: () => void; onClose: () => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalShade}><View style={styles.modal}><View style={styles.modalHandle} /><Text style={styles.modalTitle}>Your pets</Text>{pets.map(pet => <Pressable key={pet.id} style={[styles.petChoice, pet.id === selectedPetId && styles.petChoiceSelected]} onPress={() => onSelect(pet.id)} onLongPress={() => onManage(pet)}><Text style={styles.petChoiceEmoji}>{pet.emoji}</Text><View style={{ flex: 1 }}><Text style={styles.petChoiceName}>{pet.name}</Text><Text style={styles.petChoiceMeta}>{pet.kind}</Text></View>{pet.id === selectedPetId && <Ionicons name="checkmark-circle" size={22} color="#78A981" />}</Pressable>)}<Pressable style={styles.primaryButton} onPress={onAdd}><Ionicons name="add" size={20} color="white" /><Text style={styles.primaryText}>Add a pet</Text></Pressable><Text style={styles.helperText}>Long-press a pet to edit or delete it.</Text><Pressable onPress={onClose}><Text style={styles.cancel}>Done</Text></Pressable></View></View></Modal>;
}

function PetForm({ visible, editing, draft, onChange, onClose, onSave }: { visible: boolean; editing: boolean; draft: { name: string; kind: string; emoji: string }; onChange: (draft: { name: string; kind: string; emoji: string }) => void; onClose: () => void; onSave: () => void }) {
  return <FormModal visible={visible} title={editing ? 'Edit pet' : 'Add a pet'} onClose={onClose}><Text style={styles.inputLabel}>PET NAME</Text><TextInput autoFocus value={draft.name} onChangeText={name => onChange({ ...draft, name })} placeholder="Mochi" placeholderTextColor="#AAA9A2" style={styles.input} /><Text style={styles.inputLabel}>ANIMAL TYPE</Text><TextInput value={draft.kind} onChangeText={kind => onChange({ ...draft, kind })} placeholder="Dog" placeholderTextColor="#AAA9A2" style={styles.input} /><Text style={styles.inputLabel}>AVATAR</Text><View style={styles.emojiRow}>{['🐕', '🐈', '🐇', '🐢', '🦜'].map(emoji => <Pressable key={emoji} onPress={() => onChange({ ...draft, emoji })} style={[styles.emojiChoice, draft.emoji === emoji && styles.emojiChoiceSelected]}><Text style={{ fontSize: 28 }}>{emoji}</Text></Pressable>)}</View><Pressable style={[styles.primaryButton, !draft.name.trim() && { opacity: 0.45 }]} onPress={onSave} disabled={!draft.name.trim()}><Text style={styles.primaryText}>{editing ? 'Save changes' : 'Save pet'}</Text></Pressable></FormModal>;
}

function ReminderForm({ visible, editing, draft, onChange, onClose, onSave }: { visible: boolean; editing: boolean; draft: { title: string; time: string; category: CareReminder['category']; recurrence: CareReminder['recurrence'] }; onChange: (draft: { title: string; time: string; category: CareReminder['category']; recurrence: CareReminder['recurrence'] }) => void; onClose: () => void; onSave: () => void }) {
  return <FormModal visible={visible} title={editing ? 'Edit care reminder' : 'Add care reminder'} onClose={onClose}><Text style={styles.inputLabel}>WHAT NEEDS DOING?</Text><TextInput autoFocus value={draft.title} onChangeText={title => onChange({ ...draft, title })} placeholder="Brush teeth" placeholderTextColor="#AAA9A2" style={styles.input} /><Text style={styles.inputLabel}>TIME</Text><TextInput value={draft.time} onChangeText={time => onChange({ ...draft, time })} placeholder="08:00" keyboardType="numbers-and-punctuation" style={styles.input} /><Text style={styles.inputLabel}>CATEGORY</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{CATEGORIES.map(category => <Pressable key={category} onPress={() => onChange({ ...draft, category })} style={[styles.chip, draft.category === category && styles.chipSelected]}><Text style={[styles.chipText, draft.category === category && styles.chipTextSelected]}>{category}</Text></Pressable>)}</ScrollView><Text style={styles.inputLabel}>REPEATS</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{RECURRENCES.map(recurrence => <Pressable key={recurrence} onPress={() => onChange({ ...draft, recurrence })} style={[styles.chip, draft.recurrence === recurrence && styles.chipSelected]}><Text style={[styles.chipText, draft.recurrence === recurrence && styles.chipTextSelected]}>{formatRecurrence(recurrence)}</Text></Pressable>)}</ScrollView><Pressable style={[styles.primaryButton, !draft.title.trim() && { opacity: 0.45 }]} onPress={onSave} disabled={!draft.title.trim()}><Text style={styles.primaryText}>{editing ? 'Save changes' : 'Save reminder'}</Text></Pressable></FormModal>;
}

function MomentForm({ visible, draft, onChange, onClose, onSave }: { visible: boolean; draft: { title: string; note: string; photoUri?: string }; onChange: (draft: { title: string; note: string; photoUri?: string }) => void; onClose: () => void; onSave: () => void }) {
  const pickPhoto = async () => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 }); if (!result.canceled) onChange({ ...draft, photoUri: result.assets[0].uri }); };
  return <FormModal visible={visible} title="Save a little moment" onClose={onClose}><Pressable style={styles.photoPicker} onPress={pickPhoto}>{draft.photoUri ? <Image source={{ uri: draft.photoUri }} style={styles.pickedImage} /> : <><Ionicons name="camera" size={31} color="#B6634B" /><Text style={styles.photoPickerText}>Choose a photo</Text></>}</Pressable><Text style={styles.inputLabel}>TITLE</Text><TextInput autoFocus value={draft.title} onChangeText={title => onChange({ ...draft, title })} placeholder="The sweetest afternoon…" placeholderTextColor="#AAA9A2" style={styles.input} /><Text style={styles.inputLabel}>NOTE (OPTIONAL)</Text><TextInput value={draft.note} onChangeText={note => onChange({ ...draft, note })} placeholder="What made it special?" placeholderTextColor="#AAA9A2" style={[styles.input, styles.multiline]} multiline /><Pressable style={[styles.primaryButton, !draft.title.trim() && { opacity: 0.45 }]} onPress={onSave} disabled={!draft.title.trim()}><Text style={styles.primaryText}>Add to scrapbook</Text></Pressable></FormModal>;
}

function FormModal({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><KeyboardAvoidingView style={styles.modalShade} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.modal}><View style={styles.modalHandle} /><View style={styles.modalTitleRow}><Text style={styles.modalTitle}>{title}</Text><Pressable accessibilityLabel="Close" onPress={onClose}><Ionicons name="close" size={22} color="#6E716B" /></Pressable></View><ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}<Pressable onPress={onClose}><Text style={styles.cancel}>Maybe later</Text></Pressable></ScrollView></View></KeyboardAvoidingView></Modal>;
}

function EmptyState({ title, body, action, onPress }: { title: string; body: string; action: string; onPress: () => void }) {
  return <View style={styles.empty}><Text style={styles.emptyEmoji}>🌿</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text><Pressable onPress={onPress}><Text style={styles.link}>{action}</Text></Pressable></View>;
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cream }, appShell: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: cream }, content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 120 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cream }, loadingEmoji: { fontSize: 48, marginBottom: 12 }, loadingText: { color: '#777970', fontSize: 14, fontWeight: '700' }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: '#99978F', marginBottom: 6 }, greeting: { fontSize: 24, fontWeight: '800', color: ink, letterSpacing: -0.6 }, avatar: { width: 49, height: 49, borderRadius: 18, backgroundColor: '#F5DDC5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' }, avatarEmoji: { fontSize: 27 }, onlineDot: { position: 'absolute', right: -1, bottom: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#75A77E', borderWidth: 2, borderColor: cream }, petCard: { minHeight: 160, borderRadius: 28, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 27 }, petArt: { width: 116, height: 116, borderRadius: 58, alignItems: 'center', justifyContent: 'center', marginRight: 15 }, sun: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFE8B6' }, petEmoji: { fontSize: 65, zIndex: 2 }, sparkle: { position: 'absolute', right: 3, top: 12, fontSize: 20, color: '#FFF' }, petInfo: { flex: 1 }, petName: { fontSize: 28, fontWeight: '900', color: ink }, petMeta: { fontSize: 13, color: '#75746D', marginTop: 2 }, moodPill: { marginTop: 14, backgroundColor: '#FFF8EDAA', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 9, alignSelf: 'flex-start' }, moodText: { fontSize: 10, fontWeight: '700', color: '#6F856C' }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, sectionTitle: { fontSize: 20, fontWeight: '900', color: ink }, sectionSub: { fontSize: 12, color: '#95958E', marginTop: 4 }, link: { fontSize: 12, fontWeight: '800', color: '#B6634B' }, progressTrack: { height: 5, borderRadius: 5, backgroundColor: '#EDE8E0', marginVertical: 14 }, progressFill: { height: 5, borderRadius: 5, backgroundColor: '#76A982' }, activityList: { backgroundColor: '#FFFEFA', borderRadius: 22, paddingHorizontal: 15, shadowColor: '#8C7660', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 5 }, elevation: 2 }, activity: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEEAE3' }, activityIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, activityTitle: { fontWeight: '800', fontSize: 14, color: ink }, activityTime: { fontSize: 11, color: '#999991', marginTop: 3 }, doneText: { textDecorationLine: 'line-through', color: '#93958F' }, check: { width: 25, height: 25, borderRadius: 9, borderWidth: 1.5, borderColor: '#D6D5CE', alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: '#78A981', borderColor: '#78A981' }, streakCard: { marginTop: 18, backgroundColor: '#FFF0C8', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }, streakIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#FFE29B', alignItems: 'center', justifyContent: 'center' }, streakTitle: { fontSize: 14, fontWeight: '900', color: ink }, streakText: { fontSize: 11, color: '#79766D', marginTop: 3 }, streakCount: { fontSize: 35, fontWeight: '900', color: '#D68A43', marginRight: 4 }, tip: { flexDirection: 'row', gap: 12, marginTop: 18, padding: 17, borderRadius: 20, backgroundColor: '#E7F0E5' }, tipIcon: { fontSize: 24 }, tipLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#699073' }, tipText: { fontSize: 12, lineHeight: 18, color: '#596459', marginTop: 4 }, pageTitle: { fontSize: 30, fontWeight: '900', color: ink, letterSpacing: -0.8 }, pageIntro: { fontSize: 13, color: '#85867F', marginTop: 5, marginBottom: 20 }, pageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, dateStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }, dateCell: { width: 52, height: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2EDE4' }, dateActive: { backgroundColor: '#B6634B' }, dateText: { textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '800', color: '#8E8D85' }, timelineLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#A09F96', marginBottom: 10 }, primaryButton: { backgroundColor: '#B6634B', borderRadius: 16, minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, primaryText: { color: 'white', fontWeight: '900', fontSize: 14 }, helperText: { textAlign: 'center', color: '#AAA9A2', fontSize: 11, marginTop: 12 }, addRound: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B6634B' }, memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 }, memoryCard: { width: '46%', padding: 10, backgroundColor: '#FFFEFA', borderRadius: 8, shadowColor: '#8C7660', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }, memoryWide: { width: '100%' }, memoryPhoto: { width: '100%', height: 130, borderRadius: 4 }, photoPlaceholder: { height: 112, borderRadius: 4, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, memoryEmoji: { fontSize: 50 }, tape: { position: 'absolute', top: -8, width: 54, height: 22, backgroundColor: '#FFF7D6AA', transform: [{ rotate: '-4deg' }] }, memoryDate: { fontSize: 9, fontWeight: '900', color: '#B36D54', letterSpacing: 1.1, marginTop: 11 }, memoryTitle: { fontSize: 15, fontWeight: '900', color: ink, marginTop: 4 }, memoryNote: { fontSize: 11, color: '#87877E', lineHeight: 16, marginTop: 4 }, dashedAdd: { marginTop: 20, minHeight: 75, borderWidth: 1.5, borderColor: '#DBBBA9', borderStyle: 'dashed', borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 3 }, dashedText: { fontSize: 12, fontWeight: '800', color: '#B36D54' }, levelCard: { backgroundColor: '#F2E5CF', borderRadius: 22, padding: 18, flexDirection: 'row', gap: 15, alignItems: 'center', marginBottom: 26 }, levelEmoji: { fontSize: 42 }, levelLabel: { fontSize: 10, letterSpacing: 1.5, color: '#AD8357', fontWeight: '900' }, levelTitle: { fontSize: 19, color: ink, fontWeight: '900', marginTop: 4 }, xpTrack: { height: 8, backgroundColor: '#E0CBAA', borderRadius: 8, marginTop: 13, overflow: 'hidden' }, xpFill: { height: 8, borderRadius: 8, backgroundColor: '#CA8F57' }, xpText: { fontSize: 10, color: '#8D785E', marginTop: 5 }, badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, badge: { width: '47%', minHeight: 140, padding: 15, borderRadius: 20, backgroundColor: '#FFF5DF', borderWidth: 1, borderColor: '#F0DFC0' }, locked: { backgroundColor: '#F4F2EC', borderColor: '#E6E3DA' }, badgeEmoji: { fontSize: 31 }, badgeName: { fontSize: 14, fontWeight: '900', color: ink, marginTop: 10 }, badgeDesc: { fontSize: 10, lineHeight: 14, color: '#96958D', marginTop: 4 }, lock: { position: 'absolute', right: 12, top: 12 }, tabBar: { height: 82, borderTopWidth: 1, borderTopColor: '#EEE9E0', backgroundColor: '#FFFCF7', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 }, tab: { alignItems: 'center', gap: 4, minWidth: 60 }, tabText: { fontSize: 10, color: '#999B95', fontWeight: '700' }, tabSelected: { color: '#B6634B' }, modalShade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#30342F66' }, modal: { maxHeight: '92%', backgroundColor: '#FFFDF9', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 28 }, modalHandle: { width: 42, height: 4, borderRadius: 4, backgroundColor: '#DDD8CE', alignSelf: 'center', marginBottom: 20 }, modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, modalTitle: { fontSize: 24, fontWeight: '900', color: ink, marginBottom: 18 }, inputLabel: { fontSize: 10, letterSpacing: 1.4, fontWeight: '900', color: '#99978F', marginTop: 13, marginBottom: 7 }, input: { backgroundColor: '#F7F2EA', borderRadius: 13, minHeight: 50, paddingHorizontal: 14, color: ink, fontSize: 15 }, multiline: { minHeight: 82, paddingTop: 14, textAlignVertical: 'top' }, cancel: { textAlign: 'center', color: '#999991', fontWeight: '800', marginTop: 18, padding: 8 }, photoPicker: { height: 118, borderRadius: 16, backgroundColor: '#F8EADC', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' }, photoPickerText: { color: '#B6634B', fontWeight: '800', fontSize: 12 }, pickedImage: { width: '100%', height: '100%' }, chipRow: { gap: 8, paddingVertical: 2 }, chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#F2EDE4' }, chipSelected: { backgroundColor: '#B6634B' }, chipText: { color: '#85867F', fontSize: 12, fontWeight: '700' }, chipTextSelected: { color: 'white' }, petChoice: { minHeight: 62, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12, marginBottom: 8 }, petChoiceSelected: { backgroundColor: '#F3E8D7' }, petChoiceEmoji: { fontSize: 31 }, petChoiceName: { fontSize: 16, fontWeight: '900', color: ink }, petChoiceMeta: { color: '#85867F', fontSize: 11, marginTop: 2 }, emojiRow: { flexDirection: 'row', gap: 10, marginBottom: 8 }, emojiChoice: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2EDE4' }, emojiChoiceSelected: { backgroundColor: '#F3D5B8', borderWidth: 2, borderColor: '#B6634B' }, empty: { alignItems: 'center', backgroundColor: '#FFFEFA', borderRadius: 22, padding: 28, marginTop: 4 }, emptyEmoji: { fontSize: 30, marginBottom: 8 }, emptyTitle: { fontSize: 17, fontWeight: '900', color: ink }, emptyBody: { fontSize: 12, color: '#8B8C84', textAlign: 'center', lineHeight: 18, marginVertical: 7 },
});
