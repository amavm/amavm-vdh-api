import { BicyclePath, BicyclePathDivider, BicyclePathStatus } from "@entities/bicycle-paths";
import { bicyclePathSchema } from "@entities/schemas";
import { FeatureCollection, MultiLineString, Position } from "geojson";
import { HttpClient, validateAndThrow } from "uno-serverless";
import utmConverter = require("utm-latlng");
import windows1252 = require("windows-1252");

/** The GeoSourceService is responsible for getting source geographical information. */
export interface GeoSourceService {
  /** Returns the list of bicycle paths from source data. */
  getBicyclePaths(): Promise<BicyclePath[]>;
}

export interface MTLOpenDataGeoSourceServiceOptions {
  bicyclePathsSourceUrl: string | Promise<string>;
}

export class MTLOpenDataGeoSourceService implements GeoSourceService {

  private readonly utm = new utmConverter();

  public constructor(
    private readonly options: MTLOpenDataGeoSourceServiceOptions,
    private readonly httpClient: HttpClient) { }

  public async getBicyclePaths(): Promise<BicyclePath[]> {
    const response = await this.httpClient.get<MTLOpenDataBicyclePath>(
      await this.options.bicyclePathsSourceUrl,
      {
        // Data is windows 1252-encoded. Thx MTL.
        responseType: "arraybuffer",
        transformResponse: (res) => {
          const rawStr = new Uint8Array(res).reduce((acc, cur) => acc + String.fromCharCode(cur), "");
          return JSON.parse(windows1252.decode(rawStr));
        },
      });

    const result = response.data.features
      .filter((x) => x.properties.Ville_MTL === "OUI")
      .map<BicyclePath>((x) => ({
        borough: x.properties.NOM_ARR_VI,
        divider: x.properties.SEPARATEUR
          ? (Object.values(BicyclePathDivider).includes(x.properties.SEPARATEUR)
            ? x.properties.SEPARATEUR as BicyclePathDivider
            : undefined)
          : undefined,
        geometry: {
          coordinates: this.convertCoordinates(x.geometry.coordinates),
          type: x.geometry.type,
        },
        id: Math.trunc(x.properties.ID).toString(),
        length: Math.trunc(x.properties.LONGUEUR),
        numberOfLanes: Math.trunc(x.properties.NBR_VOIE),
        status: BicyclePathStatus.Unknown,
        type: Math.trunc(x.properties.TYPE_VOIE),
      }));

    validateAndThrow(
      {
        items: bicyclePathSchema,
        type: "array",
      }, result);

    return result;
  }

  private convertCoordinates(position: Position[][]): Position[][] {
    return position.map(
      (x) => x.map(
        (y) => {
          const latlng = this.utm.convertUtmToLatLng(y[0], y[1], 18, "T");
          return [latlng.lat, latlng.lng];
        }));
  }
}

type MTLOpenDataBoolean = "OUI" | "NON";

interface MTLOpenDataBicyclePathGeoJSONProperties {
  ID: number;
  ID_TRC_GEO: number;
  TYPE_VOIE: number;
  TYPE_VOIE2: number;
  LONGUEUR: number;
  NBR_VOIE: number;
  SEPARATEUR?: string;
  SAISONS4: MTLOpenDataBoolean;
  PROTEGE_4S: MTLOpenDataBoolean;
  Ville_MTL: MTLOpenDataBoolean;
  NOM_ARR_VI: string;
}

type MTLOpenDataBicyclePath = FeatureCollection<MultiLineString, MTLOpenDataBicyclePathGeoJSONProperties>;
