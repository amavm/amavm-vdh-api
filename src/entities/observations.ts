import { BicyclePathSnowRemovalStatus } from "@entities/bicycle-paths";

export enum BicyclePathObservationTypes {
  SnowRemoval,
}

export interface BicyclePathObservationContext {
  bicyclePathId: string;
  type: BicyclePathObservationTypes;
  userId: string;
}

export interface BicyclePathSnowRemovalObservationRequest {
  /** The observed status */
  snowRemoval: BicyclePathSnowRemovalStatus;
  /**
   * The timestamp - unix epoch
   * @minimum 0
   */
  timestamp: number;
}

export type BicyclePathSnowRemovalObservation =
  BicyclePathObservationContext & BicyclePathSnowRemovalObservationRequest;
