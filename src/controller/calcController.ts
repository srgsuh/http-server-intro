import {IncomingMessage, ServerResponse} from "node:http";
import {Calculator} from "../service/Calculator.ts";
import {getRequestBody, sendError, sendSuccess} from "../utils/http-utils.ts";

const CALC = new Calculator();

export async function calcController(req: IncomingMessage, res: ServerResponse) {
    processRequest(req, CALC)
        .then(computationResult => sendSuccess(res, computationResult))
        .catch(err => {sendError(res, err)});
}

async function processRequest(req: IncomingMessage, calculator: Calculator) {
    const body = await getRequestBody(req);
    const calcRequest = await Calculator.getCalcRequest(body);
    return calculator.compute(calcRequest);
}