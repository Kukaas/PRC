import React from "react";
import Header from "../components/Header.jsx";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default PublicLayout;
