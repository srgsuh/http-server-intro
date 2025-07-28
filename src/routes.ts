import {IncomingMessage, ServerResponse} from "node:http";
import {defaultController} from "./controller/defaultController.ts";

type Controller = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

const CONTROLLERS: {[key: string]: Controller} = {
    "calc": async () => {}
};

export default function router(path: string): Controller {
    return CONTROLLERS[path] || defaultController;
}