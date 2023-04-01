import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";

import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import { useLocation } from "react-router-dom";
import Timer from "../../Timer/Timer";

const javascriptDefault = `
   #include<iostream.h>

   using namespace std;

   int main(){

   }
`;

const Landing = () => {
  const { state } = useLocation();
  const data = state?.data.lab;
  console.log("data", data);

  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

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
              <b>Timer</b>
            </h2>
            <Timer minutes={data.minutes} />
          </div>
        </div>
      </div>

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
            >
              Submit
            </Button>
          </div>

          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};
export default Landing;
