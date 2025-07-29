import logger from "../logger.ts";

export type CalcRequest = {
    operation: string;
    first: number;
    second: number;
};

export type CalcResponse = CalcRequest & {result: number;};

export class CalculatorError extends Error {}

type OperationMap = {
    [operation: string]: (a: number, b: number) => number;
}

const MAPPER: OperationMap = {
    "+": (a: number, b: number) => a + b,
    "-": (a: number, b: number) => a - b,
    "*": (a: number, b: number) => a * b,
    "/": (a: number, b: number) => a / b,
}

export class Calculator {
    compute (calcRequest: CalcRequest): CalcResponse {
        this._validate(calcRequest);
        const result = this._calculate(calcRequest);
        const response: CalcResponse = {...calcRequest, result};
        logger.debug(`Calculator: response: ${JSON.stringify(response)}`);

        return response;
    }

    _validate({operation, second}: CalcRequest): void {
        if (!(operation in MAPPER)) {
            throw new CalculatorError(`Unsupported operation: ${operation}. Expected one of: ${Object.keys(MAPPER).join(", ")}`);
        }
        if (operation === "/" && second === 0) {
            throw new CalculatorError(`Division by zero is not supported.`);
        }
    }

    _calculate({first, second, operation}: CalcRequest): number {
        return MAPPER[operation](first, second);
    }
}