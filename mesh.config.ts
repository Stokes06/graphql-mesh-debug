import {
  createHoistFieldTransform,
  createPrefixTransform,
  createRenameTypeTransform,
  defineConfig as defineComposeConfig,
} from '@graphql-mesh/compose-cli';
import { defineConfig as defineGatewayConfig } from '@graphql-mesh/serve-cli';
import { loadOpenAPISubgraph } from '@omnigraph/openapi';
import msAgencySubgraphConfig from './ms-agency.subgraph.config';

export const composeConfig = defineComposeConfig({
  
  subgraphs: [
   /* {
      sourceHandler: loadOpenAPISubgraph('Cities', {
        source: 'https://api.apis.guru/v2/specs/mashape.com/geodb/1.0.0/swagger.json',
        ignoreErrorResponses: true,
        operationHeaders: {
          'X-RapidAPI-Key': '{env.GEODB_API_KEY}',
        },
      }),
      transforms: [
        createRenameTypeTransform(({ typeName }) =>
          typeName === 'Error' ? 'CitiesError' : typeName,
        ),
      ],
    },*/
    {
      sourceHandler: loadOpenAPISubgraph('Weather', {
        source: 'https://api.apis.guru/v2/specs/weatherbit.io/2.0.0/swagger.json',
        ignoreErrorResponses: true,
        queryParams: {
          key: `${process.env.WEATHERBIT_API_KEY}`,
        },
        operationHeaders: {
          'X-RapidAPI-Key': `${process.env.WEATHERBIT_API_KEY}`,
        },
      }),
      transforms: [
        createRenameTypeTransform(({ typeName }) =>
          typeName === 'Error' ? 'WeatherError' : typeName,
        ),
        createPrefixTransform({
            value: "MyTestWeather_",
            includeRootOperations: false, // also prefix Query.* (root functions)
        }),
        createHoistFieldTransform({
          // TODO investigate to solve the error when using hoist field, probably a dependency problem
          mapping: [
              {
                  typeName: "MyTestWeather_CurrentObs",
                  pathConfig: ["weather", "description"],
                  newFieldName: "MyDescription",
              },
          ],
      }),
      ],
    },
    //msAgencySubgraphConfig
  ],
});

export const gatewayConfig = defineGatewayConfig({
  responseCaching: {
    ttlPerCoordinate: [
      // Geo data doesn't change frequently, so we can cache it forever
      { coordinate: 'Query.findCitiesUsingGET', ttl: 0 },
      // Forcast data might change, so we can cache it for 1 hour only
      { coordinate: 'PopulatedPlaceSummary.dailyForecast', ttl: 3600 },
      { coordinate: 'PopulatedPlaceSummary.todayForecast', ttl: 3600 },
    ],
  },
});
