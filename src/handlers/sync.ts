import { func } from "@common";
import { Container } from "@container";
import { UnoEvent } from "uno-serverless";

export const handler = func()
  .handler<UnoEvent, Container>(
    async ({ services: { syncService } }) => {
      await syncService().sync();
    });
