import { BicyclePath, BicyclePathStatus, BicyclePathType } from "@entities/bicycle-paths";
import { MongoDbBicyclePathsService } from "@services/bicycle-paths.service";
import { MTLOpenDataGeoSourceService } from "@services/geo-source.service";
import { httpClientFactory } from "uno-serverless";

(async () => {
  /*const service = new MongoDbBicyclePathsService({
    db: "amavm-bpsr",
    url: "mongodb://localhost:27017",
  });

  const bp: BicyclePath = {
    borough: "Le Plateau-Mont-Royal",
    geometry: {
      coordinates: [
        [[45.533726, -73.552066], [45.529968, -73.555516]],
      ],
      type: "MultiLineString",
    },
    id: "8998",
    length: 90,
    numberOfLanes: 2,
    status: BicyclePathStatus.Unknown,
    type: BicyclePathType.ChausseeDesignee,
  };

  await service.set(bp);*/

  const source = new MTLOpenDataGeoSourceService(
    { bicyclePathsSourceUrl: "http://donnees.ville.montreal.qc.ca/dataset/5ea29f40-1b5b-4f34-85b3-7c67088ff536/resource/0dc6612a-be66-406b-b2d9-59c9e1c65ebf/download/reseau_cyclable_2018_juillet2018.geojson" },
    httpClientFactory());

  const result = await source.getBicyclePaths();
  console.log(JSON.stringify(result));
})();
