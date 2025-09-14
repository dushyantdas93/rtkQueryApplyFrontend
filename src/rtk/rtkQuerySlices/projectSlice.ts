import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/axiosBaseQuert";

export interface Project {
  entryId: string;
  projectName: string;
}

interface ProjectResponse {
  data: {
    content: Project[];
    totalElements: number;
  };
}

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getAllProjects: builder.query<
      ProjectResponse,
      { page: number; size: number; info: any }
    >({
      query: ({ page, size, info }) => ({
        url: `/public/project-details/search-v3?page=${page}&size=${size}`,
        method: "POST",
        data: info,
      }),
      providesTags: ["Project"],
    }),

    createProject: builder.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "/projects",
        method: "POST",
        body: project,
      }),
      async onQueryStarted(newProject, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patch = dispatch(
          projectApi.util.updateQueryData(
            "getAllProjects",
            { page: 0, size: 10, info: {} },
            (draft) => {
              draft.data.content.unshift({
                entryId: Date.now().toString(),
                projectName: newProject.projectName || "New Project",
              });
              draft.data.totalElements += 1;
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo(); // rollback if API fails
        }
      },
      invalidatesTags: ["Project"],
    }),

    updateProject: builder.mutation<
      Project,
      { entryId: string; updates: Partial<Project> }
    >({
      query: ({ entryId, updates }) => ({
        url: `/projects/${entryId}`,
        method: "PUT",
        body: updates,
      }),
      async onQueryStarted({ entryId, updates }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          projectApi.util.updateQueryData(
            "getAllProjects",
            { page: 0, size: 10, info: {} },
            (draft) => {
              const item = draft.data.content.find(
                (p) => p.entryId === entryId
              );
              if (item) Object.assign(item, updates);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Project"],
    }),

    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (entryId) => ({
        url: `public/project-details/bulk-delete`,
        method: "DELETE",
        body: [entryId], // use body instead of data (if using fetchBaseQuery)
      }),
      async onQueryStarted(entryId, { dispatch, queryFulfilled }) {
        // Loop through all possible cache entries (pages)
        const queries = projectApi.util.selectInvalidatedBy(
          dispatch.getState(),
          [{ type: "Project", id: "LIST" }]
        );

        const patches = queries.map(({ queryCacheKey }) =>
          dispatch(
            projectApi.util.updateQueryData(
              "getAllProjects",
              // Pass the actual args used for this cache
              JSON.parse(queryCacheKey.split("/")[1]),
              (draft: any) => {
                draft.data.content = draft.data.content.filter(
                  (p: any) => p.entryId !== entryId
                );
                draft.data.totalElements -= 1;
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export const {
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
