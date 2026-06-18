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