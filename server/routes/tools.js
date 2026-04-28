const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/tools', async (req, res) => {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { id: 'desc' },
    });
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
    const tool = await prisma.tool.create({
      data: {
        name,
        description,
        isAvailable: true,
      },
    });

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
    const existingTool = await prisma.tool.findUnique({ where: { id } });

    if (!existingTool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    const updatedTool = await prisma.tool.update({
      where: { id },
      data: { isAvailable: !existingTool.isAvailable },
    });

    res.json(updatedTool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
