import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/axiosBaseQuert";

// 🟢 Types
export interface Task {
  id: string;
  title: string;
  description?: string;
}

export interface ProjectFilter {
  projectName: string | null;
  projectType: string[] | null;
  propertyArea: string[] | null;
  developer: string[] | null;
  approval: string | null;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  developer: string;
  approval: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const searchV3 = createApi({
  reducerPath: "searchV3",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["SearchV3"],
  endpoints: (builder) => ({
    getAllProject: builder.query<
      PagedResponse<Project>, // Response type
      { page: number; size: number; filter?: ProjectFilter } // Arg type
    >({
      query: ({
        page = 0,
        size = 10,
        filter = {
          projectName: null,
          projectType: null,
          propertyArea: null,
          developer: null,
          approval: "APPROVED",
        },
      }) => ({
        url: "/public/project-details/search-v3",
        method: "POST",
        params: { page, size },
        data: filter,
      }),
      providesTags: ["SearchV3"],
    }),

    // 🟢 Add Task
    addTask: builder.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "/tasks",
        method: "POST",
        data: task,
      }),
      invalidatesTags: ["SearchV3"],
      async onQueryStarted(task, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          searchV3.util.updateQueryData("getTasks", undefined, (draft) => {
            draft.unshift({ id: crypto.randomUUID(), ...task } as Task);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // 🟢 Update Task
    updateTask: builder.mutation<Task, Partial<Task> & { id: string }>({
      query: ({ id, ...updatedTask }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        data: updatedTask,
      }),
      invalidatesTags: ["SearchV3"],
      async onQueryStarted(
        { id, ...updatedTask },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          searchV3.util.updateQueryData("getTasks", undefined, (tasksList) => {
            const taskIndex = tasksList.findIndex((el) => el.id === id);
            if (taskIndex !== -1) {
              tasksList[taskIndex] = {
                ...tasksList[taskIndex],
                ...updatedTask,
              } as Task;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // 🟢 Delete Task
    deleteProject: builder.mutation<any, string[]>({
      query: (projectIds) => ({
        url: `/public/project-details/bulk-delete`,
        method: "DELETE",
        data: projectIds,
      }),
      invalidatesTags: ["SearchV3"],

      async onQueryStarted(projectIds, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          searchV3.util.updateQueryData(
            "getAllProject",
            undefined,
            (draft: any[]) => {
              console.log("🟢 Project IDs to remove:", projectIds);
            

              projectIds.forEach((id) => {
                const index = draft?.data?.content.findIndex((el: any) => el.entryId === id);
                if (index !== -1) {
                  console.log(`🗑 Removing project with entryId: ${id}`);
                  draft?.data?.content.splice(index, 1);
                } else {
                  console.warn(
                    `⚠️ Project with entryId ${id} not found in draft`
                  );
                }
              });

              console.log("📌 Draft after delete (optimistic):", [...draft]);
            }
          )
        );

        try {
          // ✅ wait for actual API call
          const  data  = await queryFulfilled;
      
        } catch (err) {
          console.error("❌ Delete failed, rolling back:", err);
          patchResult.undo();
        }
      },
    }),
  }),
});

// 🟢 Hooks
export const {
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteProjectMutation,
  useGetAllProjectQuery,
} = searchV3;
