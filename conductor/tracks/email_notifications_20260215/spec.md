# Specification - Email Notifications for Zone Completion

## Overview
Automate communication to industrial managers by sending an email notification whenever a zone's documentation cycle (Before + After photos) is completed.

## User Stories
- **As a Manager**, I want to receive an email when a zone is completed so that I can immediately review the work without checking the dashboard constantly.
- **As a Field Worker**, I want the system to handle notifications automatically so I can focus on my tasks.

## Functional Requirements
- **Trigger:** An email must be sent immediately after a "Before" photo is uploaded, and another email when an "After" photo is uploaded.
- **Content:**
    - **Before Upload:** Zone Name, Work ID, Timestamp, and a notification that documentation has started.
    - **After Upload (Cycle Complete):** Zone Name, Work ID, Timestamps (Before & After), and the total time elapsed.
- **Recipient:** The recipient email address should be configurable via environment variables (e.g., `MANAGER_EMAIL`).
- **Resilience:** Email sending failures should be logged but should not prevent the photo upload from succeeding.

## Technical Requirements
- Use `nodemailer` (already in dependencies).
- Configure SMTP settings via environment variables.
- Create a clean HTML email template.

## Success Criteria
- A manager receives a well-formatted email upon zone completion.
- Automated tests verify the email trigger logic.
- >80% code coverage for the new notification module.
