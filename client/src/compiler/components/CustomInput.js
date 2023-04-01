import React from "react";
import { classnames } from "../utils/general";

const CustomInput = ({ customInput, setCustomInput }) => {
  return (
    <>
      {" "}
      <textarea
        rows="5"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Custom input`}
        className={classnames(
          "w-full border-2  z-10 px-4 py-2 hover:shadow transition duration-200  mt-2 h-36 bg-[#1e293b] rounded-md text-white font-normal text-sm overflow-y-auto"
        )}
      ></textarea>
    </>
  );
};

export default CustomInput;
