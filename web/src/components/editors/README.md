# Rich Text Editor Implementations

This directory contains 5 different rich text editor proof-of-concepts for the flashcard application. Each editor outputs markdown for database storage while providing a rich editing experience.

## Available Editors

### 1. ReactMarkdownEditor (`ReactMarkdownEditor.tsx`)
- **Library**: react-markdown + remark-gfm + rehype-highlight
- **Features**: 
  - Live preview with react-markdown rendering
  - Floating toolbar on text selection
  - Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
  - Image paste support (base64 encoding)
  - Syntax highlighting for code blocks
- **Pros**: Excellent markdown rendering, well-maintained
- **Cons**: More complex setup, larger bundle size

### 2. MarkdownItEditor (`MarkdownItEditor.tsx`)
- **Library**: markdown-it
- **Features**:
  - Fast markdown parsing and rendering
  - Floating toolbar on text selection
  - Auto-list continuation
  - Slash commands (/ai)
  - Image paste support
  - Keyboard shortcuts
- **Pros**: Very fast, configurable, good plugin ecosystem
- **Cons**: Manual HTML rendering required

### 3. LexicalEditor (`LexicalEditor.tsx`)
- **Library**: Meta's Lexical framework
- **Features**:
  - Rich text editing with automatic markdown conversion
  - Floating toolbar
  - Plugin architecture
  - Built-in list support
  - Keyboard shortcuts
- **Pros**: Modern, performant, backed by Meta
- **Cons**: Complex API, larger learning curve

### 4. TipTapEditor (`TipTapEditor.tsx`)
- **Library**: TipTap (ProseMirror-based)
- **Features**:
  - Rich text editing with markdown conversion
  - Fixed toolbar (simplified bubble menu)
  - Keyboard shortcuts
  - Image paste support
  - Extensible with plugins
- **Pros**: Great developer experience, extensible
- **Cons**: Requires custom markdown serialization

### 5. PlateEditor (`PlateEditor.tsx`)
- **Library**: Plate.js (simplified implementation)
- **Features**:
  - Basic rich text features
  - Toolbar integration
  - Keyboard shortcuts
  - Slash commands
  - Image paste support
- **Note**: This is a simplified implementation due to complex Plate.js setup requirements

## Common Features

All editors implement:
- **Markdown Output**: All editors output clean markdown strings
- **Consistent Props**: `value` (markdown string) and `onChange` callback
- **Keyboard Shortcuts**: Ctrl+B (bold), Ctrl+I (italic)
- **Image Paste**: Direct image pasting (converted to base64)
- **Responsive Design**: Works on mobile and desktop
- **Dark Mode**: Supports the application's theme system

## Usage

```tsx
import { ReactMarkdownEditor } from '@/components/editors';

function MyComponent() {
  const [content, setContent] = useState('# Hello World');
  
  return (
    <ReactMarkdownEditor 
      value={content} 
      onChange={setContent}
      className="w-full"
    />
  );
}
```

## Demo

Use the `EditorDemo` component to compare all editors side-by-side:

```tsx
import { EditorDemo } from '@/components/editors';

export default function DemoPage() {
  return <EditorDemo />;
}
```

## Dependencies

The following packages are installed for the editors:
- `react-markdown` + `remark-gfm` + `rehype-highlight`
- `markdown-it` + `@types/markdown-it`
- `lexical` + `@lexical/*` packages
- `@tiptap/react` + `@tiptap/core` + `@tiptap/starter-kit`
- `highlight.js` for syntax highlighting

## Recommendations

**For Production Use:**
1. **ReactMarkdownEditor** - Best for content-heavy applications with lots of markdown
2. **TipTapEditor** - Best balance of features and developer experience
3. **LexicalEditor** - Best for performance-critical applications

**For Quick Prototyping:**
1. **MarkdownItEditor** - Simple and fast
2. **PlateEditor** - If you plan to extend with more Plate.js features later

## Future Enhancements

Potential improvements for production use:
- Image upload to cloud storage instead of base64
- Better slash command menus
- Collaborative editing support
- More markdown extensions (tables, math, etc.)
- Better mobile experience
- Undo/redo functionality
- Spell checking integration