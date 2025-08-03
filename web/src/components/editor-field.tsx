'use client';

import type { Value } from 'platejs';

import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import * as React from 'react';

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
            <PlateContent placeholder={placeholder} className="h-36" />
        </Plate>
    );
}
