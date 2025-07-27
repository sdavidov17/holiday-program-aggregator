exports.id = 734;
exports.ids = [734];
exports.modules = {

/***/ 734:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7458);
/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5645);
/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4962);
/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7374);
/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_utils_api__WEBPACK_IMPORTED_MODULE_2__]);
_utils_api__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];




const MyApp = ({ Component, pageProps: { session, ...pageProps } })=>{
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(next_auth_react__WEBPACK_IMPORTED_MODULE_1__.SessionProvider, {
        session: session,
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Component, {
            ...pageProps
        })
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_utils_api__WEBPACK_IMPORTED_MODULE_2__/* .api */ .h.withTRPC(MyApp));

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 4962:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ api)
/* harmony export */ });
/* harmony import */ var _trpc_next__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7455);
/* harmony import */ var _trpc_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(272);
/* harmony import */ var superjson__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72);
/* harmony import */ var superjson__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(superjson__WEBPACK_IMPORTED_MODULE_2__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_trpc_next__WEBPACK_IMPORTED_MODULE_0__, _trpc_client__WEBPACK_IMPORTED_MODULE_1__]);
([_trpc_next__WEBPACK_IMPORTED_MODULE_0__, _trpc_client__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);



const getBaseUrl = ()=>{
    if (false) {}
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
};
const api = (0,_trpc_next__WEBPACK_IMPORTED_MODULE_0__.createTRPCNext)({
    config () {
        return {
            transformer: (superjson__WEBPACK_IMPORTED_MODULE_2___default()),
            links: [
                (0,_trpc_client__WEBPACK_IMPORTED_MODULE_1__.loggerLink)({
                    enabled: (opts)=> false || opts.direction === "down" && opts.result instanceof Error
                }),
                (0,_trpc_client__WEBPACK_IMPORTED_MODULE_1__.httpBatchLink)({
                    url: `${getBaseUrl()}/api/trpc`
                })
            ]
        };
    },
    ssr: false
});

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 7374:
/***/ (() => {



/***/ })

};
;