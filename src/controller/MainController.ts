import {IncomingMessage, ServerResponse} from "node:http";
import createError from "http-errors";
import {Calculator} from "../service/Calculator.js";

export interface Service {
    compute(bodyObject: unknown): string;
}

const services = new Map<string, Service>();
services.set('calc', new Calculator());

function getService(path: string): Service | undefined {
    const clearPath = path.replace(/\/$/, "");
    const service = clearPath.split("/")[1];
    return service? services.get(service) : undefined;
}

export async function mainController(req: IncomingMessage, res: ServerResponse) {
    try {
        await processRequest(req, res);
    }
    catch (err: unknown) {
        handleError(res, err);
    }
}

async function processRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== 'POST') {
        throw createError.MethodNotAllowed();
    }

    const service = getService(req.url || "/");
    if (!service) {
        throw createError.NotFound(`Path ${req.url} not found`);
    }
    let bodyString = "";
    for await (const chunk of req) {
        bodyString += chunk;
    }

    const bodyObject = JSON.parse(bodyString);
    const responseString = service.compute(bodyObject);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(responseString);
}

function handleError(res: ServerResponse, err: unknown) {
    let error: createError.HttpError;
    if (createError.isHttpError(err)) {
        error = err;
    }
    else {
        const message = (err instanceof Error)? err.message : `${err}`;
        error = createError(400, message);
    }

    res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message}));
}