import { createContext, useState } from 'react';
import { themeConstants } from './theme';

// Base theme options
export enum Theme {
	LIGHT = 'l',
	DARK = 'd',
}

// Accent color options
export enum AccentColor {
	BLUE = 'b',
	GREEN = 'g',
	PINK = 'r',
	YELLOW = 'y',
	ORANGE = 'o',
	MONOCHROME = 'm',
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

// Create the wrapper for the theme context
export const ThemeProvider = ({ children }: { children: any }) => {
	const [baseTheme, setBaseTheme] = useState<Theme>(Theme.DARK);
	const [accentColor, setAccentColor] = useState<AccentColor>(AccentColor.ORANGE);

	const value = {
		baseTheme,
		setBaseTheme,
		accentColor,
		setAccentColor,
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Appends the theme to a css class name
 * @param className - the css class name
 * @example
 * ```tsx
 * 	<div className={styles[useTheme('organizerMain')]}>
 * ```
 */
export const getThemedClass = (className: string, baseTheme: Theme) => {
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
