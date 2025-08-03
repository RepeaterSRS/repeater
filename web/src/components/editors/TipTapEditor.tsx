'use client';

import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import {
    Bold,
    Code,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Strikethrough,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import styles from './markdown-preview.module.css';

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

// Custom function to convert HTML to markdown (simplified)
function htmlToMarkdown(html: string): string {
    return html
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<b>(.*?)<\/b>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<i>(.*?)<\/i>/g, '*$1*')
        .replace(/<s>(.*?)<\/s>/g, '~~$1~~')
        .replace(/<del>(.*?)<\/del>/g, '~~$1~~')
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<h1>(.*?)<\/h1>/g, '# $1')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1')
        .replace(/<h4>(.*?)<\/h4>/g, '#### $1')
        .replace(/<h5>(.*?)<\/h5>/g, '##### $1')
        .replace(/<h6>(.*?)<\/h6>/g, '###### $1')
        .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '> $1')
        .replace(/<ul><li>(.*?)<\/li><\/ul>/g, '- $1')
        .replace(/<ol><li>(.*?)<\/li><\/ol>/g, '1. $1')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .trim();
}

// Convert markdown to HTML (simplified)
function markdownToHtml(markdown: string): string {
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
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
}

interface BubbleMenuComponentProps {
    editor: Editor;
}

function SimpleToolbar({ editor }: BubbleMenuComponentProps) {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-1 border-b p-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('bold') && 'bg-accent'
                )}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('italic') && 'bg-accent'
                )}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('strike') && 'bg-accent'
                )}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('code') && 'bg-accent'
                )}
                title="Code"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('bulletList') && 'bg-accent'
                )}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('orderedList') && 'bg-accent'
                )}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('blockquote') && 'bg-accent'
                )}
                title="Quote"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) {
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }
                }}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('link') && 'bg-accent'
                )}
                title="Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}

// Native TipTap BubbleMenu component
function TipTapBubbleMenu({ editor }: BubbleMenuComponentProps) {
    if (!editor) return null;

    return (
        <BubbleMenu 
            editor={editor}
            className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md"
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('bold') && 'bg-accent'
                )}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('italic') && 'bg-accent'
                )}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('strike') && 'bg-accent'
                )}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('code') && 'bg-accent'
                )}
                title="Code"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) {
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }
                }}
                className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('link') && 'bg-accent'
                )}
                title="Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
        </BubbleMenu>
    );
}

export function TipTapEditor({ value, onChange, className }: TipTapEditorProps) {
    const [isPreview, setIsPreview] = React.useState(false);
    const [isInitialized, setIsInitialized] = React.useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            BubbleMenuExtension,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded',
                },
            }),
        ],
        content: value ? markdownToHtml(value) : '',
        immediatelyRender: false,
        onCreate: ({ editor }) => {
            setIsInitialized(true);
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const markdown = htmlToMarkdown(html);
            onChange(markdown);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
            },
            handlePaste: (view, event) => {
                // Handle image paste
                const items = Array.from(event.clipboardData?.items || []);
                const imageItem = items.find((item) => item.type.indexOf('image') !== -1);

                if (imageItem) {
                    event.preventDefault();
                    const file = imageItem.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64 = btoa(reader.result as string);
                            const imageMarkdown = `![Image](data:${file.type};base64,${base64})`;
                            // Insert the image markdown at cursor position
                            const { from } = view.state.selection;
                            const transaction = view.state.tr.insertText(imageMarkdown, from);
                            view.dispatch(transaction);
                        };
                        reader.readAsBinaryString(file);
                    }
                    return true;
                }
                return false;
            },
        },
    });

    // Handle value changes from outside
    React.useEffect(() => {
        if (editor && isInitialized && value !== htmlToMarkdown(editor.getHTML())) {
            editor.commands.setContent(markdownToHtml(value));
        }
    }, [editor, value, isInitialized]);

    // Handle markdown shortcuts
    React.useEffect(() => {
        if (!editor) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'b':
                        event.preventDefault();
                        editor.chain().focus().toggleBold().run();
                        break;
                    case 'i':
                        event.preventDefault();
                        editor.chain().focus().toggleItalic().run();
                        break;
                    case 'k':
                        event.preventDefault();
                        // Toggle link functionality
                        const url = window.prompt('Enter URL');
                        if (url) {
                            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                        }
                        break;
                }
            }

            // Handle slash commands
            if (event.key === '/' && editor.state.selection.empty) {
                const { from } = editor.state.selection;
                const beforeText = editor.state.doc.textBetween(Math.max(0, from - 10), from);
                
                if (beforeText.endsWith('\n') || from === 0) {
                    setTimeout(() => {
                        const transaction = editor.state.tr.insertText('/ai ', from);
                        editor.view.dispatch(transaction);
                    }, 0);
                    event.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editor]);

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
                    TipTap powered
                </div>
            </div>
            
            {/* Description */}
            <div className="border-b bg-muted/30 p-3 text-sm text-muted-foreground">
                <strong>TipTap</strong> is a headless, framework-agnostic text editor built on ProseMirror. 
                It offers a modern API, extensive customization options, real-time collaboration support, 
                and a rich ecosystem of extensions. Perfect for building feature-rich editors.
                <div className="mt-2 text-xs">
                    <strong>Dependencies:</strong> @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-image, @tiptap/extension-bubble-menu (native BubbleMenu)
                </div>
            </div>

            {/* Content area */}
            <div className="relative">
                {!isPreview ? (
                    <div className="min-h-[300px]">
                        {editor && <SimpleToolbar editor={editor} />}
                        <div className="relative">
                            <EditorContent editor={editor} />
                            {editor && <TipTapBubbleMenu editor={editor} />}
                        </div>
                    </div>
                ) : (
                    <div className={cn("p-4 min-h-[300px]", styles.markdownPreview)}>
                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) || '<p class="text-muted-foreground">Nothing to preview yet...</p>' }} />
                    </div>
                )}
            </div>

            {/* Shortcut hints */}
            <div className="border-t p-2 text-xs text-muted-foreground">
                <div className="flex gap-4">
                    <span>Ctrl+B: Bold</span>
                    <span>Ctrl+I: Italic</span>
                    <span>/: Commands</span>
                    <span>Native bubble menu</span>
                    <span>Rich text editing</span>
                    <span>Paste images</span>
                </div>
            </div>
        </div>
    );
}