//задание 15.2 
'use strict';

const sizeButton = document.querySelector(".buttonPressMe");

sizeButton.addEventListener("click", () => {
  const doc = document.documentElement;
  const screenA = " экрана: ";
  const pixels = " точек.";
  let heightOfScreen = "Высота" + screenA + doc.clientHeight + pixels;
  let widthOfScreen = "Ширина" + screenA + doc.clientWidth + pixels;
  alert(`${heightOfScreen} \n${widthOfScreen}`);
});

	
