const Task = require('../models/Task');
const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(500).required(),
  status: Joi.string().valid('à faire', 'en cours', 'terminé'),
  assignedTo: Joi.string()
});

// @desc    Obtenir toutes les tâches
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    let query;
    // Si admin, voir toutes les tâches, sinon seulement les siennes ou assignées
    if (req.user.role === 'admin') {
      query = Task.find().populate('user assignedTo', 'name email');
    } else {
      query = Task.find({
        $or: [{ user: req.user.id }, { assignedTo: req.user.id }]
      }).populate('user assignedTo', 'name email');
    }

    const tasks = await query;
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Créer une tâche
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    req.body.user = req.user.id;
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mettre à jour une tâche
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Tâche non trouvée' });

    // Vérifier la propriété (sauf si admin)
    if (task.user.toString() !== req.user.id && req.user.role !== 'admin' && task.assignedTo?.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Supprimer une tâche
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Tâche non trouvée' });

    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
