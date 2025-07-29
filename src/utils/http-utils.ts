import {IncomingMessage, ServerResponse} from "node:http";
import createError from "http-errors";

export function sendResponse(res: ServerResponse, status: number, jsonBody?: string) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    jsonBody && res.write(jsonBody);
    res.end();
}

export function sendSuccess(res: ServerResponse, body: unknown) {
    const jsonBody = (typeof body === "string")? body: JSON.stringify(body);
    sendResponse(res, 200, jsonBody);
}

export function sendError(res: ServerResponse, error: unknown, status: number = 400) {
    let statusCode = createError.isHttpError(error)? error.statusCode: status;
    let message = (error instanceof Error)? error.message: `${error}`;

    sendResponse(res, statusCode, JSON.stringify({error: message}));
}

export async function getRequestBody(req: IncomingMessage): Promise<unknown> {
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