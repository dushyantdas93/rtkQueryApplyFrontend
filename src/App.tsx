import React from 'react'
import ApplianceList from './pages/ApplianceList'
import ApplianceQueryList from './pages/ApplianceQueryList';

const App: React.FC  = () => {
  return (
    <div>
      {/* <ApplianceList/> */}

      <ApplianceQueryList />
    </div>
  );
}

export default App