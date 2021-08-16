# Milvus insight server

Milvus insight server use [nest](https://docs.nestjs.com/)

Milvus insight server depend on [milvus2-node-sdk](https://www.npmjs.com/package/@zilliz/milvus2-sdk-node) to operate milvus data.

## How to run

1. yarn install
2. yarn start:dev

## Folder Structure

    .
    ├── auth                    # Jwt authentication not useful for now
    ├── collections             # Manage milvus collections api
    ├── interceptors            # Nest interceptors related
    ├── middlewares             # Nest middlewares related
    ├── milvus                  # Milvus itself infomation api. Every other api modules need import this module.
    ├── partitions              # Manage milvus partitions api
    ├── pipe                    # Nest pipe related
    ├── schema                  # Manage milvus schema api
    ├── users                   # Working with auth module, not useful for now.
    ├── utils                   # Common helping functions.
    ├── app.xxx.ts              # Need import all other modules to app module.
    └── main.ts                 # Usually we dont need change this.

### How to create new module

1. nest g module your-module-name
2. nest g service your-module-name
3. nest g controller your-module-name

### Api validation

We use [class-validator](https://github.com/typestack/class-validator) to help us.
So normally we have dto.ts for every controller file.

### Swagger Doc

We need use ApiProperty to tag every field in dto.ts file and use ApiTags in every controller file.
After you start server, you can http://localhost:3000/api to see swagger doc.
