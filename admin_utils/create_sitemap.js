import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const { Pool } = pkg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function generateSitemap() {
  try {
    // Connect to database
    const client = await pool.connect();

    // Fetch all published cafe pages from your database
    // Adjust the query based on your actual database schema
    const cafeQuery = `
      SELECT slug_name
      FROM cafes 
    `;

    const cafeResult = await client.query(cafeQuery);

    // Fetch any location/region pages if you have them
    const locationQuery = `
        select city_slug
            from city
        group by city_slug
    `;

    const locationResult = await client.query(locationQuery);

    const featureQuery = `
        select feature_slug
            from features
    `;

    const featureResult = await client.query(featureQuery);

    // Create sitemap links array starting with static pages
    const links = [{ url: '/', changefreq: 'daily', priority: 1.0 }];

    // Add cafe pages to links
    cafeResult.rows.forEach((row) => {
      links.push({
        url: `/cafe/${row.slug_name}`,
        // lastmod: new Date(row.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      });
    });

    // Add location pages if you have them
    locationResult.rows.forEach((row) => {
      links.push({
        url: `/cafes?city=${row.city_slug}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    });

    featureResult.rows.forEach((row) => {
      links.push({
        url: `/cafes?features=${row.feature_slug}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    });

    // Create a stream to write to
    const stream = new SitemapStream({
      hostname: 'https://ngebir-dimana.com',
    });

    // Return a promise that resolves with your XML string
    const data = await streamToPromise(Readable.from(links).pipe(stream));

    // Write sitemap to file
    fs.writeFileSync('sitemap.xml', data.toString());
    console.log('Sitemap generated successfully');

    // Release the client back to the pool
    client.release();
  } catch (err) {
    console.error('Error generating sitemap:', err);
  } finally {
    // Close the pool when done
    await pool.end();
  }
}

// Execute the function
generateSitemap().catch(console.error);
