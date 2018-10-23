import { Position } from "geojson";
import { WithContinuation } from "uno-serverless";

export enum BicyclePathType {
  Unknown = "unknown",
  ChausseeDesignee = "chaussee-designee",
  AccotementAsphalte = "accotement-asphalte",
  BandeCyclable = "bande-cycleable",
  PisteCyclableSurRue = "piste-cyclable-rue",
  PisteCyclableEnSitePropre = "piste-cyclable-site-propre",
  PisteCyclableAuNiveauDuTrottoir = "piste-cyclable-trottoir",
  SentierPolyvalent = "sentier-polyvalent",
  Velorue = "velorue",
}

export enum BicyclePathDivider {
  Unknown = "unknown",
  Mail = "mail",
  Delineateur = "delineateur",
  MarquageAuSol = "marquage-sol",
  Cloture = "cloture",
  Jersey = "jersey",
}

export enum BicyclePathNetwork {
  Unknown = "unknown",
  Seasons3 = "3-seasons",
  Seasons4 = "4-seasons",
}

/** A bicycle path. */
export interface BicyclePath {
  /** The name of the borough. */
  borough: string;

  /** The divider type. */
  divider: BicyclePathDivider;

  /**
   * The GeoJson geometry.
   * Be careful - GeoJson Positions are [long, lat, elevation]
   */
  geometry: {
    type: "MultiLineString";
    coordinates: Position[][];
  };

  /** Unique id for the bicycle path */
  id: string;

  /** The length in meters */
  length: number;

  /** The number of lanes */
  numberOfLanes: number;

  /** Which network does this bicycle path belong to. */
  network: BicyclePathNetwork;

  /** The type of bicycle path */
  type: BicyclePathType;
}

export interface BicyclePathsRequest extends WithContinuation {
  /**
   * @maximum 8
   * @minimum 8
   */
  bbox?: number[];

  /** The name of the borough to filter. */
  borough?: string;

  /**
   * @maximum 2
   * @minimum 2
   */
  near?: number[];

  /** The number of lanes */
  numberOfLanes?: number;

  /** Which network does this bicycle path belong to. */
  network?: BicyclePathNetwork;

  /** The type of bicycle path */
  type?: BicyclePathType;
}
