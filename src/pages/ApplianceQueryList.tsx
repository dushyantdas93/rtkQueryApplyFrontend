// ApplianceQueryList.tsx
import React, { useEffect } from "react";
import { useCreateApplianceMutation, useDeleteApplianceByIdMutation, useGetAllAppliancesQuery, useUpdateApplianceByIdMutation } from "../rtk/rtkQuerySlices/metaDataQuerySlice";


const ApplianceQueryList: React.FC = () => {
  // 🔹 Query hook
  const {
    data: appliances,
    isLoading,
    isError,
    error,
  } = useGetAllAppliancesQuery();


  // 🔹 Mutation hooks
  const [createAppliance] = useCreateApplianceMutation();
  const [updateAppliance] = useUpdateApplianceByIdMutation();
    const [deleteAppliance] = useDeleteApplianceByIdMutation();
    
    


  return (
    <div>
      <h2>Appliances</h2>

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p style={{ color: "red" }}>
          {String((error as any)?.data || "Error occurred")}
        </p>
      )}

      <ul>
        {/* {appliances?.data?.map((a) => (
          <li key={a.id}>
            {a.name} 
            <button onClick={() => deleteAppliance(a.id)}>Delete</button>
            <button
              onClick={() =>
                updateAppliance({
                  id: a.id,
                  info: { name: "Updated " + Date.now() },
                })
              }
            >
              Update
            </button>
          </li>
        ))} */}
      </ul>

      <button onClick={() => createAppliance({ name: "Fridge " + Date.now() })}>
        Add Appliance
      </button>
    </div>
  );
};

export default ApplianceQueryList;
