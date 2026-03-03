import type { IEezFlowEditor } from "./eez-types";

import { ACTIONS } from "./actions";

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------
const sampleExtension = {
    preInstalled: false,
    extensionType: "pext",

    eezFlowExtensionInit: (eezFlowEditor: IEezFlowEditor) => {
        const { registerActionComponent, registerEnumVariableType, registerStructureVariableType } = eezFlowEditor;

        for (const def of ACTIONS) {

            registerActionComponent(def);
        }

        registerStructureVariableType({
            name: "channel_config",
            fields: [
                { name: "active", type: "boolean" },
                { name: "value1", type: "float" },
                { name: "value2", type: "float" }
            ]
        });

        registerStructureVariableType({
            name: "device_data",
            fields: [
                { name: "name", type: "string" },
                { name: "oldName", type: "string" },
                { name: "createdOn", type: "integer" },
                { name: "createdBy", type: "string" },
                { name: "modifiedOn", type: "integer" },
                { name: "modifiedBy", type: "string" },
                { name: "channel1", type: "struct:eez-ext-sample/channel_config" },
                { name: "channel2", type: "struct:eez-ext-sample/channel_config" },
                { name: "channel3", type: "struct:eez-ext-sample/channel_config" },
                { name: "channel4", type: "struct:eez-ext-sample/channel_config" },
                { name: "channel5", type: "struct:eez-ext-sample/channel_config" }
            ]
        });

        registerEnumVariableType({
            name: "ChannelStatus",
            members: [
                { name: "CHANNEL_ERROR", value: -1 },
                { name: "CHANNEL_IDLE", value: 0 },
                { name: "CHANNEL_ACTIVE", value: 1 },
                { name: "CHANNEL_DONE", value: 2 },

            ]
        });
    }
};

export default sampleExtension;
