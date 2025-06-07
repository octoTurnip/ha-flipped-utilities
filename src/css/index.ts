import haAssistChip from './ha-assist-chip.css';
import haButton from './ha-button.css';
import haCard from './ha-card.css';
import haConfigInfo from './ha-config-info.css';
import haDialog from './ha-dialog.css';
import haDrawer from './ha-drawer.css';
import haEntityToggle from './ha-entity-toggle.css';
import haFab from './ha-fab.css';
import haGridLayoutSlider from './ha-grid-layout-slider.css';
import haInputChip from './ha-input-chip.css';
import haListItem from './ha-list-item.css';
import haMarkdown from './ha-markdown.css';
import haMdDialog from './ha-md-dialog.css';
import haMdListItem from './ha-md-list-item.css';
import haMdMenuItem from './ha-md-menu-item.css';
import haMenuButton from './ha-menu-button.css';
import haMoreInfoInfo from './ha-more-info-info.css';
import haSidebar from './ha-sidebar.css';
import haSlider from './ha-slider.css';
import haSwitch from './ha-switch.css';
import haTextfield from './ha-textfield.css';
import haToast from './ha-toast.css';
import haTopAppBarFixed from './ha-top-app-bar-fixed.css';
import haUserBadge from './ha-user-badge.css';
import homeAssistantMain from './home-assistant-main.css';
import homeAssistant from './home-assistant.css';
import hueLikeLightCard from './hue-like-light-card.css';
import huiEntitiesCardEditor from './hui-entities-card-editor.css';
import huiEntitiesCard from './hui-entities-card.css';
import huiGridSection from './hui-grid-section.css';
import huiRoot from './hui-root.css';
import huiViewVisibilityEditor from './hui-view-visibility-editor.css';

/**
 * Home Assistant (and other) custom elements to patch and their corresponding styles
 */
export const elements: Record<string, string> = {
	'ha-assist-chip': haAssistChip,
	'ha-button': haButton,
	'ha-card': haCard,
	'ha-config-info': haConfigInfo,
	'ha-dialog': haDialog,
	'ha-md-dialog': haMdDialog,
	'ha-entity-toggle': haEntityToggle,
	'ha-fab': haFab,
	'ha-grid-layout-slider': haGridLayoutSlider,
	'ha-input-chip': haInputChip,
	'ha-list-item': haListItem,
	'mwc-list-item': haListItem,
	'ha-markdown': haMarkdown,
	'ha-md-list-item': haMdListItem,
	'ha-md-menu-item': haMdMenuItem,
	'ha-menu-button': haMenuButton,
	'ha-more-info-info': haMoreInfoInfo,
	'ha-drawer': haDrawer,
	'ha-sidebar': haSidebar,
	'ha-slider': haSlider,
	'md-slider': haSlider,
	'ha-switch': haSwitch,
	'ha-top-app-bar-fixed': haTopAppBarFixed,
	'ha-textfield': haTextfield,
	'ha-toast': haToast,
	'ha-user-badge': haUserBadge,
	'hui-entities-card': huiEntitiesCard,
	'hui-entities-card-editor': huiEntitiesCardEditor,
	'hui-grid-section': huiGridSection,
	'hui-root': huiRoot,
	'hui-view-visibility-editor': huiViewVisibilityEditor,
	'hue-like-light-card': hueLikeLightCard,
	'home-assistant': homeAssistant,
	'home-assistant-main': homeAssistantMain,
};
