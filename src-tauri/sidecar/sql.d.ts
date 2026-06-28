// Allow importing *.sql files as text (Bun's `with { type: 'text' }` import).
declare module '*.sql' {
  const content: string;
  export default content;
}
