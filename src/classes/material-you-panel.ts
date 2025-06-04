import {
	argbFromHex,
	blueFromArgb,
	greenFromArgb,
	redFromArgb,
} from '@material/material-color-utilities';
import { css, html, LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './disk-only-color-picker';

import packageInfo from '../../package.json';
import { schemes } from '../models/constants/colors';
import { HomeAssistant } from '../models/interfaces';
import { InputField, IUserPanelSettings } from '../models/interfaces/Panel';

import { inputs, THEME_NAME } from '../models/constants/inputs';
import { showToast } from '../utils/common';
import {
	createInput,
	deleteInput,
	handleConfirmation,
	updateInput,
} from '../utils/panel';

export class MaterialYouPanel extends LitElement {
	@property() hass!: HomeAssistant;
	@property() narrow!: boolean;
	@property() route!: object;
	@property() panel!: object;

	currentUserSettings!: IUserPanelSettings;
	globalSettings!: IUserPanelSettings;
	otherUserSettings: Record<string, IUserPanelSettings> = {};

	async handleDeleteHelpers(e: MouseEvent) {
		const userId = (e.target as HTMLElement).getAttribute('user-id');
		const idSuffix = userId ? `_${userId}` : '';

		if (
			!(await handleConfirmation(this, {
				text: 'Are you sure you want to delete these helpers?',
			}))
		) {
			return;
		}

		for (const field in inputs) {
			const entityId = `${inputs[field as InputField].input}${idSuffix}`;
			if (this.hass.states[entityId]) {
				await deleteInput(
					this.hass,
					inputs[field as InputField].type,
					entityId.split('.')[1],
				);
			}
		}

		let message = 'Global input entities cleared';
		if (userId) {
			let userName = '';
			if (userId == this.hass.user?.id) {
				userName = this.hass.user?.name ?? '';
			} else {
				userName =
					this.otherUserSettings[userId].stateObj?.attributes
						.friendly_name ?? '';
			}
			message = `Input entities cleared for ${userName}`;
		}
		showToast(this, message);
	}

	buildDeleteHelpersButton(userId?: string) {
		return html`
			<div
				class="delete button"
				user-id="${userId}"
				@click=${this.handleDeleteHelpers}
			>
				Delete Helpers
			</div>
		`;
	}

	async handleCreateHelpers(e: MouseEvent) {
		// User ID and name checks
		const userId = (e.target as HTMLElement).getAttribute('user-id');
		const idSuffix = userId ? `_${userId}` : '';
		let userName = '';
		if (userId) {
			if (this.hass.user?.id == userId) {
				userName =
					this.currentUserSettings.stateObj?.attributes
						.friendly_name ?? '';
			} else {
				userName =
					this.otherUserSettings[
						Object.keys(this.otherUserSettings).filter(
							(id) => userId == id,
						)[0]
					].stateObj?.attributes.friendly_name ?? '';
			}
			userName = ` ${userName}`;
		}

		// Base Color
		let entityId = `${inputs.base_color.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.base_color.icon,
				min: 0,
				max: 9,
			};
			await createInput(this.hass, 'text', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'text', id, {
				name: `${inputs.base_color.name}${userName}`,
				...config,
			});
			await this.hass.callService('input_text', 'set_value', {
				value: '',
				entity_id: entityId,
			});
		}

		// Scheme Name
		entityId = `${inputs.scheme.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.scheme.icon,
				options: [...schemes.map((scheme) => scheme.value), ' '],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.scheme.name}${userName}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: ' ',
				entity_id: entityId,
			});
		}

		// Contrast Level
		entityId = `${inputs.contrast.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.contrast.icon,
				min: -1,
				max: 1,
				step: 0.1,
			};
			await createInput(this.hass, 'number', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'number', id, {
				name: `${inputs.contrast.name}${userName}`,
				...config,
			});
			await this.hass.callService('input_number', 'set_value', {
				value: 0,
				entity_id: entityId,
			});
		}

		// Spec Version
		entityId = `${inputs.spec.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.spec.icon,
				options: ['2021', '2025', ' '],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.spec.name}${userName}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: ' ',
				entity_id: entityId,
			});
		}

		// Platform
		entityId = `${inputs.platform.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.platform.icon,
				options: ['phone', 'watch', ' '],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.platform.name}${userName}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: ' ',
				entity_id: entityId,
			});
		}

		// Styles
		entityId = `${inputs.styles.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.styles.icon,
			};
			await createInput(this.hass, 'boolean', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'boolean', id, {
				name: `${inputs.styles.name}${userName}`,
				...config,
			});
			await this.hass.callService('input_boolean', 'turn_on', {
				entity_id: entityId,
			});
		}

		let message = 'Global input entities created';
		if (userName) {
			message = `Input entities created for${userName}`;
		}
		showToast(this, message);
	}

	buildCreateHelpersButton(userId?: string) {
		return html`
			<div
				class="create button"
				user-id="${userId}"
				@click=${this.handleCreateHelpers}
			>
				Create Helpers
			</div>
		`;
	}

	getConfig(userId: string) {
		let config: IUserPanelSettings;
		if (userId) {
			if (userId == this.hass.user?.id) {
				config = this.currentUserSettings;
			} else {
				config = this.otherUserSettings[userId];
			}
		} else {
			config = this.globalSettings;
		}
		return config;
	}

	async handleSelectorChange(e: CustomEvent) {
		const userId = (e.target as HTMLElement).getAttribute('user-id');
		const field = (e.target as HTMLElement).getAttribute(
			'field',
		) as InputField;
		let value = e.detail.value;

		let [domain, service] = inputs[field].action.split('.');
		let data: Record<string, any> = {
			entity_id: `${inputs[field].input}${userId ? `_${userId}` : ''}`,
		};
		switch (field) {
			case 'base_color':
				// data.value = hexFromArgb(
				// 	argbFromRgb(value[0], value[1], value[2]),
				// );
				data.value = value || inputs.base_color.default;
				break;
			case 'scheme':
			case 'spec':
			case 'platform':
				data.option = value || ' ';
				break;
			case 'contrast':
				data.value = value || 0;
				break;
			case 'styles':
				value ??= true;
				service = `turn_${value ? 'on' : 'off'}`;
				break;
			default:
				break;
		}

		await this.hass.callService(domain, service, data);
		this.requestUpdate();
	}

	buildSelector(
		label: string,
		field: InputField,
		userId: string,
		selector: object,
		placeholder?: string | number | boolean | object,
	) {
		// https://github.com/home-assistant/frontend/tree/dev/src/components/ha-selector
		// https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts

		const config = this.getConfig(userId);
		let value: string | number | number[] | boolean;
		switch (field) {
			case 'base_color':
				let argb: number;
				try {
					argb = argbFromHex(config.settings[field] as string);
				} catch (e) {
					console.error(e);
					argb = argbFromHex(inputs.base_color.default as string);
				}
				value = [
					redFromArgb(argb),
					greenFromArgb(argb),
					blueFromArgb(argb),
				];
				break;
			case 'styles':
				value = config.settings[field] == 'on';
				break;
			case 'scheme':
			case 'spec':
			case 'platform':
			case 'contrast':
			default:
				value = config.settings[field] as string | number;
				if (value == ' ') {
					value = inputs[field].default;
				}
				break;
		}

		return html`<ha-selector
			.hass=${this.hass}
			.name="${label}"
			.selector=${selector}
			.value=${value ?? placeholder}
			.label="${label}"
			.placeholder=${placeholder}
			.required=${false}
			user-id="${userId}"
			field="${field}"
			@value-changed=${this.handleSelectorChange}
		></ha-selector>`;
	}

	async handleKeyDown(e: KeyboardEvent) {
		if (!e.repeat && ['Enter', ' '].includes(e.key)) {
			e.preventDefault();

			let handler: Function;
			const className = (e.target as HTMLElement).parentElement?.className
				.replace('button', '')
				.trim();
			switch (className) {
				case 'clear':
					handler = this.handleClearClick;
					break;
				case 'more-info':
				default:
					handler = this.handleMoreInfoClick;
					break;
			}

			handler.call(
				this,
				new window.MouseEvent('click', e),
				e.target as HTMLElement,
			);
		}
	}

	async handleClearClick(e: MouseEvent, target?: HTMLElement) {
		const userId = ((e.target as HTMLElement) ?? target).getAttribute(
			'user-id',
		);
		const field = ((e.target as HTMLElement) ?? target).getAttribute(
			'field',
		) as InputField;

		const [domain, service] = inputs[field].action.split('.');
		let data: Record<string, any> = {
			entity_id: `${inputs[field].input}${userId ? `_${userId}` : ''}`,
		};
		switch (field) {
			case 'base_color':
				data.value = '';
				break;
			case 'scheme':
			case 'spec':
			case 'platform':
				data.option = ' ';
				break;
			case 'contrast':
				data.value = 0;
				break;
			case 'styles':
			default:
				break;
		}

		await this.hass.callService(domain, service, data);
		this.requestUpdate();
	}

	buildClearButton(field: InputField, userId?: string) {
		return html`
			<div class="clear button">
				<ha-icon
					@click=${this.handleClearClick}
					@keydown=${this.handleKeyDown}
					tabindex="0"
					user-id="${userId}"
					field="${field}"
					.icon="${'mdi:close'}"
				></ha-icon>
			</div>
		`;
	}

	handleMoreInfoClick(e: MouseEvent, target: HTMLElement) {
		const userId = ((e.target as HTMLElement) || target).getAttribute(
			'user-id',
		);
		const field = ((e.target as HTMLElement) || target).getAttribute(
			'field',
		) as InputField;

		const entityId = `${inputs[field].input}${userId ? `_${userId}` : ''}`;
		const event = new Event('hass-more-info', {
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		event.detail = { entityId };
		this.dispatchEvent(event);
	}

	buildMoreInfoButton(field: InputField, userId?: string) {
		const entityId = `${inputs[field].input}${userId ? `_${userId}` : ''}`;
		const icon =
			this.hass.states[entityId].attributes.icon || inputs[field].icon;

		return html`
			<div class="more-info button">
				<ha-icon
					@click=${this.handleMoreInfoClick}
					@keydown=${this.handleKeyDown}
					tabindex="0"
					user-id="${userId}"
					field="${field}"
					.icon="${icon}"
				></ha-icon>
			</div>
		`;
	}

	buildSettingsDatum(userId?: string) {
		const settings: Record<string, string | number | undefined> = {};
		for (const field in inputs) {
			settings[field] =
				this.hass.states[
					`${inputs[field as InputField].input}${userId ? `_${userId}` : ''}`
				]?.state ||
				this.hass.states[inputs[field as InputField].input]?.state ||
				inputs[field as InputField].default;
		}
		const contrast = parseFloat(settings.contrast as string);
		if (isNaN(contrast)) {
			settings.contrast = inputs.contrast.default;
		} else {
			settings.contrast = Math.max(Math.min(contrast, 1), -1);
		}

		return settings;
	}

	buildSettingsData() {
		// People information
		const people = Object.keys(this.hass.states).filter(
			(entity) =>
				entity.startsWith('person.') &&
				this.hass.states[entity].attributes.user_id,
		);

		// Current user
		const currentUserId = this.hass.user?.id ?? '';
		this.currentUserSettings = {
			stateObj:
				this.hass.states[
					people.filter(
						(person) =>
							this.hass.states[person].attributes.user_id ==
							currentUserId,
					)[0]
				],
			settings: this.buildSettingsDatum(currentUserId),
		};

		// If admin, add global and all user settings
		if (this.hass.user?.is_admin) {
			this.globalSettings = { settings: this.buildSettingsDatum() };

			for (const person of people) {
				const userId = this.hass.states[person].attributes.user_id;
				if (userId != currentUserId) {
					this.otherUserSettings[userId] = {
						stateObj: this.hass.states[person],
						settings: this.buildSettingsDatum(userId),
					};
				}
			}
		}
	}

	buildHeader() {
		const moduleVersion = packageInfo.version;
		const themeVersion = this.hass.themes.themes[THEME_NAME]['version'];

		return html`<div class="header">
			<ha-menu-button
				slot="navigationIcon"
				.hass=${this.hass}
				.narrow=${this.narrow}
			></ha-menu-button>
			<div class="versions">
				<span class="version">Module v${moduleVersion}</span>
				<span class="version">Theme v${themeVersion}</span>
			</div>
		</div>`;
	}

	buildBaseColorRow(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;
		const input = `${inputs.base_color.input}${userId ? `_${userId}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('base_color', userId)}
					<disk-only-color-picker
						field="base_color"
						user-id="${userId}"
						value="${settings.settings.base_color ||
						inputs.base_color.default}"
						@value-changed=${this.handleSelectorChange}
					></disk-only-color-picker>
					<div class="column">
						<div class="label">Base Color</div>
						${this.buildClearButton('base_color', userId)}
						<div class="label secondary">
							${settings.settings.base_color ||
							inputs.base_color.default}
						</div>
					</div> `
			: '';
	}

	buildSchemeRow(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;
		const input = `${inputs.scheme.input}${userId ? `_${userId}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton(
					'scheme',
					userId,
				)}${this.buildSelector(
					'Scheme Name',
					'scheme',
					userId,
					{
						select: {
							mode: 'dropdown',
							options: schemes,
						},
					},
					inputs.scheme.default,
				)}`
			: '';
	}

	buildContrastRow(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;
		const input = `${inputs.contrast.input}${userId ? `_${userId}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton(
					'contrast',
					userId,
				)}${this.buildSelector(
					'Contrast Level',
					'contrast',
					userId,
					{
						number: {
							min: -1,
							max: 1,
							step:
								this.hass.states[input].attributes.step ?? 0.1,
							mode: 'slider',
							slider_ticks: true,
						},
					},
					inputs.contrast.default,
				)}`
			: '';
	}

	buildSpecRow(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;
		const input = `${inputs.spec.input}${userId ? `_${userId}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('spec', userId)}
				${this.buildSelector(
					'Specification Version',
					'spec',
					userId,
					{
						select: {
							mode: 'box',
							options: ['2021', '2025'],
						},
					},
					inputs.spec.default,
				)}${this.buildClearButton('spec', userId)}`
			: '';
	}

	buildPlatformRow(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;
		const input = `${inputs.platform.input}${userId ? `_${userId}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('platform', userId)}
				${this.buildSelector(
					'Platform',
					'platform',
					userId,
					{
						select: {
							mode: 'box',
							options: [
								{ value: 'phone', label: 'Phone' },
								{ value: 'watch', label: 'Watch' },
							],
						},
					},
					inputs.platform.default,
				)}${this.buildClearButton('platform', userId)}`
			: '';
	}

	buildStylesRow(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;
		const input = `${inputs.styles.input}${userId ? `_${userId}` : ''}`;

		return this.hass.states[input]
			? html`
					${this.buildMoreInfoButton('styles', userId)}
					${this.buildSelector(
						'Style Upgrades',
						'styles',
						userId,
						{
							boolean: {},
						},
						inputs.styles.default == 'on',
					)}
				`
			: '';
	}

	buildSettingsCard(settings: IUserPanelSettings) {
		const userId = settings.stateObj?.attributes.user_id;

		let title = 'Global';
		if (settings.stateObj) {
			title = settings.stateObj.attributes.friendly_name ?? '';
		}

		let rows: Record<InputField, TemplateResult | string> = {
			base_color: this.buildBaseColorRow(settings),
			scheme: this.buildSchemeRow(settings),
			contrast: this.buildContrastRow(settings),
			spec: this.buildSpecRow(settings),
			platform: this.buildPlatformRow(settings),
			styles: this.buildStylesRow(settings),
		};
		const n = Object.keys(rows).length;
		const rowNames = Object.keys(rows).filter(
			(row) => rows[row as InputField] != '',
		);

		return html`
			<ha-card .hass=${this.hass} .header=${title}>
				${settings.stateObj
					? html`<div class="subtitle">ID: ${userId}</div>`
					: ''}
				<div class="card-content">
					${rowNames.length < n
						? this.buildAlertBox(
								this.hass.user?.is_admin
									? `Press Create Helpers to create and initialize ${userId ? 'helpers for this user' : 'global default helpers'}.`
									: 'Some or all input helpers not setup! Ask an Home Assistant administrator to do so.',
								this.hass.user?.is_admin ? 'info' : 'error',
							)
						: ''}
					${rowNames.map(
						(name) =>
							html`<div
								class="row ${name}"
								id="${name}${userId ? `-${userId}` : ''}"
							>
								${rows[name as InputField]}
							</div>`,
					)}
				</div>
				${this.hass.user?.is_admin
					? html`<div class="card-actions">
							${this.buildCreateHelpersButton(
								userId,
							)}${this.buildDeleteHelpersButton(userId)}
						</div>`
					: ''}
			</ha-card>
		`;
	}

	buildAlertBox(
		title: string,
		type: 'info' | 'warning' | 'error' | 'success' = 'info',
	) {
		return html`<ha-alert
			.title="${title}"
			.alertType="${type}"
		></ha-alert>`;
	}

	render() {
		this.buildSettingsData();
		return html`
			${this.buildHeader()}
			<div class="content">
				<div class="page-header">
					<div class="title">${THEME_NAME} Utilities</div>
					<div class="description">
						${this.hass.user?.is_admin
							? 'Create, edit, and delete input helpers for designing Material Design 3 color themes for you and your users.'
							: 'Design your own personal Material Design 3 color theme using the inputs below.'}
					</div>
				</div>
				${'Material Rounded' in this.hass.themes.themes
					? this.buildAlertBox(
							'Your theme install is corrupted! The legacy Material Rounded theme was not properly removed and is possibly overwriting Material You theme. Delete the config/themes/material_rounded folder from your Home Assistant server.',
							'error',
						)
					: ''}
				${!(THEME_NAME in this.hass.themes.themes)
					? this.buildAlertBox(
							`You do not have ${THEME_NAME} Theme installed! This module is made to work with ${THEME_NAME} Theme and will not function properly otherwise. Install it using HACS.`,
							'error',
						)
					: !this.hass.themes.theme.includes(THEME_NAME)
						? this.buildAlertBox(
								`You are not using ${THEME_NAME} Theme! Switch to it in your profile settings.`,
								'warning',
							)
						: ''}
				<div class="section-header">
					<div class="title">You!</div>
					<div class="description">
						Your personal ${THEME_NAME} settings.
					</div>
				</div>
				${this.buildSettingsCard(this.currentUserSettings)}
				${this.hass.user?.is_admin
					? html`
							<div class="section-header">
								<div class="title">Everyone!</div>
								<div class="description">
									Default settings for all users. Used if a
									user hasn't set their own settings.
								</div>
							</div>
							${this.buildSettingsCard(this.globalSettings)}
							${Object.keys(this.otherUserSettings).length
								? html`<div class="section-header">
										<div class="title">Everyone Else</div>
										<div class="description">
											Other users on this Home Assistant
											instance.
										</div>
									</div>`
								: ''}
							${Object.keys(this.otherUserSettings).map(
								(userId) =>
									this.buildSettingsCard(
										this.otherUserSettings[userId],
									),
							)}
						`
					: ''}
			</div>
		`;
	}

	static get styles() {
		return css`
			:host {
				font-family: var(--font-family);
				color: var(--primary-text-color);
				background-color: var(
					--lovelace-background,
					var(--primary-background-color)
				);
			}

			.header {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				padding: 0 12px;
				height: 64px;
			}
			.versions {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				width: fit-content;
				min-width: 0;
				color: var(--secondary-text-color);
				font-size: var(--md-sys-typescale-label-medium-size, 12px);
				font-weight: var(--md-sys-typescale-label-medium-weight, 500);
				line-height: var(
					--md-sys-typescale-label-medium-line-height,
					16px
				);
				letter-spacing: var(
					--md-sys-typescale-label-medium-tracking,
					0.5px
				);
			}
			.version {
				width: 100%;
				direction: rtl;
				overflow: hidden;
				text-overflow: clip;
				white-space: nowrap;
			}

			.page-header {
				width: min(600px, calc(100% - 36px));
			}
			.page-header .title {
				font-size: var(--md-sys-typescale-display-small-size, 36px);
				font-weight: var(--md-sys-typescale-display-small-weight, 400);
				line-height: var(
					--md-sys-typescale-display-small-line-height,
					44px
				);
				letter-spacing: var(
					--md-sys-typescale-display-small-tracking,
					0
				);
			}
			.page-header .description {
				color: var(--secondary-text-color);
				font-size: var(--md-sys-typescale-title-medium-size, 16px);
				font-weight: var(--md-sys-typescale-title-medium-weight, 500);
				line-height: var(
					--md-sys-typescale-title-medium-line-height,
					24px
				);
				letter-spacing: var(
					--md-sys-typescale-title-medium-tracking,
					0.15px
				);
			}

			.content {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 24px;
				padding-bottom: 24px;
			}
			ha-card {
				width: min(600px, calc(100% - 36px));
			}
			.section-header {
				width: min(564px, 85%);
				margin-bottom: -12px;
			}
			.section-header .title {
				line-height: var(
					--md-sys-typescale-headline-large-line-height,
					40px
				);
				font-size: var(--md-sys-typescale-headline-large-size, 32px);
				font-weight: var(--md-sys-typescale-headline-large-weight, 400);
				letter-spacing: var(
					--md-sys-typescale-headline-large-tracking,
					0
				);
			}
			.section-header .description {
				color: var(--secondary-text-color);
				line-height: var(
					--md-sys-typescale-body-large-line-height,
					24px
				);
				font-size: var(--md-sys-typescale-body-large-size, 16px);
				font-weight: var(--md-sys-typescale-body-large-weight, 400);
				letter-spacing: var(
					--md-sys-typescale-body-large-tracking,
					0.5px
				);
			}
			.card-content {
				display: flex;
				flex-direction: column;
				gap: 24px;
				padding: 0 16px 16px;
			}
			.subtitle {
				margin-top: -24px;
				padding: 0 16px 16px;
				color: var(--secondary-text-color);
				font-size: var(--md-sys-typescale-label-large-size, 14px);
				font-weight: var(--md-sys-typescale-label-large-weight, 500);
				line-height: var(
					--md-sys-typescale-label-large-line-height,
					20px
				);
				letter-spacing: var(
					--md-sys-typescale-label-large-tracking,
					0.1px
				);
			}

			ha-selector {
				width: 100%;
			}
			.row {
				display: flex;
				align-items: flex-end;
			}
			.row:empty {
				display: none;
			}
			.label {
				width: fit-content;
				text-align: center;
			}
			.secondary {
				color: var(--secondary-text-color);
			}
			.column {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12px;
			}
			.row.base_color {
				justify-content: space-between;
				align-items: center;
			}
			disk-only-color-picker {
				padding-top: 12px;
			}

			.card-actions {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				height: 36px;
			}
			.button {
				display: flex;
				justify-content: center;
				align-items: center;
				color: var(--color);
				cursor: pointer;
				-webkit-tap-highlight-color: transparent;
			}
			.button::after {
				content: '';
				position: absolute;
				height: var(--button-size);
				border-radius: var(--md-sys-shape-corner-full, 9999px);
				background-color: var(--color);
				pointer-events: none;
				opacity: 0;
				transition: opacity 15ms linear;
			}
			@media (hover: hover) {
				.button:hover::after {
					opacity: var(--mdc-ripple-hover-opacity, 0.04);
				}
			}
			.button:active::after {
				opacity: var(--mdc-ripple-focus-opacity, 0.12);
			}
			ha-icon:focus-visible {
				outline: none;
			}
			.button:has(ha-icon:focus-visible)::after {
				opacity: var(--mdc-ripple-hover-opacity, 0.04);
			}
			.clear {
				height: var(--button-size);
				width: var(--button-size);
				margin: 10px;
				--color: var(--secondary-text-color);
				--button-size: 36px;
				--mdc-icon-size: 20px;
			}
			.more-info {
				height: var(--button-size);
				width: var(--button-size);
				margin: 8px 12px;
				--color: var(--state-icon-color);
				--button-size: 40px;
				--mdc-icon-size: 24px;
			}
			.more-info::after,
			.clear::after {
				width: var(--button-size);
			}
			.create,
			.delete {
				margin: 0 8px;
				height: var(--button-size);
				width: 100px;
				border-radius: var(--md-sys-shape-corner-full, 9999px);
				--button-size: 36px;
			}
			.create::after,
			.delete::after {
				width: 120px;
			}
			.create {
				--color: var(--primary-color);
			}
			.delete {
				--color: var(--error-color);
			}
		`;
	}
}
