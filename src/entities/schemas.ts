/**
 * This code was generated by the uno cli.
 *
 * Manual changes may cause incorrect behavior and will be lost if
 * the code is regenerated.
 */
// tslint:disable

export const coordinatesSchema = {
  additionalProperties: false,
  properties: {
    accuracy: {
      type: "number",
    },
    altitude: {
      type: ["null", "number"],
    },
    altitudeAccuracy: {
      type: ["null", "number"],
    },
    heading: {
      type: ["null", "number"],
    },
    latitude: {
      type: "number",
    },
    longitude: {
      type: "number",
    },
    speed: {
      type: ["null", "number"],
    },
  },
  required: ["accuracy", "altitude", "altitudeAccuracy", "heading", "latitude", "longitude", "speed"],
  type: "object",
};

export const positionSchema = {
  additionalProperties: false,
  properties: {
    coords: coordinatesSchema,
    timestamp: {
      type: "number",
    },
  },
  required: ["coords", "timestamp"],
  type: "object",
};

export const reportedObservationAssetSchema = {
  additionalProperties: false,
  description: "An asset attached alongside a ReportedObservation.",
  properties: {
    contentType: {
      description: "The asset content-type",
      type: "string",
    },
    url: {
      description: "Base-64 encoded data.",
      type: "string",
    },
  },
  required: ["contentType", "url"],
  type: "object",
};

export const reportedObservationSchema = {
  additionalProperties: false,
  description: "A reported observation",
  properties: {
    assets: {
      description: "Associated assets.",
      items: reportedObservationAssetSchema,
      type: "array",
    },
    attributes: {
      description: "Attributes to further characterize the observation.",
      items: {
        enum: ["ice", "snow"],
        type: "string",
      },
      type: "array",
    },
    comment: {
      description: "Free-form comments.",
      type: "string",
    },
    deviceId: {
      description: "A device identifier (the reporting device).",
      type: "string",
    },
    position: positionSchema,
    timestamp: {
      description: "A timestamp of when the observation was done. Unix Epoch in seconds.",
      type: "number",
    },
  },
  required: ["attributes", "deviceId", "position", "timestamp"],
  type: "object",
};

export const observationRequestAssetSchema = {
  additionalProperties: false,
  description: "An asset submitted alongside an ObservationRequest.",
  properties: {
    contentType: {
      description: "The asset content-type",
      type: "string",
    },
    data: {
      description: "Base-64 encoded data.",
      type: "string",
    },
  },
  required: ["contentType", "data"],
  type: "object",
};

export const observationRequestSchema = {
  additionalProperties: false,
  description: "Request to submit an observation.",
  properties: {
    assets: {
      description: "Attached assets.",
      items: observationRequestAssetSchema,
      type: "array",
    },
    attributes: {
      description: "Attributes to further characterize the observation.",
      items: {
        enum: ["ice", "snow"],
        type: "string",
      },
      type: "array",
    },
    comment: {
      description: "Free-form comments.",
      type: "string",
    },
    deviceId: {
      description: "A device identifier (the reporting device).",
      type: "string",
    },
    position: positionSchema,
    timestamp: {
      description: "A timestamp of when the observation was done. Unix Epoch in seconds.",
      type: "number",
    },
  },
  required: ["attributes", "deviceId", "position", "timestamp"],
  type: "object",
};

export const observationBaseSchema = {
  additionalProperties: false,
  description: "Base definition for observations.",
  properties: {
    attributes: {
      description: "Attributes to further characterize the observation.",
      items: {
        enum: ["ice", "snow"],
        type: "string",
      },
      type: "array",
    },
    comment: {
      description: "Free-form comments.",
      type: "string",
    },
    deviceId: {
      description: "A device identifier (the reporting device).",
      type: "string",
    },
    position: positionSchema,
    timestamp: {
      description: "A timestamp of when the observation was done. Unix Epoch in seconds.",
      type: "number",
    },
  },
  required: ["attributes", "deviceId", "position", "timestamp"],
  type: "object",
};

export const observationAssetBaseSchema = {
  additionalProperties: false,
  properties: {
    contentType: {
      description: "The asset content-type",
      type: "string",
    },
  },
  required: ["contentType"],
  type: "object",
};

export const observationAttributesSchema = {
  enum: ["ice", "snow"],
  type: "string",
};

export const observationStatusSchema = {
  description: "Status for an observation.",
  enum: ["ko", "ok"],
  type: "string",
};

export const bicyclePathsRequestSchema = {
  additionalProperties: false,
  properties: {
    bbox: {
      items: {
        type: "number",
      },
      maximum: 8,
      minimum: 8,
      type: "array",
    },
    near: {
      items: {
        type: "number",
      },
      maximum: 2,
      minimum: 2,
      type: "array",
    },
    nextToken: {
      description: "The next continuation token.",
      type: "string",
    },
  },
  type: "object",
};

export const geoJsonMultiLineStringSchema = {
  additionalProperties: false,
  description: "MultiLineString geometry object. https://tools.ietf.org/html/rfc7946#section-3.1.5",
  properties: {
    bbox: {
      anyOf: [{
          additionalItems: {
            anyOf: [{
                type: "number",
              }, {
                type: "number",
              }, {
                type: "number",
              }, {
                type: "number",
              }],
          },
          items: [{
              type: "number",
            }, {
              type: "number",
            }, {
              type: "number",
            }, {
              type: "number",
            }],
          minItems: 4,
          type: "array",
        }, {
          additionalItems: {
            anyOf: [{
                type: "number",
              }, {
                type: "number",
              }, {
                type: "number",
              }, {
                type: "number",
              }, {
                type: "number",
              }, {
                type: "number",
              }],
          },
          items: [{
              type: "number",
            }, {
              type: "number",
            }, {
              type: "number",
            }, {
              type: "number",
            }, {
              type: "number",
            }, {
              type: "number",
            }],
          minItems: 6,
          type: "array",
        }],
      description: "Bounding box of the coordinate range of the object's Geometries, Features, or Feature Collections. https://tools.ietf.org/html/rfc7946#section-5",
    },
    coordinates: {
      items: {
        items: {
          items: {
            type: "number",
          },
          type: "array",
        },
        type: "array",
      },
      type: "array",
    },
    type: {
      description: "Specifies the type of GeoJSON object.",
      enum: ["MultiLineString"],
      type: "string",
    },
  },
  required: ["coordinates", "type"],
  type: "object",
};

export const bicyclePathTypeSchema = {
  enum: ["accotement-asphalte", "bande-cycleable", "chaussee-designee", "piste-cyclable-rue", "piste-cyclable-site-propre", "piste-cyclable-trottoir", "sentier-polyvalent", "unknown", "velorue"],
  type: "string",
};

export const bicyclePathNetworkSchema = {
  enum: ["3-seasons", "4-seasons", "unknown"],
  type: "string",
};

export const bicyclePathDividerSchema = {
  enum: ["cloture", "delineateur", "jersey", "mail", "marquage-sol", "unknown"],
  type: "string",
};

export const bicyclePathSchema = {
  additionalProperties: false,
  description: "A bicycle path.",
  properties: {
    borough: {
      description: "The name of the borough.",
      type: "string",
    },
    divider: bicyclePathDividerSchema,
    geometry: geoJsonMultiLineStringSchema,
    id: {
      description: "Unique id for the bicycle path",
      type: "string",
    },
    length: {
      description: "The length in meters",
      type: "number",
    },
    network: bicyclePathNetworkSchema,
    numberOfLanes: {
      description: "The number of lanes",
      type: "number",
    },
    type: bicyclePathTypeSchema,
  },
  required: ["borough", "divider", "geometry", "id", "length", "network", "numberOfLanes", "type"],
  type: "object",
};
