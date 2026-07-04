// 这是一个"设置项定义"对象，不是逻辑代码——只是描述这个设置的
// id（内部标识）、label（显示给用户看的名字）和 defaultValue
// （没有自定义过时的默认值）。真正读取/渲染这个设置的代码在别处，
// 这个文件只是提供这份元数据供那些代码使用。
// This is a "setting definition" object, not logic code — it just
// describes this setting's id (internal identifier), label (the name
// shown to the user), and defaultValue (the value used until the user
// customizes it). The code that actually reads/renders this setting
// lives elsewhere; this file just supplies that metadata for it to use.
export const borderRadiusSetting = {

    id: "border-radius",

    label: "Border Radius",

    defaultValue: 20

};
