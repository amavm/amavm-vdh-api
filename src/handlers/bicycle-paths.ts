import { httpFunc } from "@common";
import { Container } from "@container";
import { BicyclePathsRequest } from "@entities/bicycle-paths";
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
  }));
