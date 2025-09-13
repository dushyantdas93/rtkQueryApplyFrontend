import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosPrivate from "../../api/axiosPrivate";


const axiosInstance = axiosPrivate();

// types.ts
export interface Appliance {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetaDataState {
  loader: boolean;
  appliances: Appliance[] | null;
  errorMessage: string;
  successMessage: string;
}


const initialState: MetaDataState = {
  loader: false,
  appliances: null,
  errorMessage: "",
  successMessage: "",
};

// ✅ Get All Appliances
export const getALLAppliances = createAsyncThunk<Appliance[]>(
  "appliances/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/metadata/appliances/all");
      return data as Appliance[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch");
    }
  }
);

// ✅ Create Appliance
export const createAppliance = createAsyncThunk<Appliance, Partial<Appliance>>(
  "appliances/create",
    async (info, { rejectWithValue }) => {

        

    try {
      const { data } = await axiosInstance.post(`/metadata/appliances/add`, info);
      return data as Appliance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create");
    }
  }
);

// ✅ Update Appliance
export const updateApplianceById = createAsyncThunk<
  Appliance,
  { id: string; info: Partial<Appliance> }
>("appliances/update", async ({ id, info }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(
      `/metadata/appliances/update/${id}`,
      info
    );
    return data as Appliance;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to update");
  }
});

// ✅ Delete Appliance
export const deleteApplianceById = createAsyncThunk<string, string>(
  "appliances/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/metadata/appliances/delete/${id}`);
      return id; // return only the deleted id
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete");
    }
  }
);

const metaDataSlice = createSlice({
  name: "metaData",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Get All Appliances
      .addCase(getALLAppliances.pending, (state) => {
        state.loader = true;
      })
        .addCase(getALLAppliances.fulfilled, (state, { payload }) => {
        
        state.loader = false;
        state.appliances = payload?.data;
      })
      .addCase(getALLAppliances.rejected, (state, { payload }: any) => {
        state.loader = false;
        state.errorMessage = payload;
      })

      // 🔹 Create Appliance
        .addCase(createAppliance.fulfilled, (state, action) => {

     
console.log(action)
  
     
        if (state.appliances) {
            state.appliances = [...state.appliances,{id: action.payload?.id,name: action.meta.arg.name}]
        } else {
        //   state.appliances = [action?.payload];
        }
        state.successMessage = "Appliance created successfully!";
      })
      .addCase(createAppliance.rejected, (state, { payload }: any) => {
        state.errorMessage = payload;
      })

      // 🔹 Update Appliance
        .addCase(updateApplianceById.fulfilled, (state, { payload }) => {
          
            console.log(payload)
        if (state.appliances) {
          state.appliances = state.appliances.map((a) =>
            a.id === payload.id ? payload : a
          );
        }
        state.successMessage = "Appliance updated successfully!";
      })
      .addCase(updateApplianceById.rejected, (state, { payload }: any) => {
        state.errorMessage = payload;
      })

      // 🔹 Delete Appliance
      .addCase(deleteApplianceById.fulfilled, (state, { payload }) => {
        if (state.appliances) {
          state.appliances = state.appliances.filter((a) => a.id !== payload);
        }
        state.successMessage = "Appliance deleted successfully!";
      })
      .addCase(deleteApplianceById.rejected, (state, { payload }: any) => {
        state.errorMessage = payload;
      });
  },
});

export const { clearMessages } = metaDataSlice.actions;
export default metaDataSlice.reducer;
