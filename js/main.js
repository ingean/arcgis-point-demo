import ActionBar from './components/ActionBar.js'
//import MapTheme from './components/MapTheme.js'
import { authenticate } from './utils/OAuth2.js'

const appId = 'w8MteBiiYAwXiNdn' // AppId for Demo_oAuth2_Viewer
const portal = await authenticate(appId) //Authenticate with named user using OAuth2
const webmap = document.getElementById("viewDiv")

const actionBar = new ActionBar(webmap.view, 'layers')
//const theme = new MapTheme(webmap.view) // Contains light and dark basemap

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