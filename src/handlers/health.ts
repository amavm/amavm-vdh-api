import { httpFunc, SERVICE_NAME } from "@common";
import { Container } from "@container";
import { health } from "uno-serverless";

export const handler = httpFunc()
  .handler(health<Container>(
    SERVICE_NAME,
    async ({ services }) => [
      services.bicyclePathsService() as any,
      services.configService() as any,
      services.observationsService() as any,
    ],
  ));
