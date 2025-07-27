import { useHotkeys } from 'react-hotkeys-hook';

import { useShortcutActions } from '@/components/shortcut-provider';
import { getShortcutsForScope } from '@/lib/shortcuts';

export const usePageShortcuts = (scope: string, enabled = true) => {
    const { executeAction } = useShortcutActions();
    const shortcuts = getShortcutsForScope(scope);

    const keyToAction = shortcuts.reduce(
        (acc, { key, action }) => {
            acc[key] = action;
            return acc;
        },
        {} as Record<string, string>
    );

    const allKeys = shortcuts.map((s) => s.key);

    useHotkeys(
        allKeys,
        (event) => {
            const action = keyToAction[event.key];
            if (action) {
                executeAction(action);
            }
        },
        {
            enabled,
            preventDefault: true,
            enableOnFormTags: false,
        }
    );

    return shortcuts;
};
