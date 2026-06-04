export function createQuoteWidget() {

    return `

        <div
            class="widget"
            id="quote-widget"
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

                <span>
                    Quote
                </span>

            </div>

            <div class="widget-content">

                Stay positive.

            </div>

            <div class="resize-handle">

                ↘

            </div>

        </div>

    `;

}