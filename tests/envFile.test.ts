import { readEnv } from '../src/envFileReader';
import { describe, test, expect } from '@jest/globals';

describe('env_reader', () => {
    test('returns correct object', async () => {

        // Grab the env object
        let env = await readEnv();

        // Expect that the return array contains the urls
        if(typeof(env.logLevel) == "string"){
            expect(parseInt(env.logLevel)).toBeGreaterThanOrEqual(0);
            expect(parseInt(env.logLevel)).toBeLessThanOrEqual(2);
        }
        expect(env.token).toBeDefined();
        expect(env.logFile).toBeDefined();
    });

    // Additional test cases can be added here as needed
});
