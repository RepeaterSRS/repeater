'use client';

import { AutoformatPlugin } from '@platejs/autoformat';
import {
    BaseBoldPlugin,
    BaseItalicPlugin,
    BaseStrikethroughPlugin,
    BaseUnderlinePlugin,
    BaseCodePlugin,
    BaseHeadingPlugin,
    BaseBlockquotePlugin,
} from '@platejs/basic-nodes';
import { MarkdownPlugin } from '@platejs/markdown';
import {
    Bold,
    Code,
    Italic,
    Quote,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
} from 'lucide-react';
import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import styles from './markdown-preview.module.css';

interface PlateEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

// Plate plugins configuration
const plugins = [
    BaseBoldPlugin,
    BaseItalicPlugin,
    BaseStrikethroughPlugin,
    BaseUnderlinePlugin,
    BaseCodePlugin,
    BaseHeadingPlugin,
    BaseBlockquotePlugin,
    AutoformatPlugin,
    MarkdownPlugin,
];

// Simple fixed toolbar that doesn't rely on complex APIs
function PlateToolbar() {
    return (
        <div className="flex items-center gap-1 border-b p-2">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Bold (**text**)"
                disabled
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Italic (*text*)"
                disabled
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Strikethrough (~~text~~)"
                disabled
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Code (`text`)"
                disabled
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Heading 1 (# text)"
                disabled
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Heading 2 (## text)"
                disabled
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Heading 3 (### text)"
                disabled
            >
                <Heading3 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Quote (> text)"
                disabled
            >
                <Quote className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function PlateEditor({ value, onChange, className }: PlateEditorProps) {
    const [isPreview, setIsPreview] = React.useState(false);

    // Create a simple initial value - will handle markdown conversion later
    const initialValue = React.useMemo(() => {
        if (!value) return [{ type: 'p', children: [{ text: '' }] }];
        // For now, just create a paragraph with the text content
        return [{ type: 'p', children: [{ text: value }] }];
    }, [value]);

    const editor = usePlateEditor({
        plugins,
        value: initialValue,
    });

    // Handle editor changes - extract plain text for now
    const handleChange = React.useCallback(
        (newValue: any) => {
            // Simple text extraction - fallback approach
            const text =
                newValue
                    ?.map((node: any) => {
                        if (node.children) {
                            return node.children
                                .map((child: any) => child.text || '')
                                .join('');
                        }
                        return '';
                    })
                    .join('\n') || '';
            onChange(text);
        },
        [onChange]
    );

    // Convert markdown to HTML for preview
    const markdownToHtml = (markdown: string): string => {
        return markdown
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
            .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
            .replace(/^> (.*$)/gm, '<blockquote><p>$1</p></blockquote>')
            .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
            .replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<\/p><p><\/p><p>/g, '</p><p>');
    };

    return (
        <div className={cn('relative rounded-md border', className)}>
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
                <div className="text-muted-foreground text-sm">
                    Plate.js powered
                </div>
            </div>

            {/* Description */}
            <div className="bg-muted/30 text-muted-foreground border-b p-3 text-sm">
                <strong>Plate</strong> is a rich-text editor framework built on
                top of Slate.js. It provides a comprehensive plugin system,
                pre-built components, and advanced features like collaborative
                editing, serialization, and extensive customization options.
                Perfect for building sophisticated document editors with complex
                formatting requirements.
                <div className="mt-2 text-xs">
                    <strong>Dependencies:</strong> platejs,
                    @platejs/basic-nodes, @platejs/autoformat,
                    @platejs/markdown, @platejs/floating
                </div>
            </div>

            {/* Content area */}
            <div className="relative">
                {!isPreview ? (
                    <Plate editor={editor} onChange={handleChange}>
                        <PlateToolbar />
                        <PlateContent
                            className="min-h-[300px] w-full resize-none border-none p-4 text-sm outline-none focus:outline-none"
                            placeholder="Start typing your content here... This is a rich text editor powered by Plate.js with autoformat support"
                        />
                    </Plate>
                ) : (
                    <div
                        className={cn(
                            'min-h-[300px] p-4',
                            styles.markdownPreview
                        )}
                    >
                        <div
                            dangerouslySetInnerHTML={{
                                __html:
                                    markdownToHtml(value) ||
                                    '<p class="text-muted-foreground">Nothing to preview yet...</p>',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Shortcut hints */}
            <div className="text-muted-foreground border-t p-2 text-xs">
                <div className="flex gap-4">
                    <span>Ctrl+B: Bold</span>
                    <span>Ctrl+I: Italic</span>
                    <span>**text**: Auto-bold</span>
                    <span>*text*: Auto-italic</span>
                    <span># heading: Auto-heading</span>
                    <span>- list: Auto-list</span>
                    <span>Rich text editing with markdown</span>
                </div>
            </div>
        </div>
    );
}

