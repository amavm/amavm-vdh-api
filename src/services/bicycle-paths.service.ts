import { BicyclePath, BicyclePathsRequest } from "@entities/bicycle-paths";
import { MongoClient, MongoClientOptions } from "mongodb";
import {
  CheckHealth, checkHealth, ContinuationArray, decodeNextToken,
  encodeNextToken, HealthCheckResult, lazyAsync, validationError,
} from "uno-serverless";

export interface BicyclePathsService {
  get(id: string): Promise<BicyclePath | undefined>;
  findAll(): Promise<BicyclePath[]>;
  find(request: BicyclePathsRequest): Promise<ContinuationArray<BicyclePath>>;
  set(bp: BicyclePath): Promise<BicyclePath>;
}

export interface MongoDbBicyclePathsServiceOptions {
  url: string | Promise<string>;
  db: string | Promise<string>;
  mongoOptions?: MongoClientOptions | Promise<MongoClientOptions | undefined>;
}

export const BICYCLE_PATH_COLLECTION = "bicycle-paths";
const DEFAULT_LIMIT = 200;

export class MongoDbBicyclePathsService implements BicyclePathsService, CheckHealth {

  private readonly lazyClient = lazyAsync(
    async () => {
      const client = new MongoClient(
        await this.options.url,
        await this.options.mongoOptions);

      await client.connect();
      return client;
    });

  private readonly lazyDb = lazyAsync(async () => (await this.lazyClient()).db(await this.options.db));

  public constructor(private readonly options: MongoDbBicyclePathsServiceOptions) {}

  public async checkHealth(): Promise<HealthCheckResult> {
    return checkHealth(
      "MongoDbBicyclePathsService",
      undefined,
      async () => {
        const db = await this.lazyDb();
        return new Promise((resolve, reject) => {
          db.collection(BICYCLE_PATH_COLLECTION).createIndex(
            { geometry : "2dsphere" },
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

  public async get(id: string): Promise<BicyclePath | undefined> {
    const db = await this.lazyDb();
    const response = await db.collection(BICYCLE_PATH_COLLECTION).findOne({ id });
    if (!response) {
      return undefined;
    }

    return this.mapBp(response);
  }

  public async find(request: BicyclePathsRequest): Promise<ContinuationArray<BicyclePath>> {
    const db = await this.lazyDb();
    let pagination = decodeNextToken<Pagination>(request.nextToken);
    if (!pagination) {
      pagination = { skip: 0, limit: DEFAULT_LIMIT };
    }

    let query: any = {};
    if (request.bbox) {
      if (request.bbox.length !== 8) {
        throw validationError([{
          code: "invalid",
          message: "Bounding box must have 8 numbers to specify the 4 corners",
          target: "bbox",
        }]);
      }
      const bbox = {
        geometry: {
          $geoWithin: {
            $geometry: {
              coordinates: [
                [
                  [ request.bbox[0], request.bbox[1] ],
                  [ request.bbox[2], request.bbox[3] ],
                  [ request.bbox[4], request.bbox[5] ],
                  [ request.bbox[6], request.bbox[7] ],
                ],
              ],
              type : "Polygon",
            },
          },
        },
      };
      query = {
        ...query,
        ...bbox,
      };
    }

    if (request.near) {
      if (request.near.length !== 2) {
        throw validationError([{
          code: "invalid",
          message: "Near must have 2 numbers to specify the coordinates",
          target: "near",
        }]);
      }
      const near = {
        geometry: {
          $near: {
            $geometry: {
              coordinates: [request.near[0], request.near[1]],
              type : "Point",
            },
            $maxDistance: 100,
          },
        },
      };
      query = {
        ...query,
        ...near,
      };
    }

    const result = await db.collection(BICYCLE_PATH_COLLECTION).find(query)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray();

    pagination.skip += pagination.limit;
    return {
      items: result.map((x) => this.mapBp(x)),
      nextToken: encodeNextToken(pagination),
    };
  }

  public async findAll(): Promise<BicyclePath[]> {
    const db = await this.lazyDb();
    return (await db.collection(BICYCLE_PATH_COLLECTION).find().toArray())
      .map((x) => this.mapBp(x));
  }

  public async set(bp: BicyclePath): Promise<BicyclePath> {
    const db = await this.lazyDb();
    await db.collection(BICYCLE_PATH_COLLECTION).updateOne({ id: bp.id }, { $set: bp }, { upsert: true });
    return bp;
  }

  private mapBp(from: any): BicyclePath {
    const { _id, ...result } = from;

    return result;
  }

}

interface Pagination {
  skip: number;
  limit: number;
}
