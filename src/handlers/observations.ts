import { httpFunc } from "@common";
import { Container } from "@container";
import { ObservationRequest } from "@entities/observations";
import { observationRequestSchema } from "@entities/schemas";
import { httpRouter } from "uno-serverless";

export const handler = httpFunc()
  .handler(httpRouter<Container>({
    "": {
      post: async ({ event, services: { observationsService } }) => {
        const request = event.body<ObservationRequest>({ validate: observationRequestSchema });

        return observationsService().report(request);
      },
    },
  }));
