// test-campaign-debug.js
const express = require('express');
const router = express.Router();
const pool = require('./config/db');

// Add debug routes
router.get('/campaigns', async (req, res) => {
  try {
    const [campaigns] = await pool.query('SELECT * FROM campaigns');
    res.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaign/:id', async (req, res) => {
  try {
    const [campaign] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (campaign.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json({ campaign: campaign[0] });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-campaign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goal, imageUrl, category } = req.body;
    
    console.log(`Manual campaign update for ID ${id}:`, req.body);
    
    const [result] = await pool.query(
      'UPDATE campaigns SET title = ?, description = ?, goal = ?, imageUrl = ?, category = ? WHERE id = ?',
      [title, description, goal, imageUrl, category, id]
    );
    
    console.log('Update result:', result);
    
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Campaign updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Campaign not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
