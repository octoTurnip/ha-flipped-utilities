import { css, html, LitElement, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { inputs, services } from '../models/constants/inputs';
import { THEME_NAME, THEME_TOKEN } from '../models/constants/theme';
import { HomeAssistant } from '../models/interfaces';
import { InputField } from '../models/interfaces/Input';
import { buildAlertBox, getEntityId } from '../utils/common';
import { setCardType } from '../utils/handlers/cards';
import { setTheme } from '../utils/handlers/colors';
import { setCSSFromFile } from '../utils/handlers/css';
import { setBaseColorFromImage } from '../utils/handlers/image';
import { showToast } from '../utils/logging';
import {
	createInput,
	deleteInput,
	handleConfirmation,
	updateInput,
} from '../utils/panel';
import { setupSubscriptions } from '../utils/subscriptions';
if (!customElements.get('disk-color-picker')) {
	// HACS install causes this module to be defined twice, this squashes the error
	require('disk-color-picker');
}

const styleId = `${THEME_TOKEN}-theme`;

export class MaterialYouConfigCard extends LitElement {
	@property() hass!: HomeAssistant;
	@property() dataId?: string;

	@state() tabBarIndex: number = 0;
	tabs = ['theme', 'styles', 'other'];

	personEntityId?: string;
	darkMode?: boolean;

	unsubscribers: (() => Promise<void>)[] = [];

	async handleDeleteHelpers(_e: MouseEvent) {
		if (
			!(await handleConfirmation(this, {
				text: 'Are you sure you want to delete these helpers?',
			}))
		) {
			return;
		}

		for (const field in inputs) {
			const entityId = getEntityId(field as InputField, this.dataId);
			if (this.hass.states[entityId]) {
				await deleteInput(
					this.hass,
					inputs[field as InputField].domain,
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
		let name = '';
		if (this.dataId) {
			name = ` ${this.hass.states[this.personEntityId ?? '']?.attributes?.friendly_name ?? this.personEntityId ?? this.dataId}`;
		}

		for (const field in inputs) {
			const entityId = getEntityId(field as InputField, this.dataId);
			if (!this.hass.states[entityId]) {
				const id = entityId.split('.')[1];
				await createInput(
					this.hass,
					inputs[field as InputField].domain,
					{
						name: id,
						...inputs[field as InputField].init.config,
					},
				);
				await updateInput(
					this.hass,
					inputs[field as InputField].domain,
					id,
					{
						name: `${THEME_NAME} ${inputs[field as InputField].name}${name}`,
						...inputs[field as InputField].init.config,
					},
				);
				const domain = inputs[field as InputField].domain;
				let service = services[domain];
				const data: Record<string, any> = {
					entity_id: entityId,
				};
				switch (domain) {
					case 'input_text':
					case 'input_number':
						data.value = inputs[field as InputField].default;
						break;
					case 'input_select':
						data.option = inputs[field as InputField].default;
						break;
					case 'input_boolean':
						service = `turn_${inputs[field as InputField].default}`;
						break;
					default:
						break;
				}
				await this.hass.callService(domain, service, data);
			}
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

		const domain = inputs[field].domain;
		let service = services[domain];
		let data: Record<string, any> = {
			entity_id: getEntityId(field, this.dataId),
		};
		switch (domain) {
			case 'input_text':
			case 'input_number':
				data.value = value || inputs[field].default;
				break;
			case 'input_select':
				data.option = value || inputs[field].default;
				break;
			case 'input_boolean':
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

		const entityId = getEntityId(field, this.dataId);
		const state = this.hass.states[entityId]?.state;
		let value: string | number | number[] | boolean;
		switch (inputs[field].domain) {
			case 'input_boolean':
				value = state == 'on';
				break;
			case 'input_text':
			case 'input_number':
			case 'input_select':
			default:
				value = state ?? inputs[field].default;
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
				case 'reset':
					handler = this.handleResetClick;
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

	async handleResetClick(e: MouseEvent, target?: HTMLElement) {
		const field = ((e.target as HTMLElement) ?? target).getAttribute(
			'field',
		) as InputField;

		const domain = inputs[field].domain;
		let service = services[domain];
		let data: Record<string, any> = {
			entity_id: getEntityId(field, this.dataId),
		};
		switch (domain) {
			case 'input_text':
			case 'input_number':
				data.value = inputs[field].default;
				break;
			case 'input_select':
				data.option = inputs[field].default;
				break;
			case 'input_boolean':
				service = `turn_${inputs[field].default}`;
			default:
				break;
		}

		await this.hass.callService(domain, service, data);
		this.requestUpdate();
	}

	buildResetButton(field: InputField) {
		return html`
			<div class="reset button">
				<ha-icon
					@click=${this.handleResetClick}
					@keydown=${this.handleKeyDown}
					tabindex="0"
					field="${field}"
					.icon="${'mdi:restore'}"
				></ha-icon>
			</div>
		`;
	}

	handleMoreInfoClick(e: MouseEvent, target: HTMLElement) {
		const field = ((e.target as HTMLElement) || target).getAttribute(
			'field',
		) as InputField;

		const entityId = getEntityId(field, this.dataId);
		const event = new Event('hass-more-info', {
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		event.detail = { entityId };
		this.dispatchEvent(event);
	}

	buildMoreInfoButton(field: InputField) {
		const entityId = getEntityId(field, this.dataId);
		const icon = this.hass.states[entityId]?.attributes.icon;

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

	buildRow(field: InputField) {
		const entityId = getEntityId(field, this.dataId);

		if (!this.hass.states[entityId]) {
			return '';
		}

		let value: string | number | boolean =
			this.hass.states[entityId]?.state;
		if (field == 'base_color') {
			let timeout: ReturnType<typeof setTimeout>;
			const handleChange = (e: Event) => {
				clearTimeout(timeout);
				const target = e.target as EventTarget &
					Record<'value', string>;
				const value = target.value;
				timeout = setTimeout(() => {
					const event = new Event('value-changed');
					event.detail = { value };
					target.dispatchEvent(event);
				}, 100);
			};

			return html`<div class="column">
				<disk-color-picker
					field="${field}"
					value="${value}"
					@change=${handleChange}
					@keyup=${handleChange}
					@value-changed=${this.handleSelectorChange}
				></disk-color-picker>
				<div class="subrow">
					<div class="row">
						${this.buildMoreInfoButton(field)}
						<div class="label">${inputs[field].name}</div>
					</div>
					<div class="row">
						<div class="label secondary">
							${value || inputs[field].default}
						</div>
						${this.buildResetButton(field)}
					</div>
				</div>
			</div>`;
		}

		let config = inputs[field].card.config;
		if (inputs[field].domain == 'input_number') {
			config.min = this.hass.states[entityId]?.attributes?.min ?? -1;
			config.max = this.hass.states[entityId]?.attributes?.max ?? 1;
			config.step = this.hass.states[entityId]?.attributes?.step ?? 0.01;
		} else if (inputs[field].domain == 'input_boolean') {
			value = value == 'on';
		}

		return html`${this.buildMoreInfoButton(field)}
		${this.buildSelector(inputs[field].name, field, config, value)}
		${inputs[field].card.resetButton ? this.buildResetButton(field) : ''}`;
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

			const style = this.shadowRoot?.getElementById(styleId);
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

		let rowNames = Object.keys(inputs).filter(
			(field) =>
				inputs[field as InputField].card.tabBarIndex ==
				this.tabBarIndex,
		) as InputField[];

		// Platform field is not available for 2021 spec
		if (
			this.hass.states[getEntityId('spec', this.dataId)]?.state != '2025'
		) {
			rowNames = rowNames.filter((name) => name != 'platform');
		}

		let rows: Partial<Record<InputField, TemplateResult | string>> = {};
		for (const field of rowNames) {
			rows[field as InputField] = this.buildRow(field as InputField);
		}

		for (const name in rows) {
			if (!rows[name as InputField]) {
				delete rows[name as InputField];
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
					${Object.keys(rows).length != rowNames.length
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
			<style id="${styleId}"></style>
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

		// Initial handler calls
		const args = { targets: [this], id: this.dataId ?? '' };
		const handlers = [
			setBaseColorFromImage,
			setTheme,
			setCardType,
			setCSSFromFile,
		];
		for (const handler of handlers) {
			handler(args);
		}
	}

	updated() {
		// Apply theme mode
		this.applyThemeMode();

		// Disk color picker style tweaks
		const colorPicker = this.shadowRoot?.querySelector('disk-color-picker');
		if (colorPicker && !colorPicker.shadowRoot?.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				/* Shift color picker down */
				:host {
					height: 248px;
					translate: 0 -16px;
				}

				/* Scale the disk color picker relative to saturation arc */
				#diskPanel {
					scale: 1.3;
					top: 4px;
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

	connectedCallback() {
		super.connectedCallback();

		// Trigger updates on card
		setupSubscriptions({
			targets: [this],
			id: this.dataId ?? '',
		}).then((unsubscribers) => {
			this.unsubscribers = unsubscribers;
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		// Unsubscribe from theme update subscriptions
		this.unsubscribers.forEach(async (unsubscriber) => {
			unsubscriber();
		});
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
				margin: 0;
				gap: 20px;
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
				width: 100%;
				margin: auto;
				text-transform: capitalize;
				position: relative;
				z-index: 1;

				--sl-spacing-x-large: 0;
			}
			sl-tab-group::part(scroll-button) {
				display: none;
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
			.reset {
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
				min-width: var(--button-size);
				margin: 8px 4px;
				--color: var(--state-icon-color);
				--button-size: 40px;
				--mdc-icon-size: 24px;
			}
			.more-info::after,
			.reset::after {
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
