import React from "react";
import ProjectQueueCard from "./ProjectQueue/ProjectQueue";
import ProjectReview from "./ProjectReview/ProjectReview";
import MyRoadmap from "./MyRoadmap/MyRoadmap";
import Ignite from "../Shared/Ignite/Ignite";

export default function TeacherDashboard() {
  return (
    <>
      <ProjectQueueCard />
      <ProjectReview/>
      <MyRoadmap />
      <Ignite />

      {/* Add more components here as needed */}
    </>
  );
}