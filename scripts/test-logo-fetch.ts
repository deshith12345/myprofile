
// Native fetch is available in Node 18+

async function testFetch(org: string) {
    try {
        const start = Date.now();
        console.log(`Starting fetch for ${org}...`);
        const res = await fetch(`http://localhost:3000/api/fetch-logo?org=${encodeURIComponent(org)}`);
        const data = await res.json();
        const duration = Date.now() - start;
        console.log(`Finished ${org} in ${duration}ms. Status: ${res.status}`, data);
        return { org, success: res.ok, data };
    } catch (e) {
        console.error(`Failed ${org}:`, e);
        return { org, success: false, error: e };
    }
}

async function run() {
    // Test sequential
    console.log('--- Sequential Test ---');
    await testFetch('python');
    await testFetch('java');

    // Test concurrent
    console.log('--- Concurrent Test ---');
    await Promise.all([
        testFetch('c++'),
        testFetch('rust'),
        testFetch('go')
    ]);
}

run();
