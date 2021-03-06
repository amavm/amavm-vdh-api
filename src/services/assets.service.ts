import { GeoJSONBicyclePathProperties } from "@entities/bicycle-paths";
import { ObservationRequestAsset, ReportedObservationAsset } from "@entities/observations";
import { S3 } from "aws-sdk";
import { FeatureCollection, MultiLineString } from "geojson";
import { extension } from "mime-types";
import { CheckHealth, checkHealth, HttpStatusCodes } from "uno-serverless";
import { URL } from "url";
import { v4 as uuid } from "uuid";

export interface AssetsService {
  delete(url: string): Promise<void>;
  upload(asset: ObservationRequestAsset): Promise<ReportedObservationAsset>;
  uploadBicyclePaths(data: FeatureCollection<MultiLineString, GeoJSONBicyclePathProperties>): Promise<void>;
}

export interface S3AssetsServiceOptions {
  /** S3 bucket name. */
  bucket: string | Promise<string>;

  /** The website root for urls. */
  websiteRoot: string | Promise<string>;
}

const SERVER_SIDE_ENCRYPTION = "AES256";

export class S3AssetsService implements AssetsService, CheckHealth {

  private readonly s3 = new S3();

  public constructor(private readonly options: S3AssetsServiceOptions) {}

  public async checkHealth() {
    return checkHealth(
      "S3AssetsService",
      await this.options.bucket,
      async () => {
        const testKey = `health-${uuid()}`;
        await this.s3.putObject({
          Bucket: await this.options.bucket,
          Key: testKey,
          ServerSideEncryption: SERVER_SIDE_ENCRYPTION,
        }).promise();
        await this.s3.deleteObject({
          Bucket: await this.options.bucket,
          Key: testKey,
        }).promise();
      });
  }

  public async delete(url: string): Promise<void> {
    const websiteRoot = await this.options.websiteRoot;
    const key = url.slice(websiteRoot.length + 1);

    try {
      await this.s3.deleteObject({
        Bucket: await this.options.bucket,
        Key: key,
      }).promise();
    } catch (error) {
      if (error.statusCode === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      throw error;
    }
  }

  public async upload(asset: ObservationRequestAsset): Promise<ReportedObservationAsset> {
    const key = `${uuid()}.${extension(asset.contentType)}`;
    const response = await this.s3.upload({
      Body: Buffer.from(asset.data, "base64"),
      Bucket: await this.options.bucket,
      ContentType: asset.contentType,
      Key: key,
      ServerSideEncryption: SERVER_SIDE_ENCRYPTION,
    }).promise();

    return {
      contentType: asset.contentType,
      url: new URL(response.Key, await this.options.websiteRoot).toString(),
    };
  }

  public async uploadBicyclePaths(
    data: FeatureCollection<MultiLineString, GeoJSONBicyclePathProperties>): Promise<void> {
    await this.s3.upload({
      Body: JSON.stringify(data),
      Bucket: await this.options.bucket,
      ContentType: "application/json",
      Key: "bicycle-paths.json",
      ServerSideEncryption: SERVER_SIDE_ENCRYPTION,
    }).promise();
  }
}

export class DummyLocalAssetsService implements AssetsService, CheckHealth {

  public async checkHealth() {
    return checkHealth(
      "DummyLocalAssetsService",
      undefined,
      async () => { return; });
  }

  public async delete(url: string): Promise<void> {
    return;
  }

  public async upload(asset: ObservationRequestAsset): Promise<ReportedObservationAsset> {
    const key = `${uuid()}.${extension(asset.contentType)}`;
    return {
      contentType: asset.contentType,
      url: new URL(key, "https://example.org").toString(),
    };
  }

  public async uploadBicyclePaths(
    data: FeatureCollection<MultiLineString, GeoJSONBicyclePathProperties>): Promise<void> {
    console.log(data);
  }

}
