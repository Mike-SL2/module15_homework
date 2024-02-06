//задание 15.1 вариант решения 1 - когда не загрузились стили

"use strict";
const zdNumber = '15.1';	const variant = '1 (trigger)';
const header = document.querySelector("h1");
const buttonPressMe = document.querySelector(".buttonPressMe");
const glyphWhite = document.querySelector(".buttonGlyphWhite");
const glyphBlack = document.querySelector(".buttonGlyphBlack");

header.innerHTML = `Задание ${zdNumber}, вариант решения ${variant}`;

const changeIcons = function(){let blackGlyph;	const show = "block";
  			       let whiteGlyph;	const hide = "none";
  			     
  			     				let trigger = false;
			function changeIcons(){		    trigger = !trigger;
				if (trigger) {
    					whiteGlyph = show;
    					blackGlyph = hide;
  				} else {
    					whiteGlyph = hide;
    					blackGlyph = show;
  				}
  			glyphBlack.style.display = blackGlyph;
  			glyphWhite.style.display = whiteGlyph;      
}
		  return changeIcons;}();

buttonPressMe.addEventListener("click", changeIcons);

changeIcons();
