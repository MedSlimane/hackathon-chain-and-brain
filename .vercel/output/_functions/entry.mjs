import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DB8q2GNU.mjs';
import { manifest } from './manifest_CJkXPmdX.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/analytics.astro.mjs');
const _page2 = () => import('./pages/auth/callback.astro.mjs');
const _page3 = () => import('./pages/dashboard/admin.astro.mjs');
const _page4 = () => import('./pages/dashboard/farmer.astro.mjs');
const _page5 = () => import('./pages/dashboard/health.astro.mjs');
const _page6 = () => import('./pages/dashboard/health-risk.astro.mjs');
const _page7 = () => import('./pages/dashboard/industry.astro.mjs');
const _page8 = () => import('./pages/dashboard/scan-dechets.astro.mjs');
const _page9 = () => import('./pages/listings/_id_.astro.mjs');
const _page10 = () => import('./pages/listings.astro.mjs');
const _page11 = () => import('./pages/login.astro.mjs');
const _page12 = () => import('./pages/marketplace.astro.mjs');
const _page13 = () => import('./pages/register.astro.mjs');
const _page14 = () => import('./pages/settings.astro.mjs');
const _page15 = () => import('./pages/transactions/_id_.astro.mjs');
const _page16 = () => import('./pages/transactions.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/analytics.astro", _page1],
    ["src/pages/auth/callback.ts", _page2],
    ["src/pages/dashboard/admin.astro", _page3],
    ["src/pages/dashboard/farmer.astro", _page4],
    ["src/pages/dashboard/health.astro", _page5],
    ["src/pages/dashboard/health-risk.astro", _page6],
    ["src/pages/dashboard/industry.astro", _page7],
    ["src/pages/dashboard/scan-dechets.astro", _page8],
    ["src/pages/listings/[id].astro", _page9],
    ["src/pages/listings.astro", _page10],
    ["src/pages/login.astro", _page11],
    ["src/pages/marketplace.astro", _page12],
    ["src/pages/register.astro", _page13],
    ["src/pages/settings.astro", _page14],
    ["src/pages/transactions/[id].astro", _page15],
    ["src/pages/transactions/index.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "bef3db29-e155-4340-9861-8fc1e0676c4c",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
