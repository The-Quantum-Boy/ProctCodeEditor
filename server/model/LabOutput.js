const mongoose = require("mongoose");
const labOutSchema = mongoose.Schema({
  profileId: {
    type: String,
  },
  labNo: {
    type: Number,
  },
  subjectName: {
    type: String,
  },
  code: {
    type: String,
  },
  output: {
    type: String,
  },
  progLang: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  procterData: {
    type: {
      tab_change: {
        type: Number,
        default: 0,
      },
      key_press: {
        type: Number,
        default: 0,
      },
      mobileCount: {
        type: Number,
        default: 0,
      },
      downCount: {
        type: Number,
        default: 0,
      },
      leftCount: {
        type: Number,
        default: 0,
      },
      rightCount: {
        type: Number,
        default: 0,
      },
      screenCount: {
        type: Number,
        default: 0,
      },
      faceNotVisible: {
        type: Number,
        default: 0,
      },
      speakCount: {
        type: Number,
        default: 0,
      },
    },
    default: {
      tab_change: 0,
      key_press: 0,
      mobileCount: 0,
      downCount: 0,
      leftCount: 0,
      rightCount: 0,
      screenCount: 0,
      faceNotVisible: 0,
      speakCount: 0,
    },
  },
});

module.exports = mongoose.model("LabOutput", labOutSchema);
