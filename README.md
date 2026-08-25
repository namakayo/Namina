Page: https://namakayo.github.io/Namina/


**If the page is blank/broken, please restart the page. This is a known bug and should only happen the first time you visit the page.**

Let me know if there are any issues.

<p align="center"><img src="preview.jpg" alt="preview" width="250"></p>

# Namina
Inspired by <a href="https://github.com/Anuken/Lamina">Anuken/Lamina</a>, for mobile users.

Draw marching squares in a 8x8 grid. Namina outputs a pixelated 64x64 sprite of what you've drawn. The actual .png file is 74x74 regardless if you have outline enabled or disabled.

You are free to use the sprites made using Namina without credits.

## Documentation
### UI
The UI consists of the main canvas, preview canvas, color picker, buttons, layers, and the palette.

Note that the main canvas does not have the actual outline. The preview canvas has it. Also, ignore the thin line gaps in the main canvas.

You can set outline color to the color picker by long-pressing the outline button.
### Palette
The palette can be opened using the palette button. This should be self-explanatory.

While selecting a color in the palette, the buttons will switch to work in the palette instead of layers.

Colors is saved in local storage so you'll still have your palette after exiting.
### Layers
The order of layers drawn to the canvas is left->right.

It is recommended to have less than 8 layers. Large amount of layers can cause lag.

Layer colors is saved in local storage just like the palette so you'll still have the same colors after exiting.
### Buttons
| Button | Function |
| --- | --- |
| copy | Copy the current layer color to the color picker |
| set | Set the current layer color to the color picker |
| edit | When enabled, continuously set the current layer color to the color picker |
| <- | Move the current layer to the left |
| -> | Move the current layer to the right |
| add | Add a new layer |
| remove | Remove current layer |
| outline | Click: Toggle outline, Hold: Set outline color to the color picker |
| download | Download your epic art |
| palette | Open/close your palette |

Tip: Generally, you want to disable outline when drawing and enable when about to export. Generating outline is quite laggy.