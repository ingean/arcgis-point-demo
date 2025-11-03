export default class ActionBar {
  constructor(defaultActiveWidgetId = null) {
    this.activeWidgetId = defaultActiveWidgetId
    document.querySelector("calcite-action-bar").addEventListener("click", this.handleActionBarClick)
  }

  handleActionBarClick = ({ target }) => { // Use fat arrow function or this will point at the clicked html element
    if (target.tagName !== "CALCITE-ACTION") return
    if (this.activeWidgetId) this.toggleActionBarItem(this.activeWidgetId, false)
    
    const nextWidget = target.dataset.actionId
    
    if (nextWidget !== this.activeWidgetId) {
      this.toggleActionBarItem(nextWidget, true)
      this.activeWidgetId = nextWidget
    } else {
      this.activeWidgetId = null
    }
  }

  toggleActionBarItem = (id, visible) => {
    document.querySelector(`[data-action-id=${id}]`).active = visible
    document.querySelector(`[data-panel-id=${id}]`).hidden = !visible
  }
}

