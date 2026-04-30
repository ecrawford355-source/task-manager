const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks for a board
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignees')
      .populate('comments.author')
      .sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, board, column, priority, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      board,
      column,
      priority,
      dueDate
    });
    await task.save();
    await task.populate('assignees');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    Object.assign(task, req.body);
    task.updatedAt = Date.now();
    await task.save();
    await task.populate('assignees');
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.comments.push({
      author: req.user.id,
      text
    });
    await task.save();
    await task.populate('comments.author');
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log time on task
router.post('/:id/time', auth, async (req, res) => {
  try {
    const { minutes } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.timeLogged += minutes;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
