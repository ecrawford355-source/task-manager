import React, { useState } from 'react';
import api from '../utils/api';

function KanbanBoard({ board, tasks, onTasksUpdate }) {
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    column: board.columns?.[0]?.name || 'To Do',
    priority: 'medium'
  });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...newTaskData,
        board: board._id
      });
      setNewTaskData({
        title: '',
        description: '',
        column: board.columns?.[0]?.name || 'To Do',
        priority: 'medium'
      });
      setShowNewTask(false);
      onTasksUpdate();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getTasksByColumn = (columnName) => {
    return tasks.filter(task => task.column === columnName);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {showNewTask && (
        <form onSubmit={handleCreateTask} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                placeholder="Enter task title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
              <select
                value={newTaskData.column}
                onChange={(e) => setNewTaskData({ ...newTaskData, column: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {board.columns?.map((col) => (
                  <option key={col._id} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                placeholder="Enter task description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setShowNewTask(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showNewTask && (
        <button
          onClick={() => setShowNewTask(true)}
          className="mb-8 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + New Task
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {board.columns?.map((column) => (
          <div key={column._id} className="bg-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-gray-800">{column.name}</h3>
            <div className="space-y-3">
              {getTasksByColumn(column.name).map((task) => (
                <div key={task._id} className="bg-white rounded-lg p-3 shadow-sm">
                  <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                  {task.description && <p className="text-xs text-gray-600 mb-2">{task.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.timeLogged > 0 && (
                      <span className="text-xs text-gray-500">⏱️ {task.timeLogged}m</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;
