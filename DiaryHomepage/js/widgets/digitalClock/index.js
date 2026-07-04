// 桶文件（barrel file）——把数字时钟组件拆分成的三个部分（创建、
// 渲染、更新）统一从这一个入口重新导出，方便其他文件一次性导入。
// A barrel file — re-exports the digital clock widget's three separated
// concerns (create, render, update) from one entry point, so other files
// can import all of them in a single line.

export {
    createDigitalClock
}
from "./createDigitalClock.js";

export {
    renderDigitalClock
}
from "./renderDigitalClock.js";

export {
    updateDigitalClock
}
from "./updateDigitalClock.js";
