import type { Value, TElement } from 'platejs';

import { BoldPlugin, ItalicPlugin } from '@platejs/basic-nodes/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { createPlateEditor } from 'platejs/react';

/**
 * TODO: improve validation. Current solution is fragile, uses any
 * and only checks specific a subset of potential node types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateCardContent(content: any[]): boolean {
    return content.some((node) => {
        if (node.children) {
            return node.children.some(
                (child: { text: string }) => child.text?.trim() !== ''
            );
        }
        return false;
    });
}

/**
 * Deserializes markdown string to Plate editor format
 */
export function deserializeMarkdown(content: string): TElement[] {
    const editor = createPlateEditor({
        plugins: [MarkdownPlugin, BoldPlugin, ItalicPlugin],
    });
    return editor.getApi(MarkdownPlugin).markdown.deserialize(content);
}

/**
 * Serializes Plate editor content to markdown string
 */
export function serializeToMarkdown(content: Value): string {
    const editor = createPlateEditor({
        plugins: [MarkdownPlugin],
        value: content,
    });
    return editor.api.markdown.serialize();
}
