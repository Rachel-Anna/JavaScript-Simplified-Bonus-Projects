import setupDragAndDrop, { getDropZone } from "./dragAndDrop";
import { v4 as uuidV4 } from "uuid";

import {
  LANES_STORAGE_KEY,
  globalEventListener,
  downloadData,
  createTaskElement,
  saveLanes,
  loadLanes,
  removeItemFromLane,
  renderTasks,
  renderLanes,
} from "./utils/utils";

const addBtn = document.querySelector("[data-add-new-lane]");
let lanes = loadLanes();
const downloadBtn = document.querySelector("[data-download]");
const dataInput = document.getElementById("import-input");

setupDragAndDrop(onDragComplete);

renderLanes(lanes, addBtn);
renderTasks(lanes);

function onDragComplete(e) {
  const startLaneId = e.startZone.dataset.laneId;
  const endLaneId = e.endZone.dataset.laneId;
  const startLaneTasks = lanes[startLaneId]; //returns [{id: xx, text: xx}]
  const endLaneTasks = lanes[endLaneId];
  const task = startLaneTasks.find((t) => t.id === e.dragElement.id); //returns the task itself {id: xx, text: xx}
  startLaneTasks.splice(startLaneTasks.indexOf(task), 1);
  endLaneTasks.splice(e.index, 0, task);
  saveLanes(lanes);
}

//Adding a new task
globalEventListener("submit", "[data-task-form]", (e) => {
  e.preventDefault();
  const taskInput = e.target.querySelector("[data-task-input]");
  const taskText = taskInput.value;
  if (taskText === "") return;
  const task = { id: uuidV4(), text: taskText };
  const laneElement = e.target.closest(".lane").querySelector("[data-lane-id]");
  lanes[laneElement.dataset.laneId].push(task);
  taskInput.value = "";
  saveLanes(lanes);
  renderLanes(lanes, addBtn);
  renderTasks(lanes);
});

//For deleting task via trash can
globalEventListener("mousedown", "[data-draggable]", (e) => {
  const task = e.target;
  const originalLane = getDropZone(task);
  const trash = document.querySelector("[data-trash]");

  const hoverEffect = () => {
    trash.classList.add("onhover");
    trash.addEventListener(
      "mouseleave",
      () => {
        trash.classList.remove("onhover");
      },
      { once: true }
    );
    trash.addEventListener(
      "mouseup",
      () => {
        task.remove();
        removeItemFromLane(task, originalLane.dataset.laneId);
        trash.removeEventListener("mouseover", hoverEffect);
        trash.classList.remove("onhover");
      },
      { once: true }
    );
  };

  document.addEventListener("mousemove", () => {
    trash.addEventListener("mouseover", hoverEffect);
  });
});

//Dowloading JSON data
downloadBtn.addEventListener("click", () => {
  downloadData(LANES_STORAGE_KEY);
});

//Uploading user data to the app
dataInput.addEventListener("change", readUserData);

function readUserData(e) {
  let userData = e.target.files[0]; // Filelist object
  const reader = new FileReader();
  reader.readAsText(userData); //parse the json of the file that the user selected
  reader.onload = () => {
    //when that's done....edit lanes
    saveLanes(reader.result, LANES_STORAGE_KEY); //saving to local storage
    renderLanes(JSON.parse(reader.result), addBtn);
    renderTasks(JSON.parse(reader.result)); //rerenders using new tasks
  };
}

//Adding new lane
addBtn.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputField = addBtn.querySelector("#user-lane");
  let laneName = inputField.value;
  lanes = loadLanes();
  lanes[laneName] = [];
  saveLanes(lanes);
  renderLanes(lanes, addBtn);
  renderTasks(lanes);
  inputField.value = "";
});

//Removing lane
globalEventListener("click", "[data-delete-lane]", (e) => {
  let lane = e.target.closest(".lane");
  let id = lane.querySelector("[data-lane-id]").dataset.laneId;
  lane.remove();
  Object.entries(lanes).forEach((lane) => {
    if (lane[0] === id) {
      delete lanes[lane[0]];
      saveLanes(lanes);
    }
  });
});
