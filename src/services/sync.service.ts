import { BicyclePathsService } from "@services/bicycle-paths.service";
import { GeoSourceService } from "@services/geo-source.service";
import { toRecord } from "uno-serverless";

export interface SyncService {
  sync(): Promise<void>;
}

export class DefaultSyncService implements SyncService {

  public constructor(
    private readonly geoSourceService: GeoSourceService,
    private readonly bicyclePathsService: BicyclePathsService,
  ) {}

  public async sync(): Promise<void> {
    const allPreviousBp = await this.bicyclePathsService.findAll();
    const bicyclePaths = await this.geoSourceService.getBicyclePaths();

    for (const bicyclePath of bicyclePaths) {
      await this.bicyclePathsService.set(bicyclePath);
    }

    const indexedCurrentBp = toRecord(bicyclePaths);
    for (const bpToDelete of allPreviousBp.filter((x) => !indexedCurrentBp[x.id])) {
      await this.bicyclePathsService.delete(bpToDelete.id);
    }
  }

}
