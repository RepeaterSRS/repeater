'use client';

import { Button } from '@/components/ui/button';
import * as React from 'react';
import { LexicalEditor } from './LexicalEditor';
import { MarkdownItEditor } from './MarkdownItEditor';
import { PlateEditor } from './PlateEditor';
import { ReactMarkdownEditor } from './ReactMarkdownEditor';
import { TipTapEditor } from './TipTapEditor';

const SAMPLE_MARKDOWN = `# Rich Text Editor Demo

This is a **demonstration** of different rich text editors for our flashcard application.

## Features

- **Bold text** and *italic text*
- ~~Strikethrough~~ text
- \`Inline code\` blocks
- Lists and more!

### Unordered List
- First item
- Second item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

> This is a blockquote
> It can span multiple lines

\`\`\`javascript
// Code block
function hello() {
    console.log("Hello, world!");
}
\`\`\`

Try the following:
- Select text to see floating toolbar
- Use Ctrl+B for bold, Ctrl+I for italic
- Paste images directly (where supported)
- Type / for commands (where supported)`;

const editors = [
    { name: 'React Markdown', component: ReactMarkdownEditor, description: 'Uses react-markdown for rendering with custom toolbar' },
    { name: 'Markdown-it', component: MarkdownItEditor, description: 'Uses markdown-it parser with enhanced features' },
    { name: 'Lexical', component: LexicalEditor, description: 'Facebook\'s modern rich text framework' },
    { name: 'TipTap', component: TipTapEditor, description: 'Headless editor built on ProseMirror' },
    { name: 'Plate.js', component: PlateEditor, description: 'Plugin-based rich text editor' },
];

export function EditorDemo() {
    const [selectedEditor, setSelectedEditor] = React.useState(0);
    const [content, setContent] = React.useState(SAMPLE_MARKDOWN);

    const CurrentEditor = editors[selectedEditor].component;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Rich Text Editor Comparison</h1>
                <p className="text-muted-foreground">
                    Compare 5 different rich text editor implementations for the flashcard application.
                    Each editor outputs markdown for database storage.
                </p>
            </div>

            {/* Editor Selection */}
            <div className="flex flex-wrap gap-2">
                {editors.map((editor, index) => (
                    <Button
                        key={index}
                        variant={selectedEditor === index ? 'default' : 'outline'}
                        onClick={() => setSelectedEditor(index)}
                        className="flex flex-col h-auto p-3"
                    >
                        <span className="font-medium">{editor.name}</span>
                        <span className="text-xs opacity-75">{editor.description}</span>
                    </Button>
                ))}
            </div>

            {/* Current Editor */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">
                    {editors[selectedEditor].name} Editor
                </h2>
                <p className="text-sm text-muted-foreground">
                    {editors[selectedEditor].description}
                </p>
            </div>

            {/* Editor Component */}
            <CurrentEditor
                value={content}
                onChange={setContent}
                className="w-full"
            />

            {/* Raw Markdown Output */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Raw Markdown Output</h3>
                <div className="p-4 bg-muted rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                        {content || 'No content yet...'}
                    </pre>
                </div>
            </div>

            {/* Reset Button */}
            <Button 
                variant="outline" 
                onClick={() => setContent(SAMPLE_MARKDOWN)}
                className="w-full"
            >
                Reset to Sample Content
            </Button>
        </div>
    );
}