
import dotenv from 'dotenv';
import handler from '../api/analyze.ts'; // We might need to handle TS compilation or run with ts-node

dotenv.config();

// Mock Request
class MockRequest {
    method: string;
    body: any;

    constructor(method: string, body: any) {
        this.method = method;
        this.body = body;
    }

    async json() {
        return this.body;
    }
}

class MockResponse {
    statusCode: number = 200;
    headers: Record<string, string> = {};
    body: string = "";

    status(code: number) {
        this.statusCode = code;
        return this;
    }

    setHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    send(data: any) {
        this.body = typeof data === 'string' ? data : JSON.stringify(data);
        return this;
    }

    json(data: any) {
        return this.send(data);
    }

    // For test verification
    text() { return Promise.resolve(this.body); }
}

async function runTest() {
    console.log("--- TESTING STREAMING API ---");

    const dummyData = {
        love: ["Coding", "Sci-Fi", "Problem Solving"],
        goodAt: ["Typescript", "React", "System Architecture"],
        worldNeeds: ["Better AI Tools", "Efficient Workflows"],
        paidFor: ["SaaS", "Consulting"]
    };

    // 1. Test Structure
    console.log("\n1. Testing 'analysis_structure'...");
    const reqStructure = new MockRequest('POST', { type: 'analysis_structure', ikigaiData: dummyData });
    const resStructure = new MockResponse();
    try {
        await handler(reqStructure as any, resStructure as any);
        console.log("STATUS:", resStructure.statusCode);
        console.log("PAYLOAD:", resStructure.body.substring(0, 500) + "...");
    } catch (e) {
        console.error("FAIL:", e);
    }

    // 2. Test Ideas
    console.log("\n2. Testing 'analysis_ideas_core'...");
    const reqIdeas = new MockRequest('POST', { type: 'analysis_ideas_core', ikigaiData: dummyData });
    const resIdeas = new MockResponse();
    try {
        await handler(reqIdeas as any, resIdeas as any);
        console.log("STATUS:", resIdeas.statusCode);
        console.log("PAYLOAD:", resIdeas.body.substring(0, 500) + "...");
    } catch (e) {
        console.error("FAIL:", e);
    }
}

runTest();
