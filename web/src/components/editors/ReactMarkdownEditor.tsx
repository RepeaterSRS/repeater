'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import styles from './markdown-preview.module.css';

interface ReactMarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

interface ToolbarProps {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    onMarkdownInsert: (before: string, after?: string) => void;
    show: boolean;
    position: { top: number; left: number };
    activeFormats: Set<string>;
}

const Toolbar: React.FC<ToolbarProps> = ({
    textareaRef,
    onMarkdownInsert,
    show,
    position,
    activeFormats,
}) => {
    if (!show) return null;

    const toolbarItems = [
        { 
            icon: Bold, 
            action: () => onMarkdownInsert('**', '**'), 
            label: 'Bold',
            format: 'bold'
        },
        { 
            icon: Italic, 
            action: () => onMarkdownInsert('*', '*'), 
            label: 'Italic',
            format: 'italic'
        },
        {
            icon: Strikethrough,
            action: () => onMarkdownInsert('~~', '~~'),
            label: 'Strikethrough',
            format: 'strikethrough'
        },
        { 
            icon: Code, 
            action: () => onMarkdownInsert('`', '`'), 
            label: 'Code',
            format: 'code'
        },
        { 
            icon: Link, 
            action: () => onMarkdownInsert('[', '](url)'), 
            label: 'Link',
            format: 'link'
        },
        { 
            icon: List, 
            action: () => onMarkdownInsert('- ', ''), 
            label: 'List',
            format: 'list'
        },
        {
            icon: ListOrdered,
            action: () => onMarkdownInsert('1. ', ''),
            label: 'Ordered List',
            format: 'orderedList'
        },
        { 
            icon: Quote, 
            action: () => onMarkdownInsert('> ', ''), 
            label: 'Quote',
            format: 'quote'
        },
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
                    className={cn(
                        'h-8 w-8 p-0',
                        activeFormats.has(item.format) && 'bg-accent'
                    )}
                    title={item.label}
                >
                    <item.icon className="h-4 w-4" />
                </Button>
            ))}
        </div>
    );
};

export function ReactMarkdownEditor({
    value,
    onChange,
    className,
}: ReactMarkdownEditorProps) {
    const [isPreview, setIsPreview] = React.useState(false);
    const [toolbarVisible, setToolbarVisible] = React.useState(false);
    const [toolbarPosition, setToolbarPosition] = React.useState({
        top: 0,
        left: 0,
    });
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Check what formats are active at cursor position
    const updateActiveFormats = (start: number, end: number) => {
        const beforeText2 = value.substring(Math.max(0, start - 2), start);
        const afterText2 = value.substring(end, Math.min(value.length, end + 2));
        const beforeText1 = value.substring(Math.max(0, start - 1), start);
        const afterText1 = value.substring(end, Math.min(value.length, end + 1));
        
        const formats = new Set<string>();
        
        if (beforeText2 === '**' && afterText2 === '**') formats.add('bold');
        if (beforeText1 === '*' && afterText1 === '*' && !formats.has('bold')) formats.add('italic');
        if (beforeText2 === '~~' && afterText2 === '~~') formats.add('strikethrough');
        if (beforeText1 === '`' && afterText1 === '`') formats.add('code');
        
        setActiveFormats(formats);
    };

    const handleTextSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        updateActiveFormats(start, end);
        
        const selection = start !== end;
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
        if (beforeText === before && afterText === after && selectedText && before !== '- ' && before !== '1. ' && before !== '> ') {
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

        // Handle image paste
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
                // In a real implementation, you'd upload the image and get a URL
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
                    {isPreview ? 'Preview' : 'Markdown supported'}
                </div>
            </div>
            
            {/* Description */}
            <div className="border-b bg-muted/30 p-3 text-sm text-muted-foreground">
                <strong>react-markdown</strong> is a popular React component for rendering Markdown content. 
                It provides excellent security by default, supports CommonMark and GitHub Flavored Markdown, 
                and offers extensive customization through plugins. Known for its reliability and ease of use 
                in React applications.
                <div className="mt-2 text-xs">
                    <strong>Dependencies:</strong> react-markdown, remark-gfm, rehype-highlight, highlight.js
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
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onBlur={() => setToolbarVisible(false)}
                        className="w-full min-h-[300px] p-4 resize-none border-none outline-none font-mono text-sm"
                        placeholder="Start typing your markdown here..."
                    />
                ) : (
                    <div className={cn("p-4 min-h-[300px]", styles.markdownPreview)}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {value || 'Nothing to preview yet...'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Floating toolbar */}
            <Toolbar
                textareaRef={textareaRef}
                onMarkdownInsert={insertMarkdown}
                show={toolbarVisible}
                position={toolbarPosition}
                activeFormats={activeFormats}
            />

            {/* Shortcut hints */}
            <div className="border-t p-2 text-xs text-muted-foreground">
                <div className="flex gap-4">
                    <span>Ctrl+B: Bold</span>
                    <span>Ctrl+I: Italic</span>
                    <span>Ctrl+K: Link</span>
                    <span>Paste images directly</span>
                </div>
            </div>
        </div>
    );
}