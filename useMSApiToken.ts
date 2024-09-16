import type { Logger, MeshPlugin } from "@graphql-mesh/types";
import axios from "axios";
import { TokenCache } from "./tokenCache";

async function fetchToken(logger: Logger): Promise<string> {
    logger.debug("No MS API authorization token in cache : going to fetch one");
    if (
        !(
            process.env.MS_API_TOKEN_URL &&
            process.env.MS_API_TOKEN_CLIENT_ID &&
            process.env.MS_API_TOKEN_CLIENT_SECRET &&
            process.env.MS_API_TOKEN_SCOPE
        )
    ) {
        throw new Error("MS API configuration missing");
    }

    try {
        const response = await axios.post(
            process.env.MS_API_TOKEN_URL,
            {
                client_id: process.env.MS_API_TOKEN_CLIENT_ID,
                client_secret: process.env.MS_API_TOKEN_CLIENT_SECRET,
                scope: process.env.MS_API_TOKEN_SCOPE,
                grant_type: "client_credentials",
            },
            {
                headers: { "content-type": "application/x-www-form-urlencoded" },
            },
        );
        return await TokenCache.setToken(response.data.access_token, response.data.expires_in - 20);
    } catch (error) {
        console.error("An error occurred while fetching a new token for MS API", error);
        throw new Error("Failed to fetch the MS token");
    }
}

export default function useMSApiToken(): MeshPlugin<{
    tokenPromise: Promise<string | undefined>;
    params: { operationName: string };
    logger: Logger;
}> {
    return {
        /**
         * Extends the context with the field 'tokenPromise' that resolves to the MS API authorization token
         *
         * @param options
         */
        onContextBuilding(options) {
            const isQueryOnMSHandler = (operationName: string): boolean => operationName !== "IntrospectionQuery";

            if (isQueryOnMSHandler(options.context.params.operationName)) {
                const { logger } = options.context;

                options.extendContext({
                    tokenPromise: (async () => {
                        const token = await TokenCache.getToken();
                        if (token) {
                            logger.debug("MS API authorization token retrieved from cache");
                            return token;
                        }

                        return fetchToken(logger);
                    })(),
                });
            }
        },
        /**
         * Set the authorization token on the request's headers when the context field 'tokenPromise' is resolved not undefined.
         * If the promise is resolved undefined, that means the request does not need authorization.
         *
         * @param payload
         */
        async onFetch(payload) {
            if ("tokenPromise" in payload.context) {
                const token = await payload.context.tokenPromise;

                if (token) {
                    payload.options.headers = {
                        ...payload.options.headers,
                        Authorization: `Bearer ${token}`,
                    };
                    console.debug(payload);
                }
            }
        },
    };
}
