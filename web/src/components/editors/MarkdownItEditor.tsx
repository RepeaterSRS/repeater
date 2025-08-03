'use client';

import {
    Bold,
    Code,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
    Strikethrough,
} from 'lucide-react';
import type MarkdownIt from 'markdown-it';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import styles from './markdown-preview.module.css';

interface MarkdownItEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

interface ToolbarProps {
    onMarkdownInsert: (before: string, after?: string) => void;
    show: boolean;
    position: { top: number; left: number };
}

const Toolbar: React.FC<ToolbarProps> = ({
    onMarkdownInsert,
    show,
    position,
}) => {
    if (!show) return null;

    const toolbarItems = [
        { icon: Bold, action: () => onMarkdownInsert('**', '**'), label: 'Bold' },
        { icon: Italic, action: () => onMarkdownInsert('*', '*'), label: 'Italic' },
        {
            icon: Strikethrough,
            action: () => onMarkdownInsert('~~', '~~'),
            label: 'Strikethrough',
        },
        { icon: Code, action: () => onMarkdownInsert('`', '`'), label: 'Code' },
        { icon: Link, action: () => onMarkdownInsert('[', '](url)'), label: 'Link' },
        { icon: List, action: () => onMarkdownInsert('- ', ''), label: 'List' },
        {
            icon: ListOrdered,
            action: () => onMarkdownInsert('1. ', ''),
            label: 'Ordered List',
        },
        { icon: Quote, action: () => onMarkdownInsert('> ', ''), label: 'Quote' },
    ];

    return (
        <div
            className="fixed z-50 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {toolbarItems.map((item, index) => (
                <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={item.action}
                    className="h-8 w-8 p-0"
                    title={item.label}
                >
                    <item.icon className="h-4 w-4" />
                </Button>
            ))}
        </div>
    );
};

export function MarkdownItEditor({
    value,
    onChange,
    className,
}: MarkdownItEditorProps) {
    const [isPreview, setIsPreview] = React.useState(false);
    const [toolbarVisible, setToolbarVisible] = React.useState(false);
    const [toolbarPosition, setToolbarPosition] = React.useState({
        top: 0,
        left: 0,
    });
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Initialize markdown-it with dynamic import to avoid SSR issues
    const [md, setMd] = React.useState<MarkdownIt | null>(null);
    
    React.useEffect(() => {
        // Dynamic import to avoid SSR issues
        import('markdown-it').then((MarkdownItModule) => {
            const MDConstructor = MarkdownItModule.default || MarkdownItModule;
            const mdInstance = new MDConstructor({
                html: true,
                linkify: true,
                typographer: true,
                breaks: true,
            });
            setMd(mdInstance);
        }).catch(error => {
            console.error('Failed to load markdown-it:', error);
        });
    }, []);

    const renderedMarkdown = React.useMemo(() => {
        if (!md) return '<p class="text-muted-foreground">Loading preview...</p>';
        try {
            return md.render(value);
        } catch (error) {
            console.error('Markdown rendering error:', error);
            return `<p style="color: red;">Error rendering markdown</p>`;
        }
    }, [value, md]);

    const handleTextSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const selection = textarea.selectionStart !== textarea.selectionEnd;
        if (selection) {
            const rect = textarea.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            setToolbarPosition({
                top: rect.top + scrollTop - 50,
                left: rect.left + rect.width / 2 - 100,
            });
            setToolbarVisible(true);
        } else {
            setToolbarVisible(false);
        }
    };

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        
        // Check if the selection already has the formatting
        const beforeText = value.substring(Math.max(0, start - before.length), start);
        const afterText = value.substring(end, Math.min(value.length, end + after.length));
        
        let newText;
        let newStart, newEnd;
        
        // Toggle behavior: if already formatted, remove formatting
        if (beforeText === before && afterText === after && selectedText) {
            // Remove formatting
            newText = value.substring(0, start - before.length) + selectedText + value.substring(end + after.length);
            newStart = start - before.length;
            newEnd = newStart + selectedText.length;
        } else {
            // Add formatting
            newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
            newStart = start + before.length;
            newEnd = newStart + selectedText.length;
        }

        onChange(newText);

        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newStart, newEnd);
        }, 0);

        setToolbarVisible(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Markdown shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    insertMarkdown('**', '**');
                    break;
                case 'i':
                    e.preventDefault();
                    insertMarkdown('*', '*');
                    break;
                case 'k':
                    e.preventDefault();
                    insertMarkdown('[', '](url)');
                    break;
            }
        }

        // Handle automatic list continuation
        if (e.key === 'Enter') {
            const textarea = e.currentTarget;
            const lines = value.split('\n');
            const currentLineIndex = value.substring(0, textarea.selectionStart).split('\n').length - 1;
            const currentLine = lines[currentLineIndex];
            
            // Check for list patterns
            const unorderedListMatch = currentLine.match(/^(\s*)([-*+])\s/);
            const orderedListMatch = currentLine.match(/^(\s*)(\d+\.)\s/);
            
            if (unorderedListMatch || orderedListMatch) {
                e.preventDefault();
                const indent = unorderedListMatch ? unorderedListMatch[1] : orderedListMatch![1];
                const marker = unorderedListMatch ? unorderedListMatch[2] : 
                    `${parseInt(orderedListMatch![2]) + 1}.`;
                
                const newLine = `\n${indent}${marker} `;
                const start = textarea.selectionStart;
                const newValue = value.substring(0, start) + newLine + value.substring(start);
                onChange(newValue);
                
                setTimeout(() => {
                    textarea.setSelectionRange(start + newLine.length, start + newLine.length);
                }, 0);
            }
        }

        // Tab for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + '    ' + value.substring(end);
            onChange(newValue);
            setTimeout(() => {
                textarea.setSelectionRange(start + 4, start + 4);
            }, 0);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData.items);
        const imageItem = items.find((item) => item.type.indexOf('image') !== -1);

        if (imageItem) {
            e.preventDefault();
            const file = imageItem.getAsFile();
            if (file) {
                // For now, just insert placeholder text
                const reader = new FileReader();
                reader.onload = () => {
                    const placeholder = `![Image](data:${file.type};base64,${btoa(reader.result as string)})`;
                    const textarea = textareaRef.current!;
                    const start = textarea.selectionStart;
                    const newValue =
                        value.substring(0, start) + placeholder + value.substring(start);
                    onChange(newValue);
                };
                reader.readAsBinaryString(file);
            }
        }
    };

    const handleSlashCommand = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === '/') {
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const beforeCursor = value.substring(0, start);
            const atLineStart = beforeCursor.endsWith('\n') || start === 0;
            
            if (atLineStart) {
                // Show slash command menu (simplified version)
                setTimeout(() => {
                    const commandText = '/ai ';
                    const newValue = value.substring(0, start) + commandText + value.substring(start);
                    onChange(newValue);
                    textarea.setSelectionRange(start + commandText.length, start + commandText.length);
                }, 0);
                e.preventDefault();
            }
        }
    };

    return (
        <div className={cn('relative border rounded-md', className)}>
            {/* Header with tabs */}
            <div className="flex items-center justify-between border-b p-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant={!isPreview ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setIsPreview(false)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant={isPreview ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setIsPreview(true)}
                    >
                        Preview
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    Markdown-it powered
                </div>
            </div>
            
            {/* Description */}
            <div className="border-b bg-muted/30 p-3 text-sm text-muted-foreground">
                <strong>markdown-it</strong> is a fast and extensible Markdown parser. It follows the CommonMark 
                spec and supports syntax extensions via plugins. Features include real-time parsing, 
                GFM support, and excellent performance.
                <div className="mt-2 text-xs">
                    <strong>Dependencies:</strong> markdown-it, @types/markdown-it
                </div>
            </div>

            {/* Content area */}
            <div className="relative">
                {!isPreview ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onSelect={handleTextSelection}
                        onKeyDown={(e) => {
                            handleKeyDown(e);
                            handleSlashCommand(e);
                        }}
                        onPaste={handlePaste}
                        onBlur={() => setToolbarVisible(false)}
                        className="w-full min-h-[300px] p-4 resize-none border-none outline-none font-mono text-sm"
                        placeholder="Type / for commands, or start typing markdown..."
                    />
                ) : (
                    <div 
                        className={cn("p-4 min-h-[300px]", styles.markdownPreview)}
                        dangerouslySetInnerHTML={{ 
                            __html: renderedMarkdown || '<p class="text-muted-foreground">Nothing to preview yet...</p>' 
                        }}
                    />
                )}
            </div>

            {/* Floating toolbar */}
            <Toolbar
                onMarkdownInsert={insertMarkdown}
                show={toolbarVisible}
                position={toolbarPosition}
            />

            {/* Shortcut hints */}
            <div className="border-t p-2 text-xs text-muted-foreground">
                <div className="flex gap-4">
                    <span>Ctrl+B: Bold</span>
                    <span>Ctrl+I: Italic</span>
                    <span>Ctrl+K: Link</span>
                    <span>/: Commands</span>
                    <span>Auto-lists</span>
                </div>
            </div>
        </div>
    );
}