import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { FileEdit, Eye } from 'lucide-react';

const defaultMarkdown = `# Markdown 预览器使用指南

## 试试编辑以下内容：

### 支持的功能：
- 实时预览
- 支持所有标准 Markdown 语法
- 分屏布局

#### 代码示例：
\`\`\`javascript
function greeting(name) {
  return \`你好，\${name}！\`;
}
\`\`\`

#### 表格示例：
| 功能 | 支持情况 |
|---------|---------|
| 表格 | ✓ |
| 列表 | ✓ |
| 代码块 | ✓ |

> 这是一段引用文本

![示例图片](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&auto=format&fit=crop&q=80)
`;

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  const getMarkdownHtml = useCallback(() => {
    return { __html: marked(markdown, { breaks: true }) };
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileEdit className="w-6 h-6" />
            Markdown 预览器
          </h1>
        </div>
      </header>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 编辑器 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <FileEdit className="w-5 h-5" />
                编辑区
              </h2>
            </div>
            <textarea
              className="w-full h-[calc(100vh-16rem)] p-4 font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="在此输入 Markdown 文本..."
            />
          </div>

          {/* 预览区 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                预览区
              </h2>
            </div>
            <div 
              className="prose prose-sm max-w-none h-[calc(100vh-16rem)] p-4 overflow-auto"
              dangerouslySetInnerHTML={getMarkdownHtml()} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;