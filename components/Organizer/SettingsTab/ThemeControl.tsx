import { useContext, useState } from 'react';
import styles from '../../../styles/ThemeControl.module.css';
import { themeConstants } from '../../../theme/theme';
import { AccentColor, Theme, ThemeContext, getBaseColor } from '../../../theme/themeProvider';
import { useSWRConfig } from 'swr';

const ThemeControl = () => {
	const { baseTheme, setBaseTheme, accentColor, setAccentColor } = useContext(ThemeContext);
	const [changeThemeLoading, setChangeThemeLoading] = useState(false);

	const { mutate } = useSWRConfig();

	const [accentColorSelection, setAccentColorSelection] = useState<AccentColor>(accentColor);
	const [previousAccentColor, setPreviousAccentColor] = useState<AccentColor>(accentColor);
	const [_, setBaseThemeSelection] = useState<Theme>(baseTheme);

	const handleSetBaseTheme = async (baseTheme: Theme) => {
		// Prevent multiple requests
		if (changeThemeLoading) return;

		// Set the new base theme
		setBaseTheme(baseTheme);
		setBaseThemeSelection(baseTheme);
		setChangeThemeLoading(true);

		// Send the request to the server to update the theme
		const res = await fetch(`/api/theme`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ baseTheme, accentColor: accentColor }),
		});

		// Handle the response
		setChangeThemeLoading(false);
		if (res.ok) {
			// Update the theme
			mutate('/api/theme');
		} else {
			// Revert the theme if the request failed
			setBaseTheme(baseTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
			setBaseThemeSelection(baseTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
		}
	};

	const handleSetAccentColor = async (accentColor: AccentColor) => {
		// Prevent multiple requests
		if (changeThemeLoading) return;

		// Set the new accent color and save the previous one
		setPreviousAccentColor(accentColorSelection);
		setChangeThemeLoading(true);
		setAccentColor(accentColor);
		setAccentColorSelection(accentColor);

		// Send the request to the server to update the theme
		const res = await fetch(`/api/theme`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ baseTheme: baseTheme, accentColor }),
		});

		// Handle the response
		setChangeThemeLoading(false);
		if (res.ok) {
			// Update the theme
			mutate('/api/theme');
		} else {
			// Revert the theme if the request failed
			setAccentColor(previousAccentColor);
			setAccentColorSelection(previousAccentColor);
		}
	};

	const accentColors = [
		{
			name: AccentColor.BLUE,
			color: themeConstants.accent.blue,
		},
		{
			name: AccentColor.GREEN,
			color: themeConstants.accent.green,
		},
		{
			name: AccentColor.ORANGE,
			color: themeConstants.accent.orange,
		},
		{
			name: AccentColor.PINK,
			color: themeConstants.accent.pink,
		},
		{
			name: AccentColor.YELLOW,
			color: themeConstants.accent.yellow,
		},
		{
			name: AccentColor.MONOCHROME,
			color: baseTheme === Theme.DARK ? themeConstants.accent.white : themeConstants.accent.darkGrey,
		},
	];
	return (
		<div>
			<div style={{ color: getBaseColor(baseTheme) }}>Theme</div>
			<label className={styles['switch']}>
				<input
					disabled={changeThemeLoading}
					type={'checkbox'}
					defaultChecked={baseTheme === Theme.DARK}
					onChange={() => handleSetBaseTheme(baseTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
				/>
				<span className={styles['slider'] + ' ' + styles['round']}></span>
			</label>
			<div style={{ color: getBaseColor(baseTheme) }}>Accent Color</div>
			<div className={styles['accentColorContainer']}>
				{accentColors.map((accentColor, index) => {
					return (
						<div
							key={index}
							style={{ backgroundColor: accentColor.color }}
							className={
								accentColor.name === accentColorSelection
									? styles['accentColorSelected']
									: styles['accentColor']
							}
							onClick={() => handleSetAccentColor(accentColor.name)}
						/>
					);
				})}
			</div>
			{changeThemeLoading && (
				<div
					style={{
						color: getBaseColor(baseTheme),
					}}>
					Changing theme...
				</div>
			)}
		</div>
	);
};

export default ThemeControl;
