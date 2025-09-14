import React, { useState, useEffect, useRef } from "react";
import {
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "../rtk/rtkQuerySlices/projectSlice";

import type { Project } from "../rtk/rtkQuerySlices/projectSlice";

export default function ProjectList2() {
  const [page, setPage] = useState(0);
  const size = 20;
  const info = {};

  const { data, isLoading, isFetching } = useGetAllProjectsQuery(
    { page, size, info },
    { skip: page === -1 }
  );

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Merge new data
  useEffect(() => {
    if (data?.data?.content) {
      setAllProjects((prev) => {
        const ids = new Set(prev.map((p) => p.entryId));
        const newItems = data.data.content.filter((p) => !ids.has(p.entryId));
        return [...prev, ...newItems];
      });

      // ✅ Check if last page
      if (data?.data?.last) {
        setHasMore(false);
      }
    }
  }, [data]);

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // ✅ Infinite scroll observer
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 } // trigger earlier
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [isFetching, hasMore]);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-white p-2 border-b">
        <h1 className="text-xl font-bold">Projects</h1>
        <button
          onClick={() =>
            createProject({ projectName: `New Project ${Date.now()}` })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Project
        </button>
      </div>

      {/* Projects List */}
      {isLoading && <p>Loading...</p>}
      <ul className="space-y-2">
        {allProjects.map((project) => (
          <li
            key={project.entryId}
            className="flex justify-between items-center border p-2 rounded-lg"
          >
            <span>{project.projectName}</span>
            <div className="space-x-2">
              <button
                onClick={() =>
                  updateProject({
                    entryId: project.entryId,
                    updates: { projectName: "Updated Project" },
                  })
                }
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Update
              </button>
              <button
                onClick={() => deleteProject(project.entryId)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Loader */}
      <div
        ref={loaderRef}
        className="h-12 flex items-center justify-center text-gray-500"
      >
        {isFetching && <p>Loading more...</p>}
        {!hasMore && <p className="text-gray-400">No more projects</p>}
      </div>
    </div>
  );
}
