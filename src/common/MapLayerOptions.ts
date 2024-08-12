/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { MapLayerOptions, TileAdmin } from "@itwin/core-frontend";

// Sandbox provides map key values at runtime, however it's required to create your own account at map providers and
// get appropriate access tokens for your own projects (or exported Sandbox)

// export const mapLayerOptions: MapLayerOptions = {
//   // MapboxImagery: {
//   //   key: "access_token", 
//   //   value: process.env.IMJS_MAP_BOX_KEY || "sk.eyJ1IjoiaW5mb2plbWk0IiwiYSI6ImNsenJkd201eDFreXIyaXF1cTAydTZ5N20ifQ.e5ZpPxg8zXLzQipGXGe_OQ",
//   // },
//   AzureMaps: {
//     key: "subscription-key",
//     value: process.env.IMJS_AZURE_MAPS_KEY || "FQSO2yWI0H5fhWBWSimCOOhE1FvSemqCKP4iQxwmx7VDu83Zorq0JQQJ99AHACYeBjFKnCgxAAAgAZMPkUnO", 
//   },
// };

export const mapLayerOptions: MapLayerOptions = {
  AzureMaps: {
    key: "subscription-key",  // 这里应填 "subscription-key"
    value: process.env.IMJS_AZURE_MAPS_KEY || "FQSO2yWI0H5fhWBVSimCOOhE1FVSmqCPK4iXwmxx7VDu83ZorQJQQJ99AHACYeBJfKnCgxAAAgAZMKPUnO",
  },
};


// Access token for Cesium service. For more information: https://cesium.com/learn/ion/cesium-ion-access-tokens
export const tileAdminOptions: TileAdmin.Props = {
  cesiumIonKey: process.env.IMJS_CESIUM_ION_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OWQxMTcxMC0xNzBmLTRiMzMtODkwZS03Y2U2NWE4ZjBhMjUiLCJpZCI6MjMzOTgyLCJpYXQiOjE3MjMzMjcwNjF9.OnB_zxJP7Fi4HJJ0WKGDcmIaM55VPkaJW1LsJJHjWfY",
};
