# Specification - Mobile Centering & Optimization

## Overview
Refine the newly revamped UI by ensuring all major components are centered and optimized for mobile devices. This involves adjusting alignment, spacing, and element widths to provide a balanced and touch-friendly experience on small screens.

## Functional Requirements
- **Centering Strategy:**
    - **Dashboard:** Center-align the "Operations Center" title, stats cards content, and zone card information.
    - **Zone Detail:** Center record titles, photo labels, and the executive verification form.
    - **Login:** Ensure the card and all its internal elements (labels, icons, text) are centered.
    - **Header:** Center logo and user info on mobile breakpoints.
- **Mobile Optimization:**
    - **Full-Width UI:** All primary action buttons (Sign In, New Inspection, Upload, Approval/Rejection) and inputs must span the full container width on mobile.
    - **Interactive Elements:** Tabs and Select triggers must be full-width for easier touch interaction on small screens.
    - **Enhanced Spacing:** Increase vertical margins and padding between centered sections to improve legibility and prevent visual crowding.
- **Responsive Layout:** Adjust existing Tailwind grids and flex containers to maintain balance while centering.

## Acceptance Criteria
- Page titles, descriptions, and card headers are centered on mobile devices.
- Buttons and inputs are full-width on mobile.
- Spacing between sections is increased on mobile to provide a cleaner visual flow.
- The layout remains stable and professional on both desktop and mobile.
