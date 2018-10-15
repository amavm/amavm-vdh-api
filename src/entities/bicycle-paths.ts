import { MultiLineString } from "geojson";
import { WithContinuation } from "uno-serverless";

export enum BicyclePathType {
  ChausseeDesignee = 1,
  AccotementAsphalte = 2,
  BandeCyclable = 3,
  PisteCyclableSurRue = 4,
  PisteCyclableEnSitePropre = 5,
  PisteCyclableAuNiveauDuTrottoir = 6,
  SentierPolyvalent = 7,
  Velorue = 8,
}

export enum BicyclePathDivider {
  Mail = "M",
  Deelineateur = "D",
  MarquageAuSol = "P",
  Cloture = "C",
  Jersey = "J",
}

export enum BicyclePathSnowRemovalStatus {
  Unknown = "unknown",
  Clean = "clean",
  Partially = "partially",
  Full = "full",
}

/** A bicycle path. */
export interface BicyclePath {
  /** The name of the borough. */
  borough: string;

  /** The divider type. */
  divider?: BicyclePathDivider;

  /** The GeoJson geometry. */
  geometry: MultiLineString;

  /** Unique id for the bicycle path */
  id: string;

  /** The length in meters */
  length: number;

  /** The number of lanes */
  numberOfLanes: number;

  status: {
    snowRemoval: {
      status: BicyclePathSnowRemovalStatus;
      timestamp?: number;
    };
  };

  /** The type of bicycle path */
  type: BicyclePathType;
}

export interface BicyclePathsRequest extends WithContinuation {
  bbox?: number[];
  near?: number[];
}
