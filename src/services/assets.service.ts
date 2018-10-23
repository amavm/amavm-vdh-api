import { ObservationRequestAsset, ReportedObservationAsset } from "@entities/observations";
import { S3 } from "aws-sdk";
import { extension } from "mime-types";
import { CheckHealth, checkHealth } from "uno-serverless";
import { URL } from "url";
import { v4 as uuid } from "uuid";

export interface AssetsService {
  upload(asset: ObservationRequestAsset): Promise<ReportedObservationAsset>;
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
}

export class DummyLocalAssetsService implements AssetsService, CheckHealth {

  public async checkHealth() {
    return checkHealth(
      "DummyLocalAssetsService",
      undefined,
      async () => { return; });
  }

  public async upload(asset: ObservationRequestAsset): Promise<ReportedObservationAsset> {
    const key = `${uuid()}.${extension(asset.contentType)}`;
    return {
      contentType: asset.contentType,
      url: new URL(key, "https://example.org").toString(),
    };
  }

}
