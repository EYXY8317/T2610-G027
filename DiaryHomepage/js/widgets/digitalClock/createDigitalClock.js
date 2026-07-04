// 生成数字时钟组件的初始 HTML 骨架（拖动手柄、标题、显示时间的容器、
// 缩放手柄）——时间数字本身先写死显示 "00:00:00" 占位，真正的
// 实时时间由 updateDigitalClock.js 负责后续更新。
// Builds the digital clock widget's initial HTML skeleton (drag handle,
// title, the container that will show the time, resize handle) — the
// time digits themselves start as a hardcoded "00:00:00" placeholder;
// the real, live time is filled in afterward by updateDigitalClock.js.

export function createDigitalClock() {

    return `

        <div
            class="widget"
            id="digital-clock-widget"
        >

            <div
                class="drag-handle"
            >

                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>

                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>

            </div>

            <div class="widget-header">

                <span
                    class="clock-title"
                >
                    Digital Clock
                </span>

            </div>

            <div
                class="widget-content"
            >

                <div
                    id="digital-clock-time"
                >

                    00:00:00

                </div>

            </div>

            <div
                class="resize-handle"
            >

                ↘

            </div>

        </div>

    `;

}
