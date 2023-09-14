import { createContext, useContext, useState } from 'react';

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
	const [accentColor, setAccentColor] = useState<AccentColor>(AccentColor.BLUE);

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
export const useTheme = (className: string) => {
	const { baseTheme } = useContext(ThemeContext);
	return `${className}-${baseTheme === Theme.LIGHT ? 'light' : 'dark'}`;
};
