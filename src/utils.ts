/** Prefix image paths with Vite's base URL */
export const img = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
