import {IncomingMessage, ServerResponse} from "node:http";
import {sendError} from "../utils/http-utils.ts";

export async function notFoundController(_: IncomingMessage, res: ServerResponse) {
    sendError(res, "Page not found", 404);
}