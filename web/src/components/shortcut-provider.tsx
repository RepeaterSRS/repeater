import {
    createContext,
    useContext,
    useCallback,
    useRef,
    ReactNode,
} from 'react';

interface ShortcutContextType {
    registerAction: (action: string, handler: () => void) => void;
    unregisterAction: (action: string) => void;
    executeAction: (action: string) => void;
}

const ShortcutContext = createContext<ShortcutContextType | null>(null);

export function ShortcutProvider({ children }: { children: ReactNode }) {
    const actionsRef = useRef(new Map<string, () => void>());

    const registerAction = useCallback(
        (action: string, handler: () => void) => {
            actionsRef.current.set(action, handler);
        },
        []
    );

    const unregisterAction = useCallback((action: string) => {
        actionsRef.current.delete(action);
    }, []);

    const executeAction = useCallback((action: string) => {
        const handler = actionsRef.current.get(action);
        if (handler) {
            handler();
        }
    }, []);

    return (
        <ShortcutContext.Provider
            value={{ registerAction, unregisterAction, executeAction }}
        >
            {children}
        </ShortcutContext.Provider>
    );
}

export function useShortcutActions() {
    const context = useContext(ShortcutContext);
    if (!context)
        throw new Error(
            'useShortcutActions must be used within ShortcutProvider'
        );
    return context;
}
