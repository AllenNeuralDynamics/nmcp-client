import {defineConfig} from "vitest/config";

export default defineConfig({
    resolve: {
        // Stale tsc output (.js, gitignored) sits beside most sources, and Vite's default order resolves an
        // extensionless import to it before the .ts.  Match webpack's order so tests run the real sources.
        extensions: [".tsx", ".ts", ".mjs", ".js", ".jsx", ".json"]
    },
    test: {
        environment: "jsdom",
        include: ["client/**/*.test.{ts,tsx}"],
        setupFiles: ["client/test/setup.ts"],
        server: {
            // Neuroglancer's modules import CSS, which Node's loader rejects when the package is externalized.  Inlining
            // it lets Vite stub the CSS out.
            deps: {inline: ["neuroglancer"]}
        }
    }
});
