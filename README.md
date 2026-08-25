Page: https://namakayo.github.io/Namina/


**If the page is blank/broken, please restart the page. This is a known bug and should only happen the first time you visit the page.**

<p align="center"><img src="preview.jpg" alt="preview" width="250"></p>

# Namina
Inspired by <a href="https://github.com/Anuken/Lamina">Anuken/Lamina</a>, for mobile users.

Draw marching squares in a 8x8 grid. Namina outputs a pixelated 64x64 sprite of what you've drawn. The actual .png file is 76x76 regardless if you have outline enabled or disabled.

# Documentation
# UI
The UI consists of the main canvas, preview canvas, color picker, buttons, and the palette.

Note that the main canvas does not have the actual outline. The preview canvas has it. Also, ignore the thin line gaps in the main canvas.

Do not download your sprite manually from any of the canvases. Use the download button.
# Palette (Layer)
You can only use colors in the palette.

The order of palette color drawn to the canvas is left->right.

It is recommended to have less than 8 colors in the palette. Large palette can cause lag.

The palette is saved in local storage so you'll still have your palette after exiting.
# Buttons
| Button | Function |
| --- | --- |
| copy | Copy the current palette to the color picker |
| set | Set the current palette to the color picker |
| edit | When enabled, continuously set the current palette to the color picker |
| <- | Move the current palette to the left |
| -> | Move the current palette to the right |
| add | Add new palette color |
| remove | Remove current palette color |
| outline | Click: Toggle outline, Hold: Set outline color to the color picker |
| download | Download your epic art |

Tip: Generally, you want to diaable outline when drawing and enable when about to export. Generating outline is quite laggy.