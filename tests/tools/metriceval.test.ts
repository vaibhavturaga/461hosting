import {metricEvaluation} from '../../src/tools/metriceval';
import {repoCommunicator} from '../../src/tools/api';
import {repoConnection} from '../../src/tools/api';
import {describe, test, expect, beforeAll} from '@jest/globals';
import * as dotenv from 'dotenv'
import { freemem } from 'os';

process.env.DOTENV_CONFIG_PATH = '../../../.env';
dotenv.config();
const token: string | undefined = process.env.GITHUB_TOKEN;
if (!token) {
    expect(token).toBeDefined();
    throw new Error;
}
// globals
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
let metrics: metricEvaluation[] = [];

describe('metricEvaluation', () => {

    beforeAll(async () => {
        const Promise = require('bluebird');

        const connectionsAndCommunicators = await Promise.all(
        urls.map(async (url: string) => {
            const connection = await repoConnection.create(url, token);
            const communicator = await repoCommunicator.create(connection);
            return { connection, communicator };
        })
        );

        connectionsAndCommunicators.forEach(async (pair: any) => {
            let metric: metricEvaluation = new metricEvaluation(pair.communicator);
            metrics.push(metric);
        });
        
    });

    test('getCorrectness', () => {
        metrics.forEach(metric => {
            expect(metric.correctness).toBeGreaterThanOrEqual(0);
            expect(metric.correctness).toBeLessThanOrEqual(1);
        });
    });

    test('getRampUp', () => {
        metrics.forEach(metric => {
            expect(metric.rampUp).toBeGreaterThanOrEqual(0);
        });
    });

    test('getBus', () => {
        metrics.forEach(metric => {
            expect(metric.busFactor).toBeGreaterThanOrEqual(0);
            expect(metric.busFactor).toBeLessThanOrEqual(1);
        });
    });

    test('getResponsiveness', () => {
        metrics.forEach(metric => {
            expect(metric.responsivness).toBeGreaterThanOrEqual(0);
            expect(metric.responsivness).toBeLessThanOrEqual(1);
        });
    });

    test('getlicense', () => {
        metrics.forEach(metric => {
            expect(metric.license).toBeGreaterThanOrEqual(0);
            expect(metric.license).toBeLessThanOrEqual(1);
        });
    });

    test('netScore', () => {
        metrics.forEach(metric => {
            expect(metric.score).toBeGreaterThanOrEqual(0);
            expect(metric.score).toBeLessThanOrEqual(1);
        });
    });  
});

metrics.forEach(() => {freemem();})