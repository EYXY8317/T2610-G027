// 这是一个"转发/门面"文件——本身不包含任何实现，只是把
// boundaryManager.js 里真正的函数重新导出一次，让其他文件可以用
// "./boundary.js" 这个更短、更好记的路径来导入，而不用直接依赖
// 内部实现文件的具体名字。
// This is a "re-export / facade" file — it contains no implementation of
// its own, it just re-exports the real function from boundaryManager.js,
// so other files can import via the shorter, easier-to-remember path
// "./boundary.js" instead of depending directly on the internal
// implementation file's specific name.
export { clampWidgetToDashboard } from "./boundaryManager.js";
