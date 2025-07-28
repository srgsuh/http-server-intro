import {createServer} from "node:http";
import {calcController} from "./controller/calcController.js";
import logger from "./logger.js";
import {getConfigValue} from "./config_params.js";
import router from "./routes.js";

const DEFAULT_PORT = 3501;

const port = getConfigValue<number>("server.port", DEFAULT_PORT);
const server = createServer(
    async (req, res) => {
       const controller = router(req.url ?? "");
       await controller(req, res);
    }
);

server.listen(port, () => {
       logger.info(`Server started on port ${port}`);
});