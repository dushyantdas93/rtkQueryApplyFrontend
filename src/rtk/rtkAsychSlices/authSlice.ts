import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import api from "../../api/api";
import axiosPrivate from "../../api/axiosPrivate";


const axiosInstance = axiosPrivate();
// ================== Types ==================
export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  expireDate?: Date;
  [key: string]: any; // fallback for any other props from API
}

export interface AuthState {
  loader: boolean;
  userInfo: UserInfo | null;
  refreshToken: string | null;
  errorMessage: string;
  successMessage: string;
}

// ================== Initial State ==================
const initialState: AuthState = {
  loader: false,
  userInfo: null,
  refreshToken: null,
  errorMessage: "",
  successMessage: "",
};

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  message: string;
  [key: string]: any; // fallback for extra props
}

// ================== Thunks ==================

export const loginUser = createAsyncThunk<
  RegisterResponse, // ✅ Return type (API response)
  RegisterPayload, // ✅ Argument type (payload)
  { rejectValue: string } // ✅ Error type
>("auth/loginUser", async (info, { rejectWithValue }) => {
    try {
      
      
    // call API
    const { data } = await api.post<RegisterResponse>(
      "/public/authenticate",
      info
    );

    // decode token
    const decoded: any = jwtDecode(data.jwtToken);

    if (data) {
      const tokenDetails: UserInfo = {
        ...data,
        expireDate: new Date(decoded.exp * 1000),
      };

      localStorage.setItem("userinfo", JSON.stringify(tokenDetails));
      localStorage.setItem("token", data.jwtToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      return data; // ✅ typed as LoginResponse
    } else {
      return rejectWithValue("Invalid login response");
    }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

// 🔹 Logout
export const logoutUser = createAsyncThunk<
  any, // Return type
  void, // Argument type
  { state: { authSlice: AuthState } }
>("auth/logoutUser", async (_, { rejectWithValue, fulfillWithValue }) => {
  try {
    // // console.log(refreshToken)

    // ✅ Option 2: Fallback from localStorage (optional)
    const token = localStorage.getItem("refreshToken");
    const jwtToken = localStorage.getItem("token");

    const data = await axiosInstance.post(
      "/public/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Refresh-Token": `Bearer ${token}`,
        },
      }
    );

    console.log(data);

    // Redirect to login page after logout
    // window.location.href = window.location.origin + "/main/login";
    // window.location.href =" https://www.abhr.ca/main/";

    return fulfillWithValue(data);
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Logout failed");
  }
});

// 🔹 Check Session
export const check_session = createAsyncThunk<
  any, // Return type (you can replace with a proper type if API is fixed)
  void, // Argument type
  {}
>("auth/check_session", async (_, { rejectWithValue, fulfillWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      // window.location.href =" https://www.abhr.ca/main/";
      console.log("No token found");
      return rejectWithValue("No token found");
    }

    const { data } = await api.get("/private/home", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const decoded: any = jwtDecode(token);
    if (data) {
      const tokenDetails: UserInfo = {
        ...data,
        expireDate: new Date(decoded.exp * 1000),
      };

      localStorage.setItem("userinfo", JSON.stringify(tokenDetails));
    } else {
      // window.location.href = "https://www.abhr.ca/main/";
    }

    return fulfillWithValue(data);
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Check session failed");
  }
});

// ================== Slice ==================
export const authReducer = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    user_reset: (state) => {
      state.userInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Logout
      .addCase(logoutUser.pending, (state) => {
        state.loader = true;
      })
      .addCase(logoutUser.rejected, (state, { payload }) => {
        state.errorMessage = (payload as string) || "Logout failed";
        state.loader = false;
      })
      .addCase(logoutUser.fulfilled, (state, { payload }) => {
        state.successMessage = (payload as any)?.message;
        state.loader = false;
        state.userInfo = null;
      })

      // 🔹 Check Session
      .addCase(check_session.pending, (state) => {
        state.loader = true;
      })
      .addCase(check_session.rejected, (state, { payload }) => {
        state.errorMessage = (payload as string) || "Check session failed";
        state.loader = false;
      })
      .addCase(check_session.fulfilled, (state, { payload }) => {
        state.successMessage = (payload as any)?.message;
        state.loader = false;
        state.userInfo = payload as UserInfo;
      })

      .addCase(loginUser.pending, (state) => {
        state.loader = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.errorMessage = (payload as string) || "Login failed";
        state.loader = false;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.successMessage = (payload as any)?.message;

        console.log(payload);
        state.loader = false;
        state.userInfo = payload as UserInfo;
      });
  },
});

// ================== Exports ==================
export const { messageClear, user_reset } = authReducer.actions;
export default authReducer.reducer;
