import { BicyclePath } from "@entities/bicycle-paths";
import { AssetsService, S3AssetsService } from "@services/assets.service";
import { BicyclePathsService, MongoDbBicyclePathsService } from "@services/bicycle-paths.service";
import { GeoSourceService, MTLOpenDataGeoSourceService } from "@services/geo-source.service";
import { DefaultSyncService, SyncService } from "@services/sync.service";
import { testBicyclePath } from "@test/entity-factory";
import { expect } from "chai";
import sinon = require("sinon");

describe("DefaultSyncService", () => {

  let service: SyncService;
  let assetsServiceStub: sinon.SinonStubbedInstance<AssetsService>;
  let geoSourceServiceStub: sinon.SinonStubbedInstance<GeoSourceService>;
  let bicyclePathsServiceStub: sinon.SinonStubbedInstance<BicyclePathsService>;

  beforeEach(() => {
    assetsServiceStub = sinon.createStubInstance(S3AssetsService);
    geoSourceServiceStub = sinon.createStubInstance(MTLOpenDataGeoSourceService);
    bicyclePathsServiceStub = sinon.createStubInstance(MongoDbBicyclePathsService);
    service = new DefaultSyncService(
      assetsServiceStub,
      geoSourceServiceStub,
      bicyclePathsServiceStub);
  });

  it("should sync bicycle paths", async () => {
    const bicyclePaths: BicyclePath[] = [
      testBicyclePath(),
      testBicyclePath(),
    ];

    const previousBicyclePaths: BicyclePath[] = [
      ...bicyclePaths,
      testBicyclePath(),
    ];
    bicyclePathsServiceStub
      .findAll
      .returns(previousBicyclePaths);

    geoSourceServiceStub
      .getBicyclePaths
      .returns(bicyclePaths);

    await service.sync();

    expect(bicyclePathsServiceStub.set.callCount).to.equal(2);
    expect(bicyclePathsServiceStub.delete.callCount).to.equal(1);
  });

});
