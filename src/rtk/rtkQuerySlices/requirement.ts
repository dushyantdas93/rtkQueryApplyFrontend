import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/axiosBaseQuery";

// 🟢 Types
export interface Requirement {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  customerId: string | number;
}

export interface UpdateRequirementPayload {
  id: string | number;
  updates: Partial<Requirement>;
  customerId: string | number;
}

export const requirementApi = createApi({
  reducerPath: "requirementApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Requirement"],
  keepUnusedDataFor: 120, // cache 2 min
  refetchOnFocus: true, // tab focus
  refetchOnReconnect: true, // network reconnect

  endpoints: (builder) => ({
    // 🟢 Get all by customer
    getRequirementsByCustomer: builder.query<Requirement[], PaginationParams>({
      query: ({ page = 0, size = 10, customerId }) => ({
        url: `/private/crm/customer-requirement/customer/${customerId}`,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (response: any) => response?.data?.content ?? response,
      providesTags: ["Requirement"],
    }),

    // 🟢 Get Requirement by ID
    getRequirementById: builder.query<Requirement, string | number>({
      query: (id) => ({
        url: `/private/crm/customer-requirement/getById/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Requirement", id }],
    }),

    // 🟢 Create Requirement
    createRequirement: builder.mutation<Requirement, Partial<Requirement>>({
      query: (requirement) => ({
        url: `/private/crm/customer-requirement/create`,
        method: "POST",
        data: requirement,
      }),
      invalidatesTags: ["Requirement"],
      async onQueryStarted(requirement, { dispatch, queryFulfilled }) {
        const tempId = crypto.randomUUID();
        const patchResult = dispatch(
          requirementApi.util.updateQueryData(
            "getRequirementsByCustomer",
            { page: 0, size: 10, customerId: requirement.customerId },
            (draft) => {
              draft.unshift({ id: tempId, ...requirement } as Requirement);
            }
          )
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            requirementApi.util.updateQueryData(
              "getRequirementsByCustomer",
              { page: 0, size: 10, customerId: requirement.customerId },
              (draft) => {
                const index = draft.findIndex((r) => r.id === tempId);
                if (index !== -1) draft[index] = data;
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),

    // 🟢 Update Requirement
    updateRequirement: builder.mutation<Requirement, UpdateRequirementPayload>({
      query: ({ id, updates }) => ({
        url: `/private/crm/customer-requirement/update/${id}`,
        method: "PATCH",
        data: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Requirement", id }],
      async onQueryStarted(
        { id, updates, customerId },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          requirementApi.util.updateQueryData(
            "getRequirementsByCustomer",
            { customerId, page: 0, size: 10 },
            (draft) => {
              const index = draft.findIndex((r) => r.id === id);
              if (index !== -1)
                draft[index] = { ...draft[index], ...updates } as Requirement;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // 🟢 Delete Requirement
    deleteRequirement: builder.mutation<
      { id: string | number },
      { id: string | number; customerId: string | number }
    >({
      query: ({ id }) => ({
        url: `/private/crm/customer-requirement/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Requirement", id }],
      async onQueryStarted({ id, customerId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          requirementApi.util.updateQueryData(
            "getRequirementsByCustomer",
            { customerId, page: 0, size: 10 },
            (draft) => {
              const index = draft.findIndex((r) => r.id === id);
              if (index !== -1) draft.splice(index, 1);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

// 🟢 Hooks
export const {
  useGetRequirementsByCustomerQuery,
  useGetRequirementByIdQuery,
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
} = requirementApi;
