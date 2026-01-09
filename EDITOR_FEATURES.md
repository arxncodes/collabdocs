# Enhanced Rich Text Editor - Feature Documentation

## Overview

The enhanced rich text editor provides professional-grade text formatting capabilities including font selection, sizing, colors, alignment, and pre-made layout templates. All formatting is preserved and synchronized across collaborators in real-time.

## Features

### 1. Font Family Selection

**Location**: First row of toolbar, leftmost dropdown

**Available Fonts**:
- Arial (sans-serif) - Clean, modern
- Georgia (serif) - Classic, readable
- Times New Roman (serif) - Traditional, formal
- Courier New (monospace) - Code-like, technical
- Verdana (sans-serif) - Web-friendly, clear
- Helvetica (sans-serif) - Professional, neutral
- Comic Sans (cursive) - Casual, friendly
- Impact (fantasy) - Bold, attention-grabbing
- Tahoma (sans-serif) - Compact, efficient
- Trebuchet (sans-serif) - Modern, elegant

**How to Use**:
1. Select text you want to format
2. Click the font dropdown
3. Choose your desired font
4. Font is applied immediately

**Keyboard Shortcut**: None (use dropdown)

### 2. Font Size Selection

**Location**: First row of toolbar, second dropdown

**Available Sizes**:
- 12px - Small text, footnotes
- 14px - Body text, paragraphs
- 16px - Default size, comfortable reading
- 18px - Slightly larger body text
- 20px - Subheadings
- 24px - Section headers
- 28px - Large headers
- 32px - Major headings
- 36px - Title text
- 48px - Hero text, main titles

**How to Use**:
1. Select text you want to resize
2. Click the size dropdown
3. Choose your desired size
4. Size is applied immediately

**Keyboard Shortcut**: None (use dropdown)

### 3. Text Color Picker

**Location**: First row of toolbar, color palette button

**Color Palette**: 30 carefully selected colors including:
- **Grayscale**: Black, dark gray, medium gray, light gray, white
- **Reds**: Dark red, bright red, light red shades
- **Yellows**: Orange, yellow, light yellow shades
- **Greens**: Bright green, light green shades
- **Blues**: Cyan, various blue shades, light blue
- **Purples**: Purple, magenta, light purple shades
- **Pastels**: Soft pink, peach, mint, lavender

**How to Use**:
1. Select text you want to color
2. Click the color palette button
3. Click on any color in the grid
4. Color is applied immediately
5. Popover closes automatically

**Current Color Indicator**: Shows selected color next to palette icon

### 4. Text Formatting (Basic)

**Location**: First row of toolbar, after color picker

**Available Formats**:
- **Bold** (B icon) - Makes text bold
  - Keyboard: Ctrl+B (Cmd+B on Mac)
- **Italic** (I icon) - Makes text italic
  - Keyboard: Ctrl+I (Cmd+I on Mac)
- **Underline** (U icon) - Underlines text
  - Keyboard: Ctrl+U (Cmd+U on Mac)

### 5. Headings and Structure

**Location**: Second row of toolbar, left side

**Available Options**:
- **Heading 1** (H1 icon) - Large heading
- **Heading 2** (H2 icon) - Medium heading
- **Bullet List** (List icon) - Unordered list
- **Numbered List** (1-2-3 icon) - Ordered list
- **Code Block** (Code icon) - Monospace code formatting

**How to Use**:
1. Place cursor in paragraph or select text
2. Click desired format button
3. Format is applied to entire paragraph

### 6. Text Alignment

**Location**: Second row of toolbar, middle section

**Available Alignments**:
- **Left Align** - Default, text aligned to left
- **Center Align** - Text centered
- **Right Align** - Text aligned to right
- **Justify** - Text stretched to fill width

**How to Use**:
1. Place cursor in paragraph or select text
2. Click desired alignment button
3. Alignment applies to entire paragraph

**Visual Indicators**: Icons show alignment direction

### 7. Pre-made Text Layouts

**Location**: Second row of toolbar, "Layouts" button

**Available Templates**:

#### Title + Subtitle
Large bold title (36px) with smaller subtitle (18px, gray)
```
Your Title Here
Your subtitle or description
```
**Use Case**: Document headers, section introductions

#### Quote Block
Styled blockquote with left blue border and italic text
```
"Your inspiring quote goes here"
```
**Use Case**: Testimonials, citations, emphasis

#### Callout Box
Blue background box with border for important information
```
💡 Pro Tip: Your important message here
```
**Use Case**: Tips, notes, important information

#### Two Columns
Side-by-side content layout with borders
```
┌─────────────┬─────────────┐
│  Column 1   │  Column 2   │
│  Content    │  Content    │
└─────────────┴─────────────┘
```
**Use Case**: Comparisons, parallel content

#### Highlighted Text
Yellow background highlight for emphasis
```
✨ This text is highlighted for emphasis
```
**Use Case**: Key points, important notes

#### Step-by-Step
Numbered steps with circular blue badges
```
① First Step
  Description of the first step

② Second Step
  Description of the second step
```
**Use Case**: Instructions, tutorials, processes

#### Warning Box
Red-tinted box for warnings and alerts
```
⚠️ Warning: Important information that needs attention
```
**Use Case**: Warnings, cautions, critical info

#### Success Box
Green-tinted box for success messages
```
✅ Success: Operation completed successfully
```
**Use Case**: Confirmations, achievements, positive feedback

**How to Use Layouts**:
1. Place cursor where you want to insert layout
2. Click "Layouts" button
3. Browse available templates
4. Click on desired template
5. Template is inserted at cursor position
6. Edit the placeholder text

**Layout Features**:
- Preview thumbnails in picker
- Fully editable after insertion
- Maintains styling across saves
- Works with all other formatting

## Toolbar Organization

### First Row (Font & Basic Formatting)
```
[Font Family ▼] [Size ▼] [🎨 Color] | [B] [I] [U]
```

### Second Row (Structure & Alignment)
```
[H1] [H2] [•] [1.] [</>] | [≡] [≣] [≡] [≣] | [📐 Layouts]
```

## Technical Details

### Content Storage

All formatting is stored as HTML in the document content:
```typescript
interface EditorContent {
  html?: string;      // Rich HTML content
  text?: string;      // Plain text version
  ops?: Array<...>;   // Operation-based format (legacy)
}
```

### Formatting Persistence

- Font families stored as inline styles
- Font sizes stored as inline styles
- Colors stored as inline styles
- Alignment stored as block-level styles
- Layouts stored as complete HTML structures

### Browser Compatibility

Uses standard `document.execCommand` for formatting:
- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ⚠️ Mobile browsers (limited support)

### Real-Time Synchronization

- All formatting changes trigger auto-save
- Changes synchronized every 3 seconds
- Formatting preserved across all collaborators
- Version history includes all formatting

## Usage Tips

### Best Practices

1. **Font Selection**:
   - Use Arial or Helvetica for professional documents
   - Use Georgia or Times for formal documents
   - Use Courier for code snippets
   - Avoid Comic Sans for professional work

2. **Font Sizing**:
   - Use 14-16px for body text
   - Use 24-36px for headings
   - Use 48px sparingly for titles
   - Maintain consistent sizing throughout

3. **Color Usage**:
   - Use black or dark gray for body text
   - Use colors for emphasis only
   - Maintain sufficient contrast
   - Be consistent with color meanings

4. **Alignment**:
   - Left align for most content
   - Center for titles and headers
   - Right align for dates/signatures
   - Justify for formal documents

5. **Layouts**:
   - Use templates for consistency
   - Customize after insertion
   - Don't overuse special layouts
   - Match layout to content purpose

### Common Workflows

#### Creating a Professional Document
1. Insert "Title + Subtitle" layout
2. Set body text to 16px Arial
3. Use H1 for main sections
4. Use H2 for subsections
5. Add callout boxes for key points

#### Creating a Tutorial
1. Insert "Step-by-Step" layout
2. Add numbered steps
3. Use code blocks for examples
4. Add warning boxes for gotchas
5. End with success box

#### Creating a Report
1. Use Times New Roman 14px
2. Justify body text
3. Use headings for structure
4. Add quote blocks for citations
5. Use two-column for comparisons

## Keyboard Shortcuts

### Standard Shortcuts
- **Ctrl+B** (Cmd+B): Bold
- **Ctrl+I** (Cmd+I): Italic
- **Ctrl+U** (Cmd+U): Underline
- **Ctrl+Z** (Cmd+Z): Undo
- **Ctrl+Y** (Cmd+Y): Redo

### Browser Shortcuts
- **Ctrl+A** (Cmd+A): Select all
- **Ctrl+C** (Cmd+C): Copy
- **Ctrl+V** (Cmd+V): Paste
- **Ctrl+X** (Cmd+X): Cut

## Accessibility

### Screen Readers
- All toolbar buttons have descriptive labels
- Color picker includes color names
- Layout templates have semantic HTML

### Keyboard Navigation
- Tab through toolbar buttons
- Enter to activate buttons
- Arrow keys in dropdowns
- Escape to close popovers

### Visual Indicators
- Current font shown in dropdown
- Current size shown in dropdown
- Current color shown as swatch
- Active buttons highlighted

## Troubleshooting

### Formatting Not Applying
- Ensure text is selected
- Try clicking button again
- Check if in read-only mode
- Refresh page if needed

### Colors Not Showing
- Check browser compatibility
- Verify not in code block
- Try different color
- Clear formatting and reapply

### Layouts Not Inserting
- Ensure cursor is in editor
- Click in empty paragraph
- Try different layout
- Refresh if persistent

### Formatting Lost on Save
- Wait for auto-save indicator
- Check internet connection
- Verify not in viewer mode
- Check version history

## Future Enhancements

Potential improvements:
- [ ] Custom color picker (hex input)
- [ ] Font size slider
- [ ] More layout templates
- [ ] Layout customization
- [ ] Format painter tool
- [ ] Style presets
- [ ] Markdown import/export
- [ ] Table support
- [ ] Image insertion
- [ ] Link formatting

---

**Note**: All formatting features are available to users with Editor role. Viewers can see formatted content but cannot edit.
