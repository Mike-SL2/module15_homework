//задание 15.3

"use strict";
let socket1;
const url = "wss://echo-ws-service.herokuapp.com";
const doc = document;
const px = "px";
let buttonSendBlinker;
const CHAT_PNL_WIDTH = 500;
const SCROLL_STEP = 10;
let firstMessage;
const CHAT_PNL_HEIGHT = 500;
const SCROLL_TIME = 10;
let connIntervalID; 			//connection interval timer ID
const RECONNECT_TIMEOUT = 10000;
const BOTTOM_MARGIN_AUTO_SCROLL = 20;
const ERROR_SHOW_TIME = 500;
const buttonChatGeoCaption = "Гео-локация";
//----------------------------------------------------------
const accordion = doc.querySelector(".baYan");
accordion.addEventListener("mouseleave", () => {
  let yPos = accordion.scrollTop;
  setTimeout(function scrollToUp() {
    if (yPos > 0) {
      accordion.scrollTo(0, yPos);
      yPos -= SCROLL_STEP;
      setTimeout(scrollToUp, SCROLL_TIME);
    } else {
      accordion.scrollTo(0, 0);
    }
  }, SCROLL_TIME);
});

const buttonChatSend = doc.querySelector(".buttonChatSend");
const chatInput = doc.querySelector(".chatInput");
buttonChatSend.style.background = "cadetblue";
const buttonChatGeo = doc.querySelector(".buttonChatGeo");
const chatWindow = doc.querySelector(".chatWindow");
const statusWindow = doc.querySelector(".statusMonitor");
const chatPanel = doc.querySelector(".chatPanel");
buttonChatGeo.innerHTML = buttonChatGeoCaption;
chatPanel.style.height = CHAT_PNL_HEIGHT + px;
chatPanel.style.width = CHAT_PNL_WIDTH + px;

const chatPanelXYMax = () => {
  const docEl = doc.documentElement;
  const paddingMAX = 15;
  let CHAT_PNL_MAX_X = docEl.clientWidth - CHAT_PNL_WIDTH - paddingMAX;
  let CHAT_PNL_MAX_Y = docEl.clientHeight - CHAT_PNL_HEIGHT - paddingMAX;
  if (CHAT_PNL_MAX_Y < 0 || CHAT_PNL_MAX_X < 0) {
    CHAT_PNL_MAX_Y = 1;
    CHAT_PNL_MAX_X = 1;
  }
  return { X: CHAT_PNL_MAX_X, Y: CHAT_PNL_MAX_Y };
};
const chatPanelInitialPos = () => {
  const XYmax = chatPanelXYMax();
  chatPanel.style.top = XYmax.Y + px;
  chatPanel.style.zIndex = 1;
  chatPanel.style.left = XYmax.X + px;
};
const moveChatPanel = (kyda) => {
  const XYmax = chatPanelXYMax();
  const box = chatPanel.getBoundingClientRect();
  const boxY = box.top + window.pageYOffset;
  const boxX = box.left + window.pageXOffset;
  const shiftX = kyda.pageX - boxX;
  const shiftY = kyda.pageY - boxY;
  const movePnl = (kyda) => {
    let x = kyda.pageX - shiftX;
    let y = kyda.pageY - shiftY;
    if (x > XYmax.X) {
      x = XYmax.X;
    }
    if (x < 0) {
      x = 0;
    }
    if (y > XYmax.Y) {
      y = XYmax.Y;
    }
    if (y < 0) {
      y = 0;
    }
    chatPanel.style.top = y + px;
    chatPanel.style.left = x + px;
  };
  const mouseOff = () => {
    doc.removeEventListener("mousemove", movePnl);
    doc.removeEventListener("mouseup", mouseOff);
  };
  movePnl(kyda);
  doc.addEventListener("mousemove", movePnl);
  doc.addEventListener("mouseup", mouseOff);
};

chatPanel.ondragstart = () => false;
chatWindow.addEventListener("mousedown", (eventMouse) => {
  chatPanel.style.zIndex = 1;
  moveChatPanel(eventMouse);
});
const chatPanelUnderAll = () => {
  chatPanel.style.zIndex = -1;
};
accordion.addEventListener("mouseover", chatPanelUnderAll);
let baYanCBEPXY = true;
doc.addEventListener("DOMContentLoaded", chatPanelInitialPos);
window.addEventListener("resize", chatPanelInitialPos);
//----------------------------------------------------------
let doNtShowNextReply = false;
const messageMonitor = (messageText, agent) => {
  if (agent === "client") {
    doNtShowNextReply = false;
  } else {
    if (doNtShowNextReply) {
      doNtShowNextReply = false;
      return;
    }
  }

  const mesBx = " messageBox";
  let messageLine;
  let bottomSpaces;
  let lastBottomSpace;
  let lastBottomSpaceNumber;
  const clientClass = `<div class="clientMessage${mesBx}">`;
  const serverClass = `<div class="serverMessage${mesBx}">`;
  switch (agent) {
    case "client":
      messageLine = clientClass;
      break;
    case "server":
      messageLine = serverClass;
      break;
    case "geodata":
      doNtShowNextReply = true;
      messageLine = clientClass;
      break;
  }
  chatWindow.insertAdjacentHTML(
    "beforeend",
    `${messageLine}${messageText}</div>`,
  );

  let chatWindowPosition = chatWindow.getBoundingClientRect();
  let lastMessagePosition = chatWindow.lastElementChild.getBoundingClientRect();
  let delta = lastMessagePosition.bottom - chatWindowPosition.bottom;
  if (delta > 0) {
    chatWindow.insertAdjacentHTML(
      "beforeend",
      `<div class="bottomSpace"><br></div>`,
    );

    bottomSpaces = doc.querySelectorAll(".bottomSpace");

    chatWindow.lastElementChild.style.height = BOTTOM_MARGIN_AUTO_SCROLL + px;
    if (bottomSpaces.length > 1) {
      chatWindow.removeChild(bottomSpaces[0]);
    }

    chatWindow.scrollBy(0, delta + BOTTOM_MARGIN_AUTO_SCROLL);
  }
};
//----------------------------------------------------------
const buttonSendNoBlink = () => {
  if (buttonSendBlinker) {
    clearInterval(buttonSendBlinker);
    buttonSendBlinker = 0;
    buttonChatSend.style.background = "";
  }
};
const statusMonitor = (statusInfo = "") => {
  if (statusInfo) {
    statusWindow.style.display = "block";
  }
  const WebSocketConn = " WebSocket connection ";
  switch (statusInfo) {
    case "failConnection":
      setTimeout(() => {
        statusWindow.innerHTML = WebSocketConn + 'to "' + url + '" failed.';
        statusWindow.style.color = "red";
        statusWindow.style.background = "black";
        setTimeout(() => {
          statusWindow.style.color = "";
          statusWindow.style.background = "";
        }, ERROR_SHOW_TIME);
      }, ERROR_SHOW_TIME);
      break;
    case "ConnectSuccess":
      statusWindow.innerHTML =
        ' Connection to "' + url + '" established.<br> Type the first message.';
      break;
    case "WaitForConnect":
      statusWindow.innerHTML = " Waiting for" + WebSocketConn + "...";
      break;
    default:
      statusWindow.innerHTML = "";
      statusWindow.style.display = "none";
      break;
  }
};
const socketReady = () => {
  statusMonitor("ConnectSuccess");
  let triggerBlink = false;
  firstMessage = true;
  buttonSendBlinker = setInterval(() => {
    triggerBlink = !triggerBlink;
    if (triggerBlink) {
      buttonChatSend.style.background = "";
    } else {
      buttonChatSend.style.background = "cadetblue";
    }
  }, 500);
};
const buttonSendClick = () => {
  let inputMessage = chatInput.value;
  if (inputMessage.length > 0) {
    if (firstMessage) {
      statusMonitor();
      buttonSendNoBlink();
      if (baYanCBEPXY) {
        accordion.removeEventListener("mouseover", chatPanelUnderAll);
        baYanCBEPXY = false;
      }
      firstMessage = false;
    }
    chatInput.value = "";
    messageMonitor(inputMessage, "client");
    socket1.send(inputMessage);
  }
};

const connect = (url) => {
  statusMonitor("WaitForConnect");
  connIntervalID = setInterval(() => {
    socket1 = new WebSocket(url);

    socket1.addEventListener("error", () => {
      statusMonitor("failConnection");
      socket1 = null;
    });
    socket1.addEventListener("close", () => {
      if (connIntervalID === 0) {
        connect(url);
        buttonSendNoBlink();
        buttonChatSend.style.background = "cadetblue";
        buttonChatSend.removeEventListener("click", buttonSendClick);
      }
    });
    socket1.addEventListener("open", () => {
      if (connIntervalID) {
        buttonSendNoBlink();
        socketReady();
        buttonChatSend.addEventListener("click", buttonSendClick);
        clearInterval(connIntervalID);
        connIntervalID = 0;
      }
    });
    socket1.addEventListener("message", (event) => {
      messageMonitor(event.data, "server");
    });
  }, RECONNECT_TIMEOUT);
};
//----------------------------------------------------------
connect(url);
chatInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13 && connIntervalID === 0) {
    buttonSendClick();
  }
});
//----------------------------------------------------------
const geoLocationResult = (resultMessage = "") => {
  let errMessage = "";
  switch (resultMessage) {
    case "ERR1":
      errMessage = "данных от модуля";
      break;
    case "ERR2":
      errMessage = "доступа к модулю";
      break;
    default:
      messageMonitor(resultMessage, "geodata");
  }
  if (errMessage) {
    messageMonitor(`Геолокация недоступна. Нет ${errMessage} GPS.`, "client");
    buttonChatGeo.style.background = "lightpink";
    buttonChatGeo.style.color = "gray";
  }
  buttonChatGeo.addEventListener("click", getGeoData);
  buttonChatGeo.innerHTML = buttonChatGeoCaption;
};
const getGeoData = (function () {
  let geoInfo;
  let geoLink;
  const mapURL = "https://www.openstreetmap.org/";
  const qu = '"';
  const lnkTxt = buttonChatGeoCaption;
  function getGeoData() {
    if (baYanCBEPXY) {
      accordion.removeEventListener("mouseover", chatPanelUnderAll);
      baYanCBEPXY = false;
    }
    buttonChatGeo.removeEventListener("click", getGeoData);
    geoInfo = "";
    geoLink = `<a href=${qu}${mapURL}?mlat=`;
    buttonChatGeo.innerHTML = "Запрос...";
    buttonChatGeo.style.background = "";
    buttonChatGeo.style.color = "";
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { coords } = position;
        geoLink = `${geoLink}${coords.latitude}&mlon=${coords.longitude}${qu}>${lnkTxt}</a>`;
        geoInfo = `${coords.latitude}° N, ${coords.longitude}° E`;
        geoLocationResult(geoLink);
        if (connIntervalID === 0) {
          socket1.send(geoInfo);
        }
      });
    } else {
      geoLocationResult("ERR2");
    }
    setTimeout(() => {
      if (geoInfo === "") {
        geoLocationResult("ERR1");
      }
    }, RECONNECT_TIMEOUT);
  }
  return getGeoData;
})();
buttonChatGeo.addEventListener("click", getGeoData);
