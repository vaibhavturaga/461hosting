import axios, {AxiosResponse} from 'axios';
import { PackageManifest, getPackageManifest } from 'query-registry';
import logger from '../logger';
import { exec } from 'child_process';
import { tmpdir } from 'os';
import * as path from 'path';
/****************************************************************************************************************************************
 * repoConnection
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Interface for requesting information from github repository. Is used by communicator class
 * 
 * TODO:
 * 1. better error handling: can't access github repo, can't access npm package, etc.
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 * 
 * Completed:
 * 1. imported logger and swapped any console writes with logger calls
 * 2. Handling status 202 (successful request repsonse not ready) and 403 (timeout we do exponential decay)
 **************************************************************************************************************************************/
  /* e.g. how to initialize connection
        (async () => {
        const npmrepo = new repoCommunicator(npm);

        // Wait for the initialization to complete
          await npmrepo.waitForInitialization();

          // Now that the object is initialized, you can call instance methods like getissues
          npmrepo.getissues();
        })();
  */
export class repoConnection{
  url: string | null;
  githubkey: string | null;
  repo: string;
  org: string;
  error_occurred: boolean = false;
  original_url: string;
  private initializationPromise: Promise<void> | null = null;
  
  constructor(url: string, githubkey: string) {
    this.githubkey = githubkey;
    this.original_url = url;
    this.url = url;
    this.repo = '';
    this.org = '';
    this.initializationPromise = this.initialize(url);
  }

  async initialize(url: string): Promise<void> {
    try {
      const processedUrl: string | null = await this.processUrl(url);
      if (processedUrl) {
        const urlParts: string[] = processedUrl.split('/');
        this.org = urlParts[urlParts.length - 2];
        this.repo = urlParts[urlParts.length - 1]//.split('.')[0];
        this.url = processedUrl;
      } else {
        logger.error(`Initialization failed: Github URL not Found. for ${this.url}`);
        this.error_occurred = true;
      }
    } catch (error) {
      logger.error(`${error}`); // Rethrow the error to propagate it to the caller
      this.error_occurred = true;
    }
  }

  //This can be called from other functions when first initializing the class to know when initilization is complete. example code for when intializing instance
  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      return Promise.resolve();
    }
    return this.initializationPromise;
  }

  async processUrl(url: string): Promise<string | null> {
    if (url.includes("npmjs")) {
      try {
        const githubRepoUrl: string | null = await this.queryNPM(url);
        return githubRepoUrl
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`${error}`); // Rethrow the error to propagate it to the caller
        } else {
          logger.error(`An unknown error occurred: ${error}`)
        }
        this.error_occurred = true;
        return null;
      }
    } 
    else {
      return url;
    }
  }

  async queryNPM(url: string): Promise<string | null>{
    const urlParts: string[] = url.split('/');
    const packageName: string = urlParts[urlParts.length - 1]//.split('.')[0];
    try{
      const packageInfo: PackageManifest = await getPackageManifest({ name: packageName });
      if (packageInfo.gitRepository && packageInfo.gitRepository.url) {
        return packageInfo.gitRepository.url;
      }
      return null;
    }
    catch{
      logger.error(`Failed to get information about npm repository: ${this.url}`)
      this.error_occurred = true;
      return null;
    }
  }

  // ex goal: https://api.github.com/repos/browserify/browserify
  // ex endpoint: '/commits', '', '/issues?state=closed', '/issues?state=open'
async queryGithubapi(queryendpoint: string): Promise<AxiosResponse<any[]> | null> {
    try {
      const axiosInstance = axios.create({
        baseURL: 'https://api.github.com/',
        headers: {
          Authorization: `token ${this.githubkey}`,
          Accept: 'application/json',
          'X-GitHub-Api-Version': '2022-11-28', // Add the version header here
        },
      });
      const endpoint: string = `repos/${this.org}/${this.repo}${queryendpoint}`;
      let response: AxiosResponse<any[]>;
      let count = 10; // Maximum retry count for 202 responses
      let retries = 0;
      do {
        response = await axiosInstance.get(endpoint);
  
        if (response.status === 202) {
          // If the response is 202, it means the request is still processing.
          // Wait for a while before retrying, and decrement the count.
          count--;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the polling interval as needed.
        } else if (response.status === 403) {
          // Implement exponential backoff for 403 responses.
          if(!retries){
            logger.error(`Rate limit exceeded on ${this.url} applying exponential backoff`)
          }
          retries++;
          const maxRetryDelay = 60000; // Maximum delay between retries (in milliseconds).
          const retryDelay = Math.min(Math.pow(2, retries) * 1000, maxRetryDelay); // Exponential backoff formula.
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } while ((response.status === 202 && count > 0) || response.status === 403);
      return response;
    } catch (error) {
      logger.error(`${error}`);
      this.error_occurred = true;
      return null;
    }
  }
  
  

  static async create(url: string, githubkey: string): Promise<repoConnection> {
    const instance = new repoConnection(url, githubkey);
    await instance.waitForInitialization();
    return instance;
  }
}

/****************************************************************************************************************************************
 * repoCommunicator
 * 1. takes in a repoConnection
 * 2. Uses connection to query github api for contributors, commits and general repository information. It runs all of these queries concurrently
 * using promise.all this helps with efficiency
 * 3. We then store the responses to this class. 
 * 4. We have an evaluate function in metriceval.ts that uses the response data
 * 
 **************************************************************************************************************************************/
export class repoCommunicator {
  connection: repoConnection;
  private initializationPromise: Promise<void> | null = null;
  contributors: any[] | null = null;
  commits: any[] | null = null;
  general: any[] | null = null;
  repositoryURL = '';
  cloneDirectory = '';
  recentCommit = '';
  constructor(connection: repoConnection){
    this.connection = connection;
    if(!this.connection.error_occurred){
      this.initializationPromise = this.retrieveAllInfo();
    }
  }

  async retrieveAllInfo(): Promise<void>{
    const asyncFunctions: (() => Promise<void>)[] = [
      this.getcontributors.bind(this),
      this.getCommits.bind(this),
      this.getGeneral.bind(this),
      this.getRecentCommitDate.bind(this),
      // Add more async functions as needed
    ];
    try {
      await Promise.all(asyncFunctions.map(fn => fn()));
    } catch (error) {
      // Handle errors
      logger.error(`${error}`);
      process.exit(1);
    }
  }

  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      return Promise.resolve();
    }
    return this.initializationPromise;
  }
  async getRecentCommitDate(): Promise<void> {
    this.repositoryURL = `https://github.com/${this.connection.org}/${this.connection.repo}`
    this.cloneDirectory = path.join(tmpdir(), this.connection.repo);
    try {
        // Clone the repository
        await this.cloneRepository();

        // Get the date of the first commit
        await this.getMostRecentCommitDateFromRepository();

        //console.log(`Recent commit date: ${this.recentCommit}`);
    } catch (error) {
        logger.error(`${error}`);
    }
}

  private async cloneRepository(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
          exec(`git clone ${this.repositoryURL} ${this.cloneDirectory}`, (error, stdout, stderr) => {
              if (error) {
                if (error.message.includes('already exists')) {
                  resolve(); // Repository already exists, no need to clone again
                } else {
                  reject(error);
                }
              } else {
                  resolve();
              }
          });
      });
  }

  private async getMostRecentCommitDateFromRepository(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(`git --git-dir=${this.cloneDirectory}/.git --work-tree=${this.cloneDirectory} log --format="%ct" -n 1`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                const timestamp = parseInt(stdout.trim(), 10);
                const mostRecentCommitDate = new Date(timestamp * 1000);
                this.recentCommit = mostRecentCommitDate.toDateString()
                resolve();
            }
        });
    });
}
  async getGeneral(): Promise<void>{
    try {
      const response = await this.connection.queryGithubapi('');
      if (response) {
        this.general = response.data
      }
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  async getCommits(): Promise<void> {
    try {
      const response = await this.connection.queryGithubapi('/commits');
      if (response) {
        this.commits = response.data;
      }
    } catch (error) {
      logger.error(`${error}`);
    }
  }
  
  async getcontributors(): Promise<void>{
    try{
      const response = await this.connection.queryGithubapi('/stats/contributors');
      if(response){
        this.contributors = response.data
        //console.log(`${this.connection.url} ${response.status}`)
      }
    }
    catch(error) {
      logger.error(`${error}`);
    }
  }

  static async create(connection: repoConnection): Promise<repoCommunicator> {
    const instance = new repoCommunicator(connection);
    await instance.waitForInitialization();
    return instance;
  }
}