export interface ShortcutConfig {
    key: string;
    action: string;
    description: string;
    scope: 'decks' | 'profile' | 'review';
}

export const SHORTCUT_CONFIG: ShortcutConfig[] = [
    {
        key: 'j',
        action: 'card-forgot',
        description: 'Mark card as forgotten',
        scope: 'review',
    },
    {
        key: 'l',
        action: 'card-ok',
        description: 'Mark card as remembered',
        scope: 'review',
    },
];
