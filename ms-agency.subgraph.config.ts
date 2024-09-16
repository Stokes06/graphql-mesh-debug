import {
    createHoistFieldTransform,
    createPrefixTransform,
    createRenameTransform,
} from "@graphql-mesh/compose-cli";

import { loadOpenAPISubgraph } from "@omnigraph/openapi";

const msAgencySubgraphConfig = {
    sourceHandler: loadOpenAPISubgraph("ms-agency", {
        source: "ms-agency-tma-int.json",
        endpoint: "{env.HANDLER_MS_ENDPOINT_BASE_URL}",
        jsonApi: true,
    }),
    // the transforms are executed in order
    transforms: [
        createPrefixTransform({
            value: "MS_Agency_",
            includeRootOperations: false, // also prefix Query.* (root functions)
        }),
        createHoistFieldTransform({
            // TODO investigate to solve the error when using hoist field, probably a dependency problem
            mapping: [
                {
                    typeName: "MS_Agency_AgencyResponse",
                    pathConfig: ["location", "latitude"],
                    newFieldName: "Mylatitude",
                }/*,
                {
                    typeName: "MS_Agency_AgencyResponse",
                    pathConfig: ["location", "longitude"],
                    newFieldName: "Mylongitude",
                },*/
            ],
        }),
      /*  createRenameTransform({
            typeRenamer: ({ typeName }) => {
                switch (typeName) {
                    case "MS_Agency_AgencyResponse":
                        return "PointOfSale";
                    default:
                        return typeName;
                }
            },
        }),*/
    ],
};

export default msAgencySubgraphConfig;
