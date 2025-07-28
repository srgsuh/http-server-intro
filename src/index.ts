import {createServer} from "node:http";
import {mainController} from "./controller/MainController.js";
import logger from "./logger.js";
import {getConfigValue} from "./config_params.js";

const DEFAULT_PORT = 3501;

const port = getConfigValue<number>("server.port", DEFAULT_PORT);
const server = createServer(mainController);
server.listen(3501, () => {
       logger.info(`Server started on port ${port}`);
});