import React from 'react';
import { Alert, Image, Pressable, Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Pet, describeAge, emptyState, formatRecurrence, formatTime, remindersForDate } from '../domain';
import { exportState } from '../storage';
import { THEMES, radius, space, type } from '../theme';
import { Card, Chip, ChipRow, Label, PawButton, ProBadge, Sheet, Text } from '../ui';

/** A plain-text handover for whoever is looking after them while you are away. */
function careCardText(app: ReturnType<typeof useApp>, pet: Pet): string {
  const { state, today } = app;
  const tasks = remindersForDate(state.reminders, pet.id, today);
  const lines = [
    `${pet.name}'s care card \u{1F43E}`,
    [pet.breed || pet.species, describeAge(pet.birthday)].filter(Boolean).join(' · '),
    '',
    'DAILY ROUTINE',
    ...(tasks.length
      ? tasks.map(task => `• ${formatTime(task.time)} — ${task.title}${task.durationMinutes ? ` (${task.durationMinutes} min)` : ''}${task.notes ? ` — ${task.notes}` : ''}`)
      : ['• Nothing scheduled']),
  ];
  const meds = state.reminders.filter(item => item.petId === pet.id && item.category === 'Medication');
  if (meds.length) {
    lines.push('', 'MEDICATION', ...meds.map(med => `• ${med.title} — ${formatTime(med.time)}, ${formatRecurrence(med.recurrence).toLowerCase()}`));
  }
  if (pet.vetName || pet.vetPhone) {
    lines.push('', 'VET', `${pet.vetName ?? ''} ${pet.vetPhone ?? ''}`.trim());
  }
  if (pet.microchipId) lines.push('', `Microchip: ${pet.microchipId}`);
  if (pet.notes) lines.push('', 'GOOD TO KNOW', pet.notes);
  lines.push('', 'Made with Pawday');
  return lines.join('\n');
}

export function SettingsSheet({
  visible,
  onClose,
  onEditPet,
  onAddPet,
  onReplayTutorial,
}: {
  visible: boolean;
  onClose: () => void;
  onEditPet: (pet: Pet) => void;
  onAddPet: () => void;
  onReplayTutorial: () => void;
}) {
  const app = useApp();
  const { state, palette: p, pet, pro, guard, openPaywall } = app;

  const shareCareCard = () => {
    if (!pet) return;
    if (!pro) {
      openPaywall('care-card');
      return;
    }
    void Share.share({ message: careCardText(app, pet) });
  };

  const exportData = () => {
    if (!pro) {
      openPaywall('export');
      return;
    }
    void Share.share({ message: exportState(state) });
  };

  const confirmDeleteAll = () =>
    Alert.alert('Delete everything?', 'This removes every pet, reminder, memory and health record from this device. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: () => {
          app.replaceState(emptyState());
          onClose();
        },
      },
    ]);

  const confirmRemovePet = (target: Pet) =>
    Alert.alert(`Remove ${target.name}?`, 'Their reminders, memories and health records go too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => app.removePet(target.id) },
    ]);

  return (
    <Sheet visible={visible} title="Pawday" onClose={onClose}>
      <Card style={{ marginTop: 12 }} tint={pro ? p.accentGreenSoft : p.surfaceSoft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 26 }}>{pro ? '\u{1F31F}' : '\u{1F43E}'}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={type('bodySmStrong', p.ink)}>{pro ? 'Pawday Pro' : 'Pawday Free'}</Text>
              {pro && <ProBadge label={state.entitlement.trialEndsOn ? 'TRIAL' : (state.entitlement.plan ?? 'PRO').toUpperCase()} />}
            </View>
            <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
              {pro
                ? state.entitlement.trialEndsOn
                  ? `Free trial until ${state.entitlement.trialEndsOn}`
                  : 'Every feature unlocked. Thank you.'
                : 'One pet, six reminders, all the daily basics.'}
            </Text>
          </View>
          {!pro && <PawButton small label="Upgrade" onPress={() => openPaywall('multi-pet')} />}
        </View>
      </Card>

      <Label>YOUR PETS</Label>
      <View style={{ gap: 10 }}>
        {state.pets.map(item => {
          const active = item.id === state.selectedPetId;
          return (
            <Pressable
              key={item.id}
              onPress={() => app.selectPet(item.id)}
              onLongPress={() => (state.pets.length > 1 ? confirmRemovePet(item) : undefined)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: radius.lg,
                backgroundColor: active ? p.surfaceSoft : p.surfaceCard,
                borderWidth: 1.5,
                borderColor: active ? p.primary : p.hairline,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.surfaceSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {item.photoUri ? <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ fontSize: 22 }}>{item.emoji}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type('captionMd', p.ink)}>{item.name}</Text>
                <Text style={type('captionSm', p.body)}>{[item.breed || item.species, describeAge(item.birthday)].filter(Boolean).join(' · ')}</Text>
              </View>
              <Pressable onPress={() => onEditPet(item)} hitSlop={8}>
                <Ionicons name="create-outline" size={20} color={p.body} />
              </Pressable>
            </Pressable>
          );
        })}
      </View>
      <PawButton
        small
        variant="soft"
        icon="add"
        label={pro ? 'Add another pet' : 'Add another pet (Pro)'}
        onPress={() => guard('pet', onAddPet)}
        style={{ marginTop: 10 }}
      />

      <Label>THEME</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {THEMES.map(theme => {
          const locked = theme.pro && !pro;
          const active = state.settings.themeId === theme.id && !locked;
          return (
            <Pressable
              key={theme.id}
              onPress={() => app.setTheme(theme.id)}
              style={{
                width: 96,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: active ? p.primary : p.hairline,
                backgroundColor: theme.canvas,
                paddingVertical: 12,
                alignItems: 'center',
                gap: 4,
                opacity: locked ? 0.7 : 1,
              }}
            >
              <Text style={{ fontSize: 20 }}>{theme.emoji}</Text>
              <Text style={type('utilityXs', theme.ink)}>{theme.name}</Text>
              <View style={{ flexDirection: 'row', gap: 3, marginTop: 2 }}>
                {[theme.primary, theme.accentGreen, theme.accentRed].map(color => (
                  <View key={color} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                ))}
              </View>
              {locked && <Ionicons name="lock-closed" size={11} color={theme.body} style={{ marginTop: 2 }} />}
            </Pressable>
          );
        })}
      </View>

      <Label>UNITS</Label>
      <ChipRow>
        <Chip label="Kilograms" selected={state.settings.weightUnit === 'kg'} onPress={() => app.patchSettings({ weightUnit: 'kg' })} />
        <Chip label="Pounds" selected={state.settings.weightUnit === 'lb'} onPress={() => app.patchSettings({ weightUnit: 'lb' })} />
      </ChipRow>

      <Label>CURRENCY</Label>
      <ChipRow>
        {['$', '£', '€', '₹', '¥'].map(symbol => (
          <Chip key={symbol} label={symbol} selected={state.settings.currency === symbol} onPress={() => app.patchSettings({ currency: symbol })} />
        ))}
      </ChipRow>

      <Label>SHARING & DATA</Label>
      <View style={{ gap: 10 }}>
        <SettingRow icon="mail-outline" title="Sitter care card" sub="Share the routine with whoever is watching them" pro={!pro} onPress={shareCareCard} />
        <SettingRow icon="download-outline" title="Export a backup" sub="A full copy of everything, as JSON" pro={!pro} onPress={exportData} />
        <SettingRow icon="school-outline" title="Replay the tutorial" sub="See the quick tour again" onPress={onReplayTutorial} />
        <SettingRow icon="trash-outline" title="Delete all data" sub="Wipes this device clean" destructive onPress={confirmDeleteAll} />
        {pro && <SettingRow icon="close-circle-outline" title="Switch back to Free" sub="Keeps all your data" onPress={app.cancelPro} />}
      </View>

      <Text style={[type('captionXs', p.mute), { textAlign: 'center', marginTop: space.lg }]}>
        Pawday keeps everything on your device. No account, no cloud, no ads.
      </Text>
    </Sheet>
  );
}

function SettingRow({
  icon,
  title,
  sub,
  onPress,
  pro,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub: string;
  onPress: () => void;
  pro?: boolean;
  destructive?: boolean;
}) {
  const { palette: p } = useApp();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: radius.lg,
        backgroundColor: p.surfaceCard,
        borderWidth: 1,
        borderColor: p.hairline,
      }}
    >
      <Ionicons name={icon} size={20} color={destructive ? '#C0563F' : p.body} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={type('captionMd', destructive ? '#C0563F' : p.ink)}>{title}</Text>
          {pro && <ProBadge />}
        </View>
        <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={p.mute} />
    </Pressable>
  );
}
