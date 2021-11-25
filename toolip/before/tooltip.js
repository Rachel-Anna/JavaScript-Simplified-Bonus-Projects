//show tool tip on hover
//position the tooltip so it appears overhead by default
//hide the tooltip on mouseleave

import addGlobalEventListener from "./utils";

const toolTipContainer = document.createElement("div");
toolTipContainer.classList.add("tooltip-container");
document.body.append(toolTipContainer);

const DEFAULT_SPACING = 5;

let POSITION_ORDER = ["top", "right", "bottom", "left"];

let MAP_POSITIONS_TO_FUNCTIONS = {
  top: positionTooltipTop,
  right: positionTooltipRight,
  bottom: positionTooltipBottom,
  left: positionTooltipLeft,
};

addGlobalEventListener("mouseover", "[data-tooltip]", (e) => {
  const tooltipMessage = createTooltipMessage(e.target.dataset.tooltip);
  e.target.addEventListener(
    "mouseleave",
    () => {
      removeTooltip(tooltipMessage);
    },
    { once: true }
  );
  toolTipContainer.append(tooltipMessage);

  positionTooltip(tooltipMessage, e.target);
});

function createTooltipMessage(text) {
  const tooltipMessage = document.createElement("div");

  tooltipMessage.classList.add("tooltip");
  tooltipMessage.innerText = text;
  return tooltipMessage;
}

function removeTooltip(tooltipMessage) {
  tooltipMessage.remove();
}

function positionTooltip(tooltipMessage, element) {
  const tooltipMessageRect = tooltipMessage.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const spacing = element.dataset.spacing || DEFAULT_SPACING;
  const preferedPositions = (element.dataset.positions || "").split("|");
  //console.log(preferedPositions);
  const positions = preferedPositions.concat(POSITION_ORDER);

  for (i = 0; i < positions.length; i++) {
    const func = MAP_POSITIONS_TO_FUNCTIONS[positions[i]];

    console.log(positions.length);
    if (func && func(tooltipMessage, spacing, elementRect, tooltipMessageRect))
      return;
  }
}

function positionTooltipTop(
  tooltipMessage,
  spacing,
  elementRect,
  tooltipMessageRect
) {
  console.log("her");
  tooltipMessage.style.top = `${
    elementRect.top - tooltipMessageRect.height - spacing
  }px`;
  tooltipMessage.style.backgroundColor = "green";

  tooltipMessage.style.left = `${
    elementRect.left + elementRect.width / 2 - tooltipMessageRect.width / 2
  }px`;

  const bounds = isOutOfBounds(tooltipMessage, spacing);
  if (bounds.top) {
    resetTooltipPosition(tooltipMessage);
    return false;
  }

  if (bounds.right) {
    tooltipMessage.style.right = `${spacing}px`;
    tooltipMessage.style.left = "initial";
  }
  if (bounds.left) {
    tooltipMessage.style.left = `${spacing}px`;
  }
  return true;
}

function positionTooltipBottom(
  tooltipMessage,
  spacing,
  elementRect,
  tooltipMessageRect
) {
  tooltipMessage.style.top = `${elementRect.bottom + spacing}px`;
  tooltipMessage.style.backgroundColor = "blue";
  tooltipMessage.style.left = `${
    elementRect.left + elementRect.width / 2 - tooltipMessageRect.width / 2
  }px`;

  const bounds = isOutOfBounds(tooltipMessage, spacing);

  if (bounds.bottom) {
    resetTooltipPosition(tooltipMessage);
    return false;
  }

  if (bounds.right) {
    tooltipMessage.style.right = `${spacing}px`;
    tooltipMessage.style.left = "initial";
  }
  if (bounds.left) {
    tooltipMessage.style.left = `${spacing}px`;
  }
  return true;
}

function positionTooltipLeft(
  tooltipMessage,
  spacing,
  elementRect,
  tooltipMessageRect
) {
  tooltipMessage.style.top = `${
    elementRect.top + elementRect.height / 2 - tooltipMessageRect.height / 2
  }px`;
  tooltipMessage.style.backgroundColor = "purple";
  tooltipMessage.style.left = `${
    elementRect.left - tooltipMessageRect.width - spacing
  }px`;

  const bounds = isOutOfBounds(tooltipMessage, spacing);

  if (bounds.left) {
    resetTooltipPosition(tooltipMessage);
    return false;
  }
  if (bounds.top) {
    tooltipMessage.style.top = `${spacing}px`;
  }

  if (bounds.bottom) {
    tooltip.style.bottom = `${spacing}px`;
    tooltip.style.top = "initial";
  }

  return true;
}

function positionTooltipRight(
  tooltipMessage,
  spacing,
  elementRect,
  tooltipMessageRect
) {
  tooltipMessage.style.top = `${
    elementRect.top + elementRect.height / 2 - tooltipMessageRect.height / 2
  }px`;
  tooltipMessage.style.backgroundColor = "red";
  console.log(spacing);
  tooltipMessage.style.left = `${elementRect.right + spacing}px`;

  const bounds = isOutOfBounds(tooltipMessage, spacing);
  console.log(bounds);
  if (bounds.right) {
    resetTooltipPosition(tooltipMessage);
    return false;
  }
  if (bounds.top) {
    tooltipMessage.style.top = `${spacing}px`;
  }
  if (bounds.bottom) {
    tooltipMessage.style.bottom = `${spacing}px`;
    tooltipMessage.style.top = "initial";
  }

  return true;
}

function resetTooltipPosition(tooltipMessage) {
  tooltipMessage.style.left = "initial";
  tooltipMessage.style.right = "initial";
  tooltipMessage.style.top = "initial";
  tooltipMessage.style.bottom = "initial";
}

function isOutOfBounds(element, spacing) {
  const rect = element.getBoundingClientRect();
  const containerRect = toolTipContainer.getBoundingClientRect();

  return {
    left: rect.left <= containerRect.left + spacing,
    right: rect.right >= containerRect.right - spacing,
    top: rect.top <= containerRect.top + spacing,
    bottom: rect.bottom >= containerRect.bottom - spacing,
  };
}
