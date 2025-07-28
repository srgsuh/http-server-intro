import {IncomingMessage, ServerResponse} from "node:http";

export async function defaultController(_: IncomingMessage, res: ServerResponse) {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: "Page not found"}));
}