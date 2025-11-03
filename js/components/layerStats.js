import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";

export const ageSpans = [["u", "5"], ["6", "12"], ["13", "15"], ["16", "18"], ["19", "23"],["24", "34"],["35", "44"],["45", "54"],["55", "64"],["65", "74"],["75", "84"],["85", "o"]];
export const wealthSpans = [["0", "50"], ["50", "200"], ["200", "400"], ["400", "700"], ["700", "1000"],["1000", "2000"],["2000", "3000"],["3000", "4000"],["4000", "over"]];
export const livingTypes = ["enebolig", "tomannsbolig", "rekkehus", "bofelleskap", "blokk", "annen_bolig"];

let highlightHandle = null;

export const queryStatsOnDrag = promiseUtils.debounce((layerView, event) => {
  // create a query object for the highlight and the statistics query
  let view = document.getElementById("viewDiv").view;
  
  const query = layerView.layer.createQuery();
  query.geometry = view.toMap(event); // converts the screen point to a map point
  query.distance = 1; // queries all features within 1 mile of the point
  query.units = "kilometers";

  const statsQuery = query.clone();

  
  
  const menStats = ageSpans.map(([min, max]) => ({
    onStatisticField: `alm_${min}_${max}`,
    outStatisticFieldName: `avg_alm_${min}_${max}`,
    statisticType: "avg"
  }));

  const womenStats = ageSpans.map(([min, max]) => ({
    onStatisticField: `alk_${min}_${max}`,
    outStatisticFieldName: `avg_alk_${min}_${max}`,
    statisticType: "avg"
  }));

  const wealthStats = wealthSpans.map(([min, max]) => ({
    onStatisticField: `for_${min}_${max}`,
    outStatisticFieldName: `sum_for_${min}_${max}`,
    statisticType: "sum"
  }));

  const buildingStats = livingTypes.map((type) => ({
    onStatisticField: `bot_${type}`,
    outStatisticFieldName: `sum_bot_${type}`,
    statisticType: "sum"
  }))   
    
  const statDefinitions = [
    ...menStats,
    ...womenStats,
    ...wealthStats,
    ...buildingStats
  ]

  // add the stat definitions to the the statistics query object cloned earlier
  statsQuery.outStatistics = statDefinitions;
  //statsQuery.outFields = statDefinitions.map(def => def.onStatisticField);

  // execute the query for all features in the layer view
  const allStatsResponse = layerView.queryFeatures(statsQuery).then(
    (response) => {
      const stats = response.features[0].attributes;
      return stats;
    },
    (e) => {
      console.error(e);
    },
  );


  // highlight all features within the query distance
  layerView.queryObjectIds(query).then((ids) => {
    if (highlightHandle) {
      highlightHandle.remove();
      highlightHandle = null;
    }
    highlightHandle = layerView.highlight(ids);
  });

  // Return the promises that will resolve to each set of statistics
  return promiseUtils.eachAlways([allStatsResponse]);
});



     

   
      