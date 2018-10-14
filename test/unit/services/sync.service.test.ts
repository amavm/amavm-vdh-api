import { BicyclePath } from "@entities/bicycle-paths";
import { BicyclePathsService, MongoDbBicyclePathsService } from "@services/bicycle-paths.service";
import { GeoSourceService, MTLOpenDataGeoSourceService } from "@services/geo-source.service";
import { DefaultSyncService, SyncService } from "@services/sync.service";
import { testBicyclePath } from "@test/entity-factory";
import { expect } from "chai";
import sinon = require("sinon");

describe("DefaultSyncService", () => {

  let service: SyncService;
  let geoSourceServiceStub: sinon.SinonStubbedInstance<GeoSourceService>;
  let bicyclePathsServiceStub: sinon.SinonStubbedInstance<BicyclePathsService>;

  beforeEach(() => {
    geoSourceServiceStub = sinon.createStubInstance(MTLOpenDataGeoSourceService);
    bicyclePathsServiceStub = sinon.createStubInstance(MongoDbBicyclePathsService);
    service = new DefaultSyncService(geoSourceServiceStub, bicyclePathsServiceStub);
  });

  it("should sync bicycle paths", async () => {
    const bicyclePaths: BicyclePath[] = [
      testBicyclePath(),
      testBicyclePath(),
    ];
    geoSourceServiceStub
      .getBicyclePaths
      .returns(bicyclePaths);

    await service.sync();

    expect(bicyclePathsServiceStub.get.callCount).to.equal(2);
    expect(bicyclePathsServiceStub.set.callCount).to.equal(2);
  });

});
