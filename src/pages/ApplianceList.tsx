import React, { useEffect } from "react";

import {
  getALLAppliances,
  createAppliance,
  updateApplianceById,
  deleteApplianceById,
} from "../rtk/rtkAsychSlices/metaDataSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const ApplianceList: React.FC = () => {
  const dispatch = useDispatch();
  const { appliances, loader, successMessage, errorMessage } = useSelector(
    (state) => state.metaData
  );

  useEffect(() => {
    dispatch(getALLAppliances());
  }, [dispatch]);

  return (
    <div>
      <h2>Appliances</h2>
      {loader && <p>Loading...</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <ul>
        {appliances?.map((a) => (
          <li key={a.id}>
            {a.name} ({a.type})
            <button onClick={() => dispatch(deleteApplianceById(a.id))}>
              Delete
            </button>
            <button
              onClick={() =>
                dispatch(
                  updateApplianceById({ id: a.id, info: { name: "Updated" } })
                )
              }
            >
              Update
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          dispatch(createAppliance({ name: "Fridge", type: "Electronics" }))
        }
      >
        Add Appliance
      </button>
    </div>
  );
};

export default ApplianceList;
