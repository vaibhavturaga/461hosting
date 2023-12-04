import {repoConnection} from '../../../src/tools/api';
import {describe, test, expect, beforeAll} from '@jest/globals';
import logger from '../../../src/logger';
import * as dotenv from 'dotenv'


// globals
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
const githubUrls: string[] = ['https://github.com/browserify/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://github.com/expressjs/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
const repos: string[] = ['browserify', 'cloudinary_npm', 'express', 'nodist', 'lodash'];
const orgs: string[] = ['browserify', 'cloudinary', 'expressjs', 'nullivex', 'lodash'];

process.env.DOTENV_CONFIG_PATH = '../../../.env';
dotenv.config();
const token: string | undefined = process.env.GITHUB_TOKEN;
if (!token) {
    expect(token).toBeDefined();
    logger.error('GitHub API token not found in the .env file');
    throw new Error;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTING // ///////////////////////////////// TESTING // ///////////////////////////////// TESTING ///////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('repoConnection', () => {
    // testing with globals
    urls.forEach((url, i) => {
        let connection : repoConnection;

        beforeAll(async () => {
            connection = await repoConnection.create(url, token);
        });

        // creating a repoConnection object
        test(`create ${i}`, () => {
            expect(connection).toBeDefined();
            expect(connection.githubkey).toBe(token);
            expect(connection.url).toBe(githubUrls[i]);
            expect(connection.repo).toBe(repos[i]);
            expect(connection.org).toBe(orgs[i]);
            expect(connection.error_occurred).toBe(false);
        });

        // testing queryGithubapi
        test.each(['/commits', '', '/issues?state=closed', '/issues?state=open'])(`queryGithubAPI for current URL${i}`, async (query) => {
            const response = await connection.queryGithubapi(query);
            expect(response).not.toBeNull(); // should not be null for this test
            expect(connection.error_occurred).toBe(false); // should be false for this test
        });

        // testing bad queryGithubapi
        test('queryGithubAPI for bad URL', async () => {
            const response = await connection.queryGithubapi('/badquery');
            expect(response).toBeNull(); // should be null for this test
            expect(connection.error_occurred).toBe(true); // should be true for this test
        });
    });

    // testing for bad url
    test('create bad url', async () => {
        const badUrl = 'https://www.npmjs.com/bad_url/this_is_a_bad_url';
        const connection = await repoConnection.create(badUrl, token);
        expect(connection.error_occurred).toBe(true); // should be true for this test
    });
});