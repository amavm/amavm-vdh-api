import {
  GetObservationsRequest, GetObservationsRequestSort, ObservationRequest,
  ObservationStatus, ReportedObservation, UpdateObservationStatusRequest,
} from "@entities/observations";
import { MongoClient, MongoClientOptions, ObjectID } from "mongodb";
import {
  CheckHealth, checkHealth, ContinuationArray, decodeNextToken,
  encodeNextToken, HealthCheckResult, lazyAsync, notFoundError, validationError,
} from "uno-serverless";
import { AssetsService } from "./assets.service";

export interface ObservationsService {
  delete(observationId: string): Promise<void>;
  find(request: GetObservationsRequest): Promise<ContinuationArray<ReportedObservation>>;
  get(observationId: string): Promise<ReportedObservation | undefined>;
  /** Reports an observation. */
  report(request: ObservationRequest): Promise<ReportedObservation>;
  updateStatus(observationId: string, request: UpdateObservationStatusRequest): Promise<ReportedObservation>;
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
        await db.collection(OBSERVATIONS_COLLECTION).createIndex({ timestamp: 1 });
        await db.collection(OBSERVATIONS_COLLECTION).createIndex({ attributes: 1 });
        await db.collection(OBSERVATIONS_COLLECTION).createIndex({ status: 1 });
      });
  }

  public async delete(observationId: string): Promise<void> {
    const db = await this.lazyDb();
    const result = await db.collection(OBSERVATIONS_COLLECTION).findOneAndDelete({ id: observationId });
    if (!result.ok) {
      throw notFoundError("observationId", `Observation ${observationId} not found.`);
    }

    for (const asset of (result.value.assets || [])) {
      if (asset && asset.url) {
        this.assetsService.delete(asset.url);
      }
    }
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

    if (request.attributes && request.attributes.length > 0) {
      query = {
        ...query,
        attributes: { $in: request.attributes },
      };
    }

    if (request.status && request.status.length > 0) {
      query = {
        ...query,
        status: { $in: request.status },
      };
    }

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

  public async get(observationId: string): Promise<ReportedObservation | undefined> {
    const db = await this.lazyDb();
    const result = await db.collection(OBSERVATIONS_COLLECTION).findOne({ id: observationId });
    if (!result) {
      return undefined;
    }

    return this.mapObservation(result);
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
      status: ObservationStatus.pending,
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

  public async updateStatus(observationId: string, request: UpdateObservationStatusRequest)
    : Promise<ReportedObservation> {
    const db = await this.lazyDb();
    await db.collection(OBSERVATIONS_COLLECTION).updateOne(
      { id: observationId },
      { $set: { status: request.status } },
    );

    return (await this.get(observationId))!;
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
