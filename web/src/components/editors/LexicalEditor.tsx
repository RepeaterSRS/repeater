'use client';

import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $getSelection, $isRangeSelection, EditorState, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import {
    Bold,
    Code,
    Italic,
    Link,
    List,
    ListOrdered,
    Strikethrough,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import styles from './markdown-preview.module.css';

interface LexicalEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const theme = {
    // Theme styling
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'text-muted-foreground',
    paragraph: 'mb-1',
    quote: 'border-l-4 border-border pl-4 italic',
    heading: {
        h1: 'text-3xl font-bold mb-2',
        h2: 'text-2xl font-bold mb-2',
        h3: 'text-xl font-bold mb-2',
        h4: 'text-lg font-bold mb-1',
        h5: 'text-base font-bold mb-1',
        h6: 'text-sm font-bold mb-1',
    },
    list: {
        nested: {
            listitem: 'list-none',
        },
        ol: 'list-decimal list-inside',
        ul: 'list-disc list-inside',
        listitem: 'mb-1',
    },
    image: 'max-w-full h-auto',
    link: 'text-blue-600 underline',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        overflowed: 'overflow-hidden',
        hashtag: 'text-blue-600',
        underline: 'underline',
        strikethrough: 'line-through',
        underlineStrikethrough: 'underline line-through',
        code: 'bg-muted px-1 py-0.5 rounded text-sm font-mono',
    },
    code: 'bg-muted p-2 rounded font-mono text-sm',
    codeHighlight: {
        atrule: 'text-purple-600',
        attr: 'text-blue-600',
        boolean: 'text-orange-600',
        builtin: 'text-purple-600',
        cdata: 'text-gray-600',
        char: 'text-green-600',
        class: 'text-blue-600',
        'class-name': 'text-blue-600',
        comment: 'text-gray-600',
        constant: 'text-orange-600',
        deleted: 'text-red-600',
        doctype: 'text-gray-600',
        entity: 'text-orange-600',
        function: 'text-purple-600',
        important: 'text-red-600',
        inserted: 'text-green-600',
        keyword: 'text-purple-600',
        namespace: 'text-purple-600',
        number: 'text-orange-600',
        operator: 'text-gray-600',
        prolog: 'text-gray-600',
        property: 'text-blue-600',
        punctuation: 'text-gray-600',
        regex: 'text-green-600',
        selector: 'text-green-600',
        string: 'text-green-600',
        symbol: 'text-orange-600',
        tag: 'text-red-600',
        url: 'text-blue-600',
        variable: 'text-orange-600',
    },
};

function FloatingToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isVisible, setIsVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        const updateToolbar = () => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                
                if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                    const nativeSelection = window.getSelection();
                    if (nativeSelection && nativeSelection.rangeCount > 0) {
                        const range = nativeSelection.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        
                        setPosition({
                            top: rect.top + scrollTop - 50,
                            left: rect.left + rect.width / 2 - 100,
                        });
                        
                        // Update active formats
                        const formats = new Set<string>();
                        if (selection.hasFormat('bold')) formats.add('bold');
                        if (selection.hasFormat('italic')) formats.add('italic');
                        if (selection.hasFormat('strikethrough')) formats.add('strikethrough');
                        if (selection.hasFormat('code')) formats.add('code');
                        setActiveFormats(formats);
                        
                        setIsVisible(true);
                    }
                } else {
                    setIsVisible(false);
                }
            });
        };

        const removeUpdateListener = editor.registerUpdateListener(() => {
            updateToolbar();
        });

        const removeSelectionListener = editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateToolbar();
                return false;
            },
            1
        );

        return () => {
            removeUpdateListener();
            removeSelectionListener();
        };
    }, [editor]);

    const formatText = (command: 'bold' | 'italic' | 'strikethrough' | 'code') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
        setIsVisible(false);
    };

    const insertList = (type: 'ul' | 'ol') => {
        if (type === 'ul') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
        setIsVisible(false);
    };

    const insertLink = () => {
        const url = window.prompt('Enter URL');
        if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed z-50 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md"
            style={{ top: position.top, left: position.left }}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className={cn(
                    'h-8 w-8 p-0',
                    activeFormats.has('bold') && 'bg-accent'
                )}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className={cn(
                    'h-8 w-8 p-0',
                    activeFormats.has('italic') && 'bg-accent'
                )}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('strikethrough')}
                className={cn(
                    'h-8 w-8 p-0',
                    activeFormats.has('strikethrough') && 'bg-accent'
                )}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('code')}
                className={cn(
                    'h-8 w-8 p-0',
                    activeFormats.has('code') && 'bg-accent'
                )}
                title="Code"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => insertList('ul')}
                className="h-8 w-8 p-0"
                title="Unordered List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => insertList('ol')}
                className="h-8 w-8 p-0"
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="h-8 w-8 p-0"
                title="Link"
            >
                <Link className="h-4 w-4" />
            </Button>
        </div>
    );
}

function MarkdownPlugin({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [editor] = useLexicalComposerContext();
    const isFirstRender = React.useRef(true);
    const lastValueRef = React.useRef(value);

    // Set initial content from markdown
    React.useEffect(() => {
        if (isFirstRender.current && value) {
            editor.update(() => {
                try {
                    $convertFromMarkdownString(value, TRANSFORMERS);
                } catch (error) {
                    console.warn('Failed to convert markdown:', error);
                }
            });
            isFirstRender.current = false;
            lastValueRef.current = value;
        }
    }, [editor, value]);

    // Handle external value changes
    React.useEffect(() => {
        if (!isFirstRender.current && value !== lastValueRef.current) {
            editor.update(() => {
                try {
                    $convertFromMarkdownString(value, TRANSFORMERS);
                } catch (error) {
                    console.warn('Failed to convert markdown:', error);
                }
            });
            lastValueRef.current = value;
        }
    }, [editor, value]);

    const handleEditorChange = React.useCallback((editorState: EditorState) => {
        editorState.read(() => {
            try {
                const markdown = $convertToMarkdownString(TRANSFORMERS);
                if (markdown !== lastValueRef.current) {
                    lastValueRef.current = markdown;
                    onChange(markdown);
                }
            } catch (error) {
                console.warn('Failed to convert to markdown:', error);
            }
        });
    }, [onChange]);

    return <OnChangePlugin onChange={handleEditorChange} />;
}

function MarkdownShortcutsPlugin() {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        const removeListener = editor.registerCommand(
            'KEY_DOWN_COMMAND' as any,
            (event: KeyboardEvent) => {
                const { code, ctrlKey, metaKey } = event;
                
                if (ctrlKey || metaKey) {
                    switch (code) {
                        case 'KeyB':
                            event.preventDefault();
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                            return true;
                        case 'KeyI':
                            event.preventDefault();
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                            return true;
                        case 'KeyU':
                            event.preventDefault();
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                            return true;
                    }
                }

                return false;
            },
            1
        );

        return removeListener;
    }, [editor]);

    return null;
}

export function LexicalEditor({ value, onChange, className }: LexicalEditorProps) {
    const [isPreview, setIsPreview] = React.useState(false);

    const initialConfig = {
        namespace: 'LexicalEditor',
        theme,
        onError: (error: Error) => {
            console.error('Lexical error:', error);
        },
        nodes: [ListNode, ListItemNode, LinkNode] as any,
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
                    Lexical powered
                </div>
            </div>
            
            {/* Description */}
            <div className="border-b bg-muted/30 p-3 text-sm text-muted-foreground">
                <strong>Lexical</strong> is Meta's modern, extensible text editor framework. Built from the ground up 
                for performance and reliability, it features a plugin-based architecture, excellent accessibility, 
                and powerful collaborative editing capabilities. Ideal for applications requiring advanced text 
                editing with precise control over the editor state.
                <div className="mt-2 text-xs">
                    <strong>Dependencies:</strong> lexical, @lexical/react, @lexical/rich-text, @lexical/history, 
                    @lexical/markdown, @lexical/link, @lexical/list, @lexical/selection
                </div>
            </div>

            {/* Content area */}
            <div className="relative">
                {!isPreview ? (
                    <LexicalComposer initialConfig={initialConfig}>
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable className="w-full min-h-[300px] p-4 resize-none border-none outline-none text-sm" />
                                }
                                placeholder={
                                    <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                                        Start typing your content here...
                                    </div>
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <AutoFocusPlugin />
                            <ListPlugin />
                            <LinkPlugin />
                            <FloatingToolbarPlugin />
                            <MarkdownPlugin value={value} onChange={onChange} />
                            <MarkdownShortcutsPlugin />
                        </div>
                    </LexicalComposer>
                ) : (
                    <div className={cn("p-4 min-h-[300px]", styles.markdownPreview)}>
                        <div dangerouslySetInnerHTML={{ 
                            __html: value.replace(/\n/g, '<br>') || '<p class="text-muted-foreground">Nothing to preview yet...</p>' 
                        }} />
                    </div>
                )}
            </div>

            {/* Shortcut hints */}
            <div className="border-t p-2 text-xs text-muted-foreground">
                <div className="flex gap-4">
                    <span>Ctrl+B: Bold</span>
                    <span>Ctrl+I: Italic</span>
                    <span>Rich text editing</span>
                    <span>Auto-converts to markdown</span>
                </div>
            </div>
        </div>
    );
}