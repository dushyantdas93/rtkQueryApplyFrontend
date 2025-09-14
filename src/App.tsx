import React, { useState } from "react";
import ApplianceList from "./pages/ApplianceList";
import ApplianceQueryList from "./pages/ApplianceQueryList";
import ProjectList from "./pages/projecList";
import ProjectList2 from "./pages/projectList2";

const App: React.FC = () => {
  const [show, setShow] = useState({
    applianceList: true,
    applianceQueryList: false,
    projectList: false,
    projectList2: false,
  });

  return (
    <div>
      {/* Navigation buttons */}
      <div className="flex gap-2 mb-4">
        {Object.entries(show).map(([key, value]) => (
          <button
            key={key}
            className={`px-3 py-1 rounded transition ${
              value
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
            onClick={() =>
              setShow({
                ...Object.fromEntries(Object.keys(show).map((k) => [k, false])),
                [key]: true,
              })
            }
          >
            {key}
          </button>
        ))}
      </div>

      {/* Conditional rendering */}
      {show.applianceList && <ApplianceList />}
      {show.applianceQueryList && <ApplianceQueryList />}
      {show.projectList && <ProjectList />}
      {show.projectList2 && <ProjectList2 />}
    </div>
  );
};

export default App;
