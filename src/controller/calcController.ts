import {IncomingMessage, ServerResponse} from "node:http";
import createError from "http-errors";
import {Calculator} from "../service/Calculator.ts";

const calculator = new Calculator();

export async function calcController(req: IncomingMessage, res: ServerResponse) {
    processRequest(req, res)
        .catch(err => {sendError(res, err)});
}

async function processRequest(req: IncomingMessage, res: ServerResponse) {
    const body = await getBody(req);

    const serviceResponse = await calculator.compute(body);

    sendSuccess(res, JSON.stringify(serviceResponse));
}

function sendSuccess(res: ServerResponse, jsonBody: string) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(jsonBody);
}

function sendError(res: ServerResponse, err: unknown) {
    let error: createError.HttpError;
    if (createError.isHttpError(err)) {
        error = err;
    }
    else {
        const message = (err instanceof Error)? err.message : `${err}`;
        error = createError(400, message);
    }

    res.writeHead(error.statusCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: error.message}));
}

async function getBody(req: IncomingMessage): Promise<unknown> {

    let bodyString = "";
    for await (const chunk of req) {
        bodyString += chunk;
    }
    if (!bodyString) {
        throw createError.BadRequest("Empty body");
    }
    try {
        return JSON.parse(bodyString);
    }
    catch (err: unknown) {
        if (err instanceof SyntaxError) {
            throw createError.BadRequest("Invalid JSON");
        }
        throw err;
    }
}