/**
 * This code was generated by the uno cli.
 *
 * Manual changes may cause incorrect behavior and will be lost if
 * the code is regenerated.
 */
// tslint:disable

export const bicyclePathSnowRemovalStatusSchema = {
  enum: ["clean", "full", "partially", "unknown"],
  type: "string",
};

export const bicyclePathObservationTypesSchema = {
  enum: [0],
  type: "number",
};

export const bicyclePathSnowRemovalObservationSchema = {
  additionalProperties: false,
  properties: {
    bicyclePathId: {
      type: "string",
    },
    snowRemoval: bicyclePathSnowRemovalStatusSchema,
    timestamp: {
      description: "The timestamp - unix epoch",
      minimum: 0,
      type: "number",
    },
    type: bicyclePathObservationTypesSchema,
    userId: {
      type: "string",
    },
  },
  required: ["bicyclePathId", "snowRemoval", "timestamp", "type", "userId"],
  type: "object",
};

export const bicyclePathSnowRemovalObservationRequestSchema = {
  additionalProperties: false,
  properties: {
    snowRemoval: bicyclePathSnowRemovalStatusSchema,
    timestamp: {
      description: "The timestamp - unix epoch",
      minimum: 0,
      type: "number",
    },
  },
  required: ["snowRemoval", "timestamp"],
  type: "object",
};

export const bicyclePathObservationContextSchema = {
  additionalProperties: false,
  properties: {
    bicyclePathId: {
      type: "string",
    },
    type: bicyclePathObservationTypesSchema,
    userId: {
      type: "string",
    },
  },
  required: ["bicyclePathId", "type", "userId"],
  type: "object",
};

export const bicyclePathsRequestSchema = {
  additionalProperties: false,
  properties: {
    bbox: {
      items: {
        type: "number",
      },
      type: "array",
    },
    near: {
      items: {
        type: "number",
      },
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
  enum: [1, 2, 3, 4, 5, 6, 7, 8],
  type: "number",
};

export const bicyclePathSchema = {
  additionalProperties: false,
  description: "A bicycle path.",
  properties: {
    borough: {
      description: "The name of the borough.",
      type: "string",
    },
    divider: {
      description: "The divider type.",
      enum: ["C", "D", "J", "M", "P"],
      type: "string",
    },
    geometry: geoJsonMultiLineStringSchema,
    id: {
      description: "Unique id for the bicycle path",
      type: "string",
    },
    length: {
      description: "The length in meters",
      type: "number",
    },
    numberOfLanes: {
      description: "The number of lanes",
      type: "number",
    },
    status: {
      additionalProperties: false,
      properties: {
        snowRemoval: {
          additionalProperties: false,
          properties: {
            status: bicyclePathSnowRemovalStatusSchema,
            timestamp: {
              type: "number",
            },
          },
          required: ["status"],
          type: "object",
        },
      },
      required: ["snowRemoval"],
      type: "object",
    },
    type: bicyclePathTypeSchema,
  },
  required: ["borough", "geometry", "id", "length", "numberOfLanes", "status", "type"],
  type: "object",
};

export const bicyclePathDividerSchema = {
  enum: ["C", "D", "J", "M", "P"],
  type: "string",
};
