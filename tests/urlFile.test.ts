import { readURLs } from '../src/urlFileReader';
import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('URL_FILE', () => {
    // Function to check if a url file exists, if not, create it
    beforeAll(() => {
        // Ensure that the LOG_FILE environment variable is set
        if (!process.env.LOG_FILE) {
            throw new Error('LOG_FILE environment variable is not defined.');
        }
    });
    
    test('returns correct array', async () => {
        let testArray = ["https://www.npmjs.com/package/is-regex", "https://www.npmjs.com/package/path-to-regexp", "https://www.npmjs.com/package/escape-string-regexp", "https://github.com/es-shims/RegExp.prototype.flags", "https://github.com/ljharb/safe-regex-test", "https://github.com/npm/hosted-git-info", "https://www.npmjs.com/package/@octokit/rest"]

        // Grab the urls
        let urls = await readURLs('tests/urlTestFile.txt');

        // Expect that the return array contains the urls
        expect(JSON.stringify(urls)).toBe(JSON.stringify(testArray));
    });

    test('logs no URL_FILE error messages correctly', async () => {
        // Log an error message
        await readURLs('doesNotExist.txt');

        // Construct the path to the error.log file
        const errorLogFilePath = path.join(__dirname, ('../' + process.env.LOG_FILE) || '');

        // Wait for a short time to allow Winston to create and write to the log file
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Read the contents of the error.log file
        const errorLogFileContents = fs.readFileSync(errorLogFilePath, 'utf8');

        // Expect that the error.log file contains the error message
        expect(errorLogFileContents).toContain('File not found at:');
    });

    // Additional test cases can be added here as needed
});
