import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Convex Auth adds its sign-in / sign-out / callback routes here.
auth.addHttpRoutes(http);

export default http;
