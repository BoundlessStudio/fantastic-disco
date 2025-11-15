import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

const handleRequest = (request: NextRequest) => auth0.middleware(request);

export const GET = handleRequest;
export const POST = handleRequest;

