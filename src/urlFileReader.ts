import * as fsPromise from 'fs/promises';
import logger from './logger';
import * as path from 'path';

export const readURLs = async (fileName: string) => {
    const urls: string[] = [];
    const urlFile = path.join(__dirname, ('../' + fileName));
    await fsPromise.open(urlFile, 'r')
        .then(async (response) => {
            for await (const line of response.readLines()){
                urls.push(line);
            }
        })
        .catch(() => {
            logger.error(`File not found at: ${urlFile}`)
        });
    return urls;
};

