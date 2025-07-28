import {Service} from "../controller/MainController.js";
import z from "zod";

const requestSchema = z.object({
    operation: z.enum(["+", "-", "*", "/"]),
    first: z.number(),
    second: z.number(),
});

type Request = z.infer<typeof requestSchema>;

type Response = Request & {
    result: number;
};

export class Calculator implements Service{
    compute(bodyObject: unknown): string {
        return "";
    }
}