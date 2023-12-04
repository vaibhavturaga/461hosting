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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnv = void 0;
const readEnv = () => __awaiter(void 0, void 0, void 0, function* () {
    let token = "";
    let logLevel = "";
    let logFile = "";
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env' });
    token = process.env.GITHUB_TOKEN;
    logLevel = process.env.LOG_LEVEL;
    logFile = process.env.LOG_FILE;
    return { token: token, logLevel: logLevel, logFile: logFile };
});
exports.readEnv = readEnv;
//# sourceMappingURL=envFileReader.js.map