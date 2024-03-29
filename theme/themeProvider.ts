import { createContext, useState } from 'react';
import { themeConstants } from './theme';

// Base theme options
export enum Theme {
	LIGHT = 'light',
	DARK = 'dark',
}

export type ThemedClass<ClassName extends string> = `${ClassName}-${Theme}`;

// Accent color options
export enum AccentColor {
	BLUE = 'blue',
	GREEN = 'green',
	PINK = 'pink',
	YELLOW = 'yellow',
	ORANGE = 'orange',
	MONOCHROME = 'monochrome',
}

// Theme context types
interface ThemeContextType {
	baseTheme: Theme;
	setBaseTheme: (theme: Theme) => void;
	accentColor: AccentColor;
	setAccentColor: (accentColor: AccentColor) => void;
}

// Create the context for the theme
export const ThemeContext = createContext<ThemeContextType>({
	baseTheme: Theme.DARK,
	setBaseTheme: (_: Theme) => {},
	accentColor: AccentColor.BLUE,
	setAccentColor: (_: AccentColor) => {},
});

/**
 * Appends the theme to a css class name
 * @param className - the css class name
 * @example
 * ```tsx
 * 	<div className={styles[useTheme('organizerMain')]}>
 * ```
 */
export const getThemedClass = <ClassName extends string>(
	className: ClassName,
	baseTheme: Theme
): ThemedClass<ClassName> => {
	return `${className}-${baseTheme === Theme.LIGHT ? 'light' : 'dark'}`;
};

/**
 * Returns the accent color hex code for a given accent color enum value
 * @param accentColor - the accent color enum value
 * @returns the hex code for the accent color
 *
 * @example
 * ```tsx
 * 	<div style={{ color: useAccentColor(AccentColor.BLUE) }}>Hello World</div>
 * ```
 */
export const getAccentColor = (accentColor: AccentColor, baseTheme: Theme) => {
	switch (accentColor) {
		case AccentColor.BLUE:
			return themeConstants.accent.blue;
		case AccentColor.GREEN:
			return themeConstants.accent.green;
		case AccentColor.PINK:
			return themeConstants.accent.pink;
		case AccentColor.YELLOW:
			return themeConstants.accent.yellow;
		case AccentColor.ORANGE:
			return themeConstants.accent.orange;
		case AccentColor.MONOCHROME:
			if (baseTheme === Theme.LIGHT) {
				return themeConstants.accent.darkGrey;
			} else {
				return themeConstants.accent.lightGrey;
			}
		default:
			return themeConstants.accent.blue;
	}
};

/**
 * Returns the base color hex code for a given base theme enum value
 *
 * @param baseTheme - the base theme enum value
 *
 * @example
 * ```tsx
 * 	<div style={{ backgroundColor: useBaseColor(Theme.LIGHT) }}>Hello World</div>
 * ```
 */
export const getBaseColor = (baseTheme: Theme) => {
	return baseTheme === Theme.LIGHT ? themeConstants.light.textColor : themeConstants.dark.textColor;
};
