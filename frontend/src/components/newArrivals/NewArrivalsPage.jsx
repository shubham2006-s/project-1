import React from "react";
import NewArrivals from "./NewArrivals";

const NewArrivalsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NewArrivals limit={50} showHeader />
    </div>
  );
};

export default NewArrivalsPage;

