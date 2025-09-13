// metaDataQuery.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/axiosBaseQuert";

// 🟢 Types
export interface Appliance {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

export const metaDataQuery = createApi({
  reducerPath: "metaDataQuery",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Appliance"],

  endpoints: (builder) => ({
    // 🟢 Get All Appliances
    getAllAppliances: builder.query<Appliance[], void>({
      query: () => ({
        url: "/metadata/appliances/all",
        method: "GET",
      }),
      providesTags: ["Appliance"],
    }),
    // 🟢 Create Appliance
    createAppliance: builder.mutation<Appliance, Partial<Appliance>>({
      query: (info) => ({
        url: "/metadata/appliances/add",
        method: "POST",
        data: info,
      }),
      // invalidatesTags: ["Appliance"],  // optional, since we're doing optimistic updates
      async onQueryStarted(info, { dispatch, queryFulfilled }) {
        // 1️⃣ Add a temporary appliance with a fake id
        const tempId = crypto.randomUUID();
        const patchResult = dispatch(
          metaDataQuery.util.updateQueryData(
            "getAllAppliances",
            undefined,
            (draft) => {
              draft.data.push({
                id: tempId,
                ...info,
              } as Appliance);
            }
          )
        );

        try {
          // 2️⃣ Wait for the actual API response
          const { data } = await queryFulfilled;

          // 3️⃣ Replace temp item with real one
          dispatch(
            metaDataQuery.util.updateQueryData(
              "getAllAppliances",
              undefined,
              (draft) => {
                  const index = draft.data.findIndex((a) => a.id === tempId);
                  console.log(index);
                if (index !== -1) {
                  draft.data[index].id = data.id; // overwrite with real server response
                }
              }
            )
          );

        //   console.log("✅ Created Appliance:", data);
        } catch (err) {
          console.error("❌ Create failed:", err);
          patchResult.undo();
        }
      },
    }),

    // 🟢 Update Appliance
    updateApplianceById: builder.mutation<
      Appliance,
      { id: string; info: Partial<Appliance> }
    >({
      query: ({ id, info }) => ({
        url: `/metadata/appliances/update/${id}`,
        method: "PUT",
        data: info,
      }),
    //   invalidatesTags: ["Appliance"],
      async onQueryStarted({ id, info }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          metaDataQuery.util.updateQueryData(
            "getAllAppliances",
            undefined,
            (draft) => {
                const index = draft.data.findIndex((a) => a.id === id);
            
              if (index !== -1) {
                draft.data[index] = { ...draft.data[index], ...info } as Appliance;
              }
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

    // 🟢 Delete Appliance
    deleteApplianceById: builder.mutation<string, string>({
      query: (id) => ({
        url: `/metadata/appliances/delete/${id}`,
        method: "DELETE",
      }),
    //   invalidatesTags: ["Appliance"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        console.log(id);
        const patchResult = dispatch(
          metaDataQuery.util.updateQueryData(
            "getAllAppliances",
            undefined,
            ({data}) => {
              const index = data.findIndex((a) => a.id === id);
              if (index !== -1) data.splice(index, 1);
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
  useGetAllAppliancesQuery,
  useCreateApplianceMutation,
  useUpdateApplianceByIdMutation,
  useDeleteApplianceByIdMutation,
} = metaDataQuery;
