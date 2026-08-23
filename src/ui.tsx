/**
 * Pawday's component kit, implementing DESIGN.md.
 *
 * House rules enforced here so call sites cannot drift:
 * - cards are white on cream with a 1px olive hairline and no shadow
 * - radii live in the 4-8px band; only chips and the nav CTA go fully round
 * - every text role resolves through `type()`, so hierarchy is weight-and-size
 * - the saturated primary is reserved for primary actions, one per fold
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_FAMILIES, Palette, radius, space, type } from './theme';
import { useApp, useTheme } from './AppContext';


/**
 * React Native selects a font file per weight rather than synthesising one, so
 * a bare `fontWeight` would silently fall back to the system face. This wrapper
 * resolves the weight to the matching IBM Plex cut, which upgrades every call
 * site without each one having to name a family.
 */
export function Text({ style, ...rest }: React.ComponentProps<typeof RNText>) {
  const flat = StyleSheet.flatten(style) as { fontFamily?: string; fontWeight?: string | number } | undefined;
  const weight = Number(flat?.fontWeight) || 400;
  const family =
    flat?.fontFamily ??
    (weight >= 700 ? FONT_FAMILIES[700] : weight >= 600 ? FONT_FAMILIES[600] : weight >= 500 ? FONT_FAMILIES[500] : FONT_FAMILIES[400]);
  return <RNText {...rest} style={[style, { fontFamily: family, fontWeight: undefined }]} />;
}

/* --------------------------------------------------------------- typography */

export function Title({ children, style }: { children: React.ReactNode; style?: any }) {
  const p = useTheme();
  return <Text style={[type('displayLg', p.ink), style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: any }) {
  const p = useTheme();
  return <Text style={[type('bodySm', p.body), style]}>{children}</Text>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const p = useTheme();
  return <Text style={type('utilityXs', p.mute)}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  const p = useTheme();
  return <Text style={[type('utilityXs', p.mute), { marginBottom: space.sm, marginTop: space.lg }]}>{children}</Text>;
}

/* -------------------------------------------------------------- containers */

/** `product-card`: white on cream, 1px hairline, 6px radius, 24px padding. */
export function Card({
  children,
  style,
  tint,
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  tint?: string;
  padded?: boolean;
}) {
  const p = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tint ?? p.surfaceCard,
          borderRadius: radius.md,
          padding: padded ? space.xl : 0,
          borderWidth: 1,
          borderColor: p.hairline,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * `banner-tip-*`: the four-colour callout family. Soft tinted panel, emoji
 * prefix, ink body copy — the system's vocabulary for inline tips and warnings.
 */
export function Callout({
  tone,
  emoji,
  title,
  body,
  action,
  onAction,
  onDismiss,
}: {
  tone: 'info' | 'warn' | 'success' | 'note';
  emoji: string;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}) {
  const p = useTheme();
  const fill = {
    info: p.accentBlueSoft,
    warn: p.accentRedSoft,
    success: p.accentGreenSoft,
    note: p.accentPurpleSoft,
  }[tone];
  return (
    <View style={{ backgroundColor: fill, borderRadius: radius.md, paddingVertical: space.lg, paddingHorizontal: space.xl - 4, flexDirection: 'row', gap: space.md }}>
      <Text style={{ fontSize: 16, lineHeight: 24 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={type('bodySmStrong', p.ink)}>{title}</Text>
        {!!body && <Text style={[type('bodySm', p.charcoal), { marginTop: 2 }]}>{body}</Text>}
        {!!action && (
          <Pressable onPress={onAction} style={{ marginTop: space.sm }} hitSlop={6}>
            <Text style={type('bodySmStrong', p.linkTeal)}>{action} →</Text>
          </Pressable>
        )}
      </View>
      {!!onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={10} accessibilityLabel="Dismiss">
          <Ionicons name="close" size={15} color={p.mute} />
        </Pressable>
      )}
    </View>
  );
}

export function SectionHeader({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  const p = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space.xxl, marginBottom: space.md }}>
      <View style={{ flex: 1, paddingRight: space.sm }}>
        <Text style={type('headingMd', p.ink)}>{title}</Text>
        {!!sub && <Text style={[type('captionSm', p.mute), { marginTop: 2 }]}>{sub}</Text>}
      </View>
      {!!action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={type('buttonMd', p.linkTeal)}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ----------------------------------------------------------------- buttons */

/**
 * `button-primary` / `-secondary` / `-tertiary`. 40px tall, 6px radius, and a
 * pressed state carried by colour rather than motion, per the system.
 */
export function PawButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}) {
  const p = useTheme();
  const [pressed, setPressed] = useState(false);

  const skin = {
    primary: { bg: pressed ? p.primaryPressed : p.primary, fg: p.onPrimary, border: pressed ? p.primaryPressed : p.primary },
    soft: { bg: p.surfaceSoft, fg: p.ink, border: p.hairline },
    ghost: { bg: 'transparent', fg: p.ink, border: 'transparent' },
    danger: { bg: p.accentRedSoft, fg: p.accentRed, border: p.accentRedSoft },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      style={[
        {
          backgroundColor: disabled ? p.surfaceSoft : skin.bg,
          borderColor: disabled ? p.hairline : skin.border,
          borderWidth: 1,
          borderRadius: radius.md,
          height: small ? 32 : 40,
          paddingHorizontal: small ? space.md : space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.sm,
        },
        style as ViewStyle,
      ]}
    >
      {!!icon && <Ionicons name={icon} size={small ? 14 : 16} color={disabled ? p.ash : skin.fg} />}
      <Text style={type(small ? 'buttonSm' : 'buttonMd', disabled ? p.ash : skin.fg)}>{label}</Text>
    </Pressable>
  );
}

/** `pill-tab`: flips fully inverted to ink-on-white when selected. */
export function Chip({
  label,
  selected,
  onPress,
  emoji,
  locked,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  emoji?: string;
  locked?: boolean;
}) {
  const p = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: space.sm - 1,
        paddingHorizontal: space.lg - 2,
        borderRadius: radius.pill,
        backgroundColor: selected ? p.ink : 'transparent',
        borderWidth: 1,
        borderColor: selected ? p.ink : p.hairline,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs + 2,
      }}
    >
      {!!emoji && <Text style={{ fontSize: 13 }}>{emoji}</Text>}
      <Text style={type('buttonSm', selected ? p.onDark : p.body)}>{label}</Text>
      {locked && <Ionicons name="lock-closed" size={11} color={selected ? p.onDark : p.mute} />}
    </Pressable>
  );
}

/** `badge-promo`: small inline pill. Kept off the primary so it never reads as a CTA. */
export function ProBadge({ label = 'PRO' }: { label?: string }) {
  const p = useTheme();
  return (
    <View style={{ backgroundColor: p.accentBlueSoft, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 }}>
      <Text style={type('captionXs', p.accentBlue)}>{label}</Text>
    </View>
  );
}

/* ---------------------------------------------------------------- progress */

export function ProgressBar({ percent, color, height = 8, track }: { percent: number; color?: string; height?: number; track?: string }) {
  const p = useTheme();
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, { toValue: Math.max(0, Math.min(1, percent)), duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [percent, width]);
  return (
    <View style={{ height, borderRadius: radius.sm, backgroundColor: track ?? p.surfaceSoft, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: radius.sm,
          backgroundColor: color ?? p.primary,
          width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

/** Bar chart built from plain views — no chart dependency, no shadow. */
export function Sparkbars({ values, color, height = 56, labels }: { values: number[]; color?: string; height?: number; labels?: string[] }) {
  const p = useTheme();
  const max = Math.max(1, ...values);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.xs + 2, height }}>
        {values.map((value, index) => (
          <View key={index} style={{ flex: 1, justifyContent: 'flex-end', height: '100%' }}>
            <View
              style={{
                height: `${Math.max(4, (value / max) * 100)}%`,
                borderRadius: radius.sm,
                backgroundColor: value > 0 ? color ?? p.accentBlue : p.surfaceSoft,
                opacity: value > 0 ? 0.5 + 0.5 * (value / max) : 1,
              }}
            />
          </View>
        ))}
      </View>
      {!!labels && (
        <View style={{ flexDirection: 'row', gap: space.xs + 2, marginTop: space.sm }}>
          {labels.map((label, index) => (
            <Text key={index} style={[type('captionXs', p.stone), { flex: 1, textAlign: 'center' }]}>
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export function StatTile({ emoji, value, label, tint }: { emoji: string; value: string; label: string; tint?: string }) {
  const p = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tint ?? p.surfaceDoc,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: p.hairlineSoft,
        paddingVertical: space.md,
        paddingHorizontal: space.sm,
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={[type('headingMd', p.ink), { fontVariant: ['tabular-nums'] }]}>{value}</Text>
      <Text style={[type('captionSm', p.mute), { textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------ empty states */

export function EmptyState({
  emoji,
  title,
  body,
  action,
  onPress,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
}) {
  const p = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.sm }}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Text style={[type('headingSmMixed', p.ink), { marginTop: space.md, textAlign: 'center' }]}>{title}</Text>
      <Text style={[type('bodySm', p.body), { marginTop: space.xs + 2, textAlign: 'center', maxWidth: 320 }]}>{body}</Text>
      {!!action && !!onPress && <PawButton label={action} onPress={onPress} style={{ marginTop: space.lg }} />}
    </View>
  );
}

export function Loading() {
  const p = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: p.canvas, gap: space.md }}>
      <Text style={{ fontSize: 40 }}>{'\u{1F43E}'}</Text>
      <ActivityIndicator color={p.primary} />
      <Text style={type('bodySm', p.body)}>Waking up Pawday…</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ sheets */

export function Sheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const p = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35,37,29,0.42)' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={{
            backgroundColor: p.canvas,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            borderTopWidth: 1,
            borderColor: p.hairline,
            paddingHorizontal: space.xl,
            paddingTop: space.md,
            paddingBottom: space.xxl,
            maxHeight: '90%',
            width: '100%',
            maxWidth: 560,
            alignSelf: 'center',
          }}
        >
          <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: radius.sm, backgroundColor: p.hairline, marginBottom: space.lg }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: p.hairlineSoft }}>
            <Text style={type('headingLg', p.ink)}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={p.mute} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** `text-input`: white, 1px hairline, 6px radius, blue focus border. */
export function Field({
  value,
  onChange,
  placeholder,
  keyboardType,
  multiline,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'phone-pad';
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const p = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      placeholderTextColor={p.ash}
      keyboardType={keyboardType}
      multiline={multiline}
      autoFocus={autoFocus}
      style={[
        type('bodyMd', p.ink),
        {
          backgroundColor: p.surfaceCard,
          borderRadius: radius.md,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? p.accentBlue : p.hairline,
          paddingHorizontal: space.md,
          paddingVertical: space.sm + (focused ? 1 : 2),
          minHeight: multiline ? 88 : 40,
          textAlignVertical: multiline ? 'top' : 'center',
        },
      ]}
    />
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{children}</View>;
}

/* ------------------------------------------------------------------ toasts */

export function ToastHost() {
  const { toasts, dismissToast, palette: p } = useApp();
  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: space.md, left: 0, right: 0, alignItems: 'center', gap: space.sm }}>
      {toasts.map(toast => (
        <ToastCard key={toast.id} emoji={toast.emoji} title={toast.title} body={toast.body} palette={p} onPress={() => dismissToast(toast.id)} />
      ))}
    </View>
  );
}

function ToastCard({
  emoji,
  title,
  body,
  palette,
  onPress,
}: {
  emoji: string;
  title: string;
  body?: string;
  palette: Palette;
  onPress: () => void;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter]);
  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
        width: '92%',
        maxWidth: 480,
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: palette.surfaceCard,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: palette.hairline,
          paddingVertical: space.md,
          paddingHorizontal: space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
        }}
      >
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={type('bodySmStrong', palette.ink)}>{title}</Text>
          {!!body && <Text style={type('captionSm', palette.mute)}>{body}</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Mild entrance for a freshly unlocked item. */
export function Pop({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scale = useRef(new Animated.Value(0.88)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, friction: 7, tension: 140 }).start();
  }, [delay, scale]);
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

export const row: ViewStyle = { flexDirection: 'row', alignItems: 'center' };
export const uiStyles = StyleSheet.create({
  screenPad: { paddingHorizontal: space.xl, paddingBottom: 120, paddingTop: space.sm },
});
