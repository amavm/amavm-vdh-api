import { confirm, prompt } from "node-ask";
import { ConfigService } from "uno-serverless";
import { SSMParameterStoreConfigService } from "uno-serverless-aws";
import { Config } from "../src/config";

// tslint:disable:no-console
const promptDefault = async (question: string, defaultAnswer?: string) => {
  let proposition = defaultAnswer || "";
  if (proposition.length > 100) {
    proposition = proposition.slice(0, 100) + "...";
  }
  const response = (await prompt(`${question} [${proposition}]: `)).trim();

  return response ? response : defaultAnswer;
};

(async () => {
  const region = await promptDefault("AWS region", "us-east-1");
  process.env.AWS_REGION = region;
  const environment = await promptDefault("Environment");
  const path = `/amavm/bpsr-api/${environment}`;
  console.log(`Path: ${path}`);
  console.log();

  const configService = new SSMParameterStoreConfigService({ path, ttl: 0 });

  const values: Record<string, string> = {};
  for (const key of Object.keys(Config).sort()) {
    const configKey = Config[key] as Config;
    const currentValue = await (configService as ConfigService).get(configKey, false);
    values[configKey] = await promptDefault(configKey, currentValue);
  }

  console.log();
  console.log("Summary configuration: ");
  console.log("-------");
  console.log(JSON.stringify(values, undefined, 2));
  console.log("-------");
  console.log();

  if (await confirm(`Commit values to parameter store ${path} in region ${region} [y/N]? `)) {
    for (const key of Object.keys(values)) {
      if (values[key]) {
        try {
          await configService.set(key, values[key]);
        } catch (error) {
          if (error.message && error.message.includes("Throttling")) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await configService.set(key, values[key]);
          } else {
            throw error;
          }
        }
      }
    }

    console.log("Committed!");
    console.log();
    console.log("-------");
    console.log();
    console.log();

    for (const key of Object.keys(Config).sort()) {
      const configKey = Config[key] as Config;
      const value = await (configService as ConfigService).get(configKey, false);

      console.log(`${configKey} = ${value}`);
    }
  }
})();
