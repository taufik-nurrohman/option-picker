Option Picker
=============

![Code Size](https://img.shields.io/github/languages/code-size/taufik-nurrohman/option-picker?color=%23444&style=for-the-badge) ![License](https://img.shields.io/github/license/taufik-nurrohman/option-picker?color=%23444&style=for-the-badge)

> Just a generic custom `<select>` element with accessibility in mind.

![Option Picker](https://user-images.githubusercontent.com/1669261/126900722-52aa3eab-aa38-424f-8134-f5f7cd902859.png)

[Demo and Documentation](https://taufik-nurrohman.github.io/option-picker "View Demo")

Contribute
----------

 - **Please do not make pull requests by editing the files that are in the root of the project. They are generated automatically by the build tool.**
 - Install [Git](https://en.wikipedia.org/wiki/Git) and [Node.js](https://en.wikipedia.org/wiki/Node.js)
 - Run `git clone https://github.com/taufik-nurrohman/option-picker.git`
 - Run `cd option-picker && npm install --save-dev`
 - Edit the files in the `.github/source` folder.
 - Run `npm run pack` to generate the production ready files.

---

Release Notes
-------------

### 1.3.4

 - Added ability to convert `<input>` element with `list` attribute.
 - Fixed the custom select box insertion node that does not consider the text node.

### 1.2.4

 - Added CSS variables for easy integration with third-party applications.

### 1.1.4

 - Changed CSS classes to follow the [BEM](http://getbem.com) approach.
 - Maintenance.

### 1.0.1

 - Fixed broken `picker.pop()` response.
 - Removed `picker.value` property.

### 1.0.0

 - Initial release.