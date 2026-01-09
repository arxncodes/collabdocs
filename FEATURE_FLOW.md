# Shareable Invitation Links - Feature Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SHAREABLE LINKS SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Document Owner  │         │   Invitation     │         │    Recipient     │
│                  │         │     System       │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                            │
        │ 1. Click "Share"           │                            │
        ├───────────────────────────>│                            │
        │                            │                            │
        │ 2. Configure & Generate    │                            │
        ├───────────────────────────>│                            │
        │                            │                            │
        │ 3. Get Invitation URL      │                            │
        │<───────────────────────────┤                            │
        │                            │                            │
        │ 4. Share URL               │                            │
        ├────────────────────────────┼───────────────────────────>│
        │                            │                            │
        │                            │ 5. Click URL               │
        │                            │<───────────────────────────┤
        │                            │                            │
        │                            │ 6. Show Invitation Page    │
        │                            │───────────────────────────>│
        │                            │                            │
        │                            │ 7. Accept/Decline          │
        │                            │<───────────────────────────┤
        │                            │                            │
        │                            │ 8. Add as Collaborator     │
        │                            │───────────────────────────>│
        │                            │                            │
        │                            │ 9. Redirect to Document    │
        │                            │───────────────────────────>│
        │                            │                            │
```

## Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    documents     │         │document_invitations│        │  collaborators   │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ id (PK)          │◄────────│ document_id (FK) │         │ id (PK)          │
│ title            │         │ token (UNIQUE)   │         │ document_id (FK) │
│ owner_id (FK)    │         │ role             │         │ user_id (FK)     │
│ created_at       │         │ created_by (FK)  │         │ role             │
│ updated_at       │         │ status           │         │ invited_by (FK)  │
└──────────────────┘         │ accepted_by (FK) │         │ created_at       │
                             │ expires_at       │         └──────────────────┘
                             │ max_uses         │                 ▲
                             │ use_count        │                 │
                             │ created_at       │                 │
                             └──────────────────┘                 │
                                      │                           │
                                      │  On Accept                │
                                      └───────────────────────────┘
```

## Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                         │
└─────────────────────────────────────────────────────────────────┘

EditorPage
├── Header
│   ├── Title Input
│   ├── Save Status
│   └── Action Buttons
│       ├── History Button
│       ├── Comments Button
│       ├── Share Button ──────┐
│       └── Collaborators Button│
│                               │
├── Editor Content              │
├── Collaborators Sidebar       │
├── Comments Panel              │
├── Version History Dialog      │
│                               │
└── ShareDialog ◄───────────────┘
    ├── Create Invitation Form
    │   ├── Role Select
    │   ├── Expiration Input
    │   ├── Max Uses Input
    │   └── Generate Button
    │
    └── Active Invitations List
        └── Invitation Card
            ├── Role Badge
            ├── Status Badges
            ├── Statistics
            ├── URL Input
            ├── Copy Button
            └── Delete Button


InvitationPage (Standalone)
├── Card Container
│   ├── Header
│   │   ├── Icon
│   │   ├── Title
│   │   └── Description
│   │
│   ├── Document Info
│   │   ├── Document Title
│   │   ├── Invited By
│   │   ├── Your Role
│   │   ├── Document Owner
│   │   └── Expiration Date
│   │
│   ├── Role Description
│   │   └── Permission List
│   │
│   └── Action Buttons
│       ├── Decline Button
│       └── Accept Button
│           (or Login Button)
```

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    OWNER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────┘

1. Open Document
   └─> Click "Share" button

2. Configure Invitation
   ├─> Select Role (Editor/Viewer)
   ├─> Set Expiration (days)
   └─> Set Max Uses (optional)

3. Generate Link
   └─> Click "Generate Invitation Link"

4. Copy & Share
   ├─> Click copy button
   └─> Share URL via any channel

5. Monitor (Optional)
   ├─> View usage statistics
   ├─> Check expiration status
   └─> Delete if needed


┌─────────────────────────────────────────────────────────────────┐
│                  RECIPIENT JOURNEY                               │
└─────────────────────────────────────────────────────────────────┘

1. Receive Link
   └─> Click invitation URL

2. View Invitation
   ├─> See document details
   ├─> See role & permissions
   └─> See who invited

3. Decision Point
   ├─> Not Logged In?
   │   ├─> Click "Login to Accept"
   │   ├─> Login/Signup
   │   └─> Return to invitation
   │
   └─> Logged In?
       ├─> Accept
       │   ├─> Added as collaborator
       │   └─> Redirect to document
       │
       └─> Decline
           ├─> Mark as declined
           └─> Redirect to dashboard
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVITATION STATES                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐
│ PENDING  │ ──────────────────────────────────────┐
└──────────┘                                        │
     │                                              │
     │ User Accepts                                 │ User Declines
     │                                              │
     ▼                                              ▼
┌──────────┐                                   ┌──────────┐
│ ACCEPTED │                                   │ DECLINED │
└──────────┘                                   └──────────┘
     │                                              │
     │ Creates Collaborator                         │
     │                                              │
     ▼                                              ▼
┌──────────────────┐                         ┌──────────────────┐
│ User Added to    │                         │ No Access        │
│ Document         │                         │ Granted          │
└──────────────────┘                         └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  VALIDATION CHECKS                               │
└─────────────────────────────────────────────────────────────────┘

Before Accepting:
├─> Token exists? ──────────────> No ──> Error: Invalid
├─> Expired? ───────────────────> Yes ──> Error: Expired
├─> Max uses reached? ──────────> Yes ──> Error: Max uses
├─> Already collaborator? ──────> Yes ──> Error: Already member
└─> Status pending? ────────────> No ──> Error: Already used

All checks pass ──> Accept invitation ──> Add collaborator
```

## API Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                               │
└─────────────────────────────────────────────────────────────────┘

CREATE INVITATION
┌─────────────────────────────────────────────────────────────────┐
│ createInvitation(documentId, role, createdBy, expires, maxUses) │
├─────────────────────────────────────────────────────────────────┤
│ 1. Generate unique token (UUID)                                 │
│ 2. Calculate expiration date                                    │
│ 3. Insert into document_invitations                             │
│ 4. Return invitation object                                     │
└─────────────────────────────────────────────────────────────────┘

GET INVITATION
┌─────────────────────────────────────────────────────────────────┐
│ getInvitationByToken(token)                                     │
├─────────────────────────────────────────────────────────────────┤
│ 1. Query by token                                               │
│ 2. Join with documents table                                    │
│ 3. Join with profiles (creator & owner)                         │
│ 4. Return invitation with related data                          │
└─────────────────────────────────────────────────────────────────┘

ACCEPT INVITATION
┌─────────────────────────────────────────────────────────────────┐
│ acceptInvitation(invitationId, token, userId)                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. Get invitation by token                                      │
│ 2. Validate (not expired, not max uses, not existing)          │
│ 3. Add user as collaborator                                     │
│ 4. Update invitation (status, accepted_by, use_count)          │
│ 5. Return success with collaborator object                     │
└─────────────────────────────────────────────────────────────────┘

DECLINE INVITATION
┌─────────────────────────────────────────────────────────────────┐
│ declineInvitation(invitationId, userId)                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Update invitation status to 'declined'                       │
│ 2. Set accepted_by to userId                                    │
│ 3. Return success                                               │
└─────────────────────────────────────────────────────────────────┘

DELETE INVITATION
┌─────────────────────────────────────────────────────────────────┐
│ deleteInvitation(invitationId)                                  │
├─────────────────────────────────────────────────────────────────┤
│ 1. Delete from document_invitations                             │
│ 2. Return success                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                   ROW LEVEL SECURITY (RLS)                       │
└─────────────────────────────────────────────────────────────────┘

document_invitations Table Policies:

┌─────────────────────────────────────────────────────────────────┐
│ SELECT (View)                                                   │
├─────────────────────────────────────────────────────────────────┤
│ • Anyone can view by token (public access)                      │
│ • Document owners can view all their invitations                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ INSERT (Create)                                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Only document owners can create invitations                   │
│ • Verified via documents.owner_id = auth.uid()                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ UPDATE (Modify)                                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Document owners can update their invitations                  │
│ • Users can update invitations they accept (accepted_by)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DELETE (Remove)                                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Only document owners can delete invitations                   │
│ • Cascade delete when document is deleted                       │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Integration

```
┌─────────────────────────────────────────────────────────────────┐
│              INTEGRATION WITH EXISTING FEATURES                  │
└─────────────────────────────────────────────────────────────────┘

Collaborators System
├─> Invitation acceptance creates collaborator
├─> Same role-based permissions apply
└─> Appears in collaborators list

Authentication System
├─> Public invitation page (no auth required)
├─> Login required for accept/decline
└─> Redirect flow preserves invitation context

Document Access
├─> Accepted invitations grant document access
├─> Appears in "Shared Documents" tab
└─> Real-time collaboration enabled

Notifications (Future)
├─> Toast notifications for all actions
├─> Could add email notifications
└─> Could add in-app notifications
```

---

This visual documentation provides a comprehensive overview of the shareable invitation links feature architecture and flow.
