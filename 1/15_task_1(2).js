//задание 15.1 вариант решения 2

"use strict";
const taskNumber = "15.1";
const variant = "2 (toggle)";
const header = document.querySelector("h1");
const buttonPressMe = document.querySelector(".buttonPressMe");
const glyphWhite = document.querySelector(".buttonGlyphWhite");
const glyphBlack = document.querySelector(".buttonGlyphBlack");

header.innerHTML = `Задание ${taskNumber}, вариант решения ${variant}`;

buttonPressMe.addEventListener("click", () => {
  glyphWhite.classList.toggle("hideElement");
  glyphBlack.classList.toggle("hideElement");
});