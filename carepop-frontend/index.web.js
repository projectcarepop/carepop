import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';

ReactDOM.render(<App />, document.getElementById('root'));

// Optional: If you want to support AppRegistry.runApplication for web (less common now)
// import { AppRegistry } from 'react-native';
// AppRegistry.registerComponent('YourAppName', () => App); // Get app name from app.json
// AppRegistry.runApplication('YourAppName', { rootTag: document.getElementById('root') }); 