import {Service} from "../controller/MainController.js";
import z from "zod";
import logger from "../logger.js";

const requestSchema = z.object({
    operation: z.enum(["+", "-", "*", "/"], {message: "Operation must be one of +, -, *, /"}),
    first: z.number({message: "First number must be a number"}),
    second: z.number({message: "Second number must be a number"}),
});

type Request = z.infer<typeof requestSchema>;

type Response = Request & {result: number;};

type Operation = Request["operation"];

type OperationMap = {
    [key in Operation]: (a: number, b: number) => number;
}

const MAPPER: OperationMap = {
    "+": (a: number, b: number) => a + b,
    "-": (a: number, b: number) => a - b,
    "*": (a: number, b: number) => a * b,
    "/": (a: number, b: number) => a / b,
}

export class Calculator implements Service{
    compute(bodyObject: unknown): string {
        const request = requestSchema.safeParse(bodyObject);
        if (!request.success) {
            const message = this._getZodErrorMessages(request.error);
            logger.debug(`Request validation failed: ${message}`);
            throw new Error(message);
        }
        const data = request.data;
        logger.debug(`Valid request received: ${JSON.stringify(data)}`);

        const result = this._apply(data);
        const response: Response = {...data, result};
        logger.debug(`Response: ${JSON.stringify(response)}`);

        return JSON.stringify(response);
    }
    _apply({first, second, operation}: Request): number {
        return MAPPER[operation](first, second);
    }
    _getZodErrorMessages(zodError: z.ZodError): string {
        return zodError.issues
            .map(issue => issue.message)
            .join("; ");
    }
}