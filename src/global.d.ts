declare module 'react' {
  export const useMemo: <T>(factory: () => T, deps: unknown[]) => T;
  export const useState: <T>(initial: T) => [T, (value: T | ((previous: T) => T)) => void];
  export type ReactNode = unknown;
}

declare module 'react-dom/client' {
  export function createRoot(element: Element): { render(node: unknown): void };
}

declare module 'lucide-react' {
  export const ShieldCheck: (props?: Record<string, unknown>) => unknown;
  export const Search: (props?: Record<string, unknown>) => unknown;
  export const Library: (props?: Record<string, unknown>) => unknown;
  export const School: (props?: Record<string, unknown>) => unknown;
  export const Lock: (props?: Record<string, unknown>) => unknown;
  export const AlertTriangle: (props?: Record<string, unknown>) => unknown;
  export const BarChart3: (props?: Record<string, unknown>) => unknown;
  export const FileText: (props?: Record<string, unknown>) => unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: Record<string, unknown>;
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}

declare module '*.css';

declare interface ImportMeta {
  env: Record<string, string | undefined>;
}

declare module 'firebase/app' {
  export interface FirebaseApp {}
  export function initializeApp(config: Record<string, string | undefined>): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/auth' {
  import type { FirebaseApp } from 'firebase/app';
  export function getAuth(app: FirebaseApp): unknown;
}

declare module 'firebase/firestore' {
  import type { FirebaseApp } from 'firebase/app';
  export function getFirestore(app: FirebaseApp): unknown;
}

declare namespace JSX {
  interface IntrinsicAttributes {
    key?: string | number;
  }
}

declare module 'firebase/firestore' {
  import type { FirebaseApp } from 'firebase/app';
  export function getFirestore(app: FirebaseApp): unknown;
  export function addDoc(collectionRef: unknown, data: Record<string, unknown>): Promise<{ id: string }>;
  export function collection(db: unknown, path: string): unknown;
  export function serverTimestamp(): unknown;
}
