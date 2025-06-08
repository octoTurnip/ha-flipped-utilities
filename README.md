[![GitHub Release](https://img.shields.io/github/release/Nerwyn/material-you-utilities.svg?style=for-the-badge)](https://github.com/nerwyn/material-you-utilities/releases)
[![License](https://img.shields.io/github/license/Nerwyn/material-you-utilities.svg?style=for-the-badge)](LICENSE)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-blue.svg?style=for-the-badge)](https://github.com/hacs/default)
[![Project Maintenance](https://img.shields.io/badge/maintainer-Nerwyn-blue.svg?style=for-the-badge)](https://github.com/Nerwyn)
![Github](https://img.shields.io/github/followers/Nerwyn.svg?style=for-the-badge)
[![GitHub Activity](https://img.shields.io/github/last-commit/Nerwyn/material-you-utilities?style=for-the-badge)](https://github.com/Nerwyn/material-you-utilities/commits/main)
[![Community Forum](https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge)](https://community.home-assistant.io/t/material-you-theme-a-fully-featured-implementation-of-material-design-3-for-home-assistant/623242)
[![Buy Me A Coffee](https://img.shields.io/badge/donate-☕buy_me_a_coffee-yellow.svg?style=for-the-badge)](https://www.buymeacoffee.com/nerwyn)

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=material-you-utilities&owner=Nerwyn&category=Plugin)

# Material Design 3 Color Theme Generation and Component Modification

Material Design 3 color theme generation and Home Assistant component modification.

A companion module for [Material You theme](https://github.com/Nerwyn/material-you-theme) for Home Assistant. This module turns Material You theme into a complete Material Design 3 overhaul of Home Assistant. You'll be able to use different colors, schemes, and contrast levels in your theme colors, and will be able to change the entirety of the Home Assistant user interface to look like a modern Material Design 3 app. This can all be configured from a configuration panel included with this module.

This module generates color themes using [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) based on user defined inputs. It also injects custom styles into many Home Assistant custom components to follow the [Material Design 3 specifications](https://m3.material.io/). The Material Design 3 specification is the source of truth for this module and Material You theme, and they will change over time to reflect updates to the specification. Custom color theme generation and style injection have minimal performance impact and work well even on low end devices.

# Installation

## Install the Module From HACS

1. Navigate to HACS (install from [here](https://hacs.xyz/) if you do not have it yet).
2. Search for `Material You Utilities`.
3. Open this repository in HACS and click `Download`.

## Add the Module as a Frontend Module and Custom Panel

**This is not optional**. The component design upgrades performed by this module are very time sensitive, and must be run as soon as possible. Because of this you must install it as a frontend module in your `configuration.yaml` file.

1. Open your `configuration.yaml`.
   - Your `configuration.yaml` file is found in the `config` folder. More information can be found [here](https://www.home-assistant.io/docs/configuration/).
2. Add the file URL to `frontend` `extra_module_url`, adding the `frontend` and `extra_module_url` keys if they do not exist, and adding to them if they do.
   - If you have links to any old versions of the JavaScript module here or in frontend resources, **delete them**.

```yaml
frontend:
  themes: !include_dir_merge_named themes
  extra_module_url:
    - /hacsfiles/material-you-utilities/material-you-utilities.min.js
```

3. Add the following to the `panel_custom` key in `configuration.yaml`, creating it if it does not exist. This will allow you to access the Material You Utilities configuration panel.
   - More information about custom panels can be found [here](https://www.home-assistant.io/integrations/panel_custom/).

```yaml
panel_custom:
  - name: material-you-panel
    url_path: material-you-configuration
    sidebar_title: Material You Utilities
    sidebar_icon: mdi:material-design
    module_url: /hacsfiles/material-you-utilities/material-you-utilities.min.js
```

4. Restart Home Assistant.

Once Home Assistant has finished restarting, you should see the upgrade Material Design 3 components and the Material You Utilities configuration panel in the sidebar. You may need to clear app/browser cache. You do not need to restart Home Assistant for subsequent updates.

## Updating and Troubleshooting

While this module should be automatically updated through HACS after initial installation, you may run into issues with updates not loading due to sticky cache issues. [**See this thread**](https://github.com/Nerwyn/material-you-utilities/discussions/12) for troubleshooting steps, help, and discussion.

# The Configuration Panel

This module comes with it's own configuration panel! If you are the Home Assistant server administrator, you can use this panel to create and set input helper entities for all users and global defaults. If you are not the administrator you can set the input helper entities for yourself, but an administrator must create them first.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/configuration-panel.png" width="750"/>

The settings for every user and the global settings are all the same. If a user does not have a setting set, then the global setting is used.

To create input helper entities for a user, click on `Create Helpers` in their settings card. Similarly, you can delete input helper entities for a user by clicking `Delete Helpers`. After creating helpers, you or their non-admin user can modify them from the configuration panel or open their more info dialog using the buttons to their left.

You can use the configuration panel to setup the dynamic color theme and to modify some style options.

## Dynamic Color Theme

### Base Color

Material color themes are built around a base color, from which all other theme colors are derived depending on the scheme rules. This color defaults to `#4C5C92` (a shade of blue), but can be set to any other color using the color wheel.

#### Home Assistant Android App Color Sensor

If you are using the Home Assistant Android companion app, you can enable the accent color sensor in the companion app settings to use your phones Material Design accent color as the theme base color:

1. Navigate to `Settings` > `Companion app`.
2. Click `Manage sensors.`
3. Scroll down to the section titled `Dynamic color` and click `Accent color`.
4. Toggle `Enable sensor` on. It should now return your phone's Material Design base color as a hex code.

You can then create an automation to set your Material Design base color whenever the sensor changes.

```yaml
description: ''
mode: single
triggers:
  - trigger: state
    entity_id:
      - sensor.pixel_fold_accent_color
conditions: []
actions:
  - action: input_text.set_value
    metadata: {}
    data:
      value: '{{ states("sensor.pixel_fold_accent_color") }}'
    target:
      entity_id: input_text.material_you_base_color
```

### Color Schemes

By default, this theme will use the `Tonal Spot` color scheme. This scheme is the default color scheme used by Android 12.

In addition to the modern Android color scheme, [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) offers several alternate schemes.

| Name        | Description                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tonal Spot  | Dynamic Color theme with low to medium colorfulness and a Tertiary TonalPalette with a hue related to the source color.<br> The default Material You theme on Android 12.                                                                                                                                                                                                                                               |
| Content     | A scheme that places the source color in `Scheme.primaryContainer`.<br> Primary Container is the source color, adjusted for color relativity.<br> It maintains constant appearance in light mode and dark mode.<br> This adds ~5 tone in light mode, and subtracts ~5 tone in dark mode.<br> Tertiary Container is the complement to the source color, using `TemperatureCache`. It also maintains constant appearance. |
| Fidelity    | A scheme that places the source color in `Scheme.primaryContainer`.<br> Primary Container is the source color, adjusted for color relativity.<br> It maintains constant appearance in light mode and dark mode.<br> This adds ~5 tone in light mode, and subtracts ~5 tone in dark mode.<br> Tertiary Container is the complement to the source color, using `TemperatureCache`. It also maintains constant appearance. |
| Expressive  | A Dynamic Color theme that is intentionally detached from the source color.                                                                                                                                                                                                                                                                                                                                             |
| Fruit Salad | A playful theme - the source color's hue does not appear in the theme.                                                                                                                                                                                                                                                                                                                                                  |
| Rainbow     | A playful theme - the source color's hue does not appear in the theme.                                                                                                                                                                                                                                                                                                                                                  |
| Vibrant     | A Dynamic Color theme that maxes out colorfulness at each position in the Primary Tonal Palette.                                                                                                                                                                                                                                                                                                                        |
| Neutral     | A Dynamic Color theme that is near grayscale.                                                                                                                                                                                                                                                                                                                                                                           |
| Monochrome  | A Dynamic Color theme that is grayscale.                                                                                                                                                                                                                                                                                                                                                                                |

If an invalid or no scheme is provided, it will default to `Tonal Spot` or the globally set scheme.

### Contrast Level

Each scheme can also be provided with a custom contrast from -1 to 1. Value outside of this range are clamped to it. If an invalid or no value is provided it will default to `0`.

### Specification Version

With the Material Expressive update, Material Design 3 now has new specifications for color themes. You can choose between the original `2021` color specification, or the updated `2025` specification. Combine the `2025` specification with the `Expressive` scheme to use the new Material Expressive palette.

### Platform

Material Expressive also comes with two platform options when using the 2025 color specification - `Phone` and `Watch`. While you probably want to keep this at the default `Phone` setting, you have the ability to choose.

## Style Options

A refresh is required for style options to apply.

### Style Upgrades

If you want to disable the Material Design 3 component upgrades, toggle Style Upgrades off. Doing so will still allow you to set custom color themes and card types.

### Card Type

The Material Design 3 specification has [three different card type style variations](https://m3.material.io/components/cards/overview#ccabd69f-a01a-4b55-868f-9428f244c4bd). You can choose which one will be used as the default card style here. You can also choose to make cards transparent.

Some cards, like those found in the configuration pages, already have the attribute `outlined`. This attribute will supersede the default `elevated` card style or user chosen card type.

# Material Design 3 Components

In addition to the CSS custom properties in the theme YAML, this themes companion module modifies the lifecycle methods styles of many Home Assistant component constructors to inject additional CSS styles to make the components follow the Material Design 3 specification.

## Navigation

### [App Bars](https://m3.material.io/components/top-app-bar/overview)

Menu buttons at the top of the screen. For regular views the menu buttons remain will gain a background on scroll. For subviews the entire app bar remains but shifts to a surface container color.

Large, medium, and small headline titles and subtitles can be added using Home Assistant sections view titles either using markdown or HTML headings as described below.

| Size   | Type     | Markdown              | HTML                       |
| ------ | -------- | --------------------- | -------------------------- |
| Large  | Title    | # Large Title         | \<h1>Large Title\</h1>     |
| Medium | Title    | ## Medium Title       | \<h2>Medium Title\</h2>    |
| Small  | Title    | ### Small Title       | \<h3>Small Title\</h3>     |
| Large  | Subtitle | #### Large Subtitle   | \<h4>Large Subtitle\</h4>  |
| Medium | Subtitle | ##### Medium Subtitle | \<h5>Medium Subtitle\</h5> |
| Small  | Subtitle | ###### Small Subtitle | \<h6>Small Subtitle\</h6>  |

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/app-bar.png" width="500"/>

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/headline.png" width="300"/>

### Notes

- Subviews use the [small app bar](https://m3.material.io/components/app-bars/specs#fac99130-8bb8-498c-8cb8-16ea056cc3e1) specification and have only received minor margin adustments to match.
- The headline is now only present for subviews and hidden for single view dashboards by default. The fonts for these titles has been updated.
- Standard views no longer have a headline by default. This was added to this theme shortly before Home Assistant added its own more customizable view title system. Between the built in title option and the Material Expressive updates, I decided to remove this title in favor of user added titles instead. Home Assistants section view title system is more in line with the Material Expressive specification, and its fonts and colors have been updated to match.
- If you place a subtitle right after a title, the margins between them will be removed like in the screenshot above.

### [Navigation Bar](https://m3.material.io/components/navigation-bar/overview)

View tabs displayed at the bottom of the screen, dynamically scaling with page width. On wide (width greater than 870px) displays the view tabs are horizontal. On smaller displays the view tabs are vertical.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/navigation-bar-vertical.png" width="500"/>

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/navigation-bar-horizontal.png" width="500"/>

#### Notes

- The view tabs are more akin to [Material Design 3 tabs](https://m3.material.io/components/tabs/overview), but I chose to restyle them as a navigation bar as doing so was one of the original purposes of this theme. View tabs as a navigation bar makes more sense within the context of how Home Assistant dashboards are used, and are much easier to use on tall phone displays.
- Displaying navigation bars alongside rails is not considered good practice, but is done so in this theme due to the increased accessability the bottom aligned navigation bar offers over top aligned tabs.
- Home Assistant itself uses bottom aligned tabs for mobile settings pages, which is similar to the navigation bar.

- The navigation drawer (and rail below) is smaller in width and destination size than the specification calls for. This is to prevent it from taking up too much horizontal space, and due to difficulty restyling it without modifying the `ha-drawer` element, which is rendered too early to consitently modify the styles of.
- The navigation drawer is supposed to have a top and bottom left border radius, but adding this requires modifying `ha-drawer`, which is rendered too early to be consistently modified.

### [Navigation Rail](https://m3.material.io/components/navigation-rail/overview)

Desktop sidebar and mobile modal drawer.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/navigation-rail.png" width="500"/>

#### Notes

- The specification calls for the expanded and modal navigation rail to have variable width based on the width of the destination items, but making the width variable while expanded can cause it to cover the view. Therefore it uses the Home Assistant default fixed width for expanded drawers. The modal rail is variable width.
- Previously the expanded rail and modal dialog used the [navigation drawer specification](https://m3.material.io/components/navigation-drawer/overview), which has been deprecated and merged into navigation rail.
- Expanding and collapsing the rail has been updated with expressive animations.

### [Badges](https://m3.material.io/components/badges/overview)

Alerts the user to notifications.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/badge.png" width="200"/>

#### Notes

- Before Material Expressive, a third badge variant was available specific to the navigation drawer. This variant has been deprecated alongside the navigation drawer specification.

## [Cards](https://m3.material.io/components/cards/overview)

The ubiquitous container which most Home Assistant lovelace elements are built around.

### [Elevated Card](https://m3.material.io/components/cards/specs#a012d40d-7a5c-4b07-8740-491dec79d58b)

A background color similar to the view background with elevation. The default card style.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/elevated-card.png" width="500"/>

### [Filled Card](https://m3.material.io/components/cards/specs#0f55bf62-edf2-4619-b00d-b9ed462f2c5a)

A contrasting background color with no elevation.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/filled-card.png" width="500"/>

### [Outlined Card](https://m3.material.io/components/cards/specs#9ad208b3-3d37-475c-a0eb-68cf845718f8)

An outlined card with the same background color as the view and no elevation.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/outlined-card.png" width="500"/>

### Notes

- Cards will default to `elevated` unless they have a class or attribute that says otherwise.
- Some cards such as those found in the settings pages already have the attribute `outlined`, which will supersede the default `elevated` style.
- In order to use card styles other than elevated, you have to modify the class of the card using card-mod or set an alternate card type using the configuration panel [as described above](#card-type). The options are:
  - elevated
  - filled
  - outlined
  - transparent
- Card type classes set with card-mod will supersede card types set using the configuration panel. This way you can set an overall default card type but still modify the card types of individual cards.

```yaml
card_mod:
  class: 'filled'
```

- The specification says to use border-radius shape `--md-sys-shape-corner-medium` (12px), but I opted to instead use `--md-sys-shape-corner-extra-large` (28px). I had a few reasons for this.
  1. Material Design 3 cards are containers for interactable elements and information, but cards in Home Assistant are mostly interactable elements themselves. Interactable elements in Material Design 3 tend to have much rounder corners.
  2. Material Design 3 specification website itself uses larger more rounded border radii for card elements.
  3. Material Design 3 apps like Google Home use larger border radii for card-like interactable elements.

## Buttons

### [Text Buttons](https://m3.material.io/components/buttons/specs#899b9107-0127-4a01-8f4c-87f19323a1b4)

Buttons that are just text with no background.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/text-button.png" width="500"/>

### [Outlined Buttons](https://m3.material.io/components/buttons/specs#de72d8b1-ba16-4cd7-989e-e2ad3293cf63)

Like text buttons, but with an outline.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/outlined-button.png" width="200"/>

### [FAB](https://m3.material.io/components/floating-action-button/overview)

Floating action button with just an icon.

#### Notes

- Home Assistant doesn't normally use icon only FABs! The add view button in non-sections views has been transformed into a FAB as there isn't a good place for it on the transformed header or footer.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/fab.png" width="500"/>

### [Extended FAB](https://m3.material.io/components/extended-fab/overview)

Extended floating action buttons which appear in legacy views, and the integrations, devices, and helpers pages.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/extended-fab.png" width="500"/>

## [Chips](https://m3.material.io/components/chips/overview)

Small button-like elements that can be used to display information or fire actions.

### [Outlined Chips](https://m3.material.io/components/chips/specs#a144389c-9478-4fe4-9bd8-ca9f7dd830eb)

Follows the Assist Chip specification. Used in configuration menus and HACS.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/outlined-chip.png" width="500"/>

### [Filled Chips](https://m3.material.io/components/chips/specs#e900592f-75a4-4298-853c-bedd8f462f83)

Follows the Filter Chip (selected) specification. Can be added to the header or footer of some cards to fire actions and used in add-ons pages.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/filled-chip.png" width="500"/>

#### Notes

- While it would make more sense to use the elevated assist chip specification for this as both this and outlined chips are the same `ha-assist-chip` element, when designed as one it blends in with card backgrounds, where it is usually found.

### [Input Chips](https://m3.material.io/components/chips/specs#facb7c02-74c4-4b81-bd52-6ad10ce351eb)

Follows the Input Chip specification. Used by list selectors found in configuration menus.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/input-chip.png" width="500"/>

### Notes

- Chips in Home Assistant do not function like chips in Material Design 3. Instead of being informational or for less important actions, they are generally equivalent to buttons.
- Badges in Home Assistant are not equivalent to [Material Design 3 badges](https://m3.material.io/components/badges/overview), they are instead like a hybrid between cards and chips. It doesn't make sense to style them as chips as it tends to make them look worse, especially when used with entity pictures.

## Inputs

### [Switches](https://m3.material.io/components/switch/overview)

Toggle switches for setting boolean values.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/switch.png" width="500"/>

### [Sliders](https://m3.material.io/components/sliders/overview)

Numerical inputs optimized for human interaction.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/slider.png" width="500"/>

#### Notes

- The specification calls for the tooltip to appear and the handle to narrow when the slider is focused or pressed, but not hovered. The Home Assistant slider shows the tooltip on hover, and it is difficult to disable this behavior without breaking the tooltip and slider narrowing altogether. So instead the tooltip appears and handle narrows on hover.
- Home Assistant actually has its own implementation of a Material Design 3 slider, but it is only used for the card configuration layout grid size picker. The styles of this slider have been slightly modified to use theme colors, to modify the tooltip size, and to narrow the handle when pressed or focused.

## Pop-ups

### [Snackbars](https://m3.material.io/components/snackbar/overview)

Floating messages that appear on the bottom of the screen, also known as toasts.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/snackbar.png" width="500"/>

#### Notes

- The bottom offset of snackbars has been increased to appear above the navigation bar, fixing it from preventing you from navigating your dashboard if a snackbar was in the way. I was not able to figure out a way to make this bottom offset change depending on whether the navigation bar was visible or not, as the navigation bar and snackbar are deep within different shadow roots.

### [Dialogs](https://m3.material.io/components/dialogs/overview)

Windows that appear to display information or ask for user input, like more-info and confirmation dialogs.

#### [Basic Dialogs](https://m3.material.io/components/dialogs/specs#23e479cf-c5a6-4a8b-87b3-1202d51855ac)

Lighter color and updated font.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/basic-dialog.png" width="500"/>

#### [Full-screen Dialogs](https://m3.material.io/components/dialogs/specs#bbf1acde-f8d2-4ae1-9d51-343e96c4ac20)

Background color changes on scroll and updated font.

<img src="https://raw.githubusercontent.com/Nerwyn/material-you-utilities/expressive/assets/full-screen-dialog.png" width="500"/>

#### Notes

- Home Assistant has a more modern dialog used for confirmations and similar messages. This dialog mostly follows the Material Design 3 specification, but does not turn into a full-screen dialog on smaller displays.
- Dialogs have been updated with an expressive opening animation.

# Developing, Modifying, and Building

This repository requires npm and Node.js to develop. The JavaScript module is a minified file compiled using webpack. The source files are all written using TypeScript. After forking the repository and cloning to your machine, run the command `npm run setup` to setup the pre-commit hooks and install dependencies.

There are four main files:

- `src/classes/material-you-panel.ts` - the configuration panel.
- `src/utils/colors.ts` - the color theming set and unset functions.
- `src/utils/styles.ts` - the component style upgrade application functions.
- `src/material-you-utilities.ts` - the entrypoint file which calls these functions, sets up triggers, and defines the configuration panel custom element.

TypeScript types and interface and constants can be found in `src/models`, along with constants used throughout the module. Other helper functions can be found in `src/utils`.

The styles used by the component style upgrade functions can be found in the `src/css` folder, where they are named after the custom elements they are applied to. They must also be added to the `src/css/index.ts` file elements object to be picked up by the component style upgrade functions.

To build this module, either make a commit (to your own fork) or run the command `npm run build`. The compiled JavaScript module and a gzipped copy of it (which is ignored by git and is for local testing) can be found in the `dist` folder. Webpack can take a little bit of time to run, especially the first time you run it after opening the terminal. You can upload the gzipped file to your Home Assistant instance to overwrite the copy download from and created by HACS to test your changes. This file is located in your configuration folder at `www/community/material-you-utilities`.
