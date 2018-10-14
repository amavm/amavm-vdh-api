import { BicyclePathStatus } from "@entities/bicycle-paths";
import { BicyclePathsService } from "@services/bicycle-paths.service";
import { GeoSourceService } from "@services/geo-source.service";

export interface SyncService {
  sync(): Promise<void>;
}

export class DefaultSyncService implements SyncService {

  public constructor(
    private readonly geoSourceService: GeoSourceService,
    private readonly bicyclePathsService: BicyclePathsService,
  ) {}

  public async sync(): Promise<void> {
    const bicyclePaths = await this.geoSourceService.getBicyclePaths();

    await Promise.all(bicyclePaths.map(async (bp) => {
      const existingBp = await this.bicyclePathsService.get(bp.id);
      bp = {
        ...existingBp,
        ...bp,
        status: existingBp ? existingBp.status : BicyclePathStatus.Unknown,
      };
      await this.bicyclePathsService.set(bp);
    }));
  }

}
