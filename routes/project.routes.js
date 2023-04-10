const router = require("express").Router();

const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Task = require("../models/Task.model");



// POST /api/projects
router.post("/projects", (req, res, next) => {
    const { title, description } = req.body;

    Project.create({ title, description, tasks: [] })
        .then(response => res.status(201).json(response))
        .catch(err => {
            console.log("error creating a new project", err);
            res.status(500).json({
                message: "error creating a new project",
                error: err
            });
        })
});


// GET /api/projects
router.get("/projects", (req, res, next) => {
    Project.find()
        .populate("tasks")
        .then(projectsFromDB => {
            res.json(projectsFromDB);
        })
        .catch(err => {
            console.log("error getting list of projects", err);
            res.status(500).json({
                message: "error getting list of projects",
                error: err
            });
        })
});




// GET /api/projects/:projectId
router.get('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    // Each Project document has a `tasks` array holding `_id`s of Task documents
    // We use .populate() method to get swap the `_id`s for the actual Task documents
    Project.findById(projectId)
        .populate('tasks')
        .then(project => res.json(project))
        .catch(err => {
            console.log("error getting details of a project", err);
            res.status(500).json({
                message: "error getting details of a project",
                error: err
            });
        })
});



// PUT /api/projects/:projectId
router.put('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Project.findByIdAndUpdate(projectId, req.body, { new: true })
        .then((updatedProject) => res.json(updatedProject))
        .catch(error => res.json(error));
});


// DELETE /api/projects/:projectId  
router.delete('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Project.findByIdAndRemove(projectId)
    .then( deletedProject => {
      return Task.deleteMany( { _id: { $in: deletedProject.tasks } } );
    })
    .then(() => res.json({ message: `Project with id ${projectId} & all associated tasks were removed successfully.` }))
    .catch(error => res.status(500).json(error));
});




module.exports = router;
