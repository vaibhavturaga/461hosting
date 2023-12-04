import express from 'express';
import { Request, Response } from 'express';
import { Pool } from 'pg'; // Make sure you've installed pg via npm or yarn
import { beginEvaluation } from './tools/script';
import { readEnv } from './envFileReader';
import { readURLs } from './urlFileReader';
// import { execSync } from 'child_process';
// import { Command } from 'commander';
// import { readURLs } from './urlFileReader';
// import { beginEvaluation } from './tools/script';
// import { readEnv } from './envFileReader';
// import logger from './logger';

const app = express();
const pool = new Pool({
  user: 'neon',
  host: 'ep-wispy-dew-06424760.us-east-2.aws.neon.tech',
  database: 'neondb',
  password: 'P3IvC1FuwzaD',
  port: 5432, // Default port for PostgreSQL
  ssl: {
    rejectUnauthorized: false // This should ideally be `true` for production
  }
});

app.use(express.static('ECE461-Part-2/src/frontend'));
app.use(express.json());

// Check database connection
pool.connect()
  .then(() => console.log('Connected to the database successfully'))
  .catch(error => {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Optional: Exit the application if database connection fails
  });

app.post('/packages/ingest', async (req: Request, res: Response) => {
  const env_var: any = await readEnv();
  try {
    if (!req.body || !req.body.urls) {
      return res.status(400).json({ success: false, message: 'No data provided.' });
    }
    const urlList = req.body.urls;

    console.log('Received request body:', req.body);
    console.log('urlList:', urlList);

    const metricsResults = await beginEvaluation(urlList, env_var.token);
    console.log('Metrics results:', metricsResults);

    if (metricsResults.length === 0) {
      throw new Error('No metrics results to process.');
    }

    for (const metricResult of metricsResults) {
      // Validation to check if any metric is less than 0.5
      const metricsBelowThreshold = ['net_score', 'ramp_up_score', 'correctness_score',
        'bus_factor_score', 'responsive_maintainer_score', 'license_score']
        .some(metric => metricResult[metric.toUpperCase()] < 0.3);

      if (metricsBelowThreshold) {
        throw new Error(`Package metrics for ${metricResult.URL} does not meet the minimum threshold of 0.3`);
      }

      const insertQuery = `
        INSERT INTO packages(url, net_score, ramp_up_score, correctness_score, bus_factor_score, responsive_maintainer_score, license_score)
        VALUES($1, $2, $3, $4, $5, $6, $7)
      `;
      const values = [
        metricResult.URL,
        metricResult.NET_SCORE,
        metricResult.RAMP_UP_SCORE,
        metricResult.CORRECTNESS_SCORE,
        metricResult.BUS_FACTOR_SCORE,
        metricResult.RESPONSIVE_MAINTAINER_SCORE,
        metricResult.LICENSE_SCORE,
      ];

      console.log('Attempting to insert:', values);
      const insertResult = await pool.query(insertQuery, values);
      console.log('Insertion result:', insertResult);

      if (insertResult.rowCount === 0) {
        throw new Error('Failed to insert data into the database');
      }
    }

    res.json({ success: true, message: 'Packages processed and stored.' });
  } catch (error) {
    console.error('Error processing packages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Error processing packages', error: errorMessage });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/packages', async (req, res) => {
  try {
    // Assuming 'id' is an auto-incrementing primary key
    const query = `
      SELECT * FROM packages
      ORDER BY id DESC
      LIMIT 10;
    `;

    const result = await pool.query(query);

    // Check if we have packages
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No packages found.' });
    }

    res.json({ success: true, packages: result.rows });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, message: 'Error fetching packages' });
  }
});

app.get('/packages/search', async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: 'No search query provided.' });
  }

  try {
    const searchQuery = `
      SELECT * FROM packages
      WHERE url ~ $1
      ORDER BY id DESC;
    `;

    const result = await pool.query(searchQuery, [query]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No packages match the search pattern.' });
    }

    res.json({ success: true, packages: result.rows });
  } catch (error) {
    console.error('Error searching packages with REGEX:', error);
    res.status(500).json({ success: false, message: 'Error performing REGEX search on packages' });
  }
});
