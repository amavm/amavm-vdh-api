import { httpFunc } from "@common";
import { Container } from "@container";
import { GetObservationsRequest, GetObservationsRequestSort, ObservationRequest } from "@entities/observations";
import { observationRequestSchema } from "@entities/schemas";
import { created, httpRouter, noContent } from "uno-serverless";

export const handler = httpFunc()
  .handler(httpRouter<Container>({
    "": {
      get: async ({ event, services: { observationsService } }) => {
        const request: GetObservationsRequest = {
          attributes: event.parameters.attributes ? event.parameters.attributes.split(",") : undefined,
          endTs: event.parameters.endTs ? parseInt(event.parameters.endTs, 10) : undefined,
          nextToken: event.parameters.nextToken,
          sort: event.parameters.sort
            ? event.parameters.sort as GetObservationsRequestSort
            : GetObservationsRequestSort.TimestampDesc,
          startTs: event.parameters.startTs ? parseInt(event.parameters.startTs, 10) : undefined,
        };

        return observationsService().find(request);
      },
      post: async ({ event, services: { observationsService } }) => {
        const request = event.body<ObservationRequest>({ validate: observationRequestSchema });

        const observation = await observationsService().report(request);
        return created(`/api/v1/observations/${observation.id}`, observation);
      },
    },
    ":observationId": {
      delete: async ({ event, services: { observationsService } }) => {
        await observationsService().delete(event.parameters.observationId);

        return noContent();
      },
      get: async ({ event, services: { observationsService } }) => {
        return observationsService().get(event.parameters.observationId);
      },
    },
  }));
