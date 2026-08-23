import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { CATEGORY_EMOJI, CareReminder, dateFromKey, dateKey, formatDate, formatRecurrence, formatTime, progressForDate, remindersForDate, shiftDate } from '../domain';
import { moreIdeas } from '../suggestions';
import { usage } from '../pro';
import { radius, space, type } from '../theme';
import { Card, EmptyState, PawButton, ProgressBar, SectionHeader, Subtitle, Text, Title } from '../ui';
import { TaskRow } from './Home';

export function Schedule({ onAdd, onEdit }: { onAdd: () => void; onEdit: (reminder: CareReminder) => void }) {
  const app = useApp();
  const { state, palette: p, pet, today, guard } = app;
  const [selected, setSelected] = useState(today);
  // Hooks stay above the guard so the hook order never changes between renders.
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 2)), [today]);
  if (!pet) return null;

  const tasks = remindersForDate(state.reminders, pet.id, selected);
  const progress = progressForDate(state.reminders, pet.id, selected);
  const ideas = moreIdeas(pet.species, state.reminders.filter(reminder => reminder.petId === pet.id)).slice(0, 4);
  const quota = usage(state, 'reminder');

  const manage = (reminder: CareReminder) =>
    Alert.alert(reminder.title, 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      { text: reminder.paused ? 'Resume' : 'Pause', onPress: () => app.togglePause(reminder.id) },
      { text: 'Edit', onPress: () => onEdit(reminder) },
      { text: 'Remove', style: 'destructive', onPress: () => void app.removeReminder(reminder.id) },
    ]);

  return (
    <View>
      <Title>Care schedule</Title>
      <Subtitle style={{ marginTop: 4 }}>A calm rhythm for a happy, healthy {pet.species.toLowerCase()}.</Subtitle>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: space.md }}>
        {days.map(day => {
          const active = day === selected;
          const dayProgress = progressForDate(state.reminders, pet.id, day);
          const complete = dayProgress.total > 0 && dayProgress.completed === dayProgress.total;
          return (
            <Pressable
              key={day}
              onPress={() => setSelected(day)}
              style={{
                width: 58,
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: radius.lg,
                backgroundColor: active ? p.primary : p.surfaceCard,
                borderWidth: 1,
                borderColor: active ? p.primary : p.hairline,
                gap: 3,
              }}
            >
              <Text style={type('utilityXs', active ? p.onPrimary : p.mute)}>
                {dateFromKey(day).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
              </Text>
              <Text style={type('headingMd', active ? p.onPrimary : p.ink)}>{day.slice(-2)}</Text>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: complete ? p.accentGreen : dayProgress.total ? (active ? p.onPrimary : p.mute) : 'transparent',
                }}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {!!tasks.length && (
        <Card style={{ marginBottom: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={type('buttonMd', p.ink)}>
              {selected === today ? 'Today' : formatDate(selected, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={type('buttonMd', p.body)}>
              {progress.completed}/{progress.total}
            </Text>
          </View>
          <ProgressBar percent={progress.percent} color={p.accentGreen} />
        </Card>
      )}

      {tasks.length ? (
        <View style={{ gap: 10 }}>
          {tasks.map(task => (
            <TaskRow key={task.id} reminder={task} date={selected} onLongPress={() => manage(task)} />
          ))}
          <Text style={[type('captionXs', p.mute), { textAlign: 'center', marginTop: 4 }]}>Long-press a task to edit, pause or remove it.</Text>
        </View>
      ) : (
        <Card>
          <EmptyState
            emoji={'\u{1F4C5}'}
            title="Nothing scheduled"
            body={`Pick one of the suggestions below, or write your own task for ${pet.name}.`}
          />
        </Card>
      )}

      {!!ideas.length && (
        <>
          <SectionHeader title="Suggested for you" sub={`Common ${pet.species.toLowerCase()} routines you have not added yet`} />
          <View style={{ gap: 10 }}>
            {ideas.map(idea => (
              <Pressable
                key={idea.id}
                onPress={() =>
                  guard('reminder', () =>
                    void app.saveReminder({
                      title: idea.title,
                      category: idea.category,
                      time: idea.time,
                      recurrence: idea.recurrence,
                      durationMinutes: idea.durationMinutes,
                      startDate: dateKey(),
                    }),
                  )
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: radius.lg,
                  backgroundColor: p.surfaceSoft,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: p.mute,
                }}
              >
                <Text style={{ fontSize: 20 }}>{CATEGORY_EMOJI[idea.category]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={type('captionMd', p.ink)}>{idea.title}</Text>
                  <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
                    {formatTime(idea.time)} · {formatRecurrence(idea.recurrence).toLowerCase()}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={p.primary} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      <PawButton label="Add a care task" icon="add" onPress={() => guard('reminder', onAdd)} style={{ marginTop: space.lg }} />
      {!app.pro && (
        <Text style={[type('captionXs', p.mute), { textAlign: 'center', marginTop: 10 }]}>
          {quota.used} of {quota.limit} free reminders used · Pro removes the cap
        </Text>
      )}
    </View>
  );
}
