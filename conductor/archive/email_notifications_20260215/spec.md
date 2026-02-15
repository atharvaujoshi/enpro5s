# Specification - Email Notifications for Zone Completion

## Overview
Automate communication to industrial managers by sending an email notification whenever a zone's documentation cycle (Before + After photos) is completed.

## User Stories
- **As a Manager**, I want to receive an email when a zone is completed so that I can immediately review the work without checking the dashboard constantly.
- **As a Field Worker**, I want the system to handle notifications automatically so I can focus on my tasks.

## Functional Requirements
- **Trigger & Recipient Workflow:**
    - **Before Upload (by User):** Email sent to the **Zone Manager** assigned to that zone.
    - **After Upload (by Zone Manager):** Email sent to the **CEO** to review (Approve/Reject).
    - **Approval/Rejection (by CEO):** Email sent back to the **Zone Manager** with the decision.
- **Content:**
    - **Before Upload:** Zone Name, Work ID, Timestamp, and notification of documentation start.
    - **After Upload:** Zone Name, Work ID, Timestamps (Before & After), and link/instruction for CEO approval.
    - **Decision:** Zone Name, Work ID, Status (Approved/Rejected), and CEO's comment.
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
