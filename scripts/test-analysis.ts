
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
    try {
        const res = await handler(reqStructure as any);
        const text = await res.text(); // Response might be a standard Response object
        console.log("STATUS:", res.status);
        console.log("PAYLOAD:", text.substring(0, 500) + "...");
    } catch (e) {
        console.error("FAIL:", e);
    }

    // 2. Test Ideas
    console.log("\n2. Testing 'analysis_ideas_core'...");
    const reqIdeas = new MockRequest('POST', { type: 'analysis_ideas_core', ikigaiData: dummyData });
    try {
        const res = await handler(reqIdeas as any);
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("PAYLOAD:", text.substring(0, 500) + "...");
    } catch (e) {
        console.error("FAIL:", e);
    }
}

runTest();
