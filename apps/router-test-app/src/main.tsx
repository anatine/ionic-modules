import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/App';

declare global {
  const __DEV__: string | undefined;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );

root.render(<App />);
