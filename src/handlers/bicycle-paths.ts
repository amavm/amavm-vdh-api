import { httpFunc } from "@common";
import { Container } from "@container";
import { BicyclePathsRequest } from "@entities/bicycle-paths";
import { BicyclePathObservationTypes, BicyclePathSnowRemovalObservationRequest } from "@entities/observations";
import { bicyclePathSnowRemovalObservationRequestSchema } from "@entities/schemas";
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
          near: event.parameters.near
            ? event.parameters.near.split(",")
              .map((x) => x.trim())
              .map((x) => parseFloat(x))
            : undefined,
          nextToken: event.parameters.nextToken,
        };
        return bicyclePathsService().find(request);
      },
    },
    ":bicyclePathId/observations/snow-removal": {
      post: async ({ event, services: { bicyclePathsService } }) => {
        const request = event.body<BicyclePathSnowRemovalObservationRequest>(
          { validate: bicyclePathSnowRemovalObservationRequestSchema });

        return bicyclePathsService().addSnowRemovalObservation({
          ...request,
          bicyclePathId: event.parameters.bicyclePathId,
          type: BicyclePathObservationTypes.SnowRemoval,
          userId: "system",
        });
      },
    },
  }));
