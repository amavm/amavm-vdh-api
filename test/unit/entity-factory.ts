import { BicyclePath, BicyclePathSnowRemovalStatus, BicyclePathType } from "@entities/bicycle-paths";
import * as faker from "faker";

export const testBicyclePath = (spec: Partial<BicyclePath> = {}): BicyclePath => ({
  borough: faker.address.county(),
  geometry: {
    coordinates: [
      [
        [parseFloat(faker.address.latitude()), parseFloat(faker.address.longitude())],
        [parseFloat(faker.address.latitude()), parseFloat(faker.address.longitude())],
      ],
    ],
    type: "MultiLineString",
  },
  id: faker.random.alphaNumeric(8),
  length: faker.random.number(),
  numberOfLanes: 2,
  status: {
    snowRemoval: {
      status: BicyclePathSnowRemovalStatus.Unknown,
    },
  },
  type: BicyclePathType.ChausseeDesignee,
  ...spec,
});
