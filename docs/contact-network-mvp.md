# Contact Network MVP

## Goal
After signup/login, Realbook should help agents find people from their phone contacts.

The feature has two outcomes:

1. Existing Realbook users found in phone contacts can receive a friend/follow request.
2. Non-users found in phone contacts can receive an invite to join Realbook.

## MVP Rules

- Ask for contact permission clearly before accessing contacts.
- Do not upload the full phonebook publicly.
- Do not show CNIC or private verification data anywhere in contacts.
- Match users by normalized mobile number.
- Show contacts in two groups:
  - On Realbook
  - Invite to Realbook
- Existing users should get a Send Request button.
- Non-users should get an Invite button.
- Invites should use device share/SMS intent first, not paid SMS API.
- No automatic bulk spam invites.
- User must manually tap Invite per contact.

## Suggested Flow

After successful signup or first login:

1. Show screen: Find agents you already know
2. Explain: Realbook can check your phone contacts to find agents already on Realbook.
3. Button: Allow Contacts
4. If allowed:
   - Load contacts from device
   - Normalize phone numbers
   - Compare against Realbook users
   - Show matched users first
   - Show invite contacts below
5. If skipped:
   - Continue to Feed
   - User can access this later from Agents tab

## MVP Screens

- ContactPermissionScreen
- ContactNetworkScreen

## Data Model

ContactMatch:
- id
- name
- mobile
- isExistingUser
- userId optional
- agency optional
- city optional
- requestStatus: none | sent | accepted

InviteContact:
- id
- name
- mobile
- inviteStatus: none | invited

## Future Backend Logic

When Firebase is added:
- Store normalized mobile number on user profile.
- Use a secure lookup service for contact matching.
- Prefer hashed phone lookup if possible.
- Rate-limit invites.
- Prevent duplicate friend requests.

## Not In MVP

- Automatic invite to all contacts
- WhatsApp Business API
- Paid SMS gateway
- Group invitations
- Contact syncing in background
- Uploading contacts without explicit permission
