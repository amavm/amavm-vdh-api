import { BicyclePath, BicyclePathDivider, BicyclePathNetwork, BicyclePathType } from "@entities/bicycle-paths";
import * as faker from "faker";

export const testBicyclePath = (spec: Partial<BicyclePath> = {}): BicyclePath => ({
  borough: faker.address.county(),
  divider: BicyclePathDivider.Unknown,
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
  network: BicyclePathNetwork.Unknown,
  numberOfLanes: 2,
  type: BicyclePathType.Unknown,
  ...spec,
});
