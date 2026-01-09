# Manual Save Feature Documentation

## Overview

The Real-Time Collaboration App now includes both **automatic saving** and **manual saving** capabilities, giving users full control over when their document changes are saved.

## Features

### 1. Auto-Save (Enhanced)

**How it works**:
- Automatically saves your changes after **2 seconds** of inactivity
- Triggers when you stop typing or editing
- Runs in the background without interrupting your work

**Visual Feedback**:
- **"Saving..."** indicator appears during save operation
- **"Auto-saved"** toast notification confirms successful save
- **"Auto-save failed"** alert if save encounters an error

**Benefits**:
- Never lose your work due to forgotten saves
- Seamless background operation
- Reduced cognitive load

### 2. Manual Save (New)

**How to Save Manually**:

#### Option 1: Save Button
- Click the **"Save"** button in the toolbar
- Located next to the presence indicators
- Button highlights when there are unsaved changes

#### Option 2: Keyboard Shortcut
- Press **Ctrl+S** (Windows/Linux)
- Press **Cmd+S** (Mac)
- Works from anywhere in the editor

**Visual Indicators**:

1. **Unsaved Changes**:
   - Amber/yellow text: "Unsaved changes"
   - Save button highlighted (default variant)
   - Appears immediately when you edit

2. **Saving in Progress**:
   - Gray text with spinner: "Saving..."
   - Save button disabled
   - Prevents duplicate save operations

3. **All Saved**:
   - Green text: "All changes saved"
   - Save button grayed out (ghost variant)
   - Save button disabled until next edit

**When to Use Manual Save**:
- Before closing the browser
- Before navigating away
- After important edits
- When you want immediate confirmation
- If auto-save fails

## User Interface

### Toolbar Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]  [Document Title]  [Status Indicator]            │
│                                                             │
│  [👤 Active Users] | [💾 Save] [🕐 History] [⬇ Export]    │
│                      [💬 Comments] [👥 Share] [👥 Collab]  │
└─────────────────────────────────────────────────────────────┘
```

### Status Indicators

**Location**: Below document title, left side

**States**:
1. **Saving** (Gray + Spinner):
   ```
   ⟳ Saving...
   ```

2. **Unsaved Changes** (Amber):
   ```
   ⚠ Unsaved changes
   ```

3. **All Saved** (Green):
   ```
   ✓ All changes saved
   ```

### Save Button

**Location**: Toolbar, after active users indicator

**States**:
1. **Has Unsaved Changes** (Highlighted):
   - Variant: `default` (blue background)
   - Enabled: Yes
   - Icon: Save (💾)
   - Text: "Save"

2. **No Unsaved Changes** (Grayed):
   - Variant: `ghost` (transparent)
   - Enabled: No
   - Icon: Save (💾)
   - Text: "Save"

3. **Saving** (Disabled):
   - Variant: Current state
   - Enabled: No
   - Icon: Save (💾)
   - Text: "Save"

## Technical Implementation

### State Management

```typescript
// Track current content being edited
const [currentContent, setCurrentContent] = useState<EditorContent | null>(null);

// Track if there are unsaved changes
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Track saving state
const [saving, setSaving] = useState(false);
```

### Content Change Handler

```typescript
const handleContentChange = useCallback(
  (newContent: EditorContent) => {
    // Update current content
    setCurrentContent(newContent);
    
    // Mark as unsaved
    setHasUnsavedChanges(true);
    
    // Schedule auto-save after 2 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      // Save to database
      await updateDocumentContent(documentId, newContent, user.id);
      
      // Mark as saved
      setHasUnsavedChanges(false);
      
      // Show success notification
      toast({ title: 'Auto-saved' });
    }, 2000);
  },
  [documentId, user]
);
```

### Manual Save Handler

```typescript
const handleManualSave = useCallback(async () => {
  // Validate
  if (!documentId || !user || !currentContent) {
    toast({ title: 'Error', description: 'No changes to save' });
    return;
  }

  try {
    // Set saving state
    setSaving(true);
    
    // Save to database
    await updateDocumentContent(documentId, currentContent, user.id);
    
    // Mark as saved
    setHasUnsavedChanges(false);
    
    // Show success notification
    toast({ title: 'Saved', description: 'Document saved successfully' });
  } catch (error) {
    // Show error notification
    toast({ title: 'Save failed', variant: 'destructive' });
  } finally {
    setSaving(false);
  }
}, [documentId, user, currentContent]);
```

### Keyboard Shortcut

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check for Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // Prevent browser save dialog
      handleManualSave();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleManualSave]);
```

## Auto-Save Behavior

### Timing
- **Delay**: 2 seconds after last edit
- **Debounced**: Each new edit resets the timer
- **Example**:
  ```
  Type "Hello"     → Timer starts (2s)
  Type " World"    → Timer resets (2s)
  Stop typing      → Wait 2s → Auto-save
  ```

### Version Snapshots
- Creates version snapshot every **10 edits**
- Automatic versioning for history
- Accessible via "History" button

### Error Handling
- **Auto-save fails**: Shows error toast, prompts manual save
- **Manual save fails**: Shows error toast with retry option
- **Network issues**: Queues save for retry (future enhancement)

## User Experience

### Workflow Example

1. **User opens document**:
   - Status: "All changes saved" (green)
   - Save button: Disabled, ghost variant

2. **User starts typing**:
   - Status: "Unsaved changes" (amber)
   - Save button: Enabled, highlighted

3. **User stops typing**:
   - Status: "Unsaved changes" (amber)
   - After 2 seconds: "Saving..." (gray + spinner)
   - After save: "All changes saved" (green)
   - Save button: Disabled, ghost variant

4. **User presses Ctrl+S**:
   - Immediately: "Saving..." (gray + spinner)
   - After save: "All changes saved" (green)
   - Toast: "Document saved successfully"

### Best Practices

**For Users**:
1. Trust auto-save for normal editing
2. Use manual save before:
   - Closing browser
   - Navigating away
   - Important milestones
3. Watch status indicators for confirmation
4. Use Ctrl+S for peace of mind

**For Developers**:
1. Always show save status clearly
2. Provide multiple save methods
3. Handle errors gracefully
4. Give immediate feedback
5. Never lose user data

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate to Save button
- **Enter**: Activate Save button
- **Ctrl+S**: Save from anywhere

### Screen Readers
- Save button labeled "Save"
- Status indicators announced
- Toast notifications read aloud

### Visual Indicators
- Color-coded status (amber, green, gray)
- Icon + text for clarity
- Button state changes (highlighted/grayed)

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge - Full support
- ✅ Firefox - Full support
- ✅ Safari - Full support
- ✅ Opera - Full support

### Keyboard Shortcuts
- ✅ Windows/Linux: Ctrl+S
- ✅ Mac: Cmd+S
- ✅ Prevents browser save dialog

## Troubleshooting

### Auto-Save Not Working

**Symptoms**:
- Status stays "Unsaved changes"
- No "Auto-saved" notification
- Changes lost on refresh

**Solutions**:
1. Check internet connection
2. Check browser console for errors
3. Try manual save (Ctrl+S)
4. Refresh page and try again
5. Check Supabase connection

### Manual Save Not Working

**Symptoms**:
- Save button doesn't respond
- "Save failed" error message
- Changes not persisted

**Solutions**:
1. Check internet connection
2. Verify you're logged in
3. Check document permissions
4. Try refreshing the page
5. Check browser console for errors

### Keyboard Shortcut Not Working

**Symptoms**:
- Ctrl+S opens browser save dialog
- Nothing happens when pressing Ctrl+S

**Solutions**:
1. Ensure focus is on the page (click somewhere)
2. Check if browser extension is interfering
3. Try clicking Save button instead
4. Check browser console for errors

### Status Indicator Stuck

**Symptoms**:
- Status shows "Saving..." indefinitely
- Status doesn't update after save

**Solutions**:
1. Refresh the page
2. Check network tab for failed requests
3. Try manual save
4. Check Supabase status

## Performance

### Optimization
- **Debounced auto-save**: Prevents excessive saves
- **Efficient state updates**: Minimal re-renders
- **Async operations**: Non-blocking saves
- **Error boundaries**: Graceful error handling

### Network Usage
- **Auto-save**: Every 2 seconds (when editing)
- **Manual save**: On demand
- **Payload size**: Minimal (only content changes)
- **Compression**: Handled by Supabase

## Security

### Data Protection
- **Authentication required**: Must be logged in
- **Permission checks**: Validates user can edit
- **Secure transmission**: HTTPS only
- **Database security**: Supabase RLS policies

### Validation
- **Content validation**: Checks for valid content
- **User validation**: Verifies user identity
- **Document validation**: Ensures document exists
- **Error handling**: Prevents data corruption

## Future Enhancements

Planned improvements:
- [ ] Offline save queue
- [ ] Conflict resolution UI
- [ ] Save history timeline
- [ ] Undo/redo integration
- [ ] Auto-save interval customization
- [ ] Save on blur (when leaving page)
- [ ] Collaborative save indicators
- [ ] Save analytics

## Summary

**Key Features**:
- ✅ Auto-save every 2 seconds
- ✅ Manual save button
- ✅ Keyboard shortcut (Ctrl+S)
- ✅ Clear status indicators
- ✅ Toast notifications
- ✅ Error handling
- ✅ Version snapshots

**Benefits**:
- Never lose work
- Full user control
- Clear feedback
- Multiple save methods
- Reliable and fast

---

**Enjoy worry-free editing!** 💾✨
