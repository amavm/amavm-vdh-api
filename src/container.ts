import { Config } from "@config";
import { BicyclePathsService, MongoDbBicyclePathsService } from "@services/bicycle-paths.service";
import { GeoSourceService, MTLOpenDataGeoSourceService } from "@services/geo-source.service";
import { MongoDbObservationsService, ObservationsService } from "@services/observations.service";
import { DefaultSyncService, SyncService } from "@services/sync.service";
import * as uno from "uno-serverless";
import { httpClientFactory } from "uno-serverless";
import * as unoAws from "uno-serverless-aws";

export enum ExecutionMode {
  LocalDev = "localdev",
  RestOfTheWorld = "restoftheworld",
}

/** The specification for the container. */
export interface Container {
  bicyclePathsService(): BicyclePathsService;
  configService(): uno.ConfigService;
  environmentName(): string;
  executionMode(): ExecutionMode;
  geoSourceService(): GeoSourceService;
  observationsService(): ObservationsService;
  syncService(): SyncService;
}

/** Options for container creation. */
export interface ContainerOptions {
  mode: ExecutionMode;
  stage: string;
}

/** Definition of factories for the container. */
export const createContainer = uno.createContainerFactory<Container, ContainerOptions>({
  bicyclePathsService: ({ container }) => new MongoDbBicyclePathsService({
    db: container.configService().get(Config.MongoDbDb),
    url: container.configService().get(Config.MongoDbUrl),
  }),

  configService: ({ options }) => options.mode === ExecutionMode.LocalDev
    ? new uno.JSONFileConfigService({ debug: true, path: "./local.config.json" })
    : new unoAws.SSMParameterStoreConfigService({
      path: `/amavm/vdh-api/${options.stage}`,
    }),

  environmentName: ({ options }) => options.stage,

  executionMode: ({ options }) => options.mode,

  geoSourceService: ({ container }) => new MTLOpenDataGeoSourceService(
    { bicyclePathsSourceUrl: container.configService().get(Config.MTLOpenDataBicyclePathUrl) },
    httpClientFactory()),

  observationsService: ({ container }) => new MongoDbObservationsService({
    db: container.configService().get(Config.MongoDbDb),
    url: container.configService().get(Config.MongoDbUrl),
  }),

  syncService: ({ container }) => new DefaultSyncService(
    container.geoSourceService(),
    container.bicyclePathsService()),
});
