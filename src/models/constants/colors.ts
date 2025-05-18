import {
	MaterialDynamicColors,
	SchemeContent,
	SchemeExpressive,
	SchemeFidelity,
	SchemeFruitSalad,
	SchemeMonochrome,
	SchemeNeutral,
	SchemeRainbow,
	SchemeTonalSpot,
	SchemeVibrant,
} from '@material/material-color-utilities';
import { IScheme } from '../interfaces/Scheme';

export const colors: (keyof typeof MaterialDynamicColors)[] = [
	'primary',
	'onPrimary',
	'primaryContainer',
	'onPrimaryContainer',
	'primaryPaletteKeyColor',
	'inversePrimary',
	'primaryFixed',
	'primaryFixedDim',
	'onPrimaryFixed',
	'onPrimaryFixedVariant',
	'secondary',
	'onSecondary',
	'secondaryContainer',
	'onSecondaryContainer',
	'secondaryPaletteKeyColor',
	'secondaryFixed',
	'secondaryFixedDim',
	'onSecondaryFixed',
	'onSecondaryFixedVariant',
	'tertiary',
	'onTertiary',
	'tertiaryContainer',
	'onTertiaryContainer',
	'tertiaryPaletteKeyColor',
	'tertiaryFixed',
	'tertiaryFixedDim',
	'onTertiaryFixed',
	'onTertiaryFixedVariant',
	'neutralPaletteKeyColor',
	'neutralVariantPaletteKeyColor',
	'error',
	'onError',
	'errorContainer',
	'onErrorContainer',
	'surface',
	'onSurface',
	'surfaceVariant',
	'onSurfaceVariant',
	'surfaceDim',
	'surfaceBright',
	'surfaceContainerLowest',
	'surfaceContainerLow',
	'surfaceContainer',
	'surfaceContainerHigh',
	'surfaceContainerHighest',
	'inverseSurface',
	'inverseOnSurface',
	'surfaceTint',
	'outline',
	'outlineVariant',
	'shadow',
	'scrim',
];

export const schemes: IScheme[] = [
	{
		value: 'tonalspot',
		label: 'Tonal Spot',
		class: SchemeTonalSpot,
	},
	{
		value: 'content',
		label: 'Content',
		class: SchemeContent,
	},
	{
		value: 'fidelity',
		label: 'Fidelity',
		class: SchemeFidelity,
	},
	{
		value: 'expressive',
		label: 'Expressive',
		class: SchemeExpressive,
	},
	{
		value: 'fruitsalad',
		label: 'Fruit Salad',
		class: SchemeFruitSalad,
	},
	{
		value: 'rainbow',
		label: 'Rainbow',
		class: SchemeRainbow,
	},
	{
		value: 'vibrant',
		label: 'Vibrant',
		class: SchemeVibrant,
	},
	{
		value: 'neutral',
		label: 'Neutral',
		class: SchemeNeutral,
	},
	{
		value: 'monochrome',
		label: 'Monochrome',
		class: SchemeMonochrome,
	},
];

export const logStyles = () => {
	const html = document.querySelector('html') as HTMLElement;
	const background =
		html.style.getPropertyValue('--md-sys-color-primary-light') ??
		'#4c5c92';
	const color =
		html.style.getPropertyValue('--md-sys-color-on-primary-light') ??
		'#ffffff';
	return `color: ${color}; background: ${background}; font-weight: bold; border-radius: 32px; padding: 0 8px;`;
};
