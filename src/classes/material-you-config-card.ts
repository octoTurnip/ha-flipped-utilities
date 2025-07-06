import {
	argbFromHex,
	blueFromArgb,
	greenFromArgb,
	redFromArgb,
} from '@material/material-color-utilities';
import { css, html, LitElement, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { schemes } from '../models/constants/colors';
import { inputs, THEME_NAME } from '../models/constants/inputs';
import {
	HomeAssistant,
	RenderTemplateError,
	RenderTemplateResult,
} from '../models/interfaces';
import { InputField } from '../models/interfaces/Panel';
import { setCardType } from '../utils/cards';
import { setTheme } from '../utils/colors';
import { buildAlertBox } from '../utils/common';
import { setBaseColorFromImage } from '../utils/image';
import { debugToast, showToast } from '../utils/logging';
import {
	createInput,
	deleteInput,
	handleConfirmation,
	updateInput,
} from '../utils/panel';
if (!customElements.get('disk-color-picker')) {
	// HACS install causes this module to be defined twice, this squashes the error
	require('disk-color-picker');
}

export class MaterialYouConfigCard extends LitElement {
	@property() hass!: HomeAssistant;
	@property() dataId?: string;

	@state() tabBarIndex: number = 0;
	tabs = ['colors', 'styles'];

	personEntityId?: string;
	darkMode?: boolean;

	async handleDeleteHelpers(_e: MouseEvent) {
		const idSuffix = this.dataId ? `_${this.dataId}` : '';

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
		if (this.dataId) {
			let name = '';
			if (this.dataId == this.hass.user?.id) {
				name = this.hass.user?.name ?? '';
			} else {
				name =
					this.hass.states[this.dataId]?.attributes.friendly_name ??
					this.dataId;
			}
			message = `Input entities cleared for ${name}`;
		}
		showToast(this, message);
	}

	buildDeleteHelpersButton() {
		return html`
			<div class="delete button" @click=${this.handleDeleteHelpers}>
				Delete Helpers
			</div>
		`;
	}

	async handleCreateHelpers(_e: MouseEvent) {
		// User ID and name checks
		const idSuffix = this.dataId ? `_${this.dataId}` : '';
		let name = '';
		if (this.personEntityId) {
			name = ` ${this.hass.states[this.personEntityId]?.attributes?.friendly_name ?? this.personEntityId ?? this.dataId}`;
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

		// Base Image URL
		entityId = `${inputs.image_url.input}${idSuffix}`;
		if (!this.hass.states[entityId]) {
			const id = entityId.split('.')[1];
			const config = {
				icon: inputs.image_url.icon,
				min: 0,
				max: 255,
			};
			await createInput(this.hass, 'text', {
				name: id,
				...config,
			});
			await updateInput(this.hass, 'text', id, {
				name: `${inputs.image_url.name}${name}`,
				...config,
			});
			await this.hass.callService('input_text', 'set_value', {
				value: inputs.image_url.default,
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

	buildCreateHelpersButton() {
		return html`
			<div class="create button" @click=${this.handleCreateHelpers}>
				Create Helpers
			</div>
		`;
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

	async handleSelectorChange(e: Event) {
		const field = (e.target as HTMLElement).getAttribute(
			'field',
		) as InputField;
		let value = e.detail.value;

		let [domain, service] = inputs[field].action.split('.');
		let data: Record<string, any> = {
			entity_id: `${inputs[field].input}${this.dataId ? `_${this.dataId}` : ''}`,
		};
		switch (field) {
			case 'base_color':
			case 'image_url':
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
		selector: object,
		placeholder?: string | number | boolean | object,
	) {
		// https://github.com/home-assistant/frontend/tree/dev/src/components/ha-selector
		// https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts

		const entityId = `${inputs[field].input}${this.dataId ? `_${this.dataId}` : ''}`;
		const config = this.hass.states[entityId] ?? {};
		let value: string | number | number[] | boolean;
		switch (field) {
			case 'base_color':
				let argb: number;
				try {
					argb = argbFromHex(config.state);
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
				value = config.state == 'on';
				break;
			case 'image_url':
			case 'scheme':
			case 'spec':
			case 'platform':
			case 'card_type':
			case 'contrast':
			default:
				value = config.state as string | number;
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
		const field = ((e.target as HTMLElement) ?? target).getAttribute(
			'field',
		) as InputField;

		const [domain, service] = inputs[field].action.split('.');
		let data: Record<string, any> = {
			entity_id: `${inputs[field].input}${this.dataId ? `_${this.dataId}` : ''}`,
		};
		switch (field) {
			case 'base_color':
			case 'image_url':
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
					field="${field}"
					.icon="${'mdi:close'}"
				></ha-icon>
			</div>
		`;
	}

	handleMoreInfoClick(e: MouseEvent, target: HTMLElement) {
		const field = ((e.target as HTMLElement) || target).getAttribute(
			'field',
		) as InputField;

		const entityId = `${inputs[field].input}${this.dataId ? `_${this.dataId}` : ''}`;
		const event = new Event('hass-more-info', {
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		event.detail = { entityId };
		this.dispatchEvent(event);
	}

	buildMoreInfoButton(field: InputField) {
		const entityId = `${inputs[field].input}${this.dataId ? `_${this.dataId}` : ''}`;
		const icon =
			this.hass.states[entityId]?.attributes.icon || inputs[field].icon;

		return html`
			<div class="more-info button">
				<ha-icon
					@click=${this.handleMoreInfoClick}
					@keydown=${this.handleKeyDown}
					tabindex="0"
					field="${field}"
					.icon="${icon}"
				></ha-icon>
			</div>
		`;
	}

	buildBaseColorRow() {
		const input = `${inputs.base_color.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

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
						value="${value}"
						@change=${handleChange}
						@keyup=${handleChange}
						@value-changed=${this.handleSelectorChange}
					></disk-color-picker>
					<div class="subrow">
						<div class="row">
							${this.buildMoreInfoButton('base_color')}
							<div class="label">Base Color</div>
						</div>
						<div class="row">
							<div class="label secondary">
								${value || inputs.base_color.default}
							</div>
							${this.buildClearButton('base_color')}
						</div>
					</div>
				</div>`
			: '';
	}

	buildImageUrlRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('image_url')}
				${this.buildSelector(
					'Image URL',
					'image_url',
					{
						text: {},
					},
					value,
				)}`
			: '';
	}

	buildSchemeRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('scheme')}${this.buildSelector(
					'Scheme Name',
					'scheme',
					{
						select: {
							mode: 'dropdown',
							options: schemes,
						},
					},
					value,
				)}`
			: '';
	}

	buildContrastRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('contrast')}${this.buildSelector(
					'Contrast Level',
					'contrast',
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
					value,
				)}`
			: '';
	}

	buildSpecRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('spec')}
				${this.buildSelector(
					'Specification Version',
					'spec',
					{
						select: {
							mode: 'box',
							options: ['2021', '2025'],
						},
					},
					value,
				)}${this.buildClearButton('spec')}`
			: '';
	}

	buildPlatformRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('platform')}
				${this.buildSelector(
					'Platform',
					'platform',
					{
						select: {
							mode: 'box',
							options: [
								{ value: 'phone', label: 'Phone' },
								{ value: 'watch', label: 'Watch' },
							],
						},
					},
					value,
				)}${this.buildClearButton('platform')}`
			: '';
	}

	buildStylesRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`
					${this.buildMoreInfoButton('styles')}
					${this.buildSelector(
						'Style Upgrades',
						'styles',
						{
							boolean: {},
						},
						value == 'on',
					)}
				`
			: '';
	}

	buildCardTypeRow() {
		const input = `${inputs.image_url.input}${this.dataId ? `_${this.dataId}` : ''}`;
		const value = this.hass.states[input]?.state;

		return this.hass.states[input]
			? html`${this.buildMoreInfoButton('card_type')}
				${this.buildSelector(
					'Card Type',
					'card_type',
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
					value,
				)}`
			: '';
	}

	setupIds() {
		if (this.dataId && !this.personEntityId) {
			this.personEntityId = Object.keys(this.hass.states).find(
				(entity) =>
					entity.startsWith('person.') &&
					this.hass.states[entity].attributes.user_id == this.dataId,
			);
		}
	}

	applyThemeMode() {
		if (this.darkMode != this.hass.themes?.darkMode) {
			this.darkMode = this.hass.themes?.darkMode;

			const style = this.shadowRoot?.getElementById('material-you-theme');
			if (style) {
				const styles: string[] = [];
				for (const [key, value] of Object.entries(
					this.hass.themes?.themes[THEME_NAME].modes?.[
						this.darkMode ? 'dark' : 'light'
					] ?? {},
				)) {
					styles.push(`--${key}: ${value};`);
				}

				style.textContent = `
					:host {
						${styles.join('\n')}
					}
				`;
			}
		}
	}

	render() {
		this.setupIds();

		let title = 'Global';
		if (this.dataId) {
			title =
				this.hass.states[this.personEntityId ?? '']?.attributes
					?.friendly_name ??
				this.personEntityId ??
				this.dataId;
		}

		let rows: Partial<Record<InputField, TemplateResult | string>>;
		switch (this.tabBarIndex) {
			case 1:
				rows = {
					styles: this.buildStylesRow(),
					card_type: this.buildCardTypeRow(),
				};
				break;
			case 0:
			default:
				rows = {
					base_color: this.buildBaseColorRow(),
					image_url: this.buildImageUrlRow(),
					scheme: this.buildSchemeRow(),
					contrast: this.buildContrastRow(),
					spec: this.buildSpecRow(),
					platform: this.buildPlatformRow(),
				};

				if (
					this.hass.states[
						`${inputs.spec.input}${this.dataId ? `_${this.dataId}` : ''}`
					]?.state != '2025'
				) {
					delete rows.platform;
				}

				break;
		}

		let missingRows = false;
		for (const name in rows) {
			if (!rows[name as InputField]) {
				delete rows[name as InputField];
				missingRows = true;
			}
		}

		return html`
			<ha-card .hass=${this.hass} .header=${title}>
				${this.personEntityId
					? html`<div class="subtitle">ID: ${this.dataId}</div>`
					: ''}
				${this.buildTabBar(
					this.tabBarIndex,
					this.handleTabBar,
					this.tabs,
				)}
				<div class="card-content">
					${missingRows
						? buildAlertBox(
								this.hass.user?.is_admin
									? 'Press Create Helpers to create and initialize inputs.'
									: 'Some or all input helpers not setup! Ask an Home Assistant administrator to do so.',
								this.hass.user?.is_admin ? 'info' : 'error',
							)
						: ''}
					${Object.keys(rows).map(
						(name) =>
							html`<div class="row ${name}">
								${rows[name as InputField]}
							</div>`,
					)}
				</div>
				${this.hass.user?.is_admin
					? html`<div class="card-actions">
							${this.buildCreateHelpersButton()}${this.buildDeleteHelpersButton()}
						</div>`
					: ''}
			</ha-card>
			<style id="material-you-theme"></style>
		`;
	}

	firstUpdated() {
		// Apply theme properties to card
		const applyTheme = async () => {
			const theme = structuredClone(this.hass.themes?.themes[THEME_NAME]);
			delete theme.modes;
			const entries = Object.entries(theme);
			if (entries.length) {
				for (const [key, value] of entries) {
					this.style.setProperty(`--${key}`, value);
				}
				return;
			}
			setTimeout(() => applyTheme(), 100);
		};
		applyTheme();

		// Initial color and style setup
		setBaseColorFromImage(this.dataId ?? '');
		setTheme(this, this.dataId ?? '');
		setCardType(this.shadowRoot as ShadowRoot, this.dataId ?? '');

		// Trigger updates on card
		const setupSubscriptions = async () => {
			if (this.hass.connection.connected && this.hass.user?.id) {
				// User inputs
				const id = this.dataId ? `_${this.dataId}` : '';
				const colorThemeInputs = [
					`${inputs.base_color.input}${id}`,
					`${inputs.scheme.input}${id}`,
					`${inputs.contrast.input}${id}`,
					`${inputs.spec.input}${id}`,
					`${inputs.platform.input}${id}`,
				];
				const imageUrlInputs = [`${inputs.image_url.input}${id}`];
				const styleInputs = [`${inputs.card_type.input}${id}`];

				if (this.hass.user?.is_admin) {
					this.hass.connection.subscribeMessage(
						() => setTheme(this, this.dataId ?? ''),
						{
							type: 'subscribe_trigger',
							trigger: {
								platform: 'state',
								entity_id: colorThemeInputs,
							},
						},
						{ resubscribe: true },
					);
					this.hass.connection.subscribeMessage(
						() => setBaseColorFromImage(this.dataId ?? ''),
						{
							type: 'subscribe_trigger',
							trigger: {
								platform: 'state',
								entity_id: imageUrlInputs,
							},
						},
						{ resubscribe: true },
					);
					this.hass.connection.subscribeMessage(
						() =>
							setCardType(
								this.shadowRoot as ShadowRoot,
								this.dataId ?? '',
							),
						{
							type: 'subscribe_trigger',
							trigger: {
								platform: 'state',
								entity_id: styleInputs,
							},
						},
						{ resubscribe: true },
					);

					// Trigger on theme changed event
					this.hass.connection.subscribeEvents(
						() => setTheme(this, this.dataId ?? ''),
						'themes_updated',
					);

					// Trigger on set theme service call
					this.hass.connection.subscribeEvents(
						(e: Record<string, any>) => {
							if (e?.data?.service == 'set_theme') {
								setTimeout(
									() => setTheme(this, this.dataId ?? ''),
									1000,
								);
							}
						},
						'call_service',
					);
				} else {
					// Trigger on input change using templates
					for (const entityId of colorThemeInputs) {
						this.hass.connection.subscribeMessage(
							(
								msg: RenderTemplateResult | RenderTemplateError,
							) => {
								if ('error' in msg) {
									console.error(msg.error);
									debugToast(msg.error);
								}
								setTheme(this, this.dataId ?? '');
							},
							{
								type: 'render_template',
								template: `{{ states("${entityId}") }}`,
								entity_ids: entityId,
								report_errors: true,
							},
						);
					}
					for (const entityId of imageUrlInputs) {
						this.hass.connection.subscribeMessage(
							(
								msg: RenderTemplateResult | RenderTemplateError,
							) => {
								if ('error' in msg) {
									console.error(msg.error);
									debugToast(msg.error);
								}
								setBaseColorFromImage();
							},
							{
								type: 'render_template',
								template: `{{ states("${entityId}") }}`,
								entity_ids: entityId,
								report_errors: true,
							},
						);
					}
					for (const entityId of styleInputs) {
						this.hass.connection.subscribeMessage(
							(
								msg: RenderTemplateResult | RenderTemplateError,
							) => {
								if ('error' in msg) {
									console.error(msg.error);
									debugToast(msg.error);
								}
								setCardType(
									this.shadowRoot as ShadowRoot,
									this.dataId ?? '',
								);
							},
							{
								type: 'render_template',
								template: `{{ states("${entityId}") }}`,
								entity_ids: entityId,
								report_errors: true,
							},
						);
					}
				}
				return;
			}

			setTimeout(() => setupSubscriptions(), 100);
		};
		setupSubscriptions();
	}

	updated() {
		// Apply theme mode
		this.applyThemeMode();

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
						height: 248px;
						translate: 0 -16px;
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
				width: var(--width);
			}

			.card-content {
				display: flex;
				flex-direction: column;
				padding: 16px;
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

			sl-tab-group {
				text-transform: capitalize;
				width: var(--width);
				position: relative;
				z-index: 1;
			}
			sl-tab {
				flex: 1;
			}
			sl-tab::part(base) {
				width: 100%;
				justify-content: center;
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
			.subrow .row {
				margin-bottom: 0;
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
