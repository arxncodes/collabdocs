import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
} from 'lucide-react';
import type { EditorContent } from '@/types/types';

interface RichTextEditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  onCursorChange?: (position: number) => void;
  readOnly?: boolean;
}

export function RichTextEditor({ content, onChange, onCursorChange, readOnly = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  // Convert content to HTML
  const contentToHtml = useCallback((content: EditorContent): string => {
    if (!content.ops || content.ops.length === 0) {
      return '<p><br></p>';
    }

    let html = '';
    let currentBlock = '';
    let currentBlockType = 'p';

    for (const op of content.ops) {
      let text = op.insert;
      const attrs = op.attributes || {};

      // Handle newlines
      if (text.includes('\n')) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i]) {
            let styledText = lines[i];
            if (attrs.bold) styledText = `<strong>${styledText}</strong>`;
            if (attrs.italic) styledText = `<em>${styledText}</em>`;
            if (attrs.underline) styledText = `<u>${styledText}</u>`;
            currentBlock += styledText;
          }

          if (i < lines.length - 1) {
            // Close current block
            if (attrs['code-block']) {
              html += `<pre><code>${currentBlock || '<br>'}</code></pre>`;
            } else if (attrs.header === 1) {
              html += `<h1>${currentBlock || '<br>'}</h1>`;
            } else if (attrs.header === 2) {
              html += `<h2>${currentBlock || '<br>'}</h2>`;
            } else if (attrs.list === 'bullet') {
              html += `<li>${currentBlock || '<br>'}</li>`;
            } else if (attrs.list === 'ordered') {
              html += `<li>${currentBlock || '<br>'}</li>`;
            } else {
              html += `<p>${currentBlock || '<br>'}</p>`;
            }
            currentBlock = '';
          }
        }
      } else {
        let styledText = text;
        if (attrs.bold) styledText = `<strong>${styledText}</strong>`;
        if (attrs.italic) styledText = `<em>${styledText}</em>`;
        if (attrs.underline) styledText = `<u>${styledText}</u>`;
        currentBlock += styledText;
      }
    }

    // Close any remaining block
    if (currentBlock) {
      html += `<p>${currentBlock}</p>`;
    }

    return html || '<p><br></p>';
  }, []);

  // Convert HTML to content
  const htmlToContent = useCallback((html: string): EditorContent => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const ops: EditorContent['ops'] = [];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          const attributes: any = {};
          let parent = node.parentElement;
          while (parent && parent !== editorRef.current) {
            if (parent.tagName === 'STRONG' || parent.tagName === 'B') attributes.bold = true;
            if (parent.tagName === 'EM' || parent.tagName === 'I') attributes.italic = true;
            if (parent.tagName === 'U') attributes.underline = true;
            if (parent.tagName === 'H1') attributes.header = 1;
            if (parent.tagName === 'H2') attributes.header = 2;
            if (parent.tagName === 'CODE' && parent.parentElement?.tagName === 'PRE') attributes['code-block'] = true;
            if (parent.tagName === 'LI') {
              const listParent = parent.parentElement;
              if (listParent?.tagName === 'UL') attributes.list = 'bullet';
              if (listParent?.tagName === 'OL') attributes.list = 'ordered';
            }
            parent = parent.parentElement;
          }
          ops.push({ insert: text, attributes: Object.keys(attributes).length > 0 ? attributes : undefined });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName === 'BR') {
          ops.push({ insert: '\n' });
        } else if (['P', 'DIV', 'H1', 'H2', 'LI', 'PRE'].includes(element.tagName)) {
          Array.from(element.childNodes).forEach(processNode);
          if (element.nextSibling) {
            ops.push({ insert: '\n' });
          }
        } else {
          Array.from(element.childNodes).forEach(processNode);
        }
      }
    };

    Array.from(doc.body.childNodes).forEach(processNode);

    // Ensure there's always a trailing newline
    if (ops.length === 0 || ops[ops.length - 1].insert !== '\n') {
      ops.push({ insert: '\n' });
    }

    return { ops };
  }, []);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content) {
      const html = contentToHtml(content);
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [content, contentToHtml]);

  // Handle input
  const handleInput = useCallback(() => {
    if (editorRef.current && !readOnly) {
      const html = editorRef.current.innerHTML;
      const newContent = htmlToContent(html);
      onChange(newContent);
    }
  }, [htmlToContent, onChange, readOnly]);

  // Handle cursor position
  const handleSelectionChange = useCallback(() => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const position = range.startOffset;
      onCursorChange?.(position);
    }
  }, [onCursorChange]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Format commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      {!readOnly && (
        <>
          <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => execCommand('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => execCommand('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => execCommand('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => formatBlock('h1')}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => formatBlock('h2')}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => execCommand('insertOrderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => formatBlock('pre')}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        className="flex-1 p-6 overflow-auto focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        style={{
          minHeight: '400px',
        }}
      />
    </div>
  );
}
