import z from "zod";
import logger from "../logger.ts";

const requestSchema = z.object({
    operation: z.enum(["+", "-", "*", "/"], {message: "Field 'operation' must be one of the following: +, -, *, /"}),
    first: z.number({message: "Field 'first' must be a number"}),
    second: z.number({message: "Field 'second' must be a number"}),
});

type CalcRequest = z.infer<typeof requestSchema>;

type CalcResponse = CalcRequest & {result: number;};

type Operation = CalcRequest["operation"];

type OperationMap = {
    [key in Operation]: (a: number, b: number) => number;
}

const MAPPER: OperationMap = {
    "+": (a: number, b: number) => a + b,
    "-": (a: number, b: number) => a - b,
    "*": (a: number, b: number) => a * b,
    "/": (a: number, b: number) => a / b,
}

export class Calculator {
    async compute (bodyObject: unknown): Promise<CalcResponse> {
        const calcRequest = this._getCalcRequest(bodyObject);
        const result = this._calculate(calcRequest);
        const response: CalcResponse = {...calcRequest, result};
        logger.debug(`Calculator: response: ${JSON.stringify(response)}`);

        return response;
    }
    _getCalcRequest(bodyObject: unknown): CalcRequest {
        try {
            const data = requestSchema.parse(bodyObject);
            logger.debug(`Calculator: Valid request received: ${JSON.stringify(data)}`);
            return data;
        }
        catch (err: unknown) {
            logger.debug(`Calculator: Error: ${err}`);
            if (err instanceof z.ZodError) {
                const message = this._getZodErrorMessages(err);
                logger.debug(`Calculator: Request validation failed: ${message}`);
                throw new Error(message);
            }
            throw err;
        }
    }
    _calculate({first, second, operation}: CalcRequest): number {
        return MAPPER[operation](first, second);
    }
    _getZodErrorMessages(zodError: z.ZodError): string {
        return zodError.issues
            .map(issue => issue.message)
            .join("; ");
    }
}