#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const urlFileReader_1 = require("./urlFileReader");
const script_1 = require("./tools/script");
const envFileReader_1 = require("./envFileReader");
const logger_1 = __importDefault(require("./logger"));
console.log('Script is running...');
logger_1.default.info('Application started.');
const program = new commander_1.Command();
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
        (0, child_process_1.execSync)(`npm install`, { stdio: 'inherit' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error installing packages: ${error.message}`);
        }
        else {
            console.error('An unknown error occurred during package installation.');
        }
        process.exit(1);
    }
});
program
    .argument('<URL_FILE>', 'Absolute file location to file containing URLs')
    .action((urlFile) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Processing URL file: ${urlFile}`);
    // Your URL file processing logic here
    const env_var = yield (0, envFileReader_1.readEnv)();
    const urlList = yield (0, urlFileReader_1.readURLs)(urlFile);
    yield (0, script_1.beginEvaluation)(urlList, env_var.token);
}));
program
    .command('test')
    .description('Run tests')
    .action(() => {
    // console.log('Running tests...');
    // Your test logic here
    try {
        (0, child_process_1.execSync)(`cd ../ && npx jest --silent --coverage --coverageReporters=json-summary --config jest.config.custom1.js && npx jest --silent --coverage --coverageReporters=json-summary --config jest.config.custom.js`, { stdio: 'inherit' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error running tests: ${error.message}`);
        }
        else {
            console.error('An unknown error occurred during testing.');
        }
        process.exit(1);
    }
});
//console.log('Parsing Arguments')
program.parse(process.argv);
//# sourceMappingURL=index.js.map