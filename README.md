# Component Modification for HA-Flipped theme on Home Assistant

Redesign your Home Assistant frontend!

This is a companion module for the [HA Flipped theme](https://github.com/octoTurnip/ha-flipped-theme) _(in the root directory but not yet finished)_ for Home Assistant. This module can be used to generate wildly different colors for my [theme](https://github.com/octoTurnip/ha-flipped-utilities#ha-flipped-theme), and also changes the entire look of the Home Assistant user interface. This can all be configured from a configuration panel included with this module.

# This is a forked project!

This is a forked project from [Material You Utilities by Nerwyn](https://github.com/Nerwyn/material-you-utilities). I have so much love and admiration for him! This honestly couldn't have been done without him. If you have the time, please go check him out and support his work.

Changes & Modifications from the original project will be listed [below](https://github.com/octoTurnip/ha-flipped-utilities#changes-and-modifications). If you would like to see what else this compainion does, please go to the README.md on the original repository.

> [!warning]
> Both projects can't be active at the same time.\
> I will provide steps below to help facilitate a way on how you can easily switch back and fourth between the two.\
> You do not have to completly uninstall the old one.

### Versions

My forks version: ![](https://img.shields.io/badge/HA_Flipped_Utilities-0.1-blue)

Is based on: ![](https://img.shields.io/badge/Material_You_Utilities-2.0.9-green)

# Installation

First time setup and installation of this module is a multistep process as this module **must** be configured in `configuration.yaml`.

## Install the Module From HACS

1. Navigate to HACS (install from [here](https://hacs.xyz/) if you do not have it yet).
<!-- 2. Search for `Material You Utilities`.
2. Open this repository in HACS and click `Download`. -->
3. Click the 3 dots in the top right corner and press "Custom repositories" then enter the following information.
4. Repository: `https://github.com/octoTurnip/ha-flipped-utilities`
5. Type: Dashboard
6. Click add then search for `HA Flipped Utilities` and install it.

## Add the Module as a Frontend Module and Custom Panel

> [!important] > **This is not optional**

The component design upgrades performed by this module are very time sensitive, and must be run as soon as possible. Because of this you must install it as a frontend module in your `configuration.yaml` file.

1. Open your `configuration.yaml`.
   - Your `configuration.yaml` file is found in the `config` folder. More information can be found [here](https://www.home-assistant.io/docs/configuration/).
2. Add the file URL to `frontend` `extra_module_url`, adding the `frontend` and `extra_module_url` keys if they do not exist, and adding to them if they do.
   - If you have links to any old versions of the JavaScript module here or in frontend resources, **delete them**.

```yaml
frontend:
  themes: !include_dir_merge_named themes
  extra_module_url:
    - /hacsfiles/ha-flipped-utilities/ha-flipped-utilities.min.js
```

3. Add the following to the `panel_custom` key in `configuration.yaml`, creating it if it does not exist. This will allow you to access the Material You Utilities configuration panel.
   - More information about custom panels can be found [here](https://www.home-assistant.io/integrations/panel_custom/).
   - While you can technically manually setup in the input helpers this module uses yourself, it is much easier to setup this panel and have it manage them for you. Remember - you can always re-order and hide your sidebar items.

> [!note]
> If you had the original `Material You Utilities`\
> You can leave it all the same,\
> **BUT you must** change the `module_url`

```yaml
panel_custom:
  - name: material-you-panel
    url_path: material-you-configuration
    sidebar_title: Material You Utilities
    sidebar_icon: mdi:material-design
    # module_url: /hacsfiles/material-you-utilities/material-you-utilities.min.js
    module_url: /hacsfiles/ha-flipped-utilities/ha-flipped-utilities.min.js
```

Or add this one to `panel_custom` to avoid confusion:

```yaml
panel_custom:
  # - name: material-you-panel
  #   url_path: material-you-configuration
  #   sidebar_title: Material You Utilities
  #   sidebar_icon: mdi:material-design
  #   module_url: /hacsfiles/material-you-utilities/material-you-utilities.min.js
  - name: material-you-panel
    url_path: ha-flipped-configuration
    sidebar_title: HA Flipped Utilities
    sidebar_icon: mdi:material-design
    module_url: /hacsfiles/ha-flipped-utilities/ha-flipped-utilities.min.js
```

4. Restart Home Assistant.

Once Home Assistant has finished restarting, you should see the upgraded Material Design 3 components and the Material You Utilities configuration panel in the sidebar. You may need to clear app/browser cache and refresh. You do not need to restart Home Assistant for subsequent updates.

## Updating and Troubleshooting

While this module should be automatically updated through HACS after initial installation, you may run into issues with updates not loading due to sticky cache issues. [**See this thread**](https://github.com/Nerwyn/material-you-utilities/discussions/12) for troubleshooting steps, help, and discussion.

For any errors or issues, please post an issue here and not on the main repository.

##### Home Assistant Android App Color Sensor

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
      value: '{{ trigger.to_state.state }}'
    target:
      entity_id: input_text.material_you_base_color
```

# Changes and Modifications

This next part will get a little more technical, but as the TLDR:

To start, I moved the header back to the top. But left some of the goodies that were introduced.

Items are more round, like:

- Selectors
- Buttons
- Checkboxes
- Switches
- Inputs fields
- Card features & custom card features

## Changes

Here are the CSS changes to the original.

<br/>

### ha-select[^ha-select]

The border-radius has been modified to a sideways pill shape

![ha-select.css](/assets/ha-select.png)

[^ha-select]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-select.ts)

<br/>

### ha-textfield[^ha-textfield]

Border-radius modification just like ha-select

![ha-textfield.css](/assets/ha-textfield.png)

[^ha-textfield]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-textfield.ts)

<br/>

### hui-root[^hui-root]

A lot has changed! The header has been moved back to the top of the page. It was nice and easy for my thumb but I use a nav-bar made with button-card, mod-card, and streamline-templates as my main navigation method. And I personally couldnt give that up. I also used my own theme and didnt want to switch to the material theme, but a lot has changed since then. I guess this was the backstory of how I started all this.

Anyways...

- header has been moved back to the top
- menu-button, action-items, and the back-arrow _(on subviews only)_ have the nice added touch Nerwyn made
- removed the edit FAB style
- re-styled the header because I have it styled in my theme
- and removed the alternate nav-bar style for larger screens (might add back later...)

![hui-root.css](/assets/hui-root.png)

[^hui-root]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/hui-root.ts)

<br/>

## Additions

Added extra CSS files so more items can align more with my theme vision.

> [!note]
> If you have custom cards of find something I missed, please open an issue [here](issue/link/here).

<br/>

### Custom card features

Effects options like:

- dropdowns[^ccf-dropdown]
- inputs[^ccf-input]
- toggles[^ccf-toggle]

1. All of them are more rounded to match the theme.
2. Dropdown lists[^ccf-dropdown-option] have their padding removed.
3. Colors changed too so they aren't outside of the theme pallette.

![ccf-photos](/assets/ccf-photos.png)

[^ccf-dropdown]: Custom card feature dropdown, [CSS code here.](https://github.com/Nerwyn/custom-card-features/blob/main/src/classes/custom-feature-dropdown.ts)

[^ccf-dropdown-option]: Dropdowns and dropdown options are stored

[^ccf-input]: Custom card feature input, [CSS code here.](https://github.com/Nerwyn/custom-card-features/blob/main/src/classes/custom-feature-input.ts)

[^ccf-toggle]: Custom card feature toggle, [CSS code here.](https://github.com/Nerwyn/custom-card-features/blob/main/src/classes/custom-feature-toggle.ts)

<br/>

### ha-checkbox[^ha-checkbox]

Square boxes made round... Yay!

![ha-checkbox.css](/assets/ha-checkbox.png)

[^ha-checkbox]: CSS uses MDC library mainly. Use the inspector to make changes.

<br/>

### ha-code-editor[^ha-ce]

A nice little touch to the code editor that rounds the corners a little more.

[^ha-ce]: You'll have to use inspector to find this one.

<br/>

### ha-combo-box-item[^ha-combo-box-item]

Entity pickers are rounder to match the theme.

![ha-combo-box-item.css](/assets/ha-combo-box-item.png)

[^ha-combo-box-item]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-combo-box-item.ts)

<br/>

### ha-control-button[^ha-control-button]

Buttons and buttons on items like the alarm panel now match the theme.

![ha-control-button.css](/assets/ha-control-button.png)

[^ha-control-button]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-control-button.ts)

<br/>

### ha-control-slider[^ha-control-slider]

Sliders on cards are rounded, as well as the background.

![ha-control-slider.css](/assets/ha-control-slider.png)

[^ha-control-slider]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-control-button.ts)

<br/>

### ha-form items

Items like

- ha-form-expandable[^ha-form-expandable]
- ha-expansion-panel[^ha-expansion-panel]

match the theme now.

[^ha-form-expandable]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-form/ha-form-expandable.ts)

[^ha-expansion-panel]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-expansion-panel.ts)

<br/>

### ha-list[^ha-list]

List's from dropdown's have been shaved. Meaning the top and bottom margin have been removed. It just makes it look nicer in my opinion.

[^ha-list]: This gets it's code from MWC, so you will have to use the inspector to change something.

<br/>

### ha-menu[^ha-menu]

These are similar to ha-select but in different areas and menus.

[^ha-menu]: This gets it's code from MDC, so you will have to use the inspector to change something.

<br/>

### hui-card-features[^hui-card-features]

Not to be confused by custom-features, on a tile card if an entity supports it, the border radius will match the theme.

[^hui-card-features]: [HA CSS frontend code here.](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/card-features/hui-card-features.ts)

<br/>

# Conclusion

Thank you all if you try out my addon!

This is still under construction and still in beta. I hope everyone enjoys!
