import React from "react";
import { createRoot } from "react-dom/client";
// import App from "./App"

let root = createRoot(document.getElementById("root"))
// root.render(<App />)

let element = (
  <div id="A1">
    <div id="B1">
      <div id="C1"></div>
      <div id="C2"></div>
    </div>
    <div id="B2"></div>
  </div>
)

let workInProgressRoot = {
  stateNode: root,
  props: {
    children: [element]
  }
}

let nextUnitOfWork = workInProgressRoot;
const INSERT = "INSERT"
const DELETE = "DELETE"
const UPDATE = "UPDATE"
const ELEMENT_TEXT = "ELEMENT_TEXT" // need further definition, I defind this just wanna eliminate error

// create fiber node for each vitrualDOM element
function beginWork(workInProgressFiber) {
  if (!workInProgressFiber.stateNode) { 
    workInProgressFiber.stateNode = document.createElement(workInProgressFiber.type);
  }
  for (let key in workInProgressFiber.props) { 
    if (key !== "children") {
      workInProgressFiber.stateNode[key] = workInProgressFiber.props[key];
    }
  }

  let previousFiber;
  Array.isArray(workInProgressFiber.props.children) && workInProgressFiber.props.children.forEach((child, index) => { 
    let childFiber = {
        type: child.type,
        props: child.props,
        return: workInProgressFiber,
        effectTag: INSERT, // could be INSERT DELETE or UPDATE
        nextEffect: null,
    }
    if (index === 0) {
      workInProgressFiber.child = childFiber;
    } else { 
      previousFiber.sibling = childFiber;
    }
    previousFiber = childFiber;
  })
}

// bind effect chain for every node that has effect tag
// node has effect tag means they need to be manipulated
function completeUnitOfWork(workInProgressFiber) {
  let returnFiber = workInProgressFiber.return;
  if (returnFiber) { 
    if (!returnFiber.firstEffect) { 
      returnFiber.firstEffect = workInProgressFiber.firstEffect;
    }
    if (workInProgressFiber.lastEffect) { 
      if (returnFiber.lastEffect) { 
        returnFiber.lastEffect.nextEffect = workInProgressFiber.firstEffect;
      }
      returnFiber.lastEffect = workInProgressFiber.lastEffect;
    }
    if (workInProgressFiber.effectTag) { 
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workInProgressFiber;
      } else { 
        returnFiber.firstEffect = workInProgressFiber;
      }
      returnFiber.lastEffect = workInProgressFiber;
    }
  }
}

// traverse virtualDOM and create fiber node for each element
// complete effect chain
function performUnitOfWork(workInProgressFiber) {
  beginWork(workInProgressFiber)
  if (workInProgressFiber.child) { 
    return workInProgressFiber.child;
}
while (workInProgressFiber) { 
  completeUnitOfWork(workInProgressFiber);
  if (workInProgressFiber.sibling) { 
    return workInProgressFiber.sibling;
  }
    workInProgressFiber = workInProgressFiber.return;
}
}

function commitRoot() {
  let currentFiber = workInProgressRoot.firstEffect;
  while (currentFiber) {
    let returnFiber = currentFiber.return
    let returnDOM = returnFiber.stateNode
    
    if (currentFiber.effectTag === INSERT) {
      returnDOM.appendChild(currentFiber.stateNode)
    } else if (currentFiber.effectTag === DELETE) {
      returnDOM.removeChild(currentFiber.stateNode)
    } else if (currentFiber.effectTag === UPDATE) {
      if (currentFiber.type === ELEMENT_TEXT) {
        if (currentFiber.alternate.props.text !== currentFiber.props.text) {
          currentFiber.stateNode.textContent = currentFiber.props.text
        }
      }
    }

    currentFiber.effectTag = null
    currentFiber = currentFiber.nextEffect;
  }
  workInProgressRoot = null;
}

function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }

  if (!nextUnitOfWork) {
    commitRoot()
  }
}

requestIdleCallback(workLoop);