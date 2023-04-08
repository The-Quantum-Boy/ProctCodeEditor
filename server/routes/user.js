const { response } = require("express");
const express = require("express");
const moment = require("moment");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Lab = require("../model/Lab");
const LabOut = require("../model/LabOutput");
const LabOutput = require("../model/LabOutput");

const router = express.Router();

var compiler = require("compilex");
compiler.flush(function () {
  console.log("All temporary files flushed !");
});
var options = { stats: true }; //prints stats on console
compiler.init(options);

require("../db/conn");

router.get("/", (req, res) => {
  res.send(`hello world from the server router js`);
});

router.post("/fetchlab", async (req, res) => {
  console.log("this is form user route");
  const { rollNo, email, labNo } = req.body;

  console.log(req.body);

  try {
    const startDate = moment(Date.now()).format("YYYY-MM-DD"); // get the current date in 'YYYY-MM-DD' format
    console.log("startDate", startDate);
    const userExits = await User.findOne({ email: email });
    console.log("userExists", userExits);
    if (!userExits) {
      return res.status(423).json({ error: "user is not present" });
    } else {
      const year = userExits.section;
      console.log("year", year);
      try {
        const lab = await Lab.findOne({
          labNo: parseInt(labNo),
          year,
        });
        console.log("lab", lab);
        if (!lab) {
          return res.status(404).json({ error: "lab not found" });
        }
        return res.status(200).json({ lab, user: userExits });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/submitLab", async (req, res) => {
  console.log("i am in submit lab");
  try {
    const {
      profileId,
      labNo,
      subjectName,
      code,
      output,
      progLang,
      procterData,
    } = req.body;

    const labOutput = new LabOutput({
      profileId,
      labNo,
      subjectName,
      code,
      output,
      progLang,
      procterData,
    });

    const savedLabOutput = await labOutput.save();

    const lab = await Lab.findOne({ labNo, subjectName });

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    lab.submitBy.push({ profileId, correct: false });
    lab.attempted = true;

    await lab.save();

    return res.status(200).json({ message: "Lab output saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/execute", (req, res) => {
  const { lang, input, code } = req.body;

  try {
    // compiler.flush(function(){
    //     console.log('All temporary files flushed !');
    // });

    if (lang === "C" || lang === "Cpp") {
      var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
      if (input === "") {
        compiler.compileCPP(envData, code, function (data) {
          console.log(data);
          res.send(data);
        });
        // compiler.flush(function(){
        //     console.log('All temporary files flushed !');
        // });
      } else {
        compiler.compileCPPWithInput(envData, code, input, function (data) {
          res.send(data);
        });
        // compiler.flush(function(){
        //     console.log('All temporary files flushed !');
        // });
      }
    } else if (lang === "Python") {
      var envData = { OS: "windows" };
      if (input === "") {
        compiler.compilePython(envData, code, function (data) {
          res.send(data);
        });
        // compiler.flush(function(){
        //     console.log('All temporary files flushed !');
        // });
      } else {
        compiler.compilePythonWithInput(envData, code, input, function (data) {
          res.send(data);
        });
        // compiler.flush(function(){
        //     console.log('All temporary files flushed !');
        // });
      }
    } else if (lang === "Java") {
      //  compiler.flush(function(){
      //         console.log('All temporary files flushed !');
      //     });
      var envData = { OS: "windows", options: { timeout: 10000 } };
      // compiler.init(options);
      if (input === "") {
        compiler.compileJava(envData, code, function (data) {
          res.send(data);
        });
        // compiler.flush(function(){
        //     console.log('All temporary files flushed !');
        // });
      } else {
        compiler.compileJavaWithInput(envData, code, input, function (data) {
          res.send(data);
        });
      }
    }
  } catch (error) {
    console.log(error);
    compiler.flush(function () {
      console.log("All temporary files flushed !");
    });
    res.send({
      error: error,
    });
  }
});

module.exports = router;
