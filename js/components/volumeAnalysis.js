import VolumeMeasurementAnalysis from "@arcgis/core/analysis/VolumeMeasurementAnalysis.js"
import VolumeMeasurementAnalysisView3D from "@arcgis/core/views/3d/analysis/VolumeMeasurementAnalysisView3D.js"
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js"

let placeAbortController = new AbortController();
let analysisView = null;
const sceneEl = document.querySelector("arcgis-scene");
const measurements = {
        cut: document.getElementById("cut-volume"),
        fill: document.getElementById("fill-volume"),
        net: document.getElementById("net-volume"),
      };
const editMeasurementButton = document.getElementById("edit-measurement");

const unitConfig = {
  "cubic-meters": { symbol: "m³", precision: 2 },
  "cubic-kilometers": { symbol: "km³", precision: 6 },
  "cubic-feet": { symbol: "ft³", precision: 2 },
  "cubic-yards": { symbol: "yd³", precision: 2 },
  "cubic-miles": { symbol: "mi³", precision: 6 },
};

export const volumeMeasurement = async () =>  {
  await sceneEl.viewOnReady();
  
  const volumeMeasurementAnalysis = new VolumeMeasurementAnalysis({
    measureType: "cut-fill",
    cutFillOptions: {
      targetElevation: 2.5, // meters above sea level
    },
    displayUnits: {
      volume: "metric",
      elevation: "metric",
    },
    inputUnits: {
      elevation: "meters",
    },
  });

  const measureLayer = sceneEl.view.map.layers.find(layer => layer.title === "Prosjektområde");
  const measureFeature = await getProjectFeature(measureLayer);
  volumeMeasurementAnalysis.geometry = measureFeature?.geometry;
  sceneEl.analyses.add(volumeMeasurementAnalysis);
  const analysisView = await sceneEl.whenAnalysisView(volumeMeasurementAnalysis); 

  editMeasurementButton.addEventListener("click", async () => {
    if (!analysisView.interactive) {
      analysisView.interactive = true;
      editMeasurementButton.textContent = "Avslutt redigering";
    } else {
      analysisView.interactive = false;
      editMeasurementButton.textContent = "Redigere måling";
    }
  });

  reactiveUtils.watch(
    () => analysisView?.result,
    (result) => {
      const volumeKeys = ["cut", "fill", "net"];
      for (const key of volumeKeys) {
        const volume = result?.[`${key}Volume`];
        measurements[key].textContent = formatVolume(volume?.value, volume?.unit);
      }
    },
    { initial: true },
  );

  // Issue warnings when measurement errors are encountered
  reactiveUtils.watch(
    () => analysisView?.error,
    (error) => {
      const alert = document.querySelector("calcite-alert");
      if (!error) {
        alert.open = false;
        return;
      }
      if (error.name == "distance-too-far" || error.name == "distance-too-close") {
        document.getElementById("error-message").textContent = error.message;
        alert.open = true;
      }
    },
  );
}


const getProjectFeature = async (projectLayer) => {
  if (!projectLayer) {
    return;
  }
  const query = projectLayer.createQuery();
  query.where = "1=1";
  query.returnZ = true;
  query.returnGeometry = true;
  try {
    const featureSet = await projectLayer.queryFeatures(query);
    const feature = featureSet.features[0];
    if (feature) {
      return feature;
    }
  } catch (error) {
    console.log(error);
  }
}

 const formatVolume = (value, unit) => {
  if (value == null || unit == null) {
    return "—";
  }
  const config = unitConfig[unit];
  if (!config) {
    return `${value} ${unit}`;
  }
  return `${roundValue(value, config.precision)} ${config.symbol}`;
}

const roundValue = (value, decimals = 0) =>{
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}