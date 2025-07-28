import {createServer} from "node:http";
import logger from "./logger.ts";
import {getConfigValue} from "./config_params.ts";
import router from "./routes.ts";

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