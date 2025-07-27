"use strict";
exports.id = 956;
exports.ids = [956];
exports.modules = {

/***/ 3956:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   L: () => (/* binding */ authOptions),
/* harmony export */   W: () => (/* binding */ getServerAuthSession)
/* harmony export */ });
/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7346);
/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_auth_providers_discord__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6482);
/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2104);
/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _env_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(712);
/* harmony import */ var _server_db__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6150);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_env_mjs__WEBPACK_IMPORTED_MODULE_3__, _server_db__WEBPACK_IMPORTED_MODULE_4__]);
([_env_mjs__WEBPACK_IMPORTED_MODULE_3__, _server_db__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





const authOptions = {
    callbacks: {
        session: ({ session, user })=>({
                ...session,
                user: {
                    ...session.user,
                    id: user.id
                }
            })
    },
    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__.PrismaAdapter)(_server_db__WEBPACK_IMPORTED_MODULE_4__.db),
    providers: [
        (0,next_auth_providers_discord__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)({
            clientId: _env_mjs__WEBPACK_IMPORTED_MODULE_3__/* .env */ .O.DISCORD_CLIENT_ID ?? "",
            clientSecret: _env_mjs__WEBPACK_IMPORTED_MODULE_3__/* .env */ .O.DISCORD_CLIENT_SECRET ?? ""
        })
    ]
};
const getServerAuthSession = (ctx)=>{
    return (0,next_auth__WEBPACK_IMPORTED_MODULE_0__.getServerSession)(ctx.req, ctx.res, authOptions);
};

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 6150:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   db: () => (/* binding */ db)
/* harmony export */ });
/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3524);
/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _env_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(712);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_env_mjs__WEBPACK_IMPORTED_MODULE_1__]);
_env_mjs__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({
    log: _env_mjs__WEBPACK_IMPORTED_MODULE_1__/* .env */ .O.NODE_ENV === "development" ? [
        "query",
        "error",
        "warn"
    ] : [
        "error"
    ]
});
if (_env_mjs__WEBPACK_IMPORTED_MODULE_1__/* .env */ .O.NODE_ENV !== "production") globalForPrisma.prisma = db;

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 712:
/***/ ((__webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   O: () => (/* binding */ env)
/* harmony export */ });
/* harmony import */ var _t3_oss_env_nextjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6206);
/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9926);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_t3_oss_env_nextjs__WEBPACK_IMPORTED_MODULE_0__, zod__WEBPACK_IMPORTED_MODULE_1__]);
([_t3_oss_env_nextjs__WEBPACK_IMPORTED_MODULE_0__, zod__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const env = (0,_t3_oss_env_nextjs__WEBPACK_IMPORTED_MODULE_0__.createEnv)({
    /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */ server: {
        DATABASE_URL: zod__WEBPACK_IMPORTED_MODULE_1__.z.string().url().refine((str)=>!str.includes("YOUR_MYSQL_URL_HERE"), "You forgot to change the default URL"),
        NODE_ENV: zod__WEBPACK_IMPORTED_MODULE_1__.z.enum([
            "development",
            "test",
            "production"
        ]).default("development"),
        NEXTAUTH_SECRET:  true ? zod__WEBPACK_IMPORTED_MODULE_1__.z.string().min(1) : 0,
        NEXTAUTH_URL: zod__WEBPACK_IMPORTED_MODULE_1__.z.preprocess(// This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
        // Since NextAuth.js automatically uses the VERCEL_URL if present.
        (str)=>process.env.VERCEL_URL ?? str, // VERCEL_URL doesn't include `https` so it cant be validated as a URL
        process.env.VERCEL ? zod__WEBPACK_IMPORTED_MODULE_1__.z.string().min(1) : zod__WEBPACK_IMPORTED_MODULE_1__.z.string().url()),
        // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
        DISCORD_CLIENT_ID: zod__WEBPACK_IMPORTED_MODULE_1__.z.string().optional(),
        DISCORD_CLIENT_SECRET: zod__WEBPACK_IMPORTED_MODULE_1__.z.string().optional()
    },
    /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */ client: {
    },
    /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */ runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: "production",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET
    },
    /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */ skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */ emptyStringAsUndefined: true
});

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;