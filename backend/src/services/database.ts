
import { Pool } from 'pg';
import { UserProfile } from '../types';
import { ProfileData } from '../types';

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. The application cannot start.');
}

const pool = new Pool({
  connectionString: connectionString,
});

// SQL statement to create the profiles table if it doesn't exist
// Using TEXT[] for photo and video URLs to store multiple links
// Removed redundant hasPhoto/hasVideo boolean columns
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    date TIMESTAMPTZ DEFAULT NOW(),
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    age INTEGER,
    height INTEGER,
    weight INTEGER,
    measurements VARCHAR(255),
    about TEXT,
    "photoUrl" TEXT[],
    "videoUrl" TEXT[],
    "adminNotes" TEXT
  );
`;

// Initialize the database by creating the table
export const initDb = async () => {
  await pool.query(createTableQuery);
};

// CRUD and other functions

export const createProfile = async (data: ProfileData): Promise<UserProfile> => {
  const { name, age, height, weight, measurements, about, username, photoUrl, videoUrl } = data;
  
  const query = `
    INSERT INTO profiles (name, age, height, weight, measurements, about, username, "photoUrl", "videoUrl")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [name, age, height, weight, measurements, about, username, photoUrl, videoUrl];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getProfiles = async (): Promise<UserProfile[]> => {
  const result = await pool.query('SELECT * FROM profiles ORDER BY date DESC');
  return result.rows;
};

export const updateProfile = async (id: number, data: Partial<UserProfile>): Promise<UserProfile> => {
    const { name, age, height, weight, measurements, about, adminNotes, photoUrl, videoUrl } = data;

    const query = `
        UPDATE profiles
        SET name = $1, age = $2, height = $3, weight = $4, measurements = $5, about = $6, "adminNotes" = $7, "photoUrl" = $8, "videoUrl" = $9
        WHERE id = $10
        RETURNING *;
    `;
    const values = [name, age, height, weight, measurements, about, adminNotes, photoUrl, videoUrl, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        throw new Error(`Profile with id ${id} not found`);
    }
    return result.rows[0];
};

export const deleteProfile = async (id: number): Promise<void> => {
    const result = await pool.query('DELETE FROM profiles WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        throw new Error(`Profile with id ${id} not found`);
    }
};

export const getAnalytics = async () => {
    const analyticsQuery = `
        SELECT
            (SELECT COUNT(*) FROM profiles) AS "totalProfiles",
            (SELECT AVG(age) FROM profiles WHERE age IS NOT NULL) AS "avgAge",
            (SELECT COUNT(*) FROM profiles WHERE "photoUrl" IS NOT NULL AND array_length("photoUrl", 1) > 0) AS "profilesWithPhoto",
            (SELECT COUNT(*) FROM profiles WHERE "videoUrl" IS NOT NULL AND array_length("videoUrl", 1) > 0) AS "profilesWithVideo",
            (
                SELECT json_agg(daily_counts)
                FROM (
                    SELECT 
                        DATE(date) AS date,
                        COUNT(*) AS count
                    FROM profiles
                    WHERE date >= NOW() - INTERVAL '7 days'
                    GROUP BY DATE(date)
                    ORDER BY DATE(date)
                ) AS daily_counts
            ) AS "dailyCounts"
    `;
    const result = await pool.query(analyticsQuery);
    const data = result.rows[0];
    
    // Ensure dailyCounts is an array, even if it's null from the DB
    return {
        ...data,
        totalProfiles: parseInt(data.totalProfiles || '0', 10),
        profilesWithPhoto: parseInt(data.profilesWithPhoto || '0', 10),
        profilesWithVideo: parseInt(data.profilesWithVideo || '0', 10),
        dailyCounts: data.dailyCounts || []
    };
};
