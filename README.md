# Visual-Interfaces-UpdatedProject-1
Documentation-V2
Education & Health Awareness Dashboard
 

Author: Hethu Sri Nadipudi

​​​​​​​​​​​​​​​​
​​​​​​​​​​​​​​​​​​​

​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​

Overview
This is updated version of Project 1 demonstrates improvements made after completing Projects 2 and 3. My focus for this revision was to enhance the interactivity, usability, and design of the visualization.  The revised submission includes changes to the UI layout, added interactivity like tooltips and filtering, improved accessibility through color and layout choices, and implemented D3 features more effectively.

Usability & Interaction Improvements
Handled Missing Data (-1 Values):
All instances of -1 (representing missing data) have been filtered out or excluded from visual mappings, such as the histogram and choropleth map. This prevents visual distortions and incorrect coloring due to placeholder values.

Histogram Updates:

Excluded counties with no data from being rendered in the histogram.

Added data labels on bars to provide insight even when the bars are too small to hover reliably.

Tooltip Enhancements:

Implemented formatted, readable text in all tooltips across visualizations.

Unified style for details-on-demand to keep the look consistent and user-friendly.

Improved hover state feedback (e.g., brighter outlines) for better interactivity.

Brushing Interactivity Fix (Scatterplot):

Added a clear brush functionality upon clicking anywhere on the scatterplot to reset brushing selections easily.

Legend and Titles:

Added a legend to the choropleth to help interpret color encodings.

Improved titles across all visualizations to be more descriptive and intuitive.

Slider UI Rework:

Replaced the original slider with a more intuitive tab menu, based on the feedback. This enhances usability and prevents confusion caused by tick marks that looked like buttons.

Help Button Added:

A dedicated Help button was introduced to explain how to interact with the visualizations, filters, and brushing features. This serves as an onboarding guide for new users and enhances self-exploration.

Visualization Components:

​

Home Page(Updated):

image.png
Tab Based Attribute Selection:
I selected the default attribute as Percent of Population with No Health Insurance. I implemented tab-based attribute selection to streamline user interaction.Each tab corresponds to a different attribute, simplifying exploration of data variables. It enhances usability and ensures users can quickly compare different attributes..

image.png
image.png
Histogram:

Updated the histogram with a clearer, formatted tooltip and added a title for better readability.

Added a distinct hover color to improve visual feedback during interaction.

Included data labels on bars to aid interpretation of small or dense values.

These changes enhance usability and support better data insight at a glance.

Choropleth Map:

For the choropleth map, the tooltip was reformatted for clarity and consistency.

A hover color was added to improve interactivity and highlight selected regions.

A descriptive title was introduced to provide context at a glance.

A color legend was added to explain the data scale, improving interpretability.

image.png
image.png
Brushing Technique:

For the scatterplot, the brushing interaction was enhanced by implementing a clear/reset feature.

Users can now easily remove the brush selection without needing to refresh or perform unintuitive actions.

This improves the overall usability and interactivity of the visualization.

The fix ensures a smoother and more intuitive exploration experience.

image.png
Removal of brush selection, upon clicking anywhere on the scatterplot

Bug Fixes in Version 2:

Here’s a brief explanation of the bugs fixed in Version 2, along with how I resolved:

​

Brushing Behavior on Scatterplot:

Bug:Once brushing was done, there was no intuitive way to clear the brush without refreshing or clicking awkwardly.

Fix: Implemented a clear brush on empty click logic. Users can now click anywhere on the scatterplot to remove the brush area easily.

​

Invalid Data Points Affecting Color Scales:
Bug: Data points with values like -1 or null were skewing the color scale and visualization, especially on the choropleth and histogram.
Fix: Cleaned the dataset to filter out invalid or missing values, ensuring only valid values influence scales and rendering.
​
Global Attribute Variable Added:
Bug: Some components (like the choropleth or scatterplot) didn’t correctly reflect the newly selected attribute, leading to stale or mismatched data views.
Fix: I ensured the GlobalSelectedAttribute is centrally managed and consistently updated on attribute change.I also refactored dependent functions to re-read this variable dynamically rather than cache old values.
​
Scatterplot After Update – Brushing Color Bug:
Bug: After updating the scatterplot (e.g., due to attribute selection), the brushed area retained the old color scheme or didn’t apply the updated brushing highlight color correctly.
Fix: I corrected the brushing update logic to reapply the correct color and opacity upon redraw. I also ensured brushing state resets properly on attribute or data change, improving visual consistency.
​
Development Process​
Libraries & Technologies Used

D3.js for data visualization.

Topojson.v3.js & counties-10m.json for mapping.

HTML, CSS, JavaScript for web development.

Code Structure

index.html → Main layout of the dashboard.

style.css → Styling for a clean & interactive UI.

script.js → Handles data loading, visualization, and interactivity.

GitHub Repository:  https://github.com/HethuSriN/Visual-Interfaces-UpdatedProject-1

Live Deployment (Vercel): https://visual-interfaces-updated-project-1.vercel.app/
