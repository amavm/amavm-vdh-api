import { httpFunc } from "@common";
import { Container } from "@container";
import { BicyclePathNetwork, BicyclePathsRequest, BicyclePathType } from "@entities/bicycle-paths";
import { httpRouter } from "uno-serverless";

export const handler = httpFunc()
  .handler(httpRouter<Container>({
    "": {
      get: async ({ event, services: { bicyclePathsService } }) => {
        const request: BicyclePathsRequest = {
          bbox: event.parameters.bbox
            ? event.parameters.bbox.split(",")
                .map((x) => x.trim())
                .map((x) => parseFloat(x))
            : undefined,
          borough: event.parameters.borough,
          near: event.parameters.near
            ? event.parameters.near.split(",")
              .map((x) => x.trim())
              .map((x) => parseFloat(x))
            : undefined,
          network: event.parameters.network as BicyclePathNetwork,
          nextToken: event.parameters.nextToken,
          numberOfLanes: event.parameters.numberOfLanes ? parseInt(event.parameters.numberOfLanes, 10) : undefined,
          type: event.parameters.type as BicyclePathType,
        };
        return bicyclePathsService().find(request);
      },
    },
  }));
