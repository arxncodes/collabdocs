import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type,
  LayoutTemplate,
} from 'lucide-react';
import type { EditorContent } from '@/types/types';

interface RichTextEditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  onCursorChange?: (position: number) => void;
  readOnly?: boolean;
}

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: '"Comic Sans MS", cursive', label: 'Comic Sans' },
  { value: 'Impact, fantasy', label: 'Impact' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet' },
];

const FONT_SIZES = [
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
  { value: '36px', label: '36' },
  { value: '48px', label: '48' },
];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF',
  '#F3F3F3', '#FFFFFF', '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF',
  '#4A86E8', '#0000FF', '#9900FF', '#FF00FF', '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC',
  '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
];

const TEXT_LAYOUTS = [
  {
    id: 'title-subtitle',
    name: 'Title + Subtitle',
    html: '<h1 style="font-size: 36px; font-weight: bold; margin-bottom: 8px;">Your Title Here</h1><p style="font-size: 18px; color: #666;">Your subtitle or description</p><p><br></p>',
  },
  {
    id: 'quote',
    name: 'Quote Block',
    html: '<blockquote style="border-left: 4px solid #3B82F6; padding-left: 16px; margin: 16px 0; font-style: italic; color: #666;">"Your inspiring quote goes here"</blockquote><p><br></p>',
  },
  {
    id: 'callout',
    name: 'Callout Box',
    html: '<div style="background-color: #EFF6FF; border: 1px solid #3B82F6; border-radius: 8px; padding: 16px; margin: 16px 0;"><strong>💡 Pro Tip:</strong> Your important message here</div><p><br></p>',
  },
  {
    id: 'two-column',
    name: 'Two Columns',
    html: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;"><div style="padding: 12px; border: 1px solid #E5E7EB; border-radius: 4px;"><h3>Column 1</h3><p>Content for first column</p></div><div style="padding: 12px; border: 1px solid #E5E7EB; border-radius: 4px;"><h3>Column 2</h3><p>Content for second column</p></div></div><p><br></p>',
  },
  {
    id: 'highlight',
    name: 'Highlighted Text',
    html: '<p style="background-color: #FEF3C7; padding: 12px; border-radius: 4px; margin: 16px 0;">✨ This text is highlighted for emphasis</p><p><br></p>',
  },
  {
    id: 'steps',
    name: 'Step-by-Step',
    html: '<div style="margin: 16px 0;"><div style="display: flex; gap: 12px; margin-bottom: 12px;"><div style="background-color: #3B82F6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</div><div><strong>First Step</strong><p style="margin: 4px 0 0 0; color: #666;">Description of the first step</p></div></div><div style="display: flex; gap: 12px; margin-bottom: 12px;"><div style="background-color: #3B82F6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</div><div><strong>Second Step</strong><p style="margin: 4px 0 0 0; color: #666;">Description of the second step</p></div></div></div><p><br></p>',
  },
  {
    id: 'warning',
    name: 'Warning Box',
    html: '<div style="background-color: #FEF2F2; border: 1px solid #EF4444; border-radius: 8px; padding: 16px; margin: 16px 0;"><strong>⚠️ Warning:</strong> Important information that needs attention</div><p><br></p>',
  },
  {
    id: 'success',
    name: 'Success Box',
    html: '<div style="background-color: #F0FDF4; border: 1px solid #10B981; border-radius: 8px; padding: 16px; margin: 16px 0;"><strong>✅ Success:</strong> Operation completed successfully</div><p><br></p>',
  },
];

export function RichTextEditor({ content, onChange, onCursorChange, readOnly = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFont, setCurrentFont] = useState('Arial, sans-serif');
  const [currentSize, setCurrentSize] = useState('16px');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && content.html) {
      if (editorRef.current.innerHTML !== content.html) {
        editorRef.current.innerHTML = content.html;
      }
    }
  }, [content.html]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      onChange({
        html,
        text,
        ops: [],
      });
    }
  };

  const handleCursorMove = () => {
    if (onCursorChange && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        onCursorChange(range.startOffset);
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const applyFormat = (command: string, value?: string) => {
    execCommand(command, value);
  };

  const handleFontChange = (font: string) => {
    setCurrentFont(font);
    execCommand('fontName', font);
  };

  const handleSizeChange = (size: string) => {
    setCurrentSize(size);
    execCommand('fontSize', '7');
    // Apply custom size using style
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      try {
        range.surroundContents(span);
      } catch (e) {
        // If surroundContents fails, use insertNode
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
      handleInput();
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleAlignChange = (align: string) => {
    const commands: Record<string, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull',
    };
    execCommand(commands[align]);
  };

  const insertLayout = (layout: typeof TEXT_LAYOUTS[0]) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.createContextualFragment(layout.html);
        range.deleteContents();
        range.insertNode(fragment);
        handleInput();
      }
    }
    setShowLayoutPicker(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-border bg-muted/30 p-2 space-y-2">
          {/* First Row: Font, Size, Color */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={currentFont} onValueChange={handleFontChange}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentSize} onValueChange={handleSizeChange}>
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Palette className="h-4 w-4 mr-1" />
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: currentColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="grid grid-cols-10 gap-1">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('bold')}
              className="h-8"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('italic')}
              className="h-8"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('underline')}
              className="h-8"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          {/* Second Row: Headings, Lists, Alignment */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('formatBlock', '<h1>')}
              className="h-8"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('formatBlock', '<h2>')}
              className="h-8"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('insertUnorderedList')}
              className="h-8"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('insertOrderedList')}
              className="h-8"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat('formatBlock', '<pre>')}
              className="h-8"
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignChange('left')}
              className="h-8"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignChange('center')}
              className="h-8"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignChange('right')}
              className="h-8"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlignChange('justify')}
              className="h-8"
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Popover open={showLayoutPicker} onOpenChange={setShowLayoutPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <LayoutTemplate className="h-4 w-4 mr-1" />
                  Layouts
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <Label>Text Layouts</Label>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {TEXT_LAYOUTS.map((layout) => (
                        <button
                          key={layout.id}
                          type="button"
                          className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                          onClick={() => insertLayout(layout)}
                        >
                          <div className="font-medium text-sm mb-1">{layout.name}</div>
                          <div
                            className="text-xs opacity-60 pointer-events-none"
                            dangerouslySetInnerHTML={{ __html: layout.html }}
                            style={{ transform: 'scale(0.8)', transformOrigin: 'top left', maxHeight: '60px', overflow: 'hidden' }}
                          />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4 bg-muted/20">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          className="min-h-[600px] p-8 focus:outline-none prose prose-sm max-w-none bg-[#FFFEF7] dark:bg-[#1A1A1A] border-2 border-[#E8B86D] dark:border-[#D4A574] rounded-lg shadow-sm transition-colors"
          style={{
            fontFamily: currentFont,
            fontSize: currentSize,
            color: currentColor,
          }}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
