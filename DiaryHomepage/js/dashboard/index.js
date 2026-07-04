// "桶文件"（barrel file）——把 dashboard 文件夹里好几个不同小文件
// 各自导出的功能，统一汇总到这一个入口文件重新导出。这样其他地方
// 只需要 `import { enableDrag, enableResize, ... } from ".../dashboard/index.js"`
// 一次性导入所有需要的功能，不用一个个分别写 import 路径。
// A "barrel file" — gathers the separate exports from several small files
// in the dashboard folder and re-exports them all from this one entry
// point. This lets other code write a single
// `import { enableDrag, enableResize, ... } from ".../dashboard/index.js"`
// to pull in everything needed, instead of writing a separate import line
// for each individual file.
export { enableDrag } from "./drag.js";
export { enableResize } from "./resize.js";
export { clampWidgetToDashboard } from "./boundary.js";
export { applyWidgetCollisionSnap } from "./collision.js";
export { isOverlapping } from "./overlap.js";
