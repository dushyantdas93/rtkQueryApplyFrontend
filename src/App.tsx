import React from 'react'
import ApplianceList from './pages/ApplianceList'
import ApplianceQueryList from './pages/ApplianceQueryList';

const App: React.FC  = () => {
  return (
    <div>
      {/* // rtk asynchThunk slice  */}
      {/* <ApplianceList/>   */}



{/* // rtk query slice  */}
      <ApplianceQueryList />
    </div>
  );
}

export default App