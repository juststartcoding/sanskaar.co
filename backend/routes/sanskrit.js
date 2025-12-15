const express = require("express");
const Course = require("../models/Course");
// TEMP: const auth = require('../middleware/auth');

const router = express.Router();

router.get("/courses", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

router.get("/courses/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json(course);
});

router.post("/courses", async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.status(201).json(course);
});

router.post("/enroll/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.enrollments.push({ userId: req.user.id, progress: 0 });
  await course.save();
  res.json({ message: "Enrolled" });
});

router.put("/progress/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  const enrollment = course.enrollments.find(
    (e) => e.userId.toString() === req.user.id
  );
  enrollment.progress = req.body.progress;
  await course.save();
  res.json({ message: "Progress updated" });
});

module.exports = router;
