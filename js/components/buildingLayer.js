import DimensionAnalysis from "@arcgis/core/analysis/DimensionAnalysis.js"
import DimensionLayer from "@arcgis/core/layers/DimensionLayer.js"
import GroupLayer from  "@arcgis/core/layers/GroupLayer.js"
import LengthDimension from "@arcgis/core/analysis/LengthDimension.js"

let sceneEl = null
let buildingLayer = null
let buildingLayerView = null
let buildingFeatures = null
let groupLayer = null

const programmaticDimensionLayer = new DimensionLayer({
  title: "Dimensjonering",
  source: new DimensionAnalysis({
    style: {
      type: "simple",
      textBackgroundColor: [0, 0, 0, 0.6],
      textColor: "white",
      fontSize: 12,
    },
  }),
});

export const initBuildingLayer = async () => {
  sceneEl = document.querySelector("arcgis-scene");
  await sceneEl.viewOnReady();

  buildingLayer = sceneEl.map.layers.find(
    (layer) => layer.title === "Mulighetsrom",
  );
  buildingLayer.outFields = ["*"];
  buildingFeatures = (await buildingLayer.queryFeatures()).features;
  
  groupLayer = new GroupLayer({
    layers: [buildingLayer, programmaticDimensionLayer],
    title: "Bygning med dimensjonering",
  });

  groupLayer.visible = false
  buildingLayer.visible = true

  sceneEl.map.add(groupLayer);
  buildingLayerView = await sceneEl.whenLayerView(buildingLayer);
  showDimensionsFloor(9)
}

export const toggleBuildingLayer = (isVisible) => {
  if (!groupLayer) return
  groupLayer.visible = isVisible
  document.getElementById("building-visibility-switch").value = isVisible;
}
      
export const filterByFloorNumber = (selectedFloor) => {
  buildingLayerView.filter = {
    where: `Etasje <= '${selectedFloor}'`,
  };
}

export const showDimensionsFloor = (selectedFloor) =>{
  programmaticDimensionLayer.source.dimensions.removeAll();
  const polygonsForDimensioning = buildingFeatures.filter((item) => {
    return item.attributes.Etasje === selectedFloor;
  });
  showElevationDimensions(polygonsForDimensioning[0]);
}



// Function to show the dimensioning on the elevation
const showElevationDimensions = (feature) => {
  const groundPoint = {
    spatialReference: sceneEl.spatialReference,
    x: 1196150.3740999997, 
    y: 8379114.532499999,
    z: 2.3,
  };
  
  programmaticDimensionLayer.source.dimensions.push(
    new LengthDimension({
      orientation: 130,
      startPoint: groundPoint,
      endPoint: {
        spatialReference: groundPoint.spatialReference,
        x: groundPoint.x,
        y: groundPoint.y,
        z: feature.attributes["Hoyde"] + feature.attributes["Etasjehoyde"],
      },
      offset: 4,
    }),
  );
}