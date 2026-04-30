const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const auth = require('../middleware/auth');

// Get all boards for user
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    }).populate('owner members');
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create board
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const board = new Board({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
      columns: [
        { _id: new require('mongoose').Types.ObjectId(), name: 'To Do', order: 1 },
        { _id: new require('mongoose').Types.ObjectId(), name: 'In Progress', order: 2 },
        { _id: new require('mongoose').Types.ObjectId(), name: 'Done', order: 3 }
      ]
    });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single board
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner members');
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(board, req.body);
    board.updatedAt = Date.now();
    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to board
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!board.members.includes(userId)) {
      board.members.push(userId);
      await board.save();
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
