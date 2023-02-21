const appendStyles = () => {
  const styleContainer = document.createElement('style')

  styleContainer.innerHTML = `
  .taSaveArea {
    position: absolute;
    top: -1000px;
    left: -1000px;
    width: 1px;
    height: 1px;
  }

  .taControlPanelElement {
    position: fixed;
    bottom: 10px;
    left: 10px;
    zIndex: 99999999;
    border: 1px black solid;
    padding: 10px;
  }

  .taPanelElement {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999999999;
    padding: 20px;
    height: 100vh;
    width: 100vw;
    display: none;
    backdrop-filter: blur(10px);
  }

  .taPanelElementVisible {
    display: block;
  }

  .taInnerPanelElement {
    position: relative;
    height: 100%;
    width: 100%;
    padding: 10px;
    border: 1px black solid;
    overflow-y: auto;
    overflow-x: none;
  }

  .toastifyDisabled {
    display: none!important;
  }

  .taTabs {
    position: relative;
    margin: 3rem 0;
    background: #1abc9c;
  }
  .taTabs::before,
  .taTabs::after {
    content: "";
    display: table;
  }
  .taTabs::after {
    clear: both;
  }
  .taTab {
    float: left;
  }
  .taTab-switch {
    display: none;
  }
  .taTab-label {
    position: relative;
    display: block;
    line-height: 2.75em;
    height: 3em;
    padding: 0 1.618em;
    background: #1abc9c;
    border-right: 0.125rem solid #16a085;
    color: #fff;
    cursor: pointer;
    top: 0;
    transition: all 0.25s;
  }
  .taTab-label:hover {
    top: -0.25rem;
    transition: top 0.25s;
  }
  .taTab-content {
    position: absolute;
    z-index: 1;
    top: 2.75em;
    left: 0;
    padding: 1.618rem;
    opacity: 0;
    transition: all 0.35s;
    width: 100%;
  }
  .taTab-switch:checked + .taTab-label {
    background: #fff;
    color: #2c3e50;
    border-bottom: 0;
    border-right: 0.125rem solid #fff;
    transition: all 0.35s;
    z-index: 1;
    top: -0.0625rem;
  }
  .taTab-switch:checked + label + .taTab-content {
    z-index: 2;
    opacity: 1;
    transition: all 0.35s;
  }

  .taOptionsBar {
    position: fixed;
    z-index: 100;
  }

  .right-14 {
    right: 3.5rem;
  }
  `

  document.querySelector('head').insertAdjacentElement('beforeend', styleContainer)
}

export default { appendStyles }
