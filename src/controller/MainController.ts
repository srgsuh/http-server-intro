import {IncomingMessage, ServerResponse} from "node:http";
import createError from "http-errors";
import {Calculator} from "../service/Calculator.js";


export interface ServiceRequest {
    result: unknown;
}

export interface Service {
    compute(bodyObject: unknown): Promise<ServiceRequest>;
}

const services = new Map<string, Service>();
services.set('calc', new Calculator());

export async function mainController(req: IncomingMessage, res: ServerResponse) {
    processRequest(req, res)
        .catch(err => {sendError(res, err)});
}

async function processRequest(req: IncomingMessage, res: ServerResponse) {
    if (!req.url || ! req.method) {
        throw createError.BadRequest("Malformed request: missing method or URL");
    }
    const service = getService(req.url, req.method);

    const body = await getBody(req);

    const serviceRequest = await service.compute(body);

    sendSuccess(res, JSON.stringify(serviceRequest.result));
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

    res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message}));
}

function getService(path: string, method: string): Service {
    const clearPath = path.replace(/\/$/, "");
    const servicePath = clearPath.split("/")[1];
    const service = services.get(servicePath);
    if (!service) {
        throw createError.NotFound(`Path ${path} not found`);
    }
    if (method !== 'POST') {
        throw createError.MethodNotAllowed(`Method ${method} is not allowed for path ${path}`);
    }
    return service;
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
        else {
            throw err;
        }
    }
}