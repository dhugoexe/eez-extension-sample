import {
    IActionComponentDefinition,
    IDashboardComponentContext,

} from "./eez-types";

// ---------------------------------------------------------------------------
// Shared visual style
// ---------------------------------------------------------------------------

const HEADER_COLOR = "#5E7CE2";
// const HEADER_COLOR_PARAMETERS = "#e25e93";
const ICON =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">` +
        `<path d="M13 2L4.09 12.97H11L10 22L19.91 11.03H13L13 2Z"/>` +
        `</svg>`
    );

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function done(context: IDashboardComponentContext) {
    context.propagateValueThroughSeqout();
}

// ---------------------------------------------------------------------------
// Action definitions
// ---------------------------------------------------------------------------

export const ACTIONS: IActionComponentDefinition[] = [
    {
        name: "GetData",
        componentPaletteLabel: "Get Data",
        icon: ICON,
        componentHeaderColor: HEADER_COLOR,

        inputs: [],
        outputs: [],

        properties: [
            {
                name: "result",
                displayName: "Result",
                type: "assignable-expression",
                valueType: "struct:eez-ext-sample/device_data"
            }
        ],

        defaults: {
            result: ""
        },

        execute(context: IDashboardComponentContext) {
            done(context);
        },
        isNative: false
    },
    {
        name: "SetData",
        componentPaletteLabel: "Set Data",
        icon: ICON,
        componentHeaderColor: HEADER_COLOR,

        inputs: [],
        outputs: [],

        properties: [
            {
                name: "data",
                displayName: "Data",
                type: "expression",
                valueType: "struct:eez-ext-sample/device_data"
            }
        ],

        defaults: {
            data: "current_data"
        },

        execute(context: IDashboardComponentContext) {
            const data = context.evalProperty("data");
            if (data !== undefined && data !== null) {
                context.logInfo(`[SetData] ${JSON.stringify(data)}`);
            }
            done(context);
        },
        isNative: true
    },
];
