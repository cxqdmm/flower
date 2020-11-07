import React from 'react';
import RootRouter from './router';
import './index.less';

const App: React.FC = React.memo(function App(props) {
  return <RootRouter />;
});

export default App;
