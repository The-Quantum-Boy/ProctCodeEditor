import React from "react";

const OutputDetails = ({ outputDetails }) => {
  return (
    <div className="metrics-container h-28  p-3 shadow-md mt-4 flex  space-x-10">
      <p className="text-sm">
        Status:{" "}
        <div className="font-semibold px-2 py-1 mt-5 rounded-md bg-gray-100">
          {outputDetails?.status?.description}
        </div>
      </p>
      <p className="text-sm">
        Memory:{" "}
        <div className="font-semibold px-2 py-1 mt-5 rounded-md bg-gray-100">
          {outputDetails?.memory}
        </div>
      </p>
      <p className="text-sm">
        Time:{" "}
        <div className="font-semibold px-2 py-1 mt-5 rounded-md bg-gray-100">
          {outputDetails?.time}
        </div>
      </p>
    </div>
  );
};

export default OutputDetails;
