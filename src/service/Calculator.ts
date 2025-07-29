import logger from "../logger.ts";

export type CalcRequest = {
    operation: string;
    first: number;
    second: number;
};

export type CalcResponse = CalcRequest & {result: number;};

export class CalculatorError extends Error {}

type OperationMap = {
    [operation: string]: {
        calculate: (a: number, b: number) => number,
        validate?: (a: number, b: number) => void,
    }
}

const MAPPER: OperationMap = {
    "+": {calculate: (a: number, b: number) => a + b,},
    "-": {calculate: (a: number, b: number) => a - b,},
    "*": {calculate: (a: number, b: number) => a * b,},
    "/": {
        calculate: (a: number, b: number) => a / b,
        validate: (_: number, b: number) => {
            if (b === 0) {
                throw new CalculatorError(`Division by zero is not supported.`);
            }
        }
    }
}

export class Calculator {
    compute (calcRequest: CalcRequest): CalcResponse {
        this._validate(calcRequest);
        const result = this._calculate(calcRequest);
        const response: CalcResponse = {...calcRequest, result};
        logger.debug(`Calculator: response: ${JSON.stringify(response)}`);

        return response;
    }

    _validate({operation, first, second}: CalcRequest): void {
        if (!(operation in MAPPER)) {
            throw new CalculatorError(`Unsupported operation: ${operation}. Expected one of: ${Object.keys(MAPPER).join(", ")}`);
        }
        MAPPER[operation].validate?.(first, second);
    }

    _calculate({first, second, operation}: CalcRequest): number {
        return MAPPER[operation].calculate(first, second);
    }
}