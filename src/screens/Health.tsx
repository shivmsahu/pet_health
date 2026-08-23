import React from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import {
  daysBetween,
  expenseSummary,
  formatDate,
  formatWeight,
  toDisplayWeight,
  upcomingVaccinations,
  weightTrend,
} from '../domain';
import { FeatureKey, usage } from '../pro';
import { radius, space, type } from '../theme';
import { Card, EmptyState, PawButton, ProBadge, SectionHeader, Sparkbars, StatTile, Subtitle, Text, Title } from '../ui';

export type HealthForm = 'weight' | 'vaccination' | 'visit' | 'symptom' | 'expense';

export function Health({ onLog }: { onLog: (form: HealthForm) => void }) {
  const app = useApp();
  const { state, palette: p, pet, pro, today, guard } = app;
  if (!pet) return null;

  const unit = state.settings.weightUnit;
  const { entries, changeKg, direction } = weightTrend(state.weights, pet.id);
  const latest = entries[entries.length - 1];
  const shots = state.vaccinations.filter(item => item.petId === pet.id).sort((a, b) => (b.dueDate ?? b.givenDate).localeCompare(a.dueDate ?? a.givenDate));
  const due = upcomingVaccinations(state.vaccinations, pet.id, 60, today);
  const visits = state.visits.filter(item => item.petId === pet.id).sort((a, b) => b.date.localeCompare(a.date));
  const symptoms = state.symptoms.filter(item => item.petId === pet.id).sort((a, b) => b.date.localeCompare(a.date));
  const spend = expenseSummary(state.expenses, pet.id, 30, today);
  const weightQuota = usage(state, 'weight');

  return (
    <View>
      <Title>Health vault</Title>
      <Subtitle style={{ marginTop: 4 }}>Everything a vet might ask, in one place.</Subtitle>

      {!!due.length && (
        <Card tint={due[0].inDays < 0 ? p.accentRedSoft : p.accentBlueSoft} style={{ marginTop: space.md, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>{due[0].inDays < 0 ? '\u{1F6A8}' : '\u{1F489}'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={type('captionMd', p.ink)}>{due[0].shot.name}</Text>
            <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
              {due[0].inDays < 0
                ? `Overdue by ${Math.abs(due[0].inDays)} day${Math.abs(due[0].inDays) === 1 ? '' : 's'}`
                : `Due in ${due[0].inDays} day${due[0].inDays === 1 ? '' : 's'} · ${formatDate(due[0].shot.dueDate as string)}`}
            </Text>
          </View>
        </Card>
      )}

      <SectionHeader title="Weight" sub={latest ? `Last logged ${formatDate(latest.date)}` : 'No weigh-ins yet'} action="Log" onAction={() => guard('weight', () => onLog('weight'))} />
      <Card>
        {entries.length ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
              <Text style={type('displayXl', p.ink)}>{formatWeight(latest.kg, unit)}</Text>
              {entries.length > 1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 7 }}>
                  <Ionicons
                    name={direction === 'up' ? 'trending-up' : direction === 'down' ? 'trending-down' : 'remove'}
                    size={16}
                    color={direction === 'flat' ? p.mute : p.primary}
                  />
                  <Text style={type('captionXs', p.body)}>
                    {changeKg > 0 ? '+' : ''}
                    {toDisplayWeight(changeKg, unit).toFixed(1)} {unit} overall
                  </Text>
                </View>
              )}
            </View>
            <Sparkbars
              values={entries.slice(-10).map(entry => entry.kg)}
              labels={entries.slice(-10).map(entry => formatDate(entry.date, { day: 'numeric' }))}
              color={p.accentBlue}
            />
            {!pro && (
              <Text style={[type('captionXs', p.mute), { marginTop: 12, textAlign: 'center' }]}>
                {weightQuota.used}/{weightQuota.limit} free weigh-ins · Pro keeps the full history
              </Text>
            )}
          </>
        ) : (
          <EmptyState
            emoji={'\u{2696}'}
            title="Start the weight chart"
            body="One number today makes every future change obvious — and vets always ask."
            action="Log first weight"
            onPress={() => guard('weight', () => onLog('weight'))}
          />
        )}
      </Card>

      <SectionHeader title="Vaccinations" sub="Keep the boosters honest" action="Add" onAction={() => guard('vaccination', () => onLog('vaccination'))} />
      {shots.length ? (
        <View style={{ gap: 10 }}>
          {shots.map(shot => {
            const inDays = shot.dueDate ? daysBetween(today, shot.dueDate) : undefined;
            return (
              <Pressable
                key={shot.id}
                onLongPress={() =>
                  Alert.alert(shot.name, 'Remove this record?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => app.removeRecord('vaccinations', shot.id) },
                  ])
                }
              >
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 20 }}>{'\u{1F489}'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={type('captionMd', p.ink)}>{shot.name}</Text>
                    <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
                      Given {formatDate(shot.givenDate)}
                      {shot.dueDate ? ` · next ${formatDate(shot.dueDate)}` : ''}
                    </Text>
                  </View>
                  {inDays !== undefined && (
                    <View
                      style={{
                        backgroundColor: inDays < 0 ? p.accentRedSoft : inDays < 30 ? p.accentBlueSoft : p.accentGreenSoft,
                        borderRadius: radius.pill,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={type('utilityXs', p.ink)}>
                        {inDays < 0 ? 'OVERDUE' : `${inDays}d`}
                      </Text>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Card>
          <EmptyState emoji={'\u{1F489}'} title="No vaccinations recorded" body="Add the last one you know about and Pawday will warn you before the next is due." action="Add a vaccination" onPress={() => guard('vaccination', () => onLog('vaccination'))} />
        </Card>
      )}

      <SectionHeader title="Vet visits" action={pro ? 'Add' : undefined} onAction={() => onLog('visit')} />
      {pro ? (
        visits.length ? (
          <View style={{ gap: 10 }}>
            {visits.map(visit => (
              <Pressable
                key={visit.id}
                onLongPress={() =>
                  Alert.alert(visit.reason, 'Remove this record?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => app.removeRecord('visits', visit.id) },
                  ])
                }
              >
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={type('captionMd', p.ink)}>{visit.reason}</Text>
                    <Text style={type('captionSm', p.mute)}>{formatDate(visit.date)}</Text>
                  </View>
                  {!!visit.diagnosis && <Text style={[type('captionSm', p.body), { marginTop: 4 }]}>{visit.diagnosis}</Text>}
                  {visit.cost !== undefined && (
                    <Text style={[type('captionXs', p.body), { marginTop: 4 }]}>
                      {state.settings.currency}
                      {visit.cost.toFixed(2)}
                    </Text>
                  )}
                </Card>
              </Pressable>
            ))}
          </View>
        ) : (
          <Card>
            <EmptyState emoji={'\u{1F3E5}'} title="No visits logged" body="Record what happened and what it cost, so the next appointment starts with facts." action="Add a visit" onPress={() => onLog('visit')} />
          </Card>
        )
      ) : (
        <LockedCard
          feature="health-vault"
          emoji={'\u{1F3E5}'}
          title="Vet visit history"
          body="Reasons, diagnoses and costs, kept in order. Part of Pawday Pro."
        />
      )}

      <SectionHeader title="Symptoms" action={pro ? 'Add' : undefined} onAction={() => onLog('symptom')} />
      {pro ? (
        symptoms.length ? (
          <View style={{ gap: 10 }}>
            {symptoms.slice(0, 8).map(entry => (
              <Card key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 18 }}>{entry.severity === 3 ? '\u{1F534}' : entry.severity === 2 ? '\u{1F7E0}' : '\u{1F7E1}'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={type('captionMd', p.ink)}>{entry.symptom}</Text>
                  {!!entry.notes && <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>{entry.notes}</Text>}
                </View>
                <Text style={type('captionSm', p.mute)}>{formatDate(entry.date)}</Text>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <EmptyState emoji={'\u{1F321}'} title="Nothing to report" body="Log a limp, an itch or an off day. Patterns are much easier to spot written down." action="Log a symptom" onPress={() => onLog('symptom')} />
          </Card>
        )
      ) : (
        <LockedCard feature="health-vault" emoji={'\u{1F321}'} title="Symptom tracking" body="Spot the pattern behind the off days before it becomes a problem." />
      )}

      <SectionHeader title="Spending" sub="Last 30 days" action={pro ? 'Add' : undefined} onAction={() => onLog('expense')} />
      {pro ? (
        <Card>
          {spend.count ? (
            <>
              <Text style={type('displayXl', p.ink)}>
                {state.settings.currency}
                {spend.total.toFixed(2)}
              </Text>
              <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>across {spend.count} entries</Text>
              <View style={{ gap: 8, marginTop: 14 }}>
                {spend.byCategory.map(row => (
                  <View key={row.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={[type('captionXs', p.body), { width: 84 }]}>{row.category}</Text>
                    <View style={{ flex: 1, height: 10, backgroundColor: p.surfaceSoft, borderRadius: radius.pill, overflow: 'hidden' }}>
                      <View style={{ width: `${(row.amount / spend.total) * 100}%`, height: '100%', backgroundColor: p.accentPurple }} />
                    </View>
                    <Text style={type('captionXs', p.ink)}>
                      {state.settings.currency}
                      {row.amount.toFixed(0)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <EmptyState emoji={'\u{1F4B8}'} title="No spending logged" body="Food, vet, insurance, toys — see where it actually goes each month." action="Add an expense" onPress={() => onLog('expense')} />
          )}
        </Card>
      ) : (
        <LockedCard feature="expenses" emoji={'\u{1F4B8}'} title="Pet spending" body="Track food, vet bills and insurance, broken down by category." />
      )}

      <SectionHeader title="Vet contact" />
      <Card>
        {pet.vetName || pet.vetPhone ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 22 }}>{'\u{1F3E5}'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={type('captionMd', p.ink)}>{pet.vetName || 'Your vet'}</Text>
              {!!pet.vetPhone && <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>{pet.vetPhone}</Text>}
            </View>
            {!!pet.vetPhone && (
              <PawButton small label="Call" icon="call" onPress={() => void Linking.openURL(`tel:${pet.vetPhone}`)} />
            )}
          </View>
        ) : (
          <Text style={type('captionSm', p.body)}>
            Add your vet's name and number in {pet.name}'s profile — it fills the sitter care card too.
          </Text>
        )}
      </Card>
    </View>
  );
}

export function LockedCard({ feature, emoji, title, body }: { feature: FeatureKey; emoji: string; title: string; body: string }) {
  const { palette: p, openPaywall } = useApp();
  return (
    <Pressable onPress={() => openPaywall(feature)}>
      <Card style={{ alignItems: 'center', paddingVertical: space.lg }} tint={p.surfaceSoft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 26, opacity: 0.7 }}>{emoji}</Text>
          <Ionicons name="lock-closed" size={16} color={p.mute} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Text style={type('bodySmStrong', p.ink)}>{title}</Text>
          <ProBadge />
        </View>
        <Text style={[type('captionSm', p.body), { marginTop: 5, textAlign: 'center', maxWidth: 280 }]}>{body}</Text>
        <PawButton small label="See what's in Pro" onPress={() => openPaywall(feature)} style={{ marginTop: 12 }} variant="soft" />
      </Card>
    </Pressable>
  );
}
