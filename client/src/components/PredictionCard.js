import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const PredictionCard = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const data = {
      labels: ['July 12', 'July 13', 'July 14', 'July 15', 'July 16', 'July 17', 'July 18'],
      datasets: [
        {
          label: "Resident's LLM over time",
          data: [3, 2, 2.5, 2.8, 3.2, 3.7, 3.5],
          fill: false,
          backgroundColor: 'blue',
          borderColor: 'blue',
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    const chartInstance = new Chart(chartRef.current, {
      type: 'line',
      data,
      options,
    });

    chartInstanceRef.current = chartInstance;

    return () => {
      chartInstance.destroy();
    };
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">LLM Prediction</h2>
      <canvas ref={chartRef} />
    </div>
  );
}

export default PredictionCard;
