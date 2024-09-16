import * as process from "node:process";
import { defineConfig as defineGatewayConfig } from "@graphql-hive/gateway";
import useIncludeHttpDetailsInExtensions from "@graphql-mesh/plugin-http-details-extensions";
import useMSApiToken from "./useMSApiToken";

const activePlugins = [
    //useMSApiToken(),
    useIncludeHttpDetailsInExtensions({ if: process.env.NODE_ENV === "development" }),
];

export const gatewayConfig = defineGatewayConfig({
    graphiql: {
        title: "Mesh MS",
    },
    plugins: () => activePlugins,
});
