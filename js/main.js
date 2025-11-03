
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import ActionBar from './components/ActionBar.js'
import { authenticate } from './utils/OAuth2.js'
import { createCharts, updateCharts } from './components/popCharts.js'
import { queryStatsOnDrag } from './components/layerStats.js'

const appId = 'w8MteBiiYAwXiNdn' // AppId for Demo_oAuth2_Viewer
const portal = await authenticate(appId) //Authenticate with named user using OAuth2
const webmap = document.getElementById("viewDiv")

const actionBar = new ActionBar('layers')

webmap.addEventListener("arcgisViewReadyChange", (event) => {
  const { portalItem } = event.target.map
  const navigationLogo = document.querySelector("calcite-navigation-logo")
  navigationLogo.heading = portalItem.title
  navigationLogo.description = portalItem.snippet
  navigationLogo.thumbnail = portalItem.thumbnailUrl
  navigationLogo.href = portalItem.itemPageUrl
  navigationLogo.label = "Thumbnail of map"
  
  document.querySelector("calcite-loader").hidden = true

})

webmap.viewOnReady().then(() => {
    console.log("Webmap and View are ready")
    const layer = webmap.map.layers.getItemAt(1)
    layer.outFields = [
    "alm_u_5",
    "alm_6_12",
    "alm_13_15",
    "alm_16_18",
    "alm_19_23",
    "alm_24_34",
    "alm_35_44",
    "alm_45_54",
    "alm_55_64",
    "alm_65_74",
    "alm_75_84",
    "alm_85_o",
    "alk_u_5",
    "alk_6_12",
    "alk_13_15",
    "alk_16_18",
    "alk_19_23",
    "alk_24_34",
    "alk_35_44",
    "alk_45_54",
    "alk_55_64",
    "alk_65_74",
    "alk_75_84",
    "alk_85_o",
    "for_0_50",
    "for_50_200",
    "for_200_400",
    "for_400_700",
    "for_700_1000",
    "for_1000_2000",
    "for_2000_3000",
    "for_3000_4000",
    "for_4000_over",
    "bot_enebolig",
    "bot_tomannsbolig",
    "bot_rekkehus",
    "bot_bofelleskap",
    "bot_blokk",
    "bot_annen_bolig"
]
    createCharts()

    webmap.view.whenLayerView(layer).then((layerView) => {
      console.log("LayerView is ready")
      reactiveUtils
        .whenOnce(() => !layerView.updating)
        .then(() => {
          webmap.view.on(["click", "drag"], (event) => {
            event.stopPropagation();
            queryStatsOnDrag(layerView, event)
              .then(updateCharts)
              .catch((error) => {
                if (error.name !== "AbortError") {
                  console.error(error);
                }
              });
          });
        });
    }); 
})