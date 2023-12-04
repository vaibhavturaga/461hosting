export const readEnv = async () => {
    let token: string | undefined = "";
    let logLevel: string | undefined = "";
    let logFile: string | undefined = "";
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env' });
    token = process.env.GITHUB_TOKEN;
    logLevel = process.env.LOG_LEVEL;
    logFile = process.env.LOG_FILE;
    return {token:token, logLevel:logLevel, logFile:logFile};
};
