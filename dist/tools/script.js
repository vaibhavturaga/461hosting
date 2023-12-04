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
exports.beginEvaluation = void 0;
const api_1 = require("./api");
const api_2 = require("./api");
const metriceval_1 = require("./metriceval");
const logger_1 = __importDefault(require("../logger"));
function beginEvaluation(urls, token) {
    return __awaiter(this, void 0, void 0, function* () {
        //dotenv.config({ path: '.env' });
        //const token: string | undefined = process.env.GITHUB_API_KEY;
        if (!token) {
            logger_1.default.error('GitHub API token not found in the .env file');
            process.exit(1); // Exit the script with an error code
        }
        //Initialize repositories, find their github repositories if npm, make queries to to get the api responses we need.
        // this concurrently process 10 urls at a time
        const Promise = require('bluebird');
        const connectionsAndCommunicators = yield Promise.map(urls, (url) => __awaiter(this, void 0, void 0, function* () {
            const connection = yield api_1.repoConnection.create(url, token);
            const communicator = yield api_2.repoCommunicator.create(connection);
            return { connection, communicator };
        }), { concurrency: 10 });
        //For each pair of connections and communicators (connection finds github api, etc. communicator uses connection to make api queries)
        // we can create a metric instance by feeding the information from the communicator to our evaluater which filters responses
        // and outputs scores.
        const metricsResults = yield Promise.all(connectionsAndCommunicators.map((pair) => __awaiter(this, void 0, void 0, function* () {
            let metric = new metriceval_1.metricEvaluation(pair.communicator);
            return metric.getResults();
        })));
        return metricsResults;
    });
}
exports.beginEvaluation = beginEvaluation;
//# sourceMappingURL=script.js.map