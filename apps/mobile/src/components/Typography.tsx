/**
 * Typography components.
 *
 * All text in the app should use these components instead of
 * raw <Text>. This ensures consistent typography from the theme.
 */

import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type TypographyVariant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: TypographyProps) {
  const theme = useAppTheme();

  const variantStyles = getVariantStyles(theme, variant);
  const textColor = color ?? theme.colors.textPrimary;

  return (
    <Text
      style={[
        variantStyles,
        { color: textColor },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

function getVariantStyles(
  theme: ReturnType<typeof useAppTheme>,
  variant: TypographyVariant,
) {
  const { typography: t } = theme;

  switch (variant) {
    case 'display':
      return {
        fontSize: t.fontSize.display,
        lineHeight: t.lineHeight.display,
        fontWeight: t.fontWeight.bold,
        letterSpacing: t.letterSpacing.tight,
      };
    case 'heading1':
      return {
        fontSize: t.fontSize.xxxl,
        lineHeight: t.lineHeight.xxxl,
        fontWeight: t.fontWeight.bold,
        letterSpacing: t.letterSpacing.tight,
      };
    case 'heading2':
      return {
        fontSize: t.fontSize.xxl,
        lineHeight: t.lineHeight.xxl,
        fontWeight: t.fontWeight.semiBold,
      };
    case 'heading3':
      return {
        fontSize: t.fontSize.xl,
        lineHeight: t.lineHeight.xl,
        fontWeight: t.fontWeight.semiBold,
      };
    case 'body':
      return {
        fontSize: t.fontSize.md,
        lineHeight: t.lineHeight.md,
        fontWeight: t.fontWeight.regular,
      };
    case 'bodySmall':
      return {
        fontSize: t.fontSize.sm,
        lineHeight: t.lineHeight.sm,
        fontWeight: t.fontWeight.regular,
      };
    case 'caption':
      return {
        fontSize: t.fontSize.xs,
        lineHeight: t.lineHeight.xs,
        fontWeight: t.fontWeight.regular,
      };
    case 'label':
      return {
        fontSize: t.fontSize.sm,
        lineHeight: t.lineHeight.sm,
        fontWeight: t.fontWeight.medium,
        letterSpacing: t.letterSpacing.wide,
      };
  }
}
