import { httpFunc } from "@common";
import { Container } from "@container";
import { http, ok } from "uno-serverless";

export const handler = httpFunc()
  .handler(http<Container>(async ({ services: { syncService }}) => {
    await syncService().sync();

    return ok();
  }));
