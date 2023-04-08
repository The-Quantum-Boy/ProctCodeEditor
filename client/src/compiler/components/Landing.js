import React, { useCallback, useRef, useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import * as mobilenet from "@tensorflow-models/mobilenet";
import swal from "sweetalert";
import * as posenet from "@tensorflow-models/posenet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Webcam from "react-webcam";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";

import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import { useLocation } from "react-router-dom";
import Timer from "../../Timer/Timer";
import Procter from "../../Proctering/Procter";

const javascriptDefault = `
   #include<iostream>

   using namespace std;

   int main(){
    cout<<"Hello world!";
    return 0;
   }
`;

const Landing = () => {
  const { state } = useLocation();
  const data = state?.data.lab;
  const user = state?.data.user;
  console.log(user, "user");
  console.log("data", data);
  //  const [timeRemaining, setTimeRemaining] = useState(data.minutes * 60);

  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

  // chartdata
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

  //to handle procter chartData

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  //timer

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setTimeRemaining((prevTime) => prevTime - 1);
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

  // const formatTime = (time) => {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = time % 60;
  //   return `${minutes.toString().padStart(2, "0")}:${seconds
  //     .toString()
  //     .padStart(2, "0")}`;
  // };

  // useEffect(() => {
  //   if (timeRemaining === 0) {
  //     handleSubmit(code, outputDetails, language);
  //   }
  // }, [timeRemaining]);

  const handleSubmit = async (code, outputDetails, language) => {
    const out =
      atob(outputDetails.stdout) !== null
        ? `${atob(outputDetails.stdout)}`
        : null;
    const lab = {
      profileId: user._id,
      labNo: data.labNo,
      subjectName: data.subjectName,
      code: code,
      output: out,
      progLang: language.label,
      procterData: chartData,
    };

    console.log("submited lab :", lab);

    try {
      const res = await fetch("http://localhost:8001/submitLab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lab),
      });

      const data = await res.json();
      console.log("response", data);

      if (res.status === 200) {
        console.log("lab submited successfully");
      }
    } catch (error) {
      console.log(error);
    }

    //   console.log(chartData); //chartData
    //   console.log(code); //code
    //   console.log(
    //     atob(outputDetails.stdout) !== null
    //       ? `${atob(outputDetails.stdout)}`
    //       : null
    //   ); //output
    //   console.log(language); //language object
  };

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: "/",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  /**
   *
   */
  //procter code goes here
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

    const intervalId = setInterval(() => {
      detect(model, net, mobilenetModel, analyser, dataArray);
    }, 600);

    //to stop execution after perticular time
    setTimeout(() => {
      clearInterval(intervalId);
    }, data.minutes * 60 * 1000);
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
          swal("Face Not Visible", "Action has been Recorded", "error");
        }
      }, 3000);

      // console.log(mobilePrediction[0].className);
      if (mobilePrediction[0].className.toLowerCase().includes("mobile")) {
        setMobileCount(mobileCount + 1);
        swal(
          "Cell phone has been detected",
          "Action has been Recorded",
          "error"
        );
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
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div
        className="flex flex-col  rounded-md text-white p-4  m-4"
        style={{ backgroundColor: "black" }}
      >
        <div className="flex w-full space-x-2">
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Lab No</b>
            </h2>
            {data.labNo}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Aim</b>
            </h2>
            {data.aim}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Subject</b>
            </h2>
            {data.subjectName}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Marks</b>
            </h2>
            {data.outOfMarks}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Time</b>
            </h2>
            {data.minutes} minutes {/* {formatTime(timeRemaining)} */}
            {/* <Timer minutes={data.minutes} /> */}
          </div>
        </div>
      </div>

      <div> {/* <Procter updateChartData={updateChartData}  />{" "} */}</div>
      <div className="flex flex-row space-x-4 items-start px-4 ">
        <div className="flex flex-col w-full h-[620px] justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        <div className="right-container flex w-1/3 flex-col ">
          <div className="flex flex-row">
            <div className="">
              <LanguagesDropdown onSelectChange={onSelectChange} />
            </div>
          </div>
          <OutputWindow outputDetails={outputDetails} />

          <CustomInput
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
          {/*  */}
          <div className="flex gap-8">
            <Button
              variant="contained"
              onClick={handleCompile}
              disabled={!code}
              style={{ marginTop: "5px", width: "100px", display: "flex" }}
            >
              {processing ? "Executing..." : "Run"}
            </Button>
            <Button
              variant="contained"
              style={{ marginTop: "5px", width: "100px", display: "flex" }}
              onClick={() => handleSubmit(code, outputDetails, language)}
            >
              Submit
            </Button>
          </div>

          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
      <div>
        <Webcam
          ref={webcamRef}
          style={{
            width: 1,
            height: 1,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: 1,
            height: 1,
          }}
        />
        {/* <DoughnutChart chartData={chartData}/> */}
      </div>
    </>
  );
};
export default Landing;
