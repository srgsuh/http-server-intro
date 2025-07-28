import {createLogger, format, transports} from "winston";
import {getConfigValue} from "./config_params.ts";

const logTransports = [];

const silent = getConfigValue<boolean>("logger.silent", false);
const level = getConfigValue<string>("logger.level", "info");

if (getConfigValue<boolean>("logger.console.enabled", false)) {
    logTransports.push(new transports.Console({
        level: getConfigValue<string>("logger.console.level", level)
    }));
}

const customTimestamp = format((info, opts) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = Math.round(now.getMilliseconds()/10).toString().padStart(2, '0');
    info.timestamp = `${hours}:${minutes}:${seconds}_${milliseconds}`;
    return info;
});

if (getConfigValue<boolean>("logger.file.enabled", false)) {
    logTransports.push(new transports.File(
        {   filename: `logs/${getConfigValue<string>("logger.file.path", "app.log")}`,
            level: getConfigValue<string>("logger.file.level", level),
            format: format.combine(
                customTimestamp(),
                format.json(),
                format.splat(),
                format.printf(({ message, timestamp }) => {
                    return `${timestamp}: ${message}`;
                })
            )
        }));
}

if (!silent && logTransports.length === 0) {
    logTransports.push(new transports.Console())
}

const logger = createLogger({
    silent,
    level,
    transports: logTransports,
    format: format.combine(
        format.colorize(),
        format.json(),
        format.splat(),
        format.printf(({ level, message }) => {
            return `[${level}]: ${message}`;
        })
    )
})

export default logger;