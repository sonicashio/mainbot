import path from "path";
import { cpSync } from "fs";
import rollupPluginTs from "@rollup/plugin-typescript";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: {
        enabled: true,
        timeline: {
            enabled: true,
        },
    },
    srcDir: "src/",
    ssr: false,
    typescript: {
        strict: true,
    },
    modules: [
        "@nuxtjs/i18n",
        "@nuxtjs/tailwindcss",
        "nuxt-security",
        "nuxt-auth-utils",
        "nuxt-mikro-orm-module",
        "@nuxt/icon",
        "@vueuse/nuxt",
    ],
    i18n: {
        vueI18n: "./i18n.config.ts",
        strategy: "no_prefix",
        defaultLocale: "en",
        locales: [
            { code: "en", name: "English", dir: "ltr" },
            { code: "ar", name: "Arabic", dir: "rtl" },
        ],
    },
    security: {
        headers: {
            contentSecurityPolicy: false,
            xFrameOptions: false,
        },
        rateLimiter: {
            tokensPerInterval: 150,
            interval: 300_000,
        },
    },
    tailwindcss: {
        exposeConfig: true,
    },
    app: {
        head: {
            script: [{ src: "https://telegram.org/js/telegram-web-app.js" }],
            viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
        },
    },
    vite: {
        esbuild: {
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true,
                },
            },
        },
        plugins: [
        ],
    },
    hooks: {
        "nitro:build:public-assets": (nitro) => {
            // Copy migrations templates to .output/server/migrations
            const targetDir = path.join(nitro.options.output.serverDir, "migrations");
            cpSync(path.join(nitro.options.srcDir, "migrations"), targetDir, { recursive: true });
        },
    },
    nitro: {
        preset: "bun",
        experimental: {
            tasks: true,
        },
        scheduledTasks: {
            "0 0 * * *": ["statics:users"],
        },
        esbuild: {
            options: {
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true,
                        // emitDecoratorMetadata: true,
                        // esModuleInterop: true,
                    },
                },
            },
        },
        rollupConfig: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            plugins: [
                rollupPluginTs(
                    {
                        include: ["src/server/**/*.entity.ts"],
                        tsconfig: "src/server/tsconfig.json",
                    },
                ),
            ],
        },
    },
    routeRules: {
        "/dashboard/**": {
            security: {
                headers: {
                    crossOriginEmbedderPolicy: false,
                    crossOriginResourcePolicy: false,
                    crossOriginOpenerPolicy: false, // Let telegram widget popup's work
                },
            },
        },
    },
    runtimeConfig: {
        session: {
            cookie: {
                sameSite: "None",
            },
            maxAge: 60 * 60 * 24, // 1 day
        },
        serverVersion: 1,
        public: {
            version: 1,
        },
    },
});
