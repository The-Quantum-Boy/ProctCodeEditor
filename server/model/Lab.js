const mongoose = require("mongoose");

const LabSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  aim: {
    type: String,
    required: true,
  },
  labNo: {
    type: Number,
    required: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  outOfMarks: {
    type: Number,
    required: true,
  },
  minutes: {
    type: Number,
    required: true,
  },
  rules: {
    type: Array,
    required: true,
  },
  year: {
    type: String,
    enum: ["I", "II", "III", "IV"],
    required: true,
  },
  className: {
    type: String,
    enum: ["IT", "CS"],
    required: true,
  },
  assignedTo: {
    type: Array,
  },
  attempted: {
    type: Boolean,
    default: false,
  },
  submitBy: [
    {
      profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      correct: {
        type: Boolean,
        default: false,
      },
    },
  ],
  startDate: {
    type: Date,
  },
  startTime: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Lab", LabSchema);
