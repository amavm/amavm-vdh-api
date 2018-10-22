import { Position } from "geojson";

/** Status for an observation. */
export enum ObservationStatus {
  Ok = "ok",
  Ko = "ko",
}

export enum ObservationAttributes {
  Snow = "snow",
  Ice = "ice",
}

export interface ObservationAssetBase {
  /**
   * The asset content-type
   * @example image/jpeg
   */
  contentType: string;
}

/** An asset submitted alongside an ObservationRequest. */
export interface ObservationRequestAsset extends ObservationAssetBase {
  /** Base-64 encoded data. */
  data: string;
}

/** An asset attached alongside a ReportedObservation. */
export interface ReportedObservationAsset extends ObservationAssetBase {
  /** Base-64 encoded data. */
  url: string;
}

/** Base definition for observations. */
export interface ObservationBase {
  /** Attributes to further characterize the observation. */
  attributes: ObservationAttributes[];
  /** Free-form comments. */
  comment?: string;
  /** A device identifier (the reporting device). */
  deviceId: string;
  /** A GeoJSON position for the observation. */
  position: Position;
  /** A timestamp of when the observation was done. Unix Epoch in seconds. */
  timestamp: number;
}

/** Request to submit an observation. */
export interface ObservationRequest extends ObservationBase {
  /** Attached assets. */
  assets?: ObservationRequestAsset[];
}

/** A reported observation */
export interface ReportedObservation extends ObservationBase {
  /** Associated assets. */
  assets?: ReportedObservationAsset[];
}
