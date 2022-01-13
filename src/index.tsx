import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
// import App from './App';
import reportWebVitals from './reportWebVitals';

import ProjectConfig from './dialogs/ProjectConfig';

ReactDOM.render(
  <React.StrictMode>
    <ProjectConfig 
      existingProjects={[]}
      defaultValues={{
        name: 'hyuck',
        blueprints: [
          {
            name: 'Reggeli',
            limits: {
              carbohydrates: { max: 100 },
              fat: { max: 100 },
              energy: { max: 100 },
              protein: { max: 100 },
            },
            order: 0
          }
        ]
      }}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
