// 设置项定义（元数据），不是逻辑代码——见
// settings/appearance/borderRadiusSetting.js 里的说明。
// options 列出了这个设置允许选择的所有值（用于生成下拉框/分段按钮）。
// A setting definition (metadata), not logic code — see
// settings/appearance/borderRadiusSetting.js for the full explanation.
// options lists every value this setting can be — used to build a
// dropdown/segmented control.
export const clockFormatSetting = {

    id: "clock-format",

    label: "Clock Format",

    defaultValue: "24h",

    options: [
        "12h",
        "24h"
    ]

};
