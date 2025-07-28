import {Service} from "../controller/MainController.js";
import z from "zod";

const requestSchema = z.object({
    operation: z.enum(["+", "-", "*", "/"]),
    first: z.number(),
    second: z.number(),
});

type Request = z.infer<typeof requestSchema>;

type Response = Request & {
    result: number;
};

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
        const request = requestSchema.parse(bodyObject);
        const result = this._apply(request);
        const response: Response = {...request, result};
        return JSON.stringify(response);
    }
    _apply({first, second, operation}: Request): number {
        return MAPPER[operation](first, second);
    }
}