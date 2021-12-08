import setupDragAndDrop, { getDropZone } from "./dragAndDrop";
import { v4 as uuidV4 } from "uuid";
import { globalEventListener } from "./utils.js";

//Setting up the drag and drop
setupDragAndDrop(onDragComplete);

globalEventListener("submit", "[data-task-form]", (e) => {
  e.preventDefault();
  const taskInput = e.target.querySelector("[data-task-input]");
  const taskText = taskInput.value;
  if (taskText === "") return;

  const task = { id: uuidV4(), text: taskText };
  const laneElement = e.target.closest(".lane").querySelector("[data-lane-id]");
  lanes[laneElement.dataset.laneId].push(task);
  const taskElement = createTaskElement(task);
  laneElement.append(taskElement);
  taskInput.value = "";
  saveLanes(lanes);
});

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
//setting up lanes and saving the tasks
const storagePrefix = "TRELLO_CLONE";
const LANES_STORAGE_KEY = `${storagePrefix}-lanes`;

const DEFAULT_LANES = {
  backlog: [],
  doing: [{ id: uuidV4(), text: "Create your first task" }],
  done: [],
};

const container = document.querySelector("[data-lane-container]");
const addBtn = document.querySelector("[data-add-new-lane]");

const lanes = loadLanes();
renderLanes(lanes);
renderTasks(lanes);

function loadLanes() {
  const lanesJson = localStorage.getItem(LANES_STORAGE_KEY);
  return JSON.parse(lanesJson) || DEFAULT_LANES;
}

function saveLanes(lanes) {
  localStorage.setItem(
    LANES_STORAGE_KEY,
    typeof lanes === "string" ? lanes : JSON.stringify(lanes)
  );
}

function renderTasks(lanes) {
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

function createTaskElement(task) {
  const element = document.createElement("div");
  element.id = task.id;
  element.innerText = task.text;
  element.classList.add("task");
  element.dataset.draggable = true;

  return element;
}

//makes trash can bobble when you drag a task over it
globalEventListener("mousedown", "[data-draggable]", (e) => {
  const task = e.target;
  const originalLane = getDropZone(task);
  const trash = document.querySelector("[data-trash]");

  const hoverEffect = () => {
    trash.classList.add("onhover");
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

  const deleteTaskCheck = (e) => {
    trash.addEventListener("mouseover", hoverEffect);
  };

  document.addEventListener("mousemove", deleteTaskCheck);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", deleteTaskCheck);
  });
});

function removeItemFromLane(task, taskLane) {
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

const downloadBtn = document.querySelector("[data-download]");
downloadBtn.addEventListener("click", downloadData);

function downloadData() {
  const dataStr = localStorage.getItem(LANES_STORAGE_KEY);
  let dataUri = `data:application/json;charset=utf-8, ${encodeURIComponent(
    dataStr
  )}`;
  let exportFileDefaultName = "data.json";

  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

const dataInput = document.getElementById("import-input");
dataInput.addEventListener("change", readUserData);

function readUserData(e) {
  let userData = e.target.files[0]; // Filelist object
  const reader = new FileReader();
  reader.readAsText(userData); //parse the json of the file that the user selected
  reader.onload = () => {
    //when that's done....edit lanes
    saveLanes(reader.result); //saving to local storage
    let lanes = loadLanes(); //setting the lanes based on local storage
    removePreviousTasks(); //removes old tasks
    renderTasks(lanes); //rerenders using new tasks
  };
}

function removePreviousTasks() {
  const lanes = Array.from(document.querySelectorAll("[data-lane-id]"));
  lanes.forEach((lane) => {
    lane.innerHTML = "";
  });
}

//3. add a button that allows a user to create new lanes and drag the tasks between each laanes

addBtn.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputField = addBtn.querySelector("#user-lane");
  let laneName = inputField.value;
  lanes[laneName] = [];
  saveLanes(lanes);

  const laneElements = Array.from(document.querySelectorAll(".lane"));

  laneElements.forEach((lane) => {
    lane.remove();
  });
  renderLanes(lanes);
  //renderTasks(newLanes);
  inputField.value = "";
});

function renderLanes(lanes) {
  Object.entries(lanes).forEach((lane) => {
    const template = document.querySelector("[data-lane-template]");
    const templateClone = template.content.cloneNode(true);
    let laneId = templateClone.querySelector("[data-lane-id]");
    laneId.dataset.laneId = lane[0];
    let header = templateClone.querySelector(".header");
    header.innerText = lane[0];
    container.insertBefore(templateClone, addBtn);
  });
}

globalEventListener("click", "[data-delete-lane]", (e) => {
  let lane = e.target.closest(".lane");
  let id = lane.querySelector("[data-lane-id]").dataset.laneId;

  lane.remove();
  Object.entries(lanes).forEach((lane) => {
    if (lane[0] === id) {
      console.log(lane[0]);
      delete lanes[lane[0]];
      saveLanes(lanes);
      //lanes[0].splice(lane.indexOf(lane[0]), 1);
      //saveLanes(lanes);
    }
  });
});
