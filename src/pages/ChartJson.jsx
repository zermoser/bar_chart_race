import { useState, useEffect } from 'react';
import ChartRace from 'react-chart-race';
import data from '../assets/db.json';

const ChartJson = () => {
  const [currentYear, setCurrentYear] = useState(1950);
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(500);
  const [countryData, setCountryData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  const filterDataByYear = (year) => {
    const filteredData = data
      .filter(item => item.year === year.toString())
      .map((item, index) => ({
        id: index,
        title: item.country_name,
        value: item.value,
        color: item.color,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
      console.log('filteredData', filteredData)
    setCountryData(filteredData);
      
    const sumValues = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    setTotalValue(sumValues);
  };

  useEffect(() => {
    filterDataByYear(currentYear);
  }, [currentYear]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrentYear(prevYear => {
          const nextYear = prevYear < 2021 ? prevYear + 1 : 1950;
          filterDataByYear(nextYear);
          return nextYear;
        });
      }, speed);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed]);

  const handleStartStop = () => setIsRunning(prev => !prev);
  const handleYearChange = (e) => setCurrentYear(parseInt(e.target.value));
  const handleSpeedChange = (e) => setSpeed(parseInt(e.target.value));

  let chartWidth = 0;

  if (window.innerWidth >= 1280) {
    chartWidth = 800;
  } else if (window.innerWidth >= 960) {
    chartWidth = 700;
  } else if (window.innerWidth >= 600) {
    chartWidth = 540;
  } else {
    chartWidth = 280;
  }

  const timelineWidth = ((currentYear - 1950) / (2021 - 1950)) * 100;

  return (
    <div className="flex justify-center w-full h-auto bg-gray-100 pb-6">
      <div className="bg-white shadow-lg rounded-lg w-full p-6 mt-6 mx-4 sm:mx-20 h-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Top Population Ranking: Year <span className='text-blue-600'>{currentYear}</span>
        </h2>
        <div className="flex flex-col sm:flex-row justify-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4 items-center">
          <button
            onClick={handleStartStop}
            className={`w-full sm:w-auto px-10 py-2 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>

          <div className="flex items-center">
            <span className="font-semibold mr-2">Speed:</span>
            <select
              value={speed}
              onChange={handleSpeedChange}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2000}>Slow</option>
              <option value={1000}>Normal</option>
              <option value={500}>Fast</option>
              <option value={100}>Very Fast</option>
            </select>
          </div>

          <div className="flex items-center">
            <span className="font-semibold mr-2">Year:</span>
            <select
              value={currentYear}
              onChange={handleYearChange}
              disabled={isRunning}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 2021 - 1950 + 1 }, (_, i) => 1950 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <ChartRace
            data={countryData}
            backgroundColor={'#fff'}
            width={chartWidth}
            padding={12}
            itemHeight={58}
            titleStyle={{ font: 'normal 400 13px Arial', color: '#000' }}
            valueStyle={{ font: 'normal 400 11px Arial', color: 'rgba(0, 0, 0, 0.42)' }}
            animationDuration={speed}
          />
        </div>

        <div className="mt-6 w-full bg-gray-300 h-2 rounded-lg">
          <div className="bg-blue-600 h-full rounded-lg" style={{ width: `${timelineWidth}%` }}></div>
        </div>
        <h3 className="text-lg font-semibold text-center mb-4">
          Total : <span className='text-green-600'>{totalValue}</span>
        </h3>
      </div>
    </div>
  );
};

export default ChartJson;
