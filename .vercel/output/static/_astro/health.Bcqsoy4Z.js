import{c as n}from"./createLucideIcon.B1vwwKzF.js";import{s as e}from"./supabaseClient.B-5sNfMf.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=n("CloudSun",[["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}],["path",{d:"M15.947 12.65a4 4 0 0 0-5.925-4.128",key:"dpwdj0"}],["path",{d:"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z",key:"s09mg5"}]]);async function l(){const{data:a,error:t}=await e.from("pollution_reports").select("*").order("created_at",{ascending:!1});if(t)throw t;return a}async function p(a,t){const o={...a,reporter_id:t??null},{data:s,error:r}=await e.from("pollution_reports").insert(o).select().single();if(r)throw r;return s}async function u(){const{data:a,error:t}=await e.from("health_indicators").select("*").order("created_at",{ascending:!1});if(t)throw t;return a}export{i as C,u as a,p as c,l as g};
