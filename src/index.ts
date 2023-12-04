#!/usr/bin/env node

import { execSync } from 'child_process';
import { Command } from 'commander';
import { readURLs } from './urlFileReader';
import { beginEvaluation } from './tools/script';
import { readEnv } from './envFileReader';
import logger from './logger';

console.log('Script is running...');
logger.info('Application started.');

const program = new Command();
//testing ci
program
  .version('1.0.0')
  .description('ECE 461 NPM Phase 1');

program
    .command('install')
    .description('Install packages')
    .action(() => {
    console.log('Installing packages...');
    // Your install logic here
    try {
        execSync(`npm install`, { stdio: 'inherit' });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error installing packages: ${error.message}`);
        } else {
            console.error('An unknown error occurred during package installation.');
        }
        process.exit(1);
    }
    });

program
    .argument('<URL_FILE>', 'Absolute file location to file containing URLs')
    .action(async (urlFile: string) => {
        console.log(`Processing URL file: ${urlFile}`);
        // Your URL file processing logic here
        const env_var: any = await readEnv();
        const urlList: string[] = await readURLs(urlFile);
        await beginEvaluation(urlList, env_var.token);
    });

program
    .command('test')
    .description('Run tests')
    .action(() => {
        // console.log('Running tests...');
        // Your test logic here
        try {
            execSync(`cd ../ && npx jest --silent --coverage --coverageReporters=json-summary --config jest.config.custom1.js && npx jest --silent --coverage --coverageReporters=json-summary --config jest.config.custom.js`, { stdio: 'inherit' });
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error running tests: ${error.message}`);
            } else {
                console.error('An unknown error occurred during testing.');
            }
            process.exit(1);
        }
    });

//console.log('Parsing Arguments')
program.parse(process.argv);