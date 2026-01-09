# Shareable Invitation Links Feature

## Overview

The shareable invitation links feature allows document owners to generate unique URLs that can be shared with others to grant access to documents. Recipients can view the invitation details and choose to accept or decline the invitation.

## How It Works

### For Document Owners

1. **Generate Invitation Link**
   - Open a document you own
   - Click the "Share" button in the editor toolbar
   - Configure the invitation settings:
     - **Access Role**: Choose between Editor (can edit) or Viewer (read-only)
     - **Expires In**: Set expiration in days (default: 7 days)
     - **Max Uses**: Optionally limit how many people can use the link
   - Click "Generate Invitation Link"

2. **Copy and Share**
   - The generated link appears in the "Active Invitation Links" section
   - Click the copy button to copy the link to clipboard
   - Share the link via email, chat, or any other method

3. **Manage Invitations**
   - View all active invitation links for the document
   - See usage statistics (how many times used, expiration date)
   - Delete invitation links that are no longer needed
   - Expired or max-use-reached links are clearly marked

### For Recipients

1. **Receive Invitation Link**
   - Receive a link like: `https://your-app.com/invite/abc-123-xyz`
   - Click the link to view the invitation

2. **View Invitation Details**
   - See document title and owner information
   - View the role you'll be assigned (Editor or Viewer)
   - See who invited you
   - Check expiration date (if applicable)
   - Read what permissions you'll have

3. **Accept or Decline**
   - **If not logged in**: Click "Login to Accept" → redirected to login → back to invitation
   - **If logged in**: Choose to Accept or Decline
   - **Accept**: Added as collaborator and redirected to the document
   - **Decline**: Invitation marked as declined, redirected to dashboard

## Features

### Invitation Configuration

- **Access Roles**:
  - **Editor**: Can view, edit, comment, and see collaborators
  - **Viewer**: Can view, comment, and see collaborators (cannot edit)

- **Expiration**:
  - Set custom expiration period in days
  - Default: 7 days
  - Expired invitations cannot be accepted

- **Usage Limits**:
  - Optional maximum number of uses
  - Useful for limiting access to specific number of people
  - Unlimited uses if not set

### Security Features

- **Unique Tokens**: Each invitation has a unique UUID token
- **Validation**: Checks for expiration, max uses, and existing collaborators
- **Public Access**: Invitation page is publicly accessible (no login required to view)
- **Protected Actions**: Must be logged in to accept or decline
- **Owner Control**: Only document owners can create and delete invitations

### User Experience

- **Copy to Clipboard**: One-click copy of invitation URLs
- **Visual Feedback**: Success/error toasts for all actions
- **Status Badges**: Clear indication of role, expiration, and usage
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Smooth loading indicators during processing

## Database Schema

### document_invitations Table

```sql
CREATE TABLE public.document_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status invitation_status DEFAULT 'pending' NOT NULL,
  accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT NULL,
  use_count INTEGER DEFAULT 0 NOT NULL
);
```

### Enums

```sql
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');
```

## API Functions

### Create Invitation

```typescript
createInvitation(
  documentId: string,
  role: CollaboratorRole,
  createdBy: string,
  expiresInDays?: number,
  maxUses?: number
): Promise<DocumentInvitation | null>
```

### Get Invitation by Token

```typescript
getInvitationByToken(token: string): Promise<DocumentInvitation | null>
```

### Accept Invitation

```typescript
acceptInvitation(
  invitationId: string,
  token: string,
  userId: string
): Promise<{ success: boolean; collaborator?: Collaborator }>
```

### Decline Invitation

```typescript
declineInvitation(invitationId: string, userId: string): Promise<boolean>
```

### Delete Invitation

```typescript
deleteInvitation(invitationId: string): Promise<boolean>
```

## Components

### ShareDialog

**Location**: `src/components/editor/ShareDialog.tsx`

**Features**:
- Create new invitation links with configuration
- Display active invitations with statistics
- Copy invitation URLs to clipboard
- Delete invitation links
- Responsive scrollable list

**Props**:
```typescript
interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  currentUserId: string;
}
```

### InvitationPage

**Location**: `src/pages/InvitationPage.tsx`

**Features**:
- Display invitation details
- Show document and owner information
- Explain role permissions
- Accept/Decline actions
- Handle login redirect
- Validation and error handling

**Route**: `/invite/:token`

## Usage Examples

### Creating an Invitation

```typescript
// In ShareDialog component
const handleCreateLink = async () => {
  const invitation = await createInvitation(
    documentId,
    'editor',      // role
    currentUserId, // creator
    7,            // expires in 7 days
    10            // max 10 uses
  );
  
  if (invitation) {
    const url = `${window.location.origin}/invite/${invitation.token}`;
    // Share this URL
  }
};
```

### Accepting an Invitation

```typescript
// In InvitationPage component
const handleAccept = async () => {
  const result = await acceptInvitation(
    invitation.id,
    token,
    user.id
  );
  
  if (result.success) {
    navigate(`/editor/${invitation.document_id}`);
  }
};
```

## Validation Rules

### Invitation Validation

1. **Token exists**: Invitation must be found in database
2. **Not expired**: Current date must be before expires_at
3. **Usage limit**: use_count must be less than max_uses (if set)
4. **Not already collaborator**: User must not already have access
5. **Status pending**: Invitation status must be 'pending'

### Access Control

1. **Create**: Only document owners can create invitations
2. **View**: Anyone can view invitation by token (public)
3. **Accept/Decline**: Must be authenticated
4. **Delete**: Only document owners can delete invitations

## Error Handling

### Common Errors

- **Invalid Token**: Invitation not found or deleted
- **Expired**: Invitation has passed expiration date
- **Max Uses Reached**: Too many people have used the link
- **Already Collaborator**: User already has access to document
- **Not Logged In**: Must login to accept invitation

### Error Messages

All errors are displayed with user-friendly toast notifications:
- Success: Green toast with success message
- Error: Red toast with descriptive error message
- Info: Blue toast for informational messages

## Best Practices

### For Document Owners

1. **Set Expiration**: Always set an expiration date for security
2. **Limit Uses**: Use max_uses for controlled sharing
3. **Delete Old Links**: Remove invitations that are no longer needed
4. **Monitor Usage**: Check usage statistics regularly
5. **Use Appropriate Roles**: Give minimum necessary permissions

### For Recipients

1. **Verify Source**: Ensure the invitation is from a trusted source
2. **Check Details**: Review document and role before accepting
3. **Login First**: Have an account ready before clicking invitation
4. **Decline Unwanted**: Decline invitations you don't want

## Troubleshooting

### Link Not Working

- Check if the link has expired
- Verify the link is complete (full URL)
- Ensure you're not already a collaborator
- Check if max uses has been reached

### Cannot Accept Invitation

- Make sure you're logged in
- Verify you have a valid account
- Check if the invitation is still pending
- Ensure you're not the document owner

### Invitation Not Appearing

- Refresh the ShareDialog
- Check if you have owner permissions
- Verify the document exists
- Check browser console for errors

## Future Enhancements

Potential improvements for the invitation system:

1. **Email Invitations**: Send invitation links via email
2. **Custom Messages**: Add personal message to invitations
3. **Invitation History**: Track all invitations (including declined)
4. **Bulk Invitations**: Create multiple invitations at once
5. **Role Changes**: Allow changing role after acceptance
6. **Invitation Templates**: Save common invitation configurations
7. **Analytics**: Track invitation usage and acceptance rates
8. **Notifications**: Notify owner when invitation is accepted

## Security Considerations

1. **Token Generation**: Uses crypto.randomUUID() for secure tokens
2. **Row Level Security**: Database policies enforce access control
3. **Validation**: Multiple checks before accepting invitation
4. **Public Access**: Invitation page is public but actions require auth
5. **Cascade Deletion**: Invitations deleted when document is deleted
6. **No Sensitive Data**: Invitation page doesn't expose sensitive info

## Testing Checklist

- [ ] Create invitation with different roles
- [ ] Create invitation with expiration
- [ ] Create invitation with max uses
- [ ] Copy invitation link to clipboard
- [ ] Accept invitation as logged-in user
- [ ] Accept invitation as logged-out user (redirect flow)
- [ ] Decline invitation
- [ ] Try accepting expired invitation
- [ ] Try accepting invitation at max uses
- [ ] Try accepting as existing collaborator
- [ ] Delete invitation link
- [ ] View invitation statistics
- [ ] Test responsive design on mobile

---

**Note**: This feature requires users to have accounts to accept invitations. Non-registered users will be prompted to login/signup before accepting.
