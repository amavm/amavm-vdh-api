import {
  GetObservationsRequest, GetObservationsRequestSort, ObservationRequest, ReportedObservation,
} from "@entities/observations";
import { MongoClient, MongoClientOptions, ObjectID } from "mongodb";
import {
  CheckHealth, checkHealth, ContinuationArray, decodeNextToken,
  encodeNextToken, HealthCheckResult, lazyAsync, validationError,
} from "uno-serverless";
import { AssetsService } from "./assets.service";

export interface ObservationsService {
  find(request: GetObservationsRequest): Promise<ContinuationArray<ReportedObservation>>;
  /** Reports an observation. */
  report(request: ObservationRequest): Promise<ReportedObservation>;
}

export interface MongoDbBicyclePathsServiceOptions {
  url: string | Promise<string>;
  db: string | Promise<string>;
  mongoOptions?: MongoClientOptions | Promise<MongoClientOptions | undefined>;
}

export const OBSERVATIONS_COLLECTION = "observations";
const DEFAULT_LIMIT = 200;

export class MongoDbObservationsService implements ObservationsService, CheckHealth {

  private readonly lazyClient = lazyAsync(
    async () => {
      const client = new MongoClient(
        await this.options.url,
        await this.options.mongoOptions);

      await client.connect();
      return client;
    });

  private readonly lazyDb = lazyAsync(async () => (await this.lazyClient()).db(await this.options.db));

  public constructor(
    private readonly options: MongoDbBicyclePathsServiceOptions,
    private readonly assetsService: AssetsService) { }

  public async checkHealth(): Promise<HealthCheckResult> {
    return checkHealth(
      "MongoDbObservationsService",
      undefined,
      async () => {
        const db = await this.lazyDb();
        return new Promise((resolve, reject) => {
          db.collection(OBSERVATIONS_COLLECTION).createIndex(
            { timestamp: 1 },
            (err, _) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      });
  }

  public async find(request: GetObservationsRequest): Promise<ContinuationArray<ReportedObservation>> {
    const db = await this.lazyDb();
    const nextToken = decodeNextToken<NextToken>(request.nextToken);
    let pagination: Pagination;
    if (!nextToken) {
      pagination = { skip: 0, limit: DEFAULT_LIMIT };
    } else {
      pagination = nextToken.pagination;
      request = nextToken.request;
    }

    let query: any = {};

    if (request.endTs) {
      query = {
        ...query,
        timestamp: { $lte: request.endTs },
      };
    }

    if (request.startTs) {
      query = {
        ...query,
        timestamp: { $gte: request.startTs },
      };
    }

    if (request.endTs) {
      query = {
        ...query,
        timestamp: { $lte: request.endTs },
      };
    }

    if (request.startTs && request.endTs) {
      query = {
        ...query,
        timestamp: { $gte: request.startTs, $lte: request.endTs },
      };
    }

    let sortKey: string;
    let sortDirection: number;

    switch (request.sort) {
      case GetObservationsRequestSort.TimestampAsc:
        sortKey = "timestamp";
        sortDirection = -1;
        break;
      case GetObservationsRequestSort.TimestampDesc:
      default:
        sortKey = "timestamp";
        sortDirection = 1;
        break;
    }

    const result = await db.collection(OBSERVATIONS_COLLECTION).find(query)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sortKey, sortDirection)
      .toArray();

    pagination.skip += pagination.limit;
    request.nextToken = undefined;
    const nextNextToken = result.length < pagination.limit
      ? undefined
      : encodeNextToken({
        pagination,
        request,
      });
    return {
      items: result.map((x) => this.mapObservation(x)),
      nextToken: nextNextToken,
    };
  }

  public async report(request: ObservationRequest): Promise<ReportedObservation> {
    const db = await this.lazyDb();
    const now = Math.trunc(new Date().getTime() / 1000);
    if (request.timestamp > now) {
      throw validationError([{
        code: "invalid",
        data: {
          currentServerTimestamp: now,
        },
        message: "Timestamp cannot be in the future",
        target: "timestamp",
      }]);
    }

    const reportedObs: ReportedObservation = {
      attributes: request.attributes,
      comment: request.comment,
      deviceId: request.deviceId,
      id: new ObjectID().toHexString(),
      position: request.position,
      timestamp: request.timestamp,
    };

    if (request.assets && request.assets.length > 0) {
      reportedObs.assets = [];
      for (const asset of request.assets) {
        reportedObs.assets.push(await this.assetsService.upload(asset));
      }
    }

    await db.collection(OBSERVATIONS_COLLECTION).insertOne(reportedObs);
    return this.mapObservation(reportedObs);
  }

  private mapObservation(from: any): ReportedObservation {
    const { _id, ...result } = from;

    return result;
  }
}

interface Pagination {
  skip: number;
  limit: number;
}

interface NextToken {
  request: GetObservationsRequest;
  pagination: Pagination;
}
