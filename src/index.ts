import {createServer, ServerResponse} from "node:http";
import {mainController} from "./controller/MainController.js";
import logger from "./logger.js";



const server = createServer(mainController);
server.listen(3501, () => logger.info('Server started on port 3501'));