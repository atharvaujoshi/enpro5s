# Specification - Email Notifications for Zone Completion

## Overview
Automate communication to industrial managers by sending an email notification whenever a zone's documentation cycle (Before + After photos) is completed.

## User Stories
- **As a Manager**, I want to receive an email when a zone is completed so that I can immediately review the work without checking the dashboard constantly.
- **As a Field Worker**, I want the system to handle notifications automatically so I can focus on my tasks.

## Functional Requirements
- **Trigger:** The email must be sent immediately after the "After" photo is successfully uploaded and the zone status changes to "Complete".
- **Content:** The email should include:
    - Zone Name/ID
    - Timestamp of completion
    - Links to the before and after photos (if accessible via URL)
    - Total time elapsed between before and after captures.
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
