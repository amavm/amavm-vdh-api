import { Container, createContainer, ExecutionMode } from "@container";
import {FirebaseError} from "firebase-admin";
import * as uno from "uno-serverless";
import * as unoAws from "uno-serverless-aws";
import {HttpUnoEvent, UnoEvent} from "uno-serverless/dist/core/schemas";

/**
 * The serverless service name.
 * Must be the same as the service name in the serverless.yml file.
 */
export const SERVICE_NAME = "amavm-vdh-api";

/**
 * Get the stage from the function name
 * Uses serverless framework conventions for Lambda functions.
 */
const getStageFromFunctionName = (functionName: string) => {
  const remainder = functionName.slice(SERVICE_NAME.length + 1);
  return remainder.slice(0, remainder.indexOf("-"));
};

/** Instantiate container using contextual information. */
const createContainerFromEvent = (
  arg: uno.FunctionArg<uno.UnoEvent, Container>
) => {
  /** True if running locally, under serverless-offline. */
  if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
    return createContainer({ mode: ExecutionMode.LocalDev, stage: "local" });
  }

  const mode = ExecutionMode.RestOfTheWorld;

  const stage =
    arg.event.unoEventType === "http"
      ? (arg.event as uno.HttpUnoEvent).original.requestContext.stage
      : getStageFromFunctionName(arg.context.original.functionName);

  return createContainer({
    mode,
    stage,
  });
};

const authMiddlware: uno.Middleware<uno.HttpUnoEvent, Container> = async function authMiddleware(
  arg,
  next
): Promise<string> {
  const {event, context, services} = arg;
  if ("Authorization" in event.headers) {
    try {
      await services.authService().init(event.headers.Authorization);
    } catch (e) {
      const message = e.message || "Unknown";
      context.log.warn(`${message}\n${e.stackTrace}`);
      throw uno.buildError({code: "InvalidAuthenticationToken", message}, 401);
    }
  }
  return next(arg);
};

export const httpFunc = () =>
  uno
    .uno(unoAws.awsLambdaAdapter())
    .use(uno.container(createContainerFromEvent))
    .use(uno.cors())
    .use(uno.defaultHttpMiddlewares())
    .use(unoAws.principalFromRequestAuthorizer())
    .use(authMiddlware);

export const func = () =>
  uno
    .uno(unoAws.awsLambdaAdapter())
    .use(uno.container(createContainerFromEvent))
    .use(uno.errorLogging());
