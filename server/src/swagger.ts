import swaggerJsdoc from "swagger-jsdoc";

export const surveSwaggerSpecification = () => {
  // Swagger definition
  // You can set every attribute except paths and swagger
  // https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md

  // Options for the swagger docs
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Insight server",
        version: "1.0.0",
      },
      servers: [{ url: "/api/v1" }],
    },
    apis: ["./src/**/*.yml"],
  };
  const swaggerSpec = swaggerJsdoc(options);

  // And here we go, we serve it.
  // res.setHeader("Content-Type", "application/json");
  // res.send(swaggerSpec);
  return swaggerSpec;
};
