import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import draw from "./utilities";
import * as mobilenet from "@tensorflow-models/mobilenet";
import swal from "sweetalert";
import * as posenet from "@tensorflow-models/posenet";
import DoughnutChart from "./DoughnutChart";

const Procter = ({ onChartDataChange }) => {
  const [tab_change, setTabChange] = useState(0);
  const [key_press, setKeyPress] = useState(0);
  const [mobileCount, setMobileCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [screenCount, setScreenCount] = useState(0);
  const [faceNotVisible, setFaceNotVisible] = useState(0);
  const [speakCount, setSpeakCount] = useState(0);

  const chartData = {
    tab_change: tab_change,
    key_press: key_press,
    speakCount: speakCount,
    mobileCount: mobileCount,
    downCount: downCount,
    leftCount: leftCount,
    rightCount: rightCount,
    screenCount: screenCount,
    faceNotVisible: faceNotVisible,
  };
  

  //disable right click
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require("@tensorflow-models/blazeface");

  let model, net, mobilenetModel;

  const loadModels = async () => {
    model = await blazeface.load();
    net = await posenet.load();
    mobilenetModel = await mobilenet.load();
    console.log("Proctor Model is Loaded..");
  };

  //face detection start
  const runFacedetection = async () => {
    await loadModels();

    //speak count
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const source = audioContext.createMediaStreamSource(microphone);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    setInterval(() => {
      detect(model, net, mobilenetModel, analyser, dataArray);
    }, 1000);
  };
  const returnTensors = false;
  let speaking = false;

  const detect = async (model, net, mobilenetModel, analyser, dataArray) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // const threshold = 0.2; // to adjust this value to set the mouth open threshold

      //Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections
      const prediction = await model.estimateFaces(video, returnTensors);
      const mobilePrediction = await mobilenetModel.classify(video);

      //logs the how many user are in ther frame
      console.log(prediction.length + " user are present");
      if (prediction.length > 1) {
        swal(
          `${prediction.length} people detected`,
          "Action has been Recorded",
          "error"
        );
        console.log("second user detected");
      }

      setTimeout(function () {
        if (prediction.length === 0) {
          setFaceNotVisible(faceNotVisible + 1);
          if (faceNotVisible >= 5) {
            swal("Face Not Visible", "Action has been Recorded", "error");
          }
        }
      }, 5000);

      // console.log(mobilePrediction[0].className);
      if (mobilePrediction[0].className.toLowerCase().includes("mobile")) {
        setMobileCount(mobileCount + 1);
        if (mobileCount === 20) {
          swal(
            "Cell phone has been detected",
            "Action has been Recorded",
            "error"
          );
        }
      }
      //pose
      const pose = await net.estimateSinglePose(video);
      const leftEye = pose.keypoints[1];
      const rightEye = pose.keypoints[2];
      const screenMidpoint = video.width / 2;
      if (
        leftEye.position.x <= screenMidpoint &&
        rightEye.position.x <= screenMidpoint
      ) {
        setRightCount(rightCount + 1);
      } else if (
        leftEye.position.x >= screenMidpoint &&
        rightEye.position.x >= screenMidpoint
      ) {
        setLeftCount(leftCount + 1);
      } else {
        setScreenCount(screenCount + 1);
      }

      //to detect if user is seeing down
      const nose = pose.keypoints[0];
      const noseY = nose.position.y;
      const noseThreshold = videoHeight * 0.7;
      if (noseY > noseThreshold) {
        setDownCount(downCount + 1);
      }

      //to detect whether user is speaking or not
      analyser.getByteTimeDomainData(dataArray);
      const volume = Math.max(...dataArray) - 128;
      if (volume > 15) {
        if (!speaking) {
          speaking = true;
          setSpeakCount(speakCount + 1);
        }
      } else {
        speaking = false;
      }

      //if tab changes
      if (document.hidden) {
        // the page is hidden
        setTabChange(tab_change + 1);
        swal("Changed Tab Detected", "Action has been Recorded", "error");
      }

      //to detect ctrl key press
      document.addEventListener("keydown", function (event) {
        if (event.ctrlKey) {
          setKeyPress(key_press + 1);
          swal("Ctrl Key Press Detected!", "Action has been Recorded", "error");
        }
      });

      //to detect alt key press
      document.addEventListener("keydown", function (event) {
        if (event.altKey) {
          setKeyPress(key_press + 1);
          swal("Alt Key Press Detected!", "Action has been Recorded", "error");
        }
      });
    }
  };

  runFacedetection();

  return (
    <div>
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            top: 100,
            left: 0,
            right: 80,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            top: 100,
            left: 0,
            right: 80,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        {/* <DoughnutChart chartData={chartData}/> */}
      </header>
    </div>
  );
};

export default Procter;
