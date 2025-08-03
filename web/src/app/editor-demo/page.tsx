'use client';

import { EditorDemo } from '@/components/editors';

export default function EditorDemoPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="mb-8 text-3xl font-bold">Rich Text Editor Comparison</h1>
            <EditorDemo />
        </div>
    );
}