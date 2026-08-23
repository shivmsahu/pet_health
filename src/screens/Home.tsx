import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import {
  CATEGORY_EMOJI,
  CareReminder,
  Pet,
  completionTrend,
  dateFromKey,
  describeAge,
  formatTime,
  isCompleted,
  nextUpTask,
  progressForDate,
  remindersForDate,
} from '../domain';
import { careScore, levelFromXp, questStatuses, totalXp, weeklyChallenge } from '../game';
import { Tip, tipsFor } from '../suggestions';
import { radius, space, type } from '../theme';
import { Callout, Card, EmptyState, PawButton, ProBadge, ProgressBar, SectionHeader, Sparkbars, StatTile, Text } from '../ui';

export type Nav = (tab: 'Home' | 'Schedule' | 'Health' | 'Journal' | 'Rewards') => void;

export function Home({
  onNavigate,
  onAddReminder,
  onAddMoment,
  onQuickLog,
  onOpenProfile,
}: {
  onNavigate: Nav;
  onAddReminder: () => void;
  onAddMoment: () => void;
  onQuickLog: () => void;
  onOpenProfile: () => void;
}) {
  const app = useApp();
  const { state, palette: p, pet, today, streak, multiplier, openPaywall, dismissTip } = app;
  if (!pet) return null;

  const tasks = remindersForDate(state.reminders, pet.id, today);
  const progress = progressForDate(state.reminders, pet.id, today);
  const upNext = nextUpTask(state.reminders, pet.id, today);
  const quests = questStatuses(state, today);
  const weekly = weeklyChallenge(state, today);
  const level = levelFromXp(totalXp(state, today));
  const score = careScore(state, today);
  const tips = tipsFor(state, today).slice(0, 3);
  const trend = completionTrend(state.reminders, pet.id, 7, today);

  return (
    <View>
      <PetHero pet={pet} score={score} streak={streak} onPress={onOpenProfile} />

      <Card style={{ marginTop: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 26 }}>{level.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={type('bodySmStrong', p.ink)}>
                Level {level.level} · {level.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 13 }}>{'\u{1FA99}'}</Text>
                <Text style={type('buttonMd', p.ink)}>{state.game.coins}</Text>
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <ProgressBar percent={level.percent} color={p.primary} />
            </View>
            <Text style={[type('captionXs', p.body), { marginTop: 6 }]}>
              {level.maxed ? 'Maximum level — you absolute legend.' : `${level.toNext} XP to level ${level.level + 1}`}
              {multiplier > 1 ? ` · ${multiplier}x streak bonus active` : ''}
            </Text>
          </View>
        </View>
      </Card>

      {!!tips.length && (
        <>
          <SectionHeader title="For you" sub="Small nudges from your own data" />
          <View style={{ gap: 10 }}>
            {tips.map(tip => (
              <TipCard key={tip.id} tip={tip} onDismiss={() => dismissTip(tip.id)} onAction={() => handleTip(tip, onNavigate, openPaywall, onOpenProfile)} />
            ))}
          </View>
        </>
      )}

      <SectionHeader title="Today's quests" sub={`Fresh set every morning${multiplier > 1 ? ` · ${multiplier}x coins` : ''}`} />
      <Card>
        <View style={{ gap: 12 }}>
          {quests.map(quest => (
            <View key={quest.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 20 }}>{quest.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type('buttonMd', p.ink)}>{quest.title}</Text>
                <View style={{ marginTop: 6 }}>
                  <ProgressBar percent={quest.value / quest.target} height={7} color={quest.done ? p.accentGreen : p.primary} />
                </View>
              </View>
              {quest.claimed ? (
                <Ionicons name="checkmark-done-circle" size={24} color={p.accentGreen} />
              ) : quest.done ? (
                <Pressable
                  onPress={() => app.claimQuest(quest.id)}
                  style={{ backgroundColor: p.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 }}
                >
                  <Text style={type('captionXs', p.onPrimary)}>Claim</Text>
                </Pressable>
              ) : (
                <Text style={type('captionXs', p.mute)}>
                  {quest.value}/{quest.target}
                </Text>
              )}
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => onNavigate('Rewards')}
          style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.hairline, flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          <Text style={{ fontSize: 18 }}>{weekly.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={type('buttonMd', p.ink)}>{weekly.title}</Text>
            <Text style={[type('captionXs', p.body), { marginTop: 1 }]}>
              {weekly.value}/{weekly.target} perfect days · +{weekly.xp} XP
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={p.mute} />
        </Pressable>
      </Card>

      {!!upNext && (
        <>
          <SectionHeader title="Up next" />
          <Pressable onPress={() => app.toggleTask(upNext.id, today)}>
            <Card tint={p.surfaceSoft} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: p.surfaceCard, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{CATEGORY_EMOJI[upNext.category]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type('bodyStrong', p.ink)}>{upNext.title}</Text>
                <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
                  {formatTime(upNext.time)} · tap to tick off · +10 XP
                </Text>
              </View>
              <Ionicons name="ellipse-outline" size={28} color={p.primary} />
            </Card>
          </Pressable>
        </>
      )}

      <SectionHeader
        title="Today's care"
        sub={tasks.length ? `${progress.completed} of ${progress.total} done` : 'Nothing scheduled yet'}
        action="Schedule"
        onAction={() => onNavigate('Schedule')}
      />
      {tasks.length ? (
        <View style={{ gap: 10 }}>
          {tasks.map(task => (
            <TaskRow key={task.id} reminder={task} date={today} />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState
            emoji={'\u{1F331}'}
            title="No tasks for today"
            body={`Add the first thing ${pet.name} needs and Pawday will keep the rhythm from here.`}
            action="Add a care task"
            onPress={onAddReminder}
          />
        </Card>
      )}

      <SectionHeader title="This week" sub="How the routine is holding up" />
      <Card>
        <Sparkbars
          values={trend.map(day => Math.round(day.percent * 100))}
          labels={trend.map(day => dateFromKey(day.key).toLocaleDateString(undefined, { weekday: 'narrow' }))}
          color={p.accentGreen}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <StatTile emoji={'\u{1F525}'} value={`${streak}`} label="day streak" tint={p.accentRedSoft} />
          <StatTile emoji={'\u{2705}'} value={`${progress.completed}`} label="done today" tint={p.accentGreenSoft} />
          <StatTile emoji={'\u{2764}'} value={`${score}`} label="care score" tint={p.accentBlueSoft} />
        </View>
      </Card>

      <SectionHeader title="Quick log" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <QuickAction emoji={'\u{2696}'} label="Weight" onPress={onQuickLog} />
        <QuickAction emoji={'\u{1F4F8}'} label="Moment" onPress={onAddMoment} />
        <QuickAction emoji={'\u{1FA7A}'} label="Health" onPress={() => onNavigate('Health')} />
      </View>

      {!app.pro && (
        <Pressable onPress={() => openPaywall('insights')} style={{ marginTop: space.lg }}>
          <Card tint={p.primary} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: p.primary }}>
            <Text style={{ fontSize: 26 }}>{'\u{1F31F}'}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={type('bodySmStrong', '#5B4415')}>Pawday Pro</Text>
                <ProBadge label="7 DAYS FREE" />
              </View>
              <Text style={[type('captionSm', '#6B5424'), { marginTop: 3 }]}>
                Health vault, insights, every theme and the whole household.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#5B4415" />
          </Card>
        </Pressable>
      )}
    </View>
  );
}

function handleTip(tip: Tip, onNavigate: Nav, openPaywall: (feature?: any) => void, onOpenProfile: () => void) {
  if (!tip.action) return;
  if (tip.action.target === 'paywall') openPaywall('insights');
  else if (tip.action.target === 'profile') onOpenProfile();
  else if (tip.action.target === 'schedule') onNavigate('Schedule');
  else if (tip.action.target === 'journal') onNavigate('Journal');
  else if (tip.action.target === 'health') onNavigate('Health');
}

function TipCard({ tip, onDismiss, onAction }: { tip: Tip; onDismiss: () => void; onAction: () => void }) {
  const tone = tip.tone === 'warn' ? 'warn' : tip.tone === 'cheer' ? 'success' : 'info';
  return (
    <Callout
      tone={tone}
      emoji={tip.emoji}
      title={tip.title}
      body={tip.body}
      action={tip.action?.label}
      onAction={onAction}
      onDismiss={onDismiss}
    />
  );
}

function QuickAction({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  const { palette: p } = useApp();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: p.surfaceCard,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: p.hairline,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={type('captionXs', p.ink)}>{label}</Text>
    </Pressable>
  );
}

export function PetHero({ pet, score, streak, onPress }: { pet: Pet; score: number; streak: number; onPress: () => void }) {
  const { palette: p } = useApp();
  const age = describeAge(pet.birthday);
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          borderRadius: radius.xl,
          backgroundColor: p.surfaceCard,
          borderWidth: 1,
          borderColor: p.hairline,
          padding: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            width: 74,
            height: 74,
            borderRadius: 37,
            backgroundColor: p.surfaceSoft,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: p.surfaceCard,
          }}
        >
          {pet.photoUri ? <Image source={{ uri: pet.photoUri }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ fontSize: 36 }}>{pet.emoji}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={type('headingLg', p.ink)}>{pet.name}</Text>
            {streak > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: p.surfaceCard, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 12 }}>{'\u{1F525}'}</Text>
                <Text style={type('captionXs', p.ink)}>{streak}</Text>
              </View>
            )}
          </View>
          <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
            {[pet.breed || pet.species, age].filter(Boolean).join(' · ')}
          </Text>
          <View style={{ marginTop: 10 }}>
            <ProgressBar percent={score / 100} color={p.primary} track={p.surfaceCard} height={9} />
            <Text style={[type('utilityXs', p.body), { marginTop: 5 }]}>Care score {score}/100</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function TaskRow({
  reminder,
  date,
  onLongPress,
}: {
  reminder: CareReminder;
  date: string;
  onLongPress?: () => void;
}) {
  const { palette: p, toggleTask, notify, state } = useApp();
  const done = isCompleted(reminder, date);

  const press = () => {
    toggleTask(reminder.id, date);
    if (!done) {
      const remaining = remindersForDate(state.reminders, reminder.petId, date).filter(
        task => task.id !== reminder.id && !isCompleted(task, date),
      ).length;
      notify(
        remaining === 0
          ? { emoji: '\u{1F389}', title: 'Perfect day!', body: `+${10} XP and a ${40} XP bonus.` }
          : { emoji: '\u{2705}', title: '+10 XP', body: `${remaining} left today` },
      );
    }
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      onPress={press}
      onLongPress={onLongPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: done ? p.accentGreenSoft : p.surfaceCard,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: done ? p.accentGreen : p.hairline,
        padding: 14,
        opacity: reminder.paused ? 0.5 : 1,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: p.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>{CATEGORY_EMOJI[reminder.category]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[type('captionMd', p.ink), { textDecorationLine: done ? 'line-through' : 'none' }]}
        >
          {reminder.title}
        </Text>
        <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
          {formatTime(reminder.time)}
          {reminder.durationMinutes ? ` · ${reminder.durationMinutes} min` : ''}
          {reminder.paused ? ' · paused' : ''}
        </Text>
      </View>
      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={27} color={done ? p.accentGreen : p.mute} />
    </Pressable>
  );
}
