 import Portal from '@arcgis/core/portal/Portal.js'
import OAuthInfo from '@arcgis/core/identity/OAuthInfo.js'
import esriId from '@arcgis/core/identity/IdentityManager.js'

let info = null

const userElement = document.querySelector("calcite-navigation-user")

export const authenticate = (appId) => {
  registerInfo(appId)
  return new Promise((resolve, reject) => {
    esriId.checkSignInStatus(info.portalUrl + "/sharing").then(() => {
      const portal = new Portal() // User is signed in
      portal.authMode = "immediate"
      portal.load().then(() => {
        updateUIforSignOut(portal.user)
        return resolve(portal)
      })
    }).catch(() => {
      updateUIforSignIn() // User is not signed in
      signIn()
      resolve()
    })
  })
}

const registerInfo = (appId) => {
  info = new OAuthInfo({
    appId,
    flowType: "auto", // default that uses two-step flow
    popup: false
  })
  
  esriId.registerOAuthInfos([info])
}

const signIn = () => {
  esriId.getCredential(info.portalUrl + "/sharing")
}

const signOut = () => {
  updateUIforSignIn()
  esriId.destroyCredentials()
  window.location.reload()
}

const updateUIforSignOut = (user) => {
  userElement.thumbnail = user.thumbnailUrl
  userElement.fullName = user.fullName
  userElement.addEventListener('click', signOut)
}

const updateUIforSignIn = () => {
  userElement.addEventListener('click', signIn)
  userElement.thumbnail = ''
  userElement.fullName = ''
  userElement.username = ''
}
