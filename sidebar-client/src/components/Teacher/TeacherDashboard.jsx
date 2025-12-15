import React from "react";
import ProjectQueueCard from "./ProjectQueue/ProjectQueue";
import MyRoadmap from "./MyRoadmap/MyRoadmap";
import Ignite from "../Shared/Ignite/Ignite";

export default function TeacherDashboard() {
  return (
    <>
      <ProjectQueueCard />
      <MyRoadmap />
      <Ignite />

      {/* Add more components here as needed */}
    </>
  );
}