"use strict";
(() => {
var exports = {};
exports.id = 829;
exports.ids = [829];
exports.modules = {

/***/ 2104:
/***/ ((module) => {

module.exports = require("@next-auth/prisma-adapter");

/***/ }),

/***/ 3524:
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ 730:
/***/ ((module) => {

module.exports = require("next/dist/server/api-utils/node.js");

/***/ }),

/***/ 3076:
/***/ ((module) => {

module.exports = require("next/dist/server/future/route-modules/route-module.js");

/***/ }),

/***/ 7507:
/***/ ((module) => {

module.exports = require("next/dist/server/web/spec-extension/adapters/headers.js");

/***/ }),

/***/ 2006:
/***/ ((module) => {

module.exports = require("next/dist/server/web/spec-extension/adapters/request-cookies.js");

/***/ }),

/***/ 7782:
/***/ ((module) => {

module.exports = require("next/dist/server/web/spec-extension/cookies.js");

/***/ }),

/***/ 72:
/***/ ((module) => {

module.exports = require("superjson");

/***/ }),

/***/ 6206:
/***/ ((module) => {

module.exports = import("@t3-oss/env-nextjs");;

/***/ }),

/***/ 2937:
/***/ ((module) => {

module.exports = import("@trpc/server");;

/***/ }),

/***/ 6282:
/***/ ((module) => {

module.exports = import("@trpc/server/adapters/next");;

/***/ }),

/***/ 9926:
/***/ ((module) => {

module.exports = import("zod");;

/***/ }),

/***/ 9491:
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ 4300:
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ 6113:
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ 2181:
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ 3477:
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ 7310:
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ 9796:
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ 2620:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   config: () => (/* binding */ config),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   routeModule: () => (/* binding */ routeModule)
/* harmony export */ });
/* harmony import */ var next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9470);
/* harmony import */ var next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6111);
/* harmony import */ var next_dist_build_webpack_loaders_next_route_loader_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6213);
/* harmony import */ var private_next_pages_api_trpc_trpc_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9516);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([private_next_pages_api_trpc_trpc_ts__WEBPACK_IMPORTED_MODULE_3__]);
private_next_pages_api_trpc_trpc_ts__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_webpack_loaders_next_route_loader_helpers__WEBPACK_IMPORTED_MODULE_2__/* .hoist */ .l)(private_next_pages_api_trpc_trpc_ts__WEBPACK_IMPORTED_MODULE_3__, "default"));
// Re-export config.
const config = (0,next_dist_build_webpack_loaders_next_route_loader_helpers__WEBPACK_IMPORTED_MODULE_2__/* .hoist */ .l)(private_next_pages_api_trpc_trpc_ts__WEBPACK_IMPORTED_MODULE_3__, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__/* .RouteKind */ .x.PAGES_API,
        page: "/api/trpc/[trpc]",
        pathname: "/api/trpc/[trpc]",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: private_next_pages_api_trpc_trpc_ts__WEBPACK_IMPORTED_MODULE_3__
});

//# sourceMappingURL=pages-api.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 9516:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _trpc_server_adapters_next__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6282);
/* harmony import */ var _env_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(712);
/* harmony import */ var _server_api_root__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2960);
/* harmony import */ var _server_api_trpc__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6906);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_trpc_server_adapters_next__WEBPACK_IMPORTED_MODULE_0__, _env_mjs__WEBPACK_IMPORTED_MODULE_1__, _server_api_root__WEBPACK_IMPORTED_MODULE_2__, _server_api_trpc__WEBPACK_IMPORTED_MODULE_3__]);
([_trpc_server_adapters_next__WEBPACK_IMPORTED_MODULE_0__, _env_mjs__WEBPACK_IMPORTED_MODULE_1__, _server_api_root__WEBPACK_IMPORTED_MODULE_2__, _server_api_trpc__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_trpc_server_adapters_next__WEBPACK_IMPORTED_MODULE_0__.createNextApiHandler)({
    router: _server_api_root__WEBPACK_IMPORTED_MODULE_2__/* .appRouter */ .q,
    createContext: _server_api_trpc__WEBPACK_IMPORTED_MODULE_3__/* .createTRPCContext */ .uw,
    onError: _env_mjs__WEBPACK_IMPORTED_MODULE_1__/* .env */ .O.NODE_ENV === "development" ? ({ path, error })=>{
        console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
    } : undefined
}));

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 2960:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   q: () => (/* binding */ appRouter)
/* harmony export */ });
/* harmony import */ var _server_api_trpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6906);
/* harmony import */ var _server_api_routers_healthz__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4424);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_server_api_trpc__WEBPACK_IMPORTED_MODULE_0__, _server_api_routers_healthz__WEBPACK_IMPORTED_MODULE_1__]);
([_server_api_trpc__WEBPACK_IMPORTED_MODULE_0__, _server_api_routers_healthz__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const appRouter = (0,_server_api_trpc__WEBPACK_IMPORTED_MODULE_0__/* .createTRPCRouter */ .hA)({
    healthz: _server_api_routers_healthz__WEBPACK_IMPORTED_MODULE_1__/* .healthzRouter */ .F
});

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 4424:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   F: () => (/* binding */ healthzRouter)
/* harmony export */ });
/* harmony import */ var _server_api_trpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6906);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_server_api_trpc__WEBPACK_IMPORTED_MODULE_0__]);
_server_api_trpc__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const healthzRouter = (0,_server_api_trpc__WEBPACK_IMPORTED_MODULE_0__/* .createTRPCRouter */ .hA)({
    healthz: _server_api_trpc__WEBPACK_IMPORTED_MODULE_0__/* .publicProcedure */ .$y.query(()=>{
        return {
            status: "ok",
            timestamp: new Date().toISOString()
        };
    })
});

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 6906:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $y: () => (/* binding */ publicProcedure),
/* harmony export */   hA: () => (/* binding */ createTRPCRouter),
/* harmony export */   uw: () => (/* binding */ createTRPCContext)
/* harmony export */ });
/* unused harmony export createInnerTRPCContext */
/* harmony import */ var _trpc_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2937);
/* harmony import */ var superjson__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(72);
/* harmony import */ var superjson__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(superjson__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9926);
/* harmony import */ var _server_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3956);
/* harmony import */ var _server_db__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6150);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_trpc_server__WEBPACK_IMPORTED_MODULE_0__, zod__WEBPACK_IMPORTED_MODULE_2__, _server_auth__WEBPACK_IMPORTED_MODULE_3__, _server_db__WEBPACK_IMPORTED_MODULE_4__]);
([_trpc_server__WEBPACK_IMPORTED_MODULE_0__, zod__WEBPACK_IMPORTED_MODULE_2__, _server_auth__WEBPACK_IMPORTED_MODULE_3__, _server_db__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





const createInnerTRPCContext = (opts)=>{
    return {
        session: opts.session,
        db: _server_db__WEBPACK_IMPORTED_MODULE_4__.db
    };
};
const createTRPCContext = async (opts)=>{
    const { req, res } = opts;
    const session = await (0,_server_auth__WEBPACK_IMPORTED_MODULE_3__/* .getServerAuthSession */ .W)({
        req,
        res
    });
    return createInnerTRPCContext({
        session
    });
};
const t = _trpc_server__WEBPACK_IMPORTED_MODULE_0__.initTRPC.context().create({
    transformer: (superjson__WEBPACK_IMPORTED_MODULE_1___default()),
    errorFormatter ({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof zod__WEBPACK_IMPORTED_MODULE_2__.ZodError ? error.cause.flatten() : null
            }
        };
    }
});
const createTRPCRouter = t.router;
const publicProcedure = t.procedure;

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [334,956], () => (__webpack_exec__(2620)));
module.exports = __webpack_exports__;

})();