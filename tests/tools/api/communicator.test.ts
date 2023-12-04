import {repoCommunicator, repoConnection} from '../../../src/tools/api';
import {describe, test, expect, beforeAll} from '@jest/globals';
import logger from '../../../src/logger';
import * as dotenv from 'dotenv'


// globals
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];

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

describe.skip('communicator', () => {
    test.todo('make tests');
});