import { elements } from '../../css';
import { THEME_NAME, THEME_TOKEN } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { getHomeAssistantMainAsync, querySelectorAsync } from '../async';
import { getEntityIdAndValue } from '../common';

// Theme check variables
let theme = '';
let shouldSetStyles = true;
const explicitlyStyledElements = [
	'home-assistant',
	'home-assistant-main',
	'ha-drawer',
];

/**
 * Check if theme is a "Material You" variant and set should set styles flag
 */
function checkTheme() {
	if (!theme) {
		const ha = document.querySelector('home-assistant') as HassElement;
		theme = ha?.hass?.themes?.theme;
		if (theme) {
			shouldSetStyles =
				theme.includes(THEME_NAME) &&
				(getEntityIdAndValue('styles').value || 'on') == 'on';
		}
	}
}

/**
 * Check if styles exist, returning them if they do
 * @param {HTMLElement} element
 * @returns {HTMLStyleElement}
 */
function hasStyles(element: HTMLElement): HTMLStyleElement {
	return element.shadowRoot?.getElementById(THEME_TOKEN) as HTMLStyleElement;
}

/**
 * Convert styles to string and add !important to all styles
 * @param {string} styles CSS styles imported from file
 * @returns {string} styles converted to string and all set to !important
 */
export function loadStyles(styles: string): string {
	// Ensure new styles override default styles
	let importantStyles = styles
		.toString()
		.replace(/ !important/g, '')
		.replace(/;/g, ' !important;');

	// Remove !important from keyframes
	// Initial check to avoid expensive regex for most user styles
	if (importantStyles.includes('@keyframes')) {
		const keyframeses = importantStyles.match(
			/@keyframes .*?\s{(.|\s)*?}\s}/g,
		);
		for (const keyframes of keyframeses ?? []) {
			importantStyles = importantStyles.replace(
				keyframes,
				keyframes.replace(/ !important/g, ''),
			);
		}
	}

	return importantStyles;
}

/**
 * Build styles tag textContent string from object
 * @param {Record<string, string>} styles
 * @returns {string}
 */
export function buildStylesString(styles: Record<string, string>): string {
	return `:host,html,body,ha-card{${loadStyles(
		Object.entries(styles)
			.map(([key, value]) => `${key}: ${value};`)
			.join('\n'),
	)}}`;
}

/**
 * Apply styles to custom elements
 * @param {HTMLElement} element
 */
function applyStylesToShadowRoot(element: HTMLElement) {
	checkTheme();
	const shadowRoot = element.shadowRoot;
	if (shouldSetStyles && shadowRoot && !hasStyles(element)) {
		applyStyles(
			shadowRoot,
			THEME_TOKEN,
			loadStyles(elements[element.nodeName.toLowerCase()]),
		);
	}
}

export function applyStyles(
	target: HTMLElement | ShadowRoot,
	id: string,
	styles: string,
) {
	target = (target as HTMLElement).shadowRoot || target;
	let style = target.querySelector(`#${id}`);
	if (!style) {
		style = document.createElement('style');
		style.id = id;
		target.appendChild(style);
	}
	style.textContent = styles;
}

const observeAll = {
	childList: true,
	subtree: true,
	characterData: true,
	attributes: true,
};

/**
 * Apply styles to custom elements when a mutation is observed and the shadow-root is present
 * @param {HTMLElement} element
 */
function observeThenApplyStyles(element: HTMLElement) {
	const observer = new MutationObserver(() => {
		if (hasStyles(element)) {
			// No need to continue observing
			observer.disconnect();
		} else if (element.shadowRoot) {
			if (element.shadowRoot.children.length) {
				// Shadow-root exists and is populated, apply styles
				applyStylesToShadowRoot(element);
				observer.disconnect();
			} else {
				// Shadow-root exists but is empty, observe it
				observer.observe(element.shadowRoot, observeAll);
			}
		}
	});
	observer.observe(element, observeAll);
}

/**
 * Apply styles to custom elements on a timeout
 * @param {HTMLElement} element
 * @param {number} ms
 */
function applyStylesOnTimeout(element: HTMLElement, ms: number = 10) {
	if (ms > 20000) {
		return;
	}

	if (!element.shadowRoot?.children.length && !hasStyles(element)) {
		setTimeout(() => applyStylesOnTimeout(element, ms * 2), ms);
		return;
	}

	applyStylesToShadowRoot(element);
}

/**
 * Explicitly apply styles to top level elements
 * @param {number} ms
 */
async function applyExplicitStyles(ms: number = 10) {
	if (ms > 20000) {
		return;
	}

	checkTheme();

	// Recall the function with a longer timeout
	if (!theme) {
		setTimeout(() => applyExplicitStyles(ms * 2), ms);
		return;
	}

	if (shouldSetStyles) {
		const haMain = await getHomeAssistantMainAsync();
		const ha = await querySelectorAsync(document, 'home-assistant');
		const haDrawer = await querySelectorAsync(
			haMain.shadowRoot as ShadowRoot,
			'ha-drawer',
		);
		applyStylesToShadowRoot(ha);
		applyStylesToShadowRoot(haMain);
		applyStylesToShadowRoot(haDrawer);
	}
}

/**
 * Modify targets custom element registry define function to intercept constructors to use custom styles
 * Style are redundantly added in multiple places to ensure speed and consistency
 * @param {typeof globalThis} target
 */
export async function setStyles(target: typeof globalThis) {
	// Patch custom elements registry define function to inject styles
	const define = target.CustomElementRegistry.prototype.define;
	target.CustomElementRegistry.prototype.define = function (
		name,
		constructor,
		options,
	) {
		if (elements[name] && !explicitlyStyledElements.includes(name)) {
			class PatchedElement extends constructor {
				constructor(...args: any[]) {
					super(...args);

					// Most efficient
					observeThenApplyStyles(this);

					// Most coverage
					applyStylesOnTimeout(this);
				}
			}

			constructor = PatchedElement;
		}

		return define.call(this, name, constructor, options);
	};

	// Explictly set styles for some elements that load too early
	applyExplicitStyles();
}
