import React from "react";

const Banner = ({ appName, token }) => {
  if (token) {
    return null;
  }
  return (
    <div className="banner bg-secondary text-white">
      <div className="container p-4 text-center">
        <h1>{appName}</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
  );
};

export default Banner;
