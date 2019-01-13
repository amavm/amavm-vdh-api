import { Position } from "geojson";
import { WithContinuation } from "uno-serverless";

export enum AssetContentType {
  Jpeg = "image/jpeg",
  Png = "image/png",
}

export interface ObservationAssetBase {
  /**
   * The asset content-type
   */
  contentType: AssetContentType;
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
  attributes?: string[];
  /** Free-form comments. */
  comment?: string;
  /** A device identifier (the reporting device). */
  deviceId: string;
  /**
   * A GeoJSON position for the observation.
   * Be careful - GeoJson Positions are [long, lat, elevation]
   */
  position: Position;
  /** A timestamp of when the observation was done. Unix Epoch in seconds. */
  timestamp: number;
}

/** Request to submit an observation. */
export interface ObservationRequest extends ObservationBase {
  /** Attached assets. */
  assets?: ObservationRequestAsset[];
}

/** Status for observations */
export enum ObservationStatus {
  /**
   * The observation has been submitted, but it is neither validated nor rejected.
   * Default when submitting.
   */
  pending = "pending",
  /** The observation has been validated */
  valid = "valid",
  /** The observation has been rejected */
  rejected = "rejected",
}

/** A reported observation */
export interface ReportedObservation extends ObservationBase {
  /** Associated assets. */
  assets?: ReportedObservationAsset[];
  /** Unique id */
  id: string;
  /** The status of the observation. */
  status: ObservationStatus;
}

export enum GetObservationsRequestSort {
  TimestampAsc = "timestamp-asc",
  TimestampDesc = "timestamp-desc",
}

export interface GetObservationsRequest extends WithContinuation {
  /** The attributes to filter by */
  attributes?: string[];

  /** The start timestamp. Unix Epoch in seconds. */
  startTs?: number;

  /** The status to filter by */
  status?: ObservationStatus[];

  /** The end timestamp. Unix Epoch in seconds. */
  endTs?: number;

  /** The sort order. */
  sort: GetObservationsRequestSort;
}

export interface UpdateObservationStatusRequest {
  status: ObservationStatus;
}
