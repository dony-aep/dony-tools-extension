# dony Tools for Adobe After Effects

## Description

dony Tools is a comprehensive toolkit designed for Adobe After Effects, providing a suite of utilities to enhance your workflow and boost productivity. This extension includes modules for automating Twixtor Pro, managing anchor points, optimizing render settings, and setting up projects efficiently. Whether you're a beginner or an advanced user, dony Tools offers a range of features to streamline your After Effects experience.

## Current Version

**v3.0.0** - Major Redesign & React Migration

For a detailed history of all changes, see the [Changelog](CHANGELOG.md).

## Installation

1. **Download the Extension:**
   - Download the latest version from the official website or repository.

2. **Install the Extension:**
   - For Windows: Copy the folder to `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
   - For Mac: Copy the folder to `/Library/Application Support/Adobe/CEP/extensions/`
   
   Note: You may need to create the extensions folder if it doesn't exist.

3. **Enable Loading of Unsigned Extensions (if needed):**
   - For Windows: Simply double-click the included `Add Keys.reg` file to automatically add the required registry key.
   - For Mac: In the Terminal, run:
     ```
     defaults write com.adobe.CSXS.11 PlayerDebugMode 1
     ```
     Note: Adjust `CSXS.11` based on your After Effects major version if needed, e.g., `CSXS.9` for CC 2019, `CSXS.10` for CC 2020, etc.

4. **Access the Extension in After Effects:**
   - Open Adobe After Effects
   - Navigate to `Window > Extensions > dony Tools` to launch the panel

## Main Features

### Twixtor Pro Tab

-   **Speed Control:**
    -   Adjust the speed of your footage using Twixtor Pro.
    -   Input the desired speed percentage (e.g., 50 for half speed, 200 for double speed).
    -   Apply Twixtor Pro with optimized settings to the selected layer.
    -   **Batch Mode:** Apply Twixtor to all selected layers simultaneously via a checkbox toggle.
    -   **Improved Keyframe Placement:** The script now dynamically calculates the frame duration of the active composition for more accurate keyframe positioning.

### Anchor Point Tab

-   **Quick Anchor Point Positioning:**
    -   Move the anchor point to predefined positions: top-left, top-center, top-right, left-center, center, right-center, bottom-left, bottom-center, bottom-right.
    -   Visual icons for intuitive anchor point manipulation.
-   **Offset Adjustment:**
    -   Fine-tune the anchor point position with X and Y offset controls.
-   **Reset Options:**
    -   Reset the anchor point to the center of the layer.
    -   Reset offset values to zero.
-   **Multi-Layer Support:**
    -   Apply anchor point adjustments to multiple selected layers simultaneously.
-   **Bounds Calculation:**
    -   Accurately calculate the bounds of multiple layers for precise anchor point positioning.
-   **New Organized Layout:**
    - Position Control panel for anchor point positioning buttons
    - Offset Control panel for precise adjustments
    - Improved vertical organization for better workflow

### Render Settings Tab

-   **Output Module Selection:**
    -   Choose from a list of available output modules.
    -   Refresh the list to get the latest output module options.
    -   Search functionality to quickly find the right output module.
-   **Render Queue Management:**
    -   Add the current composition to the render queue with a single click.
    -   Optionally, start rendering automatically after adding to the queue.
-   **File Extension and Filter:**
    -   Automatically determines file extension and filter based on the selected output format.
-   **User-Friendly Save Dialog:**
    -   Provides a standard save dialog for specifying the output file location and name.
-   **Settings Location Access:**
    - Quick access button to open the folder containing output modules settings
    - Direct access to JSON configuration files

### Setup Tab

-   **Preset Project Setups:**
    -   Create default project setups with standard resolutions and folder structures:
        -   **16:9:**  1920x1080 resolution
        -   **1:1:**  1080x1080 resolution
        -   **4:3:** 1600x1080 resolution
    -   Includes standard folders: Comps, Main Comps, Materials, Clips, Episodes.
-   **Custom Project Setup:**
    -   Open a dedicated window to create custom project setups.
    -   Define custom width, height, FPS, duration, number of compositions, and folders.
    -   Name your compositions and assign them to specific folders.
    -   Save and load custom presets for future use.
-   **Preset Management:**
    -   Load and delete saved custom presets.
    -   Search functionality for finding presets quickly.
-   **Quick access to project presets folder**
    -   Easy management of saved project configurations

### About Tab

-   **Information and Credits:**
    -   Displays the extension version and author information.
    -   Provides a brief description of the toolkit's features.
-   **Website Link:**
    -   Button to visit the author's website for more information, updates, contact, and suggestions. The button is labeled "Visit Website".

## Usage

1. **Open Adobe After Effects.**
2. **Launch the dony Tools Panel:**
    -   Go to  `Window > Extensions > dony Tools`.
3. **Flyout Menu:**
    - Access the panel's flyout menu (typically three horizontal lines) for options to refresh the extension or open documentation.
4. **Navigate:**
    - The extension uses a Home dashboard. Tap any feature card to navigate to that tool, and use the back button to return home.
4. **Twixtor Pro:**
    -   Select a layer in your composition.
    -   Enter the desired speed percentage in the  `Speed Input`  field.
    -   Optionally, check `Apply to all selected layers` to enable batch mode.
    -   Click  `Apply Twixtor Pro`  to precompose the layer(s) and apply the effect.
5. **Anchor Point:**
    -   Select one or more layers.
    -   Click the desired anchor point position button (e.g., top-left, center, bottom-right).
    -   Optionally, adjust the  `Offset X`  and  `Offset Y`  values.
    -   Click  `Reset Anchor`  to center the anchor point or  `Reset Offset`  to clear offset values.
6. **Render Settings:**
    -   Select an output module from the dropdown list.
    -   Click  `Refresh`  to update the list if needed.
    -   Click  `Add to Render Queue`  to add the current composition to the render queue with the selected settings.
    -   Check  `Auto Render`  to start rendering immediately after adding to the queue.
7. **Setup:**
    -   Click a preset button (**16:9, 1:1, or 4:3**) to create a project with default settings.
    -   Click  `Open Custom Setup`  to create a project with custom settings.
    -   In the Custom Setup window:
        -   Enter the desired width, height, FPS, duration, number of compositions, and folders.
        -   Click  `Save Preset`  to save your settings as a preset.
        -   Click  `Create Custom Setup`  to create the project.
8. **About:**
    -   Click the  `About`  tab to view script information and visit the author's website.
9. **Tooltips:**
    -   Hover over any button or interface element to see a detailed description of its function.

## Custom Setup Window

### Features

-   **Load Preset:**
    -   Select a previously saved preset from the dropdown list.
    -   Search functionality to find presets easily.
    -   Click  `Load`  to populate the settings fields with the preset values. (Button shows "Loaded" with a check icon temporarily).
    -   Click the refresh icon button to manually reload presets from the file.
-   **Delete Preset:**
    -   Select a preset from the dropdown list.
    -   Click  `Delete`  to permanently remove the preset.
-   **Dimensions:**
    -   Enter the desired width and height in pixels.
    -   Select from common resolution presets in the dropdown list with search functionality.
-   **Duration:**
    -   Set the frames per second (FPS) manually or choose from common FPS presets.
    -   Search functionality to quickly find specific FPS values.
    -   Specify the duration in hours, minutes, and seconds.
-   **Compositions:**
    -   Enter the number of compositions to create.
    -   Click the `+` button to customize composition names and assign them to specific folders.
-   **Folders:**
    -   Add and remove folders using the interactive list with `+` and `×` buttons.
-   **Save Preset:**
    -   Enter a name for your preset.
    -   Click  `Save Preset`  to save the current settings. A confirmation dialog appears if a preset with the same name already exists.
-   **Actions:**
    -   Click  `Reset to Default`  to revert all settings to their default values.
    -   Click  `Create Custom Setup`  to create the project with the specified settings.

## Notes

-   The extension automatically saves output module settings and custom presets to JSON files in your user documents folder under  `Adobe/dony Tools Data`.
-   The responsive design ensures the extension works well at various panel sizes and screen resolutions.
-   All dropdown menus (presets, resolutions, FPS values, and output modules) include search functionality for quick access.

## Compatibility

This extension is designed to be compatible with **Adobe After Effects CC 2018 (version 15.0) and later versions**, up to After Effects 2026. It uses the CEP (Common Extensibility Platform) with CSXS 8 runtime support.

> **Note:** Adobe is gradually migrating from CEP to UXP. CEP is still fully supported in After Effects 2026, but may be retired in future versions.

## Support

If you need help or want to provide feedback, you can contact me here:

[https://donyaep.vercel.app/](https://donyaep.vercel.app/)

Enjoy using dony Tools and enhance your After Effects workflow! :>