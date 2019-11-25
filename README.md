# amavm-vdh-api

## Prerequisites

- Node 8.10.x:
  - It is recommended to use https://github.com/jasongin/nvs to install multiple versions of Node. 
- [Amazon AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
  - Configure it for the target AWS environment: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
- [Mongo DB](https://www.mongodb.com/download-center/community)
- Install the node requirements:
    ```bash
    $ npm install
    ```

## Local execution

1. Set up the Amazon AWS CLI with your own credentials.
1. Ensure you have MongoDB installed and accepting connections. Ensure that the URL in `local.config.json` matches your MongoDB installation.
1. Start the local server:
    ```bash
    $ npm start
    ```

    This will expose a local server at `localhost:3000`.

    **Note:** The console output will give you an API key which you will need to add to the `x-api-key` header of some requests.

## Unit tests
```cmd
$ npm test
$ npm run test:watch
```

## Deployment

1. Set all the required parameters in the [AWS Parameter Store](https://console.aws.amazon.com/systems-manager/parameters?region=us-east-1). 
    You will need to set the following substituting `${environment}` for the environment you will be deploying to in step 2:
    - `/amavm/vdh-api/${environment}/assets/bucket` - the default S3 bucket. **Default: `amavm-vdh-api-assets`**
    - `/amavm/vdh-api/${environment}/assets/root` - the root of the S3 url.
    **e.g. `http://amavm-vdh-api-assets.s3-website-us-east-1.amazonaws.com`**
    - `/amavm/vdh-api/${environment}/assets/mongodb-url` - the URL of your MongoDB. I think this also needs to include credentials, so you should encrypt this. 
    - `/amavm/vdh-api/${environment}/assets/mongodb-db` - the default MongoDB database. **Default: `amavm-vdh`**
    - `/amavm/vdh-api/${environment}/assets/mtl-od-bp-url` - the URL of the city's bike path file **Default: `http://donnees.ville.montreal.qc.ca/dataset/5ea29f40-1b5b-4f34-85b3-7c67088ff536/resource/0dc6612a-be66-406b-b2d9-59c9e1c65ebf/download/reseau_cyclable_2018_c.geojson`**

1. Run the deploy:

    ```bash
    $ npm run deploy -- [environment]
    ```

## Run end-to-end tests
```bash
$ npm run test:e2e -- --global-var url=[environment url]
```
