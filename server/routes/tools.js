const express = require('express');
const router = express.Router();
const toolStore = require('../toolStore');

router.get('/tools', async (req, res) => {
  try {
    const tools = await toolStore.listTools();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tools', async (req, res) => {
  const name = req.body.name?.trim();
  const description = req.body.description?.trim();

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    const tool = await toolStore.createTool({ name, description });
    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/tools/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid tool id' });
  }

  try {
    const updatedTool = await toolStore.toggleToolAvailability(id);
    if (!updatedTool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.json(updatedTool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
