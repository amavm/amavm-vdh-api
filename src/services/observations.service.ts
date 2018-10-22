import { ObservationRequest, ReportedObservation } from "@entities/observations";

export interface ObservationsService {
  /** Reports an observation. */
  report(request: ObservationRequest): Promise<ReportedObservation>;
}
