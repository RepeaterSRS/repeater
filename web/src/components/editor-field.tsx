'use client';

import type { Value } from 'platejs';

import { BoldPlugin, ItalicPlugin } from '@platejs/basic-nodes/react';
import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';

export interface EditorFieldProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value?: Value;
    onChange?: (value: Value) => void;
    placeholder?: string;
}

export function EditorField({
    value,
    onChange,
    placeholder = 'Type here...',
    ...props
}: EditorFieldProps) {
    const editor = usePlateEditor({
        plugins: [BoldPlugin, ItalicPlugin],
        value: value ?? [{ type: 'p', children: [{ text: '' }] }],
    });

    return (
        <Plate
            editor={editor}
            onChange={({ value }) => {
                onChange?.(value);
            }}
            {...props}
        >
            <FloatingToolbar>
                {/* TODO: make keyboard shortcut modifier adapt based on system */}
                <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
                    B
                </MarkToolbarButton>
                <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
                    I
                </MarkToolbarButton>
            </FloatingToolbar>
            <PlateContent placeholder={placeholder} className="h-36" />
        </Plate>
    );
}
