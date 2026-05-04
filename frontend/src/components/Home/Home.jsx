import React, { useEffect } from "react";
import axios from "axios";
import Products from "../products/Products";
const Home = () => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user/profile");
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [])
  return (
    <Products />
  );
}

export default Home