import React from "react";
import logo from "../../imgs/logo.png";

const Banner = () => {
  return (
    <div className="banner text-white">
      <div className="container p-4 text-center">
        <img src={logo} />
        <p>A place to get the cool stuff.</p>
      </div>
    </div>
  );
};

export default Banner;
