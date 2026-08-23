import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { categoryBreakdown, completionTrend, formatDate, shiftDate } from '../domain';
import {
  AWARDS,
  COIN_COSTS,
  STICKERS,
  levelFromXp,
  questStatuses,
  stickerUnlocked,
  streakMultiplier,
  totalXp,
  totalsFor,
  weeklyChallenge,
} from '../game';
import { Palette, radius, space, type } from '../theme';
import { Card, EmptyState, PawButton, Pop, ProBadge, ProgressBar, SectionHeader, Sparkbars, StatTile, Subtitle, Text, Title } from '../ui';
import { Anim, Nudge } from '../motion';
import { LockedCard } from './Health';

export function Rewards() {
  const app = useApp();
  const { state, palette: p, pet, pro, today, streak, openPaywall } = app;
  if (!pet) return null;

  const xp = totalXp(state, today);
  const level = levelFromXp(xp);
  const totals = totalsFor(state, today);
  const quests = questStatuses(state, today);
  const weekly = weeklyChallenge(state, today);
  const trend = completionTrend(state.reminders, pet.id, 14, today);
  const breakdown = categoryBreakdown(state.reminders, pet.id, 30, today);
  const multiplier = streakMultiplier(streak);
  const yesterday = shiftDate(today, -1);
  const canFreezeYesterday = !state.game.frozenDates.includes(yesterday);

  return (
    <View>
      <Title>Rewards</Title>
      <Subtitle style={{ marginTop: 4 }}>Tiny wins, stacked up into a beautiful life together.</Subtitle>

      <Card style={{ marginTop: space.md, alignItems: 'center', paddingVertical: space.lg }} tint={p.surfaceDoc}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Anim name="trophy-sparkle" size={116} loop speed={0.7} tint={p.primary} style={{ position: 'absolute', opacity: 0.35 }} />
          <Nudge trigger={level.level} amount={0.3}>
            <Pop>
              <Text style={{ fontSize: 52 }}>{level.emoji}</Text>
            </Pop>
          </Nudge>
        </View>
        <Text style={[type('headingLg', p.ink), { marginTop: 6 }]}>
          Level {level.level} · {level.title}
        </Text>
        <Text style={[type('captionSm', p.body), { marginTop: 3 }]}>{xp.toLocaleString()} XP earned</Text>
        <View style={{ width: '100%', marginTop: 14 }}>
          <ProgressBar percent={level.percent} color={p.primary} track={p.surfaceCard} height={12} />
          <Text style={[type('captionXs', p.body), { marginTop: 7, textAlign: 'center' }]}>
            {level.maxed ? 'You have reached the top of the mountain.' : `${level.toNext} XP to level ${level.level + 1}`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' }}>
          <StatTile
            emoji={'\u{1F525}'}
            value={`${streak}`}
            label="day streak"
            tint={p.surfaceCard}
            icon={streak > 0 ? <Anim name="streak-flame" size={24} loop fallback={<Text style={{ fontSize: 18 }}>{'\u{1F525}'}</Text>} /> : undefined}
          />
          <StatTile emoji={'\u{26A1}'} value={`${multiplier}x`} label="XP streak bonus" tint={p.surfaceCard} />
          <StatTile emoji={'\u{1FA99}'} value={`${state.game.coins}`} label="paw coins" tint={p.surfaceCard} />
        </View>
      </Card>

      <SectionHeader title="Weekly challenge" sub="Resets every Monday" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 26 }}>{weekly.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={type('captionMd', p.ink)}>{weekly.title}</Text>
            <View style={{ marginTop: 8 }}>
              <ProgressBar percent={weekly.value / weekly.target} color={p.primary} />
            </View>
            <Text style={[type('captionXs', p.body), { marginTop: 6 }]}>
              {weekly.value}/{weekly.target} · reward +{weekly.xp} XP and {weekly.coins} coins
            </Text>
          </View>
          {weekly.claimed ? (
            <Ionicons name="checkmark-done-circle" size={26} color={p.accentGreen} />
          ) : (
            <PawButton small label="Claim" onPress={app.claimWeekly} disabled={!weekly.done} />
          )}
        </View>
      </Card>

      <SectionHeader title="Today's quests" sub={`${quests.filter(quest => quest.done).length} of ${quests.length} complete`} />
      <Card>
        <View style={{ gap: 12 }}>
          {quests.map(quest => (
            <View key={quest.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 19 }}>{quest.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type('buttonMd', p.ink)}>{quest.title}</Text>
                <Text style={[type('captionXs', p.mute), { marginTop: 2 }]}>
                  +{quest.xp} XP · +{Math.round(quest.coins * multiplier)} coins
                </Text>
              </View>
              {quest.claimed ? (
                <Ionicons name="checkmark-done-circle" size={22} color={p.accentGreen} />
              ) : (
                <PawButton small label={quest.done ? 'Claim' : `${quest.value}/${quest.target}`} onPress={() => app.claimQuest(quest.id)} disabled={!quest.done} variant={quest.done ? 'primary' : 'ghost'} />
              )}
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Paw coin shop" sub={`${state.game.coins} coins available`} />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 24 }}>{'\u{2744}'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={type('captionMd', p.ink)}>Streak freeze</Text>
            <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>
              You have {state.game.streakFreezes} · protects one missed day
            </Text>
          </View>
          <PawButton small label={`${COIN_COSTS.streakFreeze}`} icon="add" onPress={app.buyStreakFreeze} variant="soft" />
        </View>
        {state.game.streakFreezes > 0 && canFreezeYesterday && (
          <Pressable onPress={() => app.useStreakFreeze(yesterday)} style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.hairline }}>
            <Text style={type('buttonMd', p.primary)}>Use one on {formatDate(yesterday)} →</Text>
          </Pressable>
        )}
      </Card>

      <SectionHeader title="Sticker album" sub={`${STICKERS.filter(sticker => stickerUnlocked(sticker, totals)).length} of ${STICKERS.length} collected`} />
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {STICKERS.map(sticker => {
            const earned = stickerUnlocked(sticker, totals);
            const locked = sticker.pro && !pro;
            return (
              <Pressable
                key={sticker.id}
                onPress={() => (locked ? openPaywall('pro-stickers') : undefined)}
                style={{
                  width: 74,
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderRadius: radius.md,
                  backgroundColor: earned && !locked ? p.accentGreenSoft : p.surfaceSoft,
                  borderWidth: 1,
                  borderColor: earned && !locked ? p.accentGreen : p.hairline,
                }}
              >
                <Text style={{ fontSize: 26, opacity: earned && !locked ? 1 : 0.28 }}>{sticker.emoji}</Text>
                <Text numberOfLines={1} style={[type('utilityXs', p.body), { marginTop: 5 }]}>
                  {locked ? 'PRO' : earned ? sticker.name : '???'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[type('captionXs', p.mute), { marginTop: 12 }]}>
          Locked stickers show their hint when you get close — keep caring and they turn up.
        </Text>
      </Card>

      <SectionHeader title="Awards" sub={`${AWARDS.filter(award => award.unlocked(totals) && (!award.pro || pro)).length} of ${AWARDS.length} unlocked`} />
      <View style={{ gap: 10 }}>
        {AWARDS.map(award => {
          const locked = award.pro && !pro;
          const earned = award.unlocked(totals) && !locked;
          return (
            <Pressable key={award.id} onPress={() => (locked ? openPaywall('pro-stickers') : undefined)}>
              <Card
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: earned ? 1 : 0.72 }}
                tint={earned ? tierTint(award.tier, p) : p.surfaceCard}
              >
                <Text style={{ fontSize: 26, opacity: earned ? 1 : 0.35 }}>{award.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={type('captionMd', p.ink)}>{award.name}</Text>
                    {award.pro && <ProBadge />}
                  </View>
                  <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>{award.desc}</Text>
                </View>
                <Ionicons name={earned ? 'ribbon' : locked ? 'lock-closed' : 'ellipse-outline'} size={20} color={earned ? p.primary : p.mute} />
              </Card>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Care insights" sub="Last 14 days" />
      {pro ? (
        <Card>
          <Sparkbars values={trend.map(day => Math.round(day.percent * 100))} color={p.accentGreen} height={64} />
          <Text style={[type('captionSm', p.body), { marginTop: 10 }]}>
            {Math.round((trend.reduce((sum, day) => sum + day.percent, 0) / Math.max(1, trend.filter(day => day.total).length)) * 100)}% average completion
          </Text>
          {!!breakdown.length && (
            <View style={{ gap: 8, marginTop: 16 }}>
              <Text style={type('buttonMd', p.ink)}>Where the care goes</Text>
              {breakdown.slice(0, 5).map(row => (
                <View key={row.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={[type('captionXs', p.body), { width: 84 }]}>{row.category}</Text>
                  <View style={{ flex: 1, height: 10, backgroundColor: p.surfaceSoft, borderRadius: radius.pill, overflow: 'hidden' }}>
                    <View style={{ width: `${(row.count / breakdown[0].count) * 100}%`, height: '100%', backgroundColor: p.accentBlue }} />
                  </View>
                  <Text style={type('captionXs', p.ink)}>{row.count}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <StatTile emoji={'\u{2705}'} value={`${totals.tasks}`} label="tasks done" />
            <StatTile emoji={'\u{1F31F}'} value={`${totals.perfectDays}`} label="perfect days" />
            <StatTile emoji={'\u{1F4F8}'} value={`${totals.moments}`} label="moments" />
          </View>
        </Card>
      ) : (
        <LockedCard feature="insights" emoji={'\u{1F4C8}'} title="Care insights" body="Completion trends, category breakdowns and the habits that keep slipping." />
      )}
    </View>
  );
}

/** Award tiers borrow the callout pastels — soft fills, never the primary. */
function tierTint(tier: 'bronze' | 'silver' | 'gold', p: Palette) {
  return tier === 'gold' ? p.accentGreenSoft : tier === 'silver' ? p.accentBlueSoft : p.accentPurpleSoft;
}
