import { BicyclePath, GeoJSONBicyclePathProperties } from "@entities/bicycle-paths";
import { BicyclePathsService } from "@services/bicycle-paths.service";
import { GeoSourceService } from "@services/geo-source.service";
import { Feature, FeatureCollection, MultiLineString } from "geojson";
import { toRecord } from "uno-serverless";
import { AssetsService } from "./assets.service";

export interface SyncService {
  sync(): Promise<void>;
}

export class DefaultSyncService implements SyncService {

  public constructor(
    private readonly assetsService: AssetsService,
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

    const condensedBicyclePaths = await this.condenseBp(indexedCurrentBp);
    await this.assetsService.uploadBicyclePaths(condensedBicyclePaths);
  }

  public async condenseBp(indexedPaths: Record<string, BicyclePath>)
    : Promise<FeatureCollection<MultiLineString, GeoJSONBicyclePathProperties>> {
      const ids = Object.keys(indexedPaths);
      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const segment = indexedPaths[id];
        if (segment) {
          const lastPoint = segment.geometry.coordinates[0][segment.geometry.coordinates[0].length - 1];
          const segmentWithStartingFirstPoint = Object.values(indexedPaths)
            .filter((x) =>
            !!x &&
            x.network === segment.network &&
            x.geometry.coordinates[0][0][0] === lastPoint[0] &&
            x.geometry.coordinates[0][0][1] === lastPoint[1])[0];
          if (segmentWithStartingFirstPoint) {
            segmentWithStartingFirstPoint.geometry.coordinates[0] = [
              ...segment.geometry.coordinates[0],
              ...segmentWithStartingFirstPoint.geometry.coordinates[0],
            ];
          }
        }
      }

      const filteredData = Object.values(indexedPaths).filter((x) => !!x).map((x) => ({
        geometry: x.geometry,
        id: x.id,
        network: x.network,
        numberOfLanes: x.numberOfLanes,
        type: x.type,
      }));

      const features = filteredData.map((x) => ({
        geometry: x.geometry,
        properties: {
          network: x.network,
          numberOfLanes: x.numberOfLanes,
          type: x.type,
        },
        type: "Feature",
      })) as Array<Feature<MultiLineString, GeoJSONBicyclePathProperties>>;

      return {
        features,
        type: "FeatureCollection",
      };
  }

}
