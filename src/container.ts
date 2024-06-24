import { Config } from "@config";
import {
  AssetsService,
  DummyLocalAssetsService,
  S3AssetsService
} from "@services/assets.service";
import { AuthService, FirebaseAuthService } from "@services/auth.service";
import {
  BicyclePathsService,
  MongoDbBicyclePathsService
} from "@services/bicycle-paths.service";
import {
  GeoSourceService,
  MTLOpenDataGeoSourceService
} from "@services/geo-source.service";
import {
  MongoDbObservationsService,
  ObservationsService
} from "@services/observations.service";
import { DefaultSyncService, SyncService } from "@services/sync.service";
import * as firebaseAdmin from "firebase-admin";
import * as uno from "uno-serverless";
import { httpClientFactory, memoize } from "uno-serverless";
import * as unoAws from "uno-serverless-aws";
import { VError } from "verror";

export enum ExecutionMode {
  LocalDev = "localdev",
  RestOfTheWorld = "restoftheworld"
}

/** The specification for the container. */
export interface Container {
  assetsService(): AssetsService;
  bicyclePathsService(): BicyclePathsService;
  configService(): uno.ConfigService;
  environmentName(): string;
  executionMode(): ExecutionMode;
  geoSourceService(): GeoSourceService;
  observationsService(): ObservationsService;
  syncService(): SyncService;
  firebaseApp(): Promise<firebaseAdmin.app.App>;
  authService(): AuthService;
}

/** Options for container creation. */
export interface ContainerOptions {
  mode: ExecutionMode;
  stage: string;
}

/** Definition of factories for the container. */
export const createContainer = uno.createContainerFactory<
  Container,
  ContainerOptions
>({
  assetsService: ({ container, options }) =>
    options.mode === ExecutionMode.LocalDev
      ? new DummyLocalAssetsService()
      : new S3AssetsService({
          bucket: container.configService().get(Config.AssetsBucket),
          websiteRoot: container.configService().get(Config.AssetsRoot)
        }),

  authService: ({ container }) => new FirebaseAuthService(container.firebaseApp()),

  bicyclePathsService: ({ container }) =>
    new MongoDbBicyclePathsService({
      db: container.configService().get(Config.MongoDbDb),
      url: container.configService().get(Config.MongoDbUrl)
    }),

  configService: ({ options }) =>
    options.mode === ExecutionMode.LocalDev
      ? new uno.JSONFileConfigService({
          debug: true,
          path: "./local.config.json"
        })
      : new unoAws.SSMParameterStoreConfigService({
          path: `/amavm/vdh-api/${options.stage}`
        }),

  environmentName: ({ options }) => options.stage,

  executionMode: ({ options }) => options.mode,

  geoSourceService: ({ container }) =>
    new MTLOpenDataGeoSourceService(
      {
        bicyclePathsSourceUrl: container
          .configService()
          .get(Config.MTLOpenDataBicyclePathUrl)
      },
      httpClientFactory()
    ),

  observationsService: ({ container }) =>
    new MongoDbObservationsService(
      {
        db: container.configService().get(Config.MongoDbDb),
        url: container.configService().get(Config.MongoDbUrl)
      },
      container.assetsService()
    ),

  syncService: ({ container }) =>
    new DefaultSyncService(
      container.assetsService(),
      container.geoSourceService(),
      container.bicyclePathsService()
    ),

  firebaseApp: async ({ container }) => {
    let firebaseConfig: firebaseAdmin.AppOptions | undefined;
    try {
      firebaseConfig = JSON.parse(await container.configService().get(Config.FirebaseConfig));
    } catch (err) {
      throw new VError({ name: "InvalidFirebaseConfig", cause: err }, "Unable to parse Firebase config");
    }
    if (typeof firebaseConfig !== "object") {
      throw new VError({ name: "InvalidFirebaseConfig", info: firebaseConfig }, "Invalid Firebase config");
    }
    return firebaseAdmin.initializeApp(firebaseConfig);
  }
});
