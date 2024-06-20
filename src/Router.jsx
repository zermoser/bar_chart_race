import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ChartAxios from './pages/ChartAxios';
import ChartJson from './pages/ChartJson';
import ChartMockup from './pages/ChartMockup';
import PopulationChart from './pages/PopulationChart';
import RedirectHome from './pages/RedirectHome';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/json",
    element: <ChartJson />,
  },
  {
    path: "/axios",
    element: <ChartAxios />,
  },
  {
    path: "/mockup",
    element: <ChartMockup />,
  },
  {
    path: "/populationChart",
    element: <PopulationChart />,
  },
  {
    path: "*",
    element: <RedirectHome />,
  }
], { basename: "/bar_chart_race/" });
