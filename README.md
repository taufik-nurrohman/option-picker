Option Picker
=============

Accessible custom `<select>` (and `<input list>`) element.

![index.js](https://img.shields.io/github/size/taufik-nurrohman/option-picker/index.js?branch=main&color=%23f1e05a&label=index.js&labelColor=%231f2328&style=flat-square)
![index.min.js](https://img.shields.io/github/size/taufik-nurrohman/option-picker/index.min.js?branch=main&color=%23f1e05a&label=index.min.js&labelColor=%231f2328&style=flat-square)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/892942af-77fd-4678-93c9-402862bb2571">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/503ff380-fe53-4188-aeee-0006af534d60">
  <img alt="Option Picker" src="https://github.com/user-attachments/assets/503ff380-fe53-4188-aeee-0006af534d60">
</picture>

Press <kbd>Enter</kbd> or <kbd>Space</kbd> key to open/close the options list. Use <kbd>ArrowDown</kbd> and
<kbd>ArrowUp</kbd> keys to open the options list and then focus on an option, then press <kbd>Enter</kbd>,
<kbd>Space</kbd>, or <kbd>Tab</kbd> to select it. On the “strict” option picker presentation, you should be able to type
away when you focus on it to select the first active option that contains text that matches the search query you are
currently typing. On the “loose” option picker presentation, when you start to input a value, the available options get
filtered instead of selected immediately.

Contribute
----------

 - **Please do not make pull requests by editing the files that are in the root of the project. They are generated
   automatically by the build tool.**
 - Install [Git](https://en.wikipedia.org/wiki/Git) and [Node.js](https://en.wikipedia.org/wiki/Node.js)
 - Run `git clone https://github.com/taufik-nurrohman/option-picker.git`
 - Run `cd option-picker && npm install --save-dev`
 - Edit the files in the `.factory` folder.
 - Run `npm run pack` to generate the production ready files.