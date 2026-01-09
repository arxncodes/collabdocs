import { saveAs } from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';

/**
 * Export document content as plain text (.txt)
 */
export async function exportAsText(content: string, filename: string): Promise<void> {
  try {
    // Create a temporary div to parse HTML and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get plain text content
    const plainText = tempDiv.innerText || tempDiv.textContent || '';
    
    // Create blob
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    
    // Trigger download
    saveAs(blob, `${filename}.txt`);
  } catch (error) {
    console.error('Error exporting as text:', error);
    throw new Error('Failed to export document as text');
  }
}

/**
 * Export document content as Word document (.docx)
 */
export async function exportAsDocx(content: string, filename: string): Promise<void> {
  try {
    // Wrap content in a complete HTML document structure
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              margin: 1in;
            }
            h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
            h2 { font-size: 18pt; font-weight: bold; margin-bottom: 10pt; }
            h3 { font-size: 14pt; font-weight: bold; margin-bottom: 8pt; }
            p { margin-bottom: 10pt; }
            ul, ol { margin-bottom: 10pt; }
            blockquote { 
              border-left: 4px solid #3B82F6; 
              padding-left: 16px; 
              margin: 16px 0; 
              font-style: italic; 
              color: #666; 
            }
            code, pre { 
              font-family: 'Courier New', monospace; 
              background-color: #f5f5f5; 
              padding: 4px; 
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
    
    // Convert HTML to DOCX blob
    const docxBlob = await asBlob(htmlContent);
    
    // Ensure it's a Blob - handle both Blob and Buffer types
    let blob: Blob;
    if (docxBlob instanceof Blob) {
      blob = docxBlob;
    } else {
      // Convert Buffer to Blob
      const arrayBuffer = docxBlob.buffer.slice(
        docxBlob.byteOffset,
        docxBlob.byteOffset + docxBlob.byteLength
      ) as ArrayBuffer;
      blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
    }
    
    // Trigger download
    saveAs(blob, `${filename}.docx`);
  } catch (error) {
    console.error('Error exporting as DOCX:', error);
    throw new Error('Failed to export document as Word document');
  }
}

/**
 * Sanitize filename to remove invalid characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 200); // Limit length
}

/**
 * Get current date string for filename
 */
export function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Generate export filename
 */
export function generateExportFilename(documentTitle: string): string {
  const sanitized = sanitizeFilename(documentTitle || 'Untitled');
  const dateStr = getDateString();
  return `${sanitized}_${dateStr}`;
}
