import { v4 as uuidV4 } from "uuid";

export function globalEventListener(type, selector, callback) {
  document.addEventListener(type, (e) => {
    if (e.target.matches(selector)) callback(e);
  });
}

const container = document.querySelector("[data-lane-container]");
const storagePrefix = "TRELLO_CLONE";

export const LANES_STORAGE_KEY = `${storagePrefix}-lanes`;

const DEFAULT_LANES = {
  backlog: [],
  doing: [{ id: uuidV4(), text: "Create your first task" }],
  done: [],
};

//Handling data

export function downloadData(data) {
  const dataStr = localStorage.getItem(data);
  let dataUri = `data:application/json;charset=utf-8, ${encodeURIComponent(
    dataStr
  )}`;
  let exportFileDefaultName = "data.json";

  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

export function saveLanes(lanes) {
  localStorage.setItem(
    LANES_STORAGE_KEY,
    typeof lanes === "string" ? lanes : JSON.stringify(lanes)
  );
}

export function loadLanes() {
  const lanesJson = localStorage.getItem(LANES_STORAGE_KEY);
  return JSON.parse(lanesJson) || DEFAULT_LANES;
}

//Creating elements

export function createTaskElement(task) {
  const element = document.createElement("div");
  element.id = task.id;
  element.innerText = task.text;
  element.classList.add("task");
  element.dataset.draggable = true;

  return element;
}

export function renderLanes(lanes, position) {
  //delete old ones
  removeLanesFromPage();
  //render new ones
  Object.entries(lanes).forEach((lane) => {
    const template = document.querySelector("[data-lane-template]");
    const templateClone = template.content.cloneNode(true);
    let laneId = templateClone.querySelector("[data-lane-id]");
    laneId.dataset.laneId = lane[0];
    let header = templateClone.querySelector(".header");
    header.innerText = lane[0];
    container.insertBefore(templateClone, position);
  });
}

export function renderTasks(lanes) {
  Object.entries(lanes).forEach((obj) => {
    const laneId = obj[0];
    const tasks = obj[1];
    const lane = document.querySelector(`[data-lane-id="${laneId}"]`);
    tasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      lane.append(taskElement);
    });
  });
}

//Removing elements

export function removeItemFromLane(task, taskLane) {
  Object.entries(lanes).forEach((lane) => {
    if (lane[0] === taskLane) {
      lane[1].forEach((t) => {
        if (t.id === task.id) {
          lane[1].splice(lane.indexOf(t), 1);
          saveLanes(lanes);
        }
      });
    }
  });
}

export function removeLanesFromPage() {
  const laneElements = Array.from(document.querySelectorAll(".lane"));
  laneElements.forEach((lane) => {
    lane.remove();
  });
}
