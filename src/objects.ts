import type {
    IEezFlowEditor,
    IObjectVariableType,
    IObjectVariableValue,
    IObjectVariableValueConstructorParams,
    IObjectVariableValueFieldDescription,
    IVariable
} from "./eez-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChannelConfig {
    active: number;
    value1: number;
    value2: number;
}

type ChannelKey = "channel1" | "channel2" | "channel3" | "channel4" | "channel5";

const CHANNEL_KEYS: ChannelKey[] = [
    "channel1",
    "channel2",
    "channel3",
    "channel4",
    "channel5"
];

interface DataTypeConstructorParams
    extends IObjectVariableValueConstructorParams {
    name: string;
    oldName: string;
    createdOn: number;
    createdBy: string;
    modifiedOn: number;
    modifiedBy: string;
    channel1: ChannelConfig;
    channel2: ChannelConfig;
    channel3: ChannelConfig;
    channel4: ChannelConfig;
    channel5: ChannelConfig;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CHANNEL: ChannelConfig = {
    active: 0,
    value1: 0,
    value2: 0
};

const DATA_DEFAULTS: DataTypeConstructorParams = {
    name: "",
    oldName: "",
    createdOn: 0,
    createdBy: "",
    modifiedOn: 0,
    modifiedBy: "",
    channel1: { ...DEFAULT_CHANNEL },
    channel2: { ...DEFAULT_CHANNEL },
    channel3: { ...DEFAULT_CHANNEL },
    channel4: { ...DEFAULT_CHANNEL },
    channel5: { ...DEFAULT_CHANNEL }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mergeParams(
    base: DataTypeConstructorParams,
    override: Partial<DataTypeConstructorParams>
): DataTypeConstructorParams {
    const result = { ...base, ...override };
    for (const key of CHANNEL_KEYS) {
        result[key] = { ...base[key], ...(override[key] ?? {}) };
    }
    return result;
}

function channelFields(key: ChannelKey): IObjectVariableValueFieldDescription[] {
    return [
        {
            name: "active",
            valueType: "integer",
            getFieldValue: (v: IObjectVariableValue) =>
                (v.constructorParams as DataTypeConstructorParams)[key].active
        },
        {
            name: "value1",
            valueType: "float",
            getFieldValue: (v: IObjectVariableValue) =>
                (v.constructorParams as DataTypeConstructorParams)[key].value1
        },
        {
            name: "value2",
            valueType: "float",
            getFieldValue: (v: IObjectVariableValue) =>
                (v.constructorParams as DataTypeConstructorParams)[key].value2
        }
    ];
}

// ---------------------------------------------------------------------------
// Data object variable type
// ---------------------------------------------------------------------------

function createDataType(eezFlowEditor: IEezFlowEditor): IObjectVariableType {
    const { showGenericDialog, validators } = eezFlowEditor;

    return {
        // ------------------------------------------------------------------
        // Field descriptions (used by the debugger / variable inspector)
        // ------------------------------------------------------------------
        valueFieldDescriptions: [
            {
                name: "name",
                valueType: "string",
                getFieldValue: (v: IObjectVariableValue) =>
                    (v.constructorParams as DataTypeConstructorParams).name
            },
            {
                name: "oldName",
                valueType: "string",
                getFieldValue: (v: IObjectVariableValue) =>
                    (v.constructorParams as DataTypeConstructorParams).oldName
            },
            {
                name: "createdOn",
                valueType: "integer",
                getFieldValue: (v: IObjectVariableValue) =>
                    (v.constructorParams as DataTypeConstructorParams).createdOn
            },
            {
                name: "createdBy",
                valueType: "string",
                getFieldValue: (v: IObjectVariableValue) =>
                    (v.constructorParams as DataTypeConstructorParams).createdBy
            },
            {
                name: "modifiedOn",
                valueType: "integer",
                getFieldValue: (v: IObjectVariableValue) =>
                    (v.constructorParams as DataTypeConstructorParams).modifiedOn
            },
            {
                name: "modifiedBy",
                valueType: "string",
                getFieldValue: (v: IObjectVariableValue) =>
                    (v.constructorParams as DataTypeConstructorParams).modifiedBy
            },
            ...CHANNEL_KEYS.map(
                (key): IObjectVariableValueFieldDescription => ({
                    name: key,
                    valueType: channelFields(key),
                    getFieldValue: (v: IObjectVariableValue) =>
                        (v.constructorParams as DataTypeConstructorParams)[key]
                })
            )
        ],

        // ------------------------------------------------------------------
        // Lifecycle
        // ------------------------------------------------------------------

        createValue(
            params: IObjectVariableValueConstructorParams,
            _isRuntime: boolean
        ): IObjectVariableValue {
            const p = mergeParams(
                DATA_DEFAULTS,
                params as Partial<DataTypeConstructorParams>
            );
            return {
                constructorParams: p,
                status: {
                    label: p.name || "(unnamed)",
                    color: p.name ? "#44cc44" : "#888888"
                }
            };
        },

        destroyValue(_value: IObjectVariableValue): void { },

        getValue(variableValue: any): IObjectVariableValue | null {
            return variableValue ?? null;
        },

        // ------------------------------------------------------------------
        // Configuration dialog
        // ------------------------------------------------------------------

        async editConstructorParams(
            _variable: IVariable,
            params?: IObjectVariableValueConstructorParams
        ): Promise<IObjectVariableValueConstructorParams | undefined> {
            const isNew = !params;
            const current = mergeParams(
                DATA_DEFAULTS,
                (params ?? {}) as Partial<DataTypeConstructorParams>
            );

            // Flatten channel params into dialog field names
            const channelValues: Record<string, number> = {};
            for (const key of CHANNEL_KEYS) {
                const n = key.slice(-1); // "1" … "5"
                channelValues[`c${n}_active`] = current[key].active;
                channelValues[`c${n}_value1`] = current[key].value1;
                channelValues[`c${n}_value2`] = current[key].value2;
            }

            try {
                const result = await showGenericDialog({
                    dialogDefinition: {
                        title: isNew ? "New Data" : `Edit Data: ${current.name}`,
                        size: "medium",
                        fields: [
                            {
                                name: "name",
                                displayName: "Data name",
                                type: "string",
                                validators: [validators.required]
                            },
                            // One section per channel
                            ...CHANNEL_KEYS.flatMap(key => {
                                const n = key.slice(-1);
                                const label = `Channel ${n}`;
                                return [
                                    {
                                        name: `c${n}_active`,
                                        displayName: `${label} – Active`,
                                        type: "integer" as const,
                                        validators: [
                                            validators.rangeInclusive(0)
                                        ]
                                    },
                                    {
                                        name: `c${n}_value1`,
                                        displayName: `${label} – Value 1`,
                                        type: "number" as const,
                                        validators: [
                                            validators.rangeInclusive(0)
                                        ]
                                    },
                                    {
                                        name: `c${n}_value2`,
                                        displayName: `${label} – Value 2`,
                                        type: "number" as const
                                    }
                                ];
                            })
                        ]
                    },
                    values: {
                        name: current.name,
                        ...channelValues
                    }
                });

                const now = Date.now();

                // Reconstruct nested channel objects from flat dialog result
                const newChannels: Partial<DataTypeConstructorParams> = {};
                for (const key of CHANNEL_KEYS) {
                    const n = key.slice(-1);
                    newChannels[key] = {
                        active: result.values[`c${n}_active`] as number,
                        value1: result.values[`c${n}_value1`] as number,
                        value2: result.values[`c${n}_value2`] as number
                    };
                }

                return {
                    ...current,
                    ...newChannels,
                    name: result.values.name as string,
                    oldName: isNew ? "" : current.name,
                    createdOn: isNew ? now : current.createdOn,
                    modifiedOn: now
                };
            } catch {
                // user cancelled
                return undefined;
            }
        }
    };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerObjectVariableTypes(
    eezFlowEditor: IEezFlowEditor
): void {
    eezFlowEditor.registerObjectVariableType(
        "Data",
        createDataType(eezFlowEditor)
    );
}
