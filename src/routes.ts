import {IncomingMessage, ServerResponse} from "node:http";
import {notFoundController} from "./controller/notFoundController.ts";
import {calcController} from "./controller/calcController.ts";

type Controller = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

const CONTROLLERS: {[key: string]: Controller} = {
    "calc": calcController
};

export default function router(url: string): Controller {
    const path = url.split("/")[1];
    return CONTROLLERS[path] || notFoundController;
}