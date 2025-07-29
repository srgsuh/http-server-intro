import {IncomingMessage, ServerResponse} from "node:http";
import {Calculator, CalculatorError, CalculatorUnsupportedOperationError} from "../service/Calculator.ts";
import {getRequestBody, sendError, sendSuccess} from "../utils/http-utils.ts";
import z from "zod";
import logger from "../logger.ts";
import createError from "http-errors";

const CALC = new Calculator();

const requestSchema = z.object({
    operation: z.string({message: "field 'operation' must a string"}),
    first: z.number({message: "field 'first' must be a number"}),
    second: z.number({message: "field 'second' must be a number"}),
});

type Request = z.infer<typeof requestSchema>;

export async function calcController(req: IncomingMessage, res: ServerResponse) {
    extractRequest(req)
        .then(request => calculate(request, CALC))
        .then(computationResult => sendSuccess(res, computationResult))
        .catch(err => {sendError(res, err)});
}

function calculate(request: Request, calculator: Calculator) {
    try {
        return calculator.compute(request);
    }
    catch (err: unknown) {
        if (err instanceof CalculatorUnsupportedOperationError) {
            throw createError.NotFound(err.message);
        }
        if (err instanceof CalculatorError) {
            throw createError.BadRequest(err.message);
        }
        throw err;
    }
}

async function extractRequest(req: IncomingMessage): Promise<Request> {
    const body = await getRequestBody(req);
    return await getRequestFromBody(body);
}

const FormatDescription = "Expected JSON object with fields: 'operation'(string), 'first'(number), and 'second'(number)"

async function getRequestFromBody(bodyObject: unknown): Promise<Request> {
    try {
        const data = await requestSchema.parseAsync(bodyObject);
        logger.debug(`calcController: Valid request received: ${JSON.stringify(data)}`);
        return data;
    }
    catch (err: unknown) {
        if (err instanceof z.ZodError) {
            const formatError = getZodErrorMessages(err);
            logger.debug(`calcController: Request validation failed: ${formatError}`);
            const message = `Invalid request format: ${formatError}. ${FormatDescription}.`;
            throw createError.BadRequest(message);
        }
        throw err;
    }
}

function getZodErrorMessages(zodError: z.ZodError): string {
    return zodError.issues
        .map(issue => issue.message)
        .join("; ");
}