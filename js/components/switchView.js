import { initViewShed, abortViewshed } from "./viewShed.js";
import { volumeMeasurement } from "./volumeAnalysis.js";
import { initBuildingLayer, toggleBuildingLayer } from "./buildingLayer.js"; 

let activeView = "map"
const mapEl = document.querySelector("arcgis-map");
const sceneEl = document.querySelector("arcgis-scene");
const shellEl = document.querySelector("calcite-shell");
sceneEl.remove()

sceneEl.addEventListener("arcgisViewReadyChange", (event) => {

  initViewShed(sceneEl.view)
  initBuildingLayer()
  

  sceneEl.view.on("key-down", (event) => {
    if ((event.key = "Escape")) {
      abortViewshed()
    }
  })
})

export const switchView = (viewName) => {
  if (viewName === "pop-query") {
    sceneEl.remove()
    if (!shellEl.contains(mapEl)) shellEl.append(mapEl)
   
  } else {     
    mapEl.remove()
    if (!shellEl.contains(sceneEl)) shellEl.append(sceneEl)
    
    sceneEl.analyses.removeAll()
    if (viewName === "volume" ) {
      toggleBuildingLayer(false)
      volumeMeasurement() 
    }
  }
}