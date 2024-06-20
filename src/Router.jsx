import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Chart2 from './pages/Chart2';
import PopulationChart from './pages/PopulationChart';
import Redirect404 from './pages/Redirect404';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/2",
    element: <Chart2 />,
  },
  {
    path: "/populationChart",
    element: <PopulationChart />,
  },
  {
    path: "*",
    element: <Redirect404 />,
  },
  {
    path: "404",
    element: <div>Error Not Found</div>,
  },
], { basename: "/bar_chart_race/" });
