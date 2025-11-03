import { ageSpans, wealthSpans, livingTypes } from "./layerStats.js"

let ageChart = null
let wealthChart = null
let buildingChart = null

export const createCharts = () => {
  
  ageChart = createChart(
    "population-age",
    "bar",
    {
      labels: ["Under 5 år", "6 - 12 år", "13 - 15 år", "16 - 18 år", "19 - 23 år", "24 - 34 år", "35 - 44 år", "45 - 54 år", "55 - 64 år", "65 - 74 år", "75 - 84 år", "85 år og eldre"],
      datasets: [
        { label: "Menn", backgroundColor: "#149dcf", stack: "Stack 0", data: new Array(12).fill(0) },
        { label: "Kvinner", backgroundColor: "#ed5050", stack: "Stack 0", data: new Array(12).fill(0) },
      ],
    },
    {
      title: { text: "Aldersfordeling (snitt)", display: true },
    }
  );

  wealthChart = createChart(
    "population-wealth",
    "bar",
    {
      labels: ["0 - 49.999", "50 - 199.999", "200 - 399.999", "400 - 699.999", "700 - 999.999", "1 - 2 mill", "2 - 3 mill", "3 - 4 mill", "over 4 mill"],
      datasets: [
        { label: "Formue", backgroundColor: "#ed5050", stack: "Stack 0", data: new Array(9).fill(0) }
      ],
    },
    {
      title: { text: "Formue (sum)", display: true },
    }
  );

  buildingChart = createChart(
    "building-type",
    "doughnut",
    {
      labels: ["Enebolig", "Tomannsbolig", "Rekkehus", "Bofelleskap", "Blokk", "Annen bolig"],
      datasets: [
        { backgroundColor: ["#149dcf", "#a6c736", "#ed5050"], borderColor: "rgb(255, 255, 255)", borderWidth: 1, data: [0, 0, 0] },
      ],
    },
    { title: { text: "Bosituasjon (sum)", display: true } }
  );
}

export const updateCharts = async (responses) =>{
  const allStats = await responses[0].value;

  const ageChartStats = {
    men: ageSpans.map(([min, max]) => allStats[`avg_alm_${min}_${max}`]),
    women: ageSpans.map(([min, max]) => allStats[`avg_alk_${min}_${max}`])
  }

  updateChart(ageChart, ageChartStats);

  const wealthChartStats = wealthSpans.map(([min, max]) => allStats[`sum_for_${min}_${max}`]);
  updateChart(wealthChart, wealthChartStats);

  const buildingChartStats = livingTypes.map((type) => allStats[`sum_bot_${type}`]);
  updateChart(buildingChart, buildingChartStats); 
}

export const updateChart = (chart, dataValues) =>{
  if (chart.id === 0) {
    chart.data.datasets[0].data = dataValues.men;
    chart.data.datasets[1].data = dataValues.women;
  } else {
    chart.data.datasets[0].data = dataValues;
  }
  chart.update();
}

const createChart = (canvasId, type, data, opts = {}) =>{
  const canvas = document.getElementById(canvasId);
  const baseOptions = getBaseOptions(type);
  // shallow-merge options (enough for this use case)
  const options = Object.assign({}, baseOptions, opts);
  // if both have 'title' or 'legend' or 'scales', merge them too
  if (baseOptions.title || opts.title) options.title = Object.assign({}, baseOptions.title, opts.title);
  if (baseOptions.legend || opts.legend) options.legend = Object.assign({}, baseOptions.legend, opts.legend);
  if (baseOptions.scales || opts.scales) options.scales = Object.assign({}, baseOptions.scales, opts.scales);

  return new Chart(canvas.getContext("2d"), {
    type,
    data,
    options,
  });
}

const getBaseOptions = (type) =>{
  const common = {
    responsive: false,
  };

  if (type === "doughnut") {
    return Object.assign({}, common, {
      cutoutPercentage: 35,
      legend: { position: "bottom" },
    });
  }

  // bar / horizontalBar defaults
  return Object.assign({}, common, {
    legend: { position: "top" },
    title: { display: true },
    scales: {
      xAxes: [{ stacked: true }],
      yAxes: [{ stacked: true, ticks: { beginAtZero: true } }],
    },
  });
}
