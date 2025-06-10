import {
	argbFromHex,
	blueFromArgb,
	greenFromArgb,
	redFromArgb,
} from '@material/material-color-utilities';
import 'disk-color-picker';
import { css, html, LitElement, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import packageInfo from '../../package.json';
import { schemes } from '../models/constants/colors';
import { HomeAssistant } from '../models/interfaces';
import { InputField, IUserPanelSettings } from '../models/interfaces/Panel';

import { inputs, THEME_NAME } from '../models/constants/inputs';
import { showToast } from '../utils/logging';
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

	globalSettings!: IUserPanelSettings;
	currentUserSettings!: IUserPanelSettings;
	otherUserSettings: Record<string, IUserPanelSettings> = {};
	currentDeviceSettings!: IUserPanelSettings;
	otherDeviceSettings: Record<string, IUserPanelSettings> = {};

	@state() tabBarIndex: number = 0;
	tabs = ['you', 'everyone', 'devices'];

	async handleDeleteHelpers(e: MouseEvent) {
		const id = (e.target as HTMLElement).getAttribute('data-id');
		const idSuffix = id ? `_${id}` : '';

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
		if (id) {
			let userName = '';
			if (id == this.hass.user?.id) {
				userName = this.hass.user?.name ?? '';
			} else {
				userName =
					this.otherUserSettings[id].stateObj?.attributes
						.friendly_name ?? id;
			}
			message = `Input entities cleared for ${userName}`;
		}
		showToast(this, message);
	}

	buildDeleteHelpersButton(id?: string) {
		return html`
			<div
				class="delete button"
				data-id="${id}"
				@click=${this.handleDeleteHelpers}
			>
				Delete Helpers
			</div>
		`;
	}

	async handleCreateHelpers(e: MouseEvent) {
		// User ID and name checks
		const id = (e.target as HTMLElement).getAttribute('data-id');
		const idSuffix = id ? `_${id}` : '';
		let name = '';
		if (id) {
			const settings = this.getConfig(id);
			name = ` ${settings.stateObj?.attributes?.friendly_name ?? settings.id}`;
		}

		// Base Color
		let entityId = `${inputs.base_color.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.base_color.icon,
				min: 3,
				max: 9,
				pattern: '^#(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})$',
			};
			await createInput(this.hass, 'text', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'text', id, {
				name: `${inputs.base_color.name}${name}`,
				...config,
			});
			await this.hass.callService('input_text', 'set_value', {
				value: inputs.base_color.default,
				entity_id: entityId,
			});
		}

		// Scheme Name
		entityId = `${inputs.scheme.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.scheme.icon,
				options: [...schemes.map((scheme) => scheme.value)],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.scheme.name}${name}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: inputs.scheme.default,
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
				name: `${inputs.contrast.name}${name}`,
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
				options: ['2021', '2025'],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.spec.name}${name}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: inputs.spec.default,
				entity_id: entityId,
			});
		}

		// Platform
		entityId = `${inputs.platform.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.platform.icon,
				options: ['phone', 'watch'],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.platform.name}${name}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: inputs.platform.default,
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
				name: `${inputs.styles.name}${name}`,
				...config,
			});
			await this.hass.callService('input_boolean', 'turn_on', {
				entity_id: entityId,
			});
		}

		// Card Type
		entityId = `${inputs.card_type.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.card_type.icon,
				options: ['elevated', 'filled', 'outlined', 'transparent'],
			};
			await createInput(this.hass, 'select', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'select', id, {
				name: `${inputs.card_type.name}${name}`,
				...config,
			});
			await this.hass.callService('input_select', 'select_option', {
				option: inputs.card_type.default,
				entity_id: entityId,
			});
		}

		let message = 'Global input entities created';
		if (name) {
			message = `Input entities created for${name}`;
		}
		showToast(this, message);
	}

	buildCreateHelpersButton(id?: string) {
		return html`
			<div
				class="create button"
				data-id="${id}"
				@click=${this.handleCreateHelpers}
			>
				Create Helpers
			</div>
		`;
	}

	getConfig(id: string) {
		let config: IUserPanelSettings;
		if (id) {
			if (id == this.currentUserSettings.id) {
				config = this.currentUserSettings;
			} else if (id == this.currentDeviceSettings.id) {
				config = this.currentDeviceSettings;
			} else {
				config =
					this.otherUserSettings[id] ?? this.otherDeviceSettings[id];
			}
		} else {
			config = this.globalSettings;
		}
		return config;
	}

	async handleSelectorChange(e: Event) {
		const id = (e.target as HTMLElement).getAttribute('data-id');
		const field = (e.target as HTMLElement).getAttribute(
			'field',
		) as InputField;
		let value = e.detail.value;

		let [domain, service] = inputs[field].action.split('.');
		let data: Record<string, any> = {
			entity_id: `${inputs[field].input}${id ? `_${id}` : ''}`,
		};
		switch (field) {
			case 'base_color':
			case 'contrast':
				data.value = value || inputs[field].default;
				break;
			case 'scheme':
			case 'spec':
			case 'platform':
			case 'card_type':
				data.option = value || inputs[field].default;
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
		id: string,
		selector: object,
		placeholder?: string | number | boolean | object,
	) {
		// https://github.com/home-assistant/frontend/tree/dev/src/components/ha-selector
		// https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts

		const config = this.getConfig(id);
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
			case 'card_type':
			case 'contrast':
			default:
				value = config.settings[field] as string | number;
				if (!value) {
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
			data-id="${id}"
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
		const id = ((e.target as HTMLElement) ?? target).getAttribute(
			'data-id',
		);
		const field = ((e.target as HTMLElement) ?? target).getAttribute(
			'field',
		) as InputField;

		const [domain, service] = inputs[field].action.split('.');
		let data: Record<string, any> = {
			entity_id: `${inputs[field].input}${id ? `_${id}` : ''}`,
		};
		switch (field) {
			case 'base_color':
			case 'contrast':
			case 'styles':
				data.value = inputs[field].default;
				break;
			case 'scheme':
			case 'spec':
			case 'platform':
			case 'card_type':
				data.option = inputs[field].default;
				break;
			default:
				break;
		}

		await this.hass.callService(domain, service, data);
		this.requestUpdate();
	}

	buildClearButton(field: InputField, id?: string) {
		return html`
			<div class="clear button">
				<ha-icon
					@click=${this.handleClearClick}
					@keydown=${this.handleKeyDown}
					tabindex="0"
					data-id="${id}"
					field="${field}"
					.icon="${'mdi:close'}"
				></ha-icon>
			</div>
		`;
	}

	handleMoreInfoClick(e: MouseEvent, target: HTMLElement) {
		const id = ((e.target as HTMLElement) || target).getAttribute(
			'data-id',
		);
		const field = ((e.target as HTMLElement) || target).getAttribute(
			'field',
		) as InputField;

		const entityId = `${inputs[field].input}${id ? `_${id}` : ''}`;
		const event = new Event('hass-more-info', {
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		event.detail = { entityId };
		this.dispatchEvent(event);
	}

	buildMoreInfoButton(field: InputField, id?: string) {
		const entityId = `${inputs[field].input}${id ? `_${id}` : ''}`;
		const icon =
			this.hass.states[entityId].attributes.icon || inputs[field].icon;

		return html`
			<div class="more-info button">
				<ha-icon
					@click=${this.handleMoreInfoClick}
					@keydown=${this.handleKeyDown}
					tabindex="0"
					data-id="${id}"
					field="${field}"
					.icon="${icon}"
				></ha-icon>
			</div>
		`;
	}

	buildSettingsDatum(id?: string) {
		const settings: Record<string, string | number | undefined> = {};
		for (const field in inputs) {
			const values = [
				this.hass.states[
					`${inputs[field as InputField].input}${id ? `_${id}` : ''}`
				]?.state?.trim(),
				this.hass.states[
					inputs[field as InputField].input
				]?.state?.trim(),
				inputs[field as InputField].default,
			];
			if (field == 'contrast') {
				for (const value of values) {
					const parsed = parseFloat(value as string);
					if (!isNaN(parsed)) {
						settings[field] = Math.max(Math.min(parsed, 1), -1);
						break;
					}
				}
			} else {
				settings[field] = values[0] || values[1] || values[2];
			}
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
			id: currentUserId,
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

		if (this.hass.user?.is_admin) {
			// Global defaults
			this.globalSettings = {
				id: '',
				settings: this.buildSettingsDatum(),
			};

			// Other users
			for (const person of people) {
				const userId = this.hass.states[person].attributes.user_id;
				if (userId != currentUserId) {
					this.otherUserSettings[userId] = {
						id: userId,
						stateObj: this.hass.states[person],
						settings: this.buildSettingsDatum(userId),
					};
				}
			}

			// Current device
			const currentDeviceId = window.browser_mod?.browserID ?? 'NO_ID';
			this.currentDeviceSettings = {
				id: currentDeviceId,
				settings: this.buildSettingsDatum(currentDeviceId),
			};

			// Other devices

			for (const device of Object.keys(
				window.browser_mod?.browsers ?? {},
			)) {
				if (device != window.browser_mod?.browserID) {
					this.otherDeviceSettings[device] = {
						id: device,
						settings: this.buildSettingsDatum(device),
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

	handleTabBar(e: Event) {
		const i = this.tabs.indexOf(e.detail.name);
		if (this.tabBarIndex == i) {
			return;
		}
		this.tabBarIndex = i;
	}

	buildTabBar(index: number, handler: (e: Event) => void, tabs: string[]) {
		return html`
			<sl-tab-group @sl-tab-show=${handler}>
				${tabs.map(
					(tab, i) =>
						html`<sl-tab
							slot="nav"
							panel=${tab}
							.active=${i == index}
							>${tab}</sl-tab
						>`,
				)}
			</sl-tab-group>
		`;
	}

	buildBaseColorRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.base_color.input}${id ? `_${id}` : ''}`;

		let timeout: ReturnType<typeof setTimeout>;
		const handleChange = (e: Event) => {
			clearTimeout(timeout);
			const target = e.target as EventTarget & Record<'value', string>;
			const value = target.value;
			timeout = setTimeout(() => {
				const event = new Event('value-changed');
				event.detail = { value };
				target.dispatchEvent(event);
			}, 100);
		};

		return this.hass.states[input]
			? html`<div class="column">
					<disk-color-picker
						field="base_color"
						data-id="${id}"
						value="${settings.settings.base_color}"
						@change=${handleChange}
						@keyup=${handleChange}
						@value-changed=${this.handleSelectorChange}
					></disk-color-picker>
					<div class="subrow">
						<div class="row">
							${this.buildMoreInfoButton('base_color', id)}
							<div class="label">Base Color</div>
						</div>
						<div class="row">
							<div class="label secondary">
								${settings.settings.base_color ||
								inputs.base_color.default}
							</div>
							${this.buildClearButton('base_color', id)}
						</div>
					</div>
				</div>`
			: '';
	}

	buildSchemeRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.scheme.input}${id ? `_${id}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton(
					'scheme',
					id,
				)}${this.buildSelector(
					'Scheme Name',
					'scheme',
					id,
					{
						select: {
							mode: 'dropdown',
							options: schemes,
						},
					},
					settings.settings.scheme,
				)}`
			: '';
	}

	buildContrastRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.contrast.input}${id ? `_${id}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton(
					'contrast',
					id,
				)}${this.buildSelector(
					'Contrast Level',
					'contrast',
					id,
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
					settings.settings.contrast,
				)}`
			: '';
	}

	buildSpecRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.spec.input}${id ? `_${id}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('spec', id)}
				${this.buildSelector(
					'Specification Version',
					'spec',
					id,
					{
						select: {
							mode: 'box',
							options: ['2021', '2025'],
						},
					},
					settings.settings.spec,
				)}${this.buildClearButton('spec', id)}`
			: '';
	}

	buildPlatformRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.platform.input}${id ? `_${id}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('platform', id)}
				${this.buildSelector(
					'Platform',
					'platform',
					id,
					{
						select: {
							mode: 'box',
							options: [
								{ value: 'phone', label: 'Phone' },
								{ value: 'watch', label: 'Watch' },
							],
						},
					},
					settings.settings.platform,
				)}${this.buildClearButton('platform', id)}`
			: '';
	}

	buildStylesRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.styles.input}${id ? `_${id}` : ''}`;

		return this.hass.states[input]
			? html`
					${this.buildMoreInfoButton('styles', id)}
					${this.buildSelector(
						'Style Upgrades',
						'styles',
						id,
						{
							boolean: {},
						},
						settings.settings.styles == 'on',
					)}
				`
			: '';
	}

	buildCardTypeRow(settings: IUserPanelSettings) {
		const id = settings.id;
		const input = `${inputs.card_type.input}${id ? `_${id}` : ''}`;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('card_type', id)}
				${this.buildSelector(
					'Card Type',
					'card_type',
					id,
					{
						select: {
							mode: 'dropdown',
							options: [
								{ value: 'elevated', label: 'Elevated' },
								{ value: 'filled', label: 'Filled' },
								{ value: 'outlined', label: 'Outlined' },
								{ value: 'transparent', label: 'Transparent' },
							],
						},
					},
					settings.settings.card_type,
				)}`
			: '';
	}

	buildSettingsCard(settings: IUserPanelSettings) {
		const id = settings.id;

		let title = 'Global';
		if (settings.id) {
			title = settings.stateObj?.attributes?.friendly_name ?? settings.id;
		}

		let missingRows = false;
		let themeRows: Partial<Record<InputField, TemplateResult | string>> = {
			base_color: this.buildBaseColorRow(settings),
			scheme: this.buildSchemeRow(settings),
			contrast: this.buildContrastRow(settings),
			spec: this.buildSpecRow(settings),
			platform: this.buildPlatformRow(settings),
		};
		for (const name in themeRows) {
			if (!themeRows[name as InputField]) {
				delete themeRows[name as InputField];
				missingRows = true;
			}
		}
		let styleRows: Partial<Record<InputField, TemplateResult | string>> = {
			styles: this.buildStylesRow(settings),
			card_type: this.buildCardTypeRow(settings),
		};
		for (const name in styleRows) {
			if (!styleRows[name as InputField]) {
				delete styleRows[name as InputField];
				missingRows = true;
			}
		}

		return html`
			<ha-card .hass=${this.hass} .header=${title}>
				${settings.stateObj
					? html`<div class="subtitle">ID: ${id}</div>`
					: ''}
				<div class="card-content">
					${missingRows
						? this.buildAlertBox(
								this.hass.user?.is_admin
									? `Press Create Helpers to create and initialize ${id ? 'helpers for this user' : 'global default helpers'}.`
									: 'Some or all input helpers not setup! Ask an Home Assistant administrator to do so.',
								this.hass.user?.is_admin ? 'info' : 'error',
							)
						: ''}
					${Object.keys(themeRows).length
						? html`<div class="card-content-section-header">
								Dynamic Color Theme
							</div>`
						: ''}
					${Object.keys(themeRows).map(
						(name) =>
							html`<div
								class="row ${name}"
								id="${name}${id ? `-${id}` : ''}"
							>
								${themeRows[name as InputField]}
							</div>`,
					)}
					${Object.keys(styleRows).length
						? html`<div class="card-content-section-header">
								Style Options
							</div>`
						: ''}
					${Object.keys(styleRows).map(
						(name) =>
							html`<div
								class="row ${name}"
								id="${name}${id ? `-${id}` : ''}"
							>
								${styleRows[name as InputField]}
							</div>`,
					)}
				</div>
				${this.hass.user?.is_admin
					? html`<div class="card-actions">
							${this.buildCreateHelpersButton(
								id,
							)}${this.buildDeleteHelpersButton(id)}
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
		if (!this.hass.user?.is_admin) {
			this.tabBarIndex = 0;
		}

		this.buildSettingsData();

		const warnings = html`
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
		`;

		let page: TemplateResult;
		switch (this.tabBarIndex) {
			case 2:
				page = html`
					${window.browser_mod
						? ''
						: this.buildAlertBox(
								'Device specific settings requires browser_mod, which can be installed using HACS.',
								'error',
							)}
					<div class="section-header">
						<div class="title">This Device</div>
						<div class="description">
							This device, prioritized over all other settings.
						</div>
					</div>
					${this.buildSettingsCard(this.currentDeviceSettings)}
					<div class="section-header">
						<div class="title">Other Devices</div>
						<div class="description">
							Other devices on this Home Assistant instance.
						</div>
					</div>
					${Object.keys(this.otherDeviceSettings).map((id) =>
						this.buildSettingsCard(this.otherDeviceSettings[id]),
					)}
				`;
				break;
			case 1:
				page = html`
					<div class="section-header">
						<div class="title">Everyone!</div>
						<div class="description">
							Default settings for all users. Used if a user or
							device doesn't have their own settings.
						</div>
					</div>
					${this.buildSettingsCard(this.globalSettings)}
					<div class="section-header">
						<div class="title">Everyone Else</div>
						<div class="description">
							Other users on this Home Assistant instance.
						</div>
					</div>
					${Object.keys(this.otherUserSettings).map((id) =>
						this.buildSettingsCard(this.otherUserSettings[id]),
					)}
				`;
				break;
			case 0:
			default:
				page = html`
					<div class="section-header">
						<div class="title">You!</div>
						<div class="description">
							Your personal ${THEME_NAME} settings.
						</div>
					</div>
					${this.buildSettingsCard(this.currentUserSettings)}
				`;
				break;
		}

		return html`
			${this.buildHeader()}
			<div class="content">
				${this.hass.user?.is_admin
					? this.buildTabBar(
							this.tabBarIndex,
							this.handleTabBar,
							this.tabs,
						)
					: ''}
				${warnings}
				<div class="page-header">
					<div class="title">${THEME_NAME} Utilities</div>
					<div class="description">
						Design your own personal Material Design 3 dynamic color
						theme.
					</div>
				</div>
				${page}
			</div>
		`;
	}

	updated() {
		// Disk color picker style tweaks
		const colorPickers =
			this.shadowRoot?.querySelectorAll('disk-color-picker') ?? [];
		for (const colorPicker of colorPickers) {
			if (!colorPicker.shadowRoot?.getElementById('material-you')) {
				const style = document.createElement('style');
				style.id = 'material-you';
				style.textContent = `
				/* Shift color picker down */
				:host {
					height: 236px;
					translate: 0 -24px;
				}

				/* Scale the disk color picker relative to saturation arc */
				#diskPanel {
					scale: 1.25;
				}

				/* Fix ugly square tap shadows */
				#diskTarget,
				#diskThumb,
				#wheelThumb {
					-webkit-tap-highlight-color: transparent;
				}
			`;
				colorPicker.shadowRoot?.appendChild(style);
			}
		}
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

				--width: min(600px, calc(100% - 36px));
			}

			.header {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				padding: 0 12px;
				height: 64px;
				background-color: inherit;
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
				width: var(--width);
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
				background-color: inherit;
				min-height: calc(100% - 88px);
			}

			sl-tab-group {
				text-transform: capitalize;
				width: var(--width);
			}
			sl-tab {
				flex: 1;
			}
			sl-tab::part(base) {
				width: 100%;
				justify-content: center;
			}

			ha-card {
				width: var(--width);
			}
			.section-header {
				width: var(--width);
				padding: 0 16px;
				margin-bottom: -12px;
				box-sizing: border-box;
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
			.card-content-section-header {
				font-size: var(--md-sys-typescale-title-medium-siz, 16px);
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
			.card-content-section-header::before {
				content: '';
				display: block;
				height: 1px;
				width: 100%;
				padding-top: 12px;
				border-top: 1px
					var(
						--md-sys-color-outline-variant,
						var(--divider-color, gray)
					)
					solid;
			}

			ha-selector {
				width: 100%;
			}
			.row {
				display: flex;
				align-items: flex-end;
				margin-bottom: 16px;
			}
			.row:empty {
				display: none;
			}
			.label {
				width: fit-content;
				text-align: center;
				align-content: center;
				margin: auto 0;
			}
			.secondary {
				color: var(--secondary-text-color);
			}
			.column {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 100%;
			}
			.row.base_color {
				justify-content: center;
				align-items: center;
			}
			.subrow {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
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
