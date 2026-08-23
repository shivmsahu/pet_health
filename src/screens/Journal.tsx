import React, { useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { JournalMoment, MOODS, Mood, formatDate } from '../domain';
import { usage } from '../pro';
import { radius, space, type } from '../theme';
import { Card, Chip, ChipRow, EmptyState, PawButton, SectionHeader, Subtitle, Text, Title } from '../ui';

export function Journal({ onAdd, onEdit }: { onAdd: () => void; onEdit: (moment: JournalMoment) => void }) {
  const app = useApp();
  const { state, palette: p, pet, today, guard } = app;
  const [filter, setFilter] = useState<Mood | 'all'>('all');
  if (!pet) return null;

  const all = state.moments.filter(moment => moment.petId === pet.id).sort((a, b) => b.date.localeCompare(a.date));
  const moments = filter === 'all' ? all : all.filter(moment => moment.mood === filter);
  const quota = usage(state, 'moment');

  // "On this day" — the same calendar day in an earlier year.
  const onThisDay = all.filter(moment => moment.date.slice(5) === today.slice(5) && moment.date.slice(0, 4) !== today.slice(0, 4));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Title>Little moments</Title>
          <Subtitle style={{ marginTop: 4 }}>{pet.name}'s scrapbook of happy days.</Subtitle>
        </View>
        <Pressable
          accessibilityLabel="Add a moment"
          onPress={() => guard('moment', onAdd)}
          style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: p.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="add" size={24} color={p.onPrimary} />
        </Pressable>
      </View>

      {!!onThisDay.length && (
        <Card tint={p.accentPurpleSoft} style={{ marginTop: space.md, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>{'\u{1F570}'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={type('captionMd', p.ink)}>On this day</Text>
            <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
              {onThisDay[0].title} — {formatDate(onThisDay[0].date, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </Card>
      )}

      {all.length > 2 && (
        <View style={{ marginTop: space.md }}>
          <ChipRow>
            <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
            {MOODS.filter(mood => all.some(moment => moment.mood === mood.mood)).map(mood => (
              <Chip key={mood.mood} label={mood.label} emoji={mood.emoji} selected={filter === mood.mood} onPress={() => setFilter(mood.mood)} />
            ))}
          </ChipRow>
        </View>
      )}

      {moments.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: space.md }}>
          {moments.map(moment => {
            const mood = MOODS.find(item => item.mood === moment.mood);
            return (
              <Pressable
                key={moment.id}
                onPress={() => onEdit(moment)}
                onLongPress={() =>
                  Alert.alert(moment.title, 'Manage this moment.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Edit', onPress: () => onEdit(moment) },
                    { text: 'Delete', style: 'destructive', onPress: () => app.removeMoment(moment.id) },
                  ])
                }
                style={{
                  width: '47.5%',
                  flexGrow: 1,
                  backgroundColor: p.surfaceCard,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: p.hairline,
                  overflow: 'hidden',
                }}
              >
                <View style={{ height: 108, backgroundColor: p.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                  {moment.photoUri ? (
                    <Image source={{ uri: moment.photoUri }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={{ fontSize: 34 }}>{mood?.emoji ?? '\u{1F43E}'}</Text>
                  )}
                </View>
                <View style={{ padding: 12 }}>
                  <Text numberOfLines={1} style={type('buttonMd', p.ink)}>
                    {moment.title}
                  </Text>
                  {!!moment.note && (
                    <Text numberOfLines={2} style={[type('captionXs', p.body), { marginTop: 3 }]}>
                      {moment.note}
                    </Text>
                  )}
                  <Text style={[type('utilityXs', p.mute), { marginTop: 6 }]}>
                    {mood ? `${mood.emoji} · ` : ''}
                    {formatDate(moment.date)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Card style={{ marginTop: space.md }}>
          <EmptyState
            emoji={'\u{1F4F8}'}
            title={filter === 'all' ? 'The scrapbook is empty' : 'Nothing with that mood yet'}
            body={
              filter === 'all'
                ? `A nap in a sunbeam, a first swim, the silly face. Save one now and future you will be grateful.`
                : 'Try another mood filter, or add a new moment.'
            }
            action={filter === 'all' ? 'Save the first moment' : undefined}
            onPress={() => guard('moment', onAdd)}
          />
        </Card>
      )}

      <PawButton label="Add a little moment" icon="camera" onPress={() => guard('moment', onAdd)} style={{ marginTop: space.lg }} variant="soft" />
      {!app.pro && (
        <Text style={[type('captionXs', p.mute), { textAlign: 'center', marginTop: 10 }]}>
          {quota.used} of {quota.limit} free moments saved · Pro keeps every one
        </Text>
      )}
    </View>
  );
}
