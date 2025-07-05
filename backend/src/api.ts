import express from 'express';
import { getProfiles, updateProfile, deleteProfile, getAnalytics } from './services/database';
import { UserProfile } from './types';

const router = express.Router();

// GET /api/profiles - Fetch all profiles
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await getProfiles();
    res.json(profiles);
  } catch (error) {
    console.error('API Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

// GET /api/analytics - Fetch analytics data
router.get('/analytics', async (req, res) => {
    try {
        const analyticsData = await getAnalytics();
        res.json(analyticsData);
    } catch (error) {
        console.error('API Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
});

// PUT /api/profiles/:id - Update a profile
router.put('/profiles/:id', async (req, res) => {
  const { id } = req.params;
  const profileData: UserProfile = req.body;
  try {
    const updatedProfile = await updateProfile(Number(id), profileData);
    res.json(updatedProfile);
  } catch (error) {
    console.error(`API Error updating profile ${id}:`, error);
    res.status(500).json({ message: `Error updating profile ${id}` });
  }
});

// DELETE /api/profiles/:id - Delete a profile
router.delete('/profiles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteProfile(Number(id));
    res.status(204).send(); // No Content
  } catch (error) {
    console.error(`API Error deleting profile ${id}:`, error);
    res.status(500).json({ message: `Error deleting profile ${id}` });
  }
});

export default router;
