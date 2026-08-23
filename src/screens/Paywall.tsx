import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { FEATURE_COPY, PLANS, PRO_BULLETS } from '../pro';
import { THEMES, radius, space, type } from '../theme';
import { Card, PawButton, ProBadge, Text } from '../ui';

export function Paywall() {
  const { paywallFor, closePaywall, palette: p, startPro, pet } = useApp();
  const [plan, setPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const visible = paywallFor !== null;
  const highlighted = paywallFor ? FEATURE_COPY[paywallFor] : undefined;
  const chosen = PLANS.find(item => item.id === plan) ?? PLANS[1];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={closePaywall} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: p.canvas }}>
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable onPress={closePaywall} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close-circle" size={30} color={p.mute} />
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 56 }}>{'\u{1F31F}'}</Text>
            <Text style={[type('displayXl', p.ink), { marginTop: 8, textAlign: 'center' }]}>Pawday Pro</Text>
            <Text style={[type('bodyXs', p.body), { marginTop: 8, textAlign: 'center', maxWidth: 320 }]}>
              {highlighted
                ? `${highlighted.title} — ${highlighted.blurb}`
                : `Everything ${pet?.name ?? 'your pet'} needs, and everything you want to remember.`}
            </Text>
          </View>

          <Card style={{ marginTop: space.lg }}>
            {PRO_BULLETS.map((key, index) => {
              const copy = FEATURE_COPY[key];
              const isHighlight = key === paywallFor;
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'flex-start',
                    paddingVertical: 10,
                    borderTopWidth: index ? 1 : 0,
                    borderTopColor: p.hairline,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{copy.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={type('captionMd', p.ink)}>{copy.title}</Text>
                      {isHighlight && <ProBadge label="WHAT YOU WANTED" />}
                    </View>
                    <Text style={[type('captionSm', p.body), { marginTop: 2 }]}>{copy.blurb}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={19} color={p.accentGreen} />
                </View>
              );
            })}
          </Card>

          <Text style={[type('bodySmStrong', p.ink), { marginTop: space.lg, marginBottom: 10 }]}>Theme packs included</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {THEMES.map(theme => (
              <View
                key={theme.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: radius.pill,
                  backgroundColor: theme.canvas,
                  borderWidth: 1.5,
                  borderColor: theme.primary,
                }}
              >
                <Text>{theme.emoji}</Text>
                <Text style={type('captionXs', theme.ink)}>{theme.name}</Text>
              </View>
            ))}
          </View>

          <Text style={[type('bodySmStrong', p.ink), { marginTop: space.xl, marginBottom: 10 }]}>Choose your plan</Text>
          <View style={{ gap: 10 }}>
            {PLANS.map(option => {
              const active = option.id === plan;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setPlan(option.id)}
                  style={{
                    borderRadius: radius.lg,
                    borderWidth: 2,
                    borderColor: active ? p.primary : p.hairline,
                    backgroundColor: active ? p.surfaceSoft : p.surfaceCard,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? p.primary : p.mute} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={type('bodySmStrong', p.ink)}>{option.label}</Text>
                      {!!option.badge && <ProBadge label={option.badge} />}
                    </View>
                    <Text style={[type('captionSm', p.body), { marginTop: 3 }]}>{option.sub}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={type('headingMd', p.ink)}>{option.price}</Text>
                    {!!option.perMonth && <Text style={type('captionXs', p.mute)}>{option.perMonth}</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <PawButton
            label={chosen.trialDays ? `Start ${chosen.trialDays}-day free trial` : `Get Pro · ${chosen.price}`}
            icon="sparkles"
            onPress={() => startPro(chosen.id, chosen.trialDays)}
            style={{ marginTop: space.lg }}
          />
          <Text style={[type('captionXs', p.mute), { textAlign: 'center', marginTop: 12 }]}>
            {chosen.trialDays
              ? 'Cancel any time during the trial and you will not be charged.'
              : 'One tap to cancel from your store account. No ads, ever.'}
            {'\n'}Your pet data stays on your device either way.
          </Text>

          <Card style={{ marginTop: space.lg }} tint={p.surfaceSoft}>
            <Text style={type('buttonMd', p.ink)}>What stays free, forever</Text>
            <Text style={[type('captionSm', p.body), { marginTop: 6 }]}>
              One pet, six daily reminders, notifications, streaks, quests, awards, twenty scrapbook moments and eight weigh-ins. Looking after your
              pet is never behind a paywall.
            </Text>
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}
