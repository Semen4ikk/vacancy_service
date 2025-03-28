import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {AuthProvider} from './utils/token';
import AppRoutes from './utils/router';

const App = () => {
  return (
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
  );
};

export default App;