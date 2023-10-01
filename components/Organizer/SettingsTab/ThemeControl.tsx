import { useContext, useState } from 'react';
import styles from '../../../styles/ThemeControl.module.css';
import { themeConstants } from '../../../theme/theme';
import { AccentColor, Theme, ThemeContext, getBaseColor } from '../../../theme/themeProvider';
import { set } from 'mongoose';

const ThemeControl = () => {
	const { baseTheme, setBaseTheme, accentColor, setAccentColor } = useContext(ThemeContext);

	const [accentColorSelection, setAccentColorSelection] = useState<AccentColor>(accentColor);
	const [_, setBaseThemeSelection] = useState<Theme>(baseTheme);

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
					type={'checkbox'}
					defaultChecked={baseTheme === Theme.DARK}
					onChange={() => {
						if (baseTheme === Theme.DARK) {
							setBaseTheme(Theme.LIGHT);
							setBaseThemeSelection(Theme.LIGHT);
						} else {
							setBaseTheme(Theme.DARK);
							setBaseThemeSelection(Theme.DARK);
						}
					}}
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
							onClick={() => {
								setAccentColor(accentColor.name);
								setAccentColorSelection(accentColor.name);
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default ThemeControl;
