import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

async function audit() {
    console.log('🔍 INITIATING SYSTEM AUDIT...\n');

    const tests = [
        { name: 'Core API Health', endpoint: '/admin/system-health', method: 'GET' }, // Might 401 but should exist
        { name: 'Public Courses List', endpoint: '/courses', method: 'GET' },
        { name: 'Daily Learning Plan', endpoint: '/courses/daily-plan', method: 'GET' },
        { name: 'Auth Registry Check', endpoint: '/auth/me', method: 'GET' }, // Should 401
    ];

    for (const test of tests) {
        try {
            const start = Date.now();
            const res = await axios({
                method: test.method,
                url: `${API_BASE}${test.endpoint}`,
                validateStatus: () => true
            });
            const duration = Date.now() - start;
            
            let status = '✅';
            if (res.status >= 500) status = '❌';
            else if (res.status === 404) status = '⚠️';
            else if (res.status === 401) status = '🔐';

            console.log(`${status} ${test.name.padEnd(20)} | Status: ${res.status} | Latency: ${duration}ms`);
            
            if (res.status === 500) {
                console.log(`   └─ Error: ${res.data?.message || 'Unknown'}`);
            }
        } catch (err) {
            console.log(`❌ ${test.name.padEnd(20)} | FAILED: ${err.message}`);
        }
    }

    console.log('\n✨ AUDIT COMPLETE');
}

audit();
