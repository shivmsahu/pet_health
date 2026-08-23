import React, { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/AppContext';
import { CareReminder, JournalMoment, Pet } from './src/domain';
import { COACH_MARKS } from './src/suggestions';
import { radius, space, type } from './src/theme';
import { FONT_ASSETS } from './src/fonts';
import { Card, CelebrationHost, Loading, PawButton, ProgressBar, Text, ToastHost } from './src/ui';
import { Anim, Nudge } from './src/motion';
import { cue } from './src/feedback';
import { Onboarding } from './src/screens/Onboarding';
import { Home, Nav } from './src/screens/Home';
import { Schedule } from './src/screens/Schedule';
import { Health, HealthForm } from './src/screens/Health';
import { Journal } from './src/screens/Journal';
import { Rewards } from './src/screens/Rewards';
import { Paywall } from './src/screens/Paywall';
import { HealthSheet, MomentSheet, PetSheet, ReminderSheet } from './src/screens/Forms';
import { SettingsSheet } from './src/screens/Settings';

type Tab = 'Home' | 'Schedule' | 'Health' | 'Journal' | 'Rewards';

const TABS: { name: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { name: 'Home', icon: 'home', label: 'Today' },
  { name: 'Schedule', icon: 'calendar', label: 'Routine' },
  { name: 'Health', icon: 'medkit', label: 'Health' },
  { name: 'Journal', icon: 'images', label: 'Moments' },
  { name: 'Rewards', icon: 'trophy', label: 'Rewards' },
];

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const app = useApp();
  const { state, ready, palette: p, pet } = app;
  // IBM Plex Sans carries every text role, so hold the UI until it is resident.
  const [fontsLoaded] = useFonts(FONT_ASSETS);
  const [tab, setTab] = useState<Tab>('Home');
  const [reminderSheet, setReminderSheet] = useState<{ open: boolean; editing?: CareReminder }>({ open: false });
  const [momentSheet, setMomentSheet] = useState<{ open: boolean; editing?: JournalMoment }>({ open: false });
  const [petSheet, setPetSheet] = useState<{ open: boolean; editing?: Pet }>({ open: false });
  const [healthSheet, setHealthSheet] = useState<{ open: boolean; form: HealthForm }>({ open: false, form: 'weight' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tour, setTour] = useState(false);

  if (!ready || !fontsLoaded) return <Loading />;
  if (!state.settings.onboarded || !pet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.canvas }}>
        <StatusBar style={p.dark ? 'light' : 'dark'} />
        <Onboarding />
        <ToastHost />
      </SafeAreaView>
    );
  }

  const showTour = tour || !state.settings.coachMarksSeen.includes('done');
  const navigate: Nav = next => setTab(next);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.canvas }}>
      <StatusBar style={p.dark ? 'light' : 'dark'} />
      <View style={{ flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <Header onSettings={() => setSettingsOpen(true)} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.section * 2 }} showsVerticalScrollIndicator={false}>
          {tab === 'Home' && (
            <Home
              onNavigate={navigate}
              onAddReminder={() => app.guard('reminder', () => setReminderSheet({ open: true }))}
              onAddMoment={() => app.guard('moment', () => setMomentSheet({ open: true }))}
              onQuickLog={() => app.guard('weight', () => setHealthSheet({ open: true, form: 'weight' }))}
              onOpenProfile={() => setPetSheet({ open: true, editing: pet })}
            />
          )}
          {tab === 'Schedule' && (
            <Schedule onAdd={() => setReminderSheet({ open: true })} onEdit={reminder => setReminderSheet({ open: true, editing: reminder })} />
          )}
          {tab === 'Health' && <Health onLog={form => setHealthSheet({ open: true, form })} />}
          {tab === 'Journal' && <Journal onAdd={() => setMomentSheet({ open: true })} onEdit={moment => setMomentSheet({ open: true, editing: moment })} />}
          {tab === 'Rewards' && <Rewards />}
        </ScrollView>
        <TabBar selected={tab} onSelect={setTab} />
      </View>

      <ReminderSheet visible={reminderSheet.open} editing={reminderSheet.editing} onClose={() => setReminderSheet({ open: false })} />
      <MomentSheet visible={momentSheet.open} editing={momentSheet.editing} onClose={() => setMomentSheet({ open: false })} />
      <PetSheet visible={petSheet.open} editing={petSheet.editing} onClose={() => setPetSheet({ open: false })} />
      <HealthSheet visible={healthSheet.open} form={healthSheet.form} onClose={() => setHealthSheet({ open: false, form: healthSheet.form })} />
      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onEditPet={target => {
          setSettingsOpen(false);
          setPetSheet({ open: true, editing: target });
        }}
        onAddPet={() => {
          setSettingsOpen(false);
          setPetSheet({ open: true });
        }}
        onReplayTutorial={() => {
          setSettingsOpen(false);
          setTour(true);
        }}
      />
      <Paywall />
      <CoachMarks
        visible={showTour}
        onDone={() => {
          setTour(false);
          app.markCoachMarksSeen();
        }}
      />
      <CelebrationHost />
      <ToastHost />
    </SafeAreaView>
  );
}

/** `primary-nav`: cream, flush with the page, 56px, no radius, no shadow. */
function Header({ onSettings }: { onSettings: () => void }) {
  const { palette: p, pet, state } = useApp();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: space.xl,
        gap: space.md,
        borderBottomWidth: 1,
        borderBottomColor: p.hairlineSoft,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={type('utilityXs', p.mute)}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={type('bodyStrong', p.ink)}>
          {greeting}
          {pet ? `, ${pet.name}'s human` : ''}
        </Text>
      </View>
      <Nudge trigger={state.game.coins}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.xs + 2,
            backgroundColor: p.surfaceSoft,
            borderRadius: radius.sm,
            paddingHorizontal: space.sm,
            paddingVertical: space.xs,
          }}
        >
          <Text style={{ fontSize: 12 }}>{'\u{1FA99}'}</Text>
          <Text style={[type('captionMd', p.ink), { fontVariant: ['tabular-nums'] }]}>{state.game.coins}</Text>
        </View>
      </Nudge>
      <Pressable onPress={onSettings} accessibilityLabel="Settings" hitSlop={8}>
        <Ionicons name="settings-outline" size={20} color={p.body} />
      </Pressable>
    </View>
  );
}

/** `product-tab`: the active tab lifts off the cream as a white card. */
function TabBar({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const { palette: p } = useApp();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        backgroundColor: p.canvas,
        borderTopWidth: 1,
        borderTopColor: p.hairline,
        paddingTop: space.sm,
        paddingBottom: space.md,
        paddingHorizontal: space.sm,
      }}
    >
      {TABS.map(item => {
        const active = item.name === selected;
        return (
          <Pressable
            key={item.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) cue('select');
              onSelect(item.name);
            }}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: space.xs,
              paddingVertical: space.sm,
              marginHorizontal: space.xs,
              borderRadius: radius.md,
              backgroundColor: active ? p.surfaceCard : 'transparent',
              borderWidth: 1,
              borderColor: active ? p.hairline : 'transparent',
            }}
          >
            {active && item.name === 'Rewards' ? (
              <Anim
                name="trophy-sparkle"
                size={26}
                style={{ width: 26, height: 19 }}
                loop
                tint={p.ink}
                fallback={<Ionicons name={item.icon} size={19} color={p.ink} />}
              />
            ) : (
              <Ionicons
                name={active ? item.icon : (`${item.icon}-outline` as keyof typeof Ionicons.glyphMap)}
                size={19}
                color={active ? p.ink : p.mute}
              />
            )}
            <Text style={type('captionXs', active ? p.ink : p.mute)}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The one-time tour. Short, skippable, and replayable from settings. */
function CoachMarks({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const { palette: p } = useApp();
  const [index, setIndex] = useState(0);
  const mark = COACH_MARKS[index];
  if (!visible || !mark) return null;

  const next = () => (index + 1 < COACH_MARKS.length ? setIndex(index + 1) : (setIndex(0), onDone()));

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDone}>
      <View style={{ flex: 1, backgroundColor: 'rgba(35,37,29,0.5)', alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Card style={{ width: '100%', maxWidth: 420, alignItems: 'center', paddingVertical: space.xxl }}>
          <Text style={{ fontSize: 40 }}>{mark.emoji}</Text>
          <Text style={[type('headingLg', p.ink), { marginTop: space.md, textAlign: 'center' }]}>{mark.title}</Text>
          <Text style={[type('bodySm', p.body), { marginTop: space.sm, textAlign: 'center' }]}>{mark.body}</Text>
          <View style={{ width: '60%', marginTop: space.xl }}>
            <ProgressBar percent={(index + 1) / COACH_MARKS.length} />
          </View>
          <PawButton
            label={index + 1 === COACH_MARKS.length ? "Let's go" : 'Next'}
            onPress={next}
            style={{ marginTop: space.xl, alignSelf: 'stretch' }}
          />
          <Pressable
            onPress={() => {
              setIndex(0);
              onDone();
            }}
            style={{ marginTop: space.md }}
            hitSlop={8}
          >
            <Text style={type('buttonSm', p.mute)}>Skip the tour</Text>
          </Pressable>
        </Card>
      </View>
    </Modal>
  );
}
