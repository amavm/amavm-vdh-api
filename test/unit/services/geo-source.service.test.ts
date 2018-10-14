import { GeoSourceService, MTLOpenDataGeoSourceService } from "@services/geo-source.service";
import { expect } from "chai";
import nock = require("nock");
import { httpClientFactory } from "uno-serverless";

// tslint:disable-next-line:max-line-length
const MTL_OPEN_DATA_BICYCLE_PATH_URL = "http://donnees.ville.montreal.qc.ca/dataset/5ea29f40-1b5b-4f34-85b3-7c67088ff536/resource/0dc6612a-be66-406b-b2d9-59c9e1c65ebf/download/reseau_cyclable_2018_juillet2018.geojson";

describe("MTLOpenDataGeoSourceService", () => {

  let service: GeoSourceService;

  after(() => {
    nock.cleanAll();
  });

  before(() => {
    if (!nock.isActive()) {
      nock.activate();
    }
    nock.back.fixtures = "./test/unit/fixtures/mtl-opendata-geo-source.service";
    nock.back.setMode("record");
  });

  beforeEach(() => {
    service = new MTLOpenDataGeoSourceService(
      { bicyclePathsSourceUrl: MTL_OPEN_DATA_BICYCLE_PATH_URL },
      httpClientFactory({}));
  });

  const nockIt = (name: string, test: () => Promise<any>) => {
    it(name, async () => {
      const nockDone = await nock.back(`${encodeURIComponent(name.replace(/\s/g, "-"))}.json`);
      try {
        await test();
      } finally {
        if ((nockDone.context as any).isRecording) {
          // We give some time for pending parallel requests to complete.
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        nockDone.nockDone();
      }
    });
  };

  nockIt("should download MTL open data bicycle paths", async () => {
    const result = await service.getBicyclePaths();
    expect(result).to.not.be.empty;
  });

});
