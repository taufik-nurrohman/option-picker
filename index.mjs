import {D, R, W, getAria, getAttribute, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getRole, getState, getStyle, getText, getValue, hasClass, hasDatum, hasState, isDisabled, isReadOnly, letAria, letAttribute, letClass, letDatum, letElement, letID, letStyle, setAria, setAttribute, setChildLast, setClass, setClasses, setDatum, setElement, setHTML, setID, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {/* focusTo, */insertAtSelection, selectTo, selectToNone} from '@taufik-nurrohman/selection';
import {forEachArray, forEachMap, forEachObject, getPrototype, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toKeysFromMap, toKeyFirstFromMap, toKeyLastFromMap, toValuesFromMap, toValueFirstFromMap, toValueLastFromMap} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getOffset, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {getRect} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isBoolean, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toValue} from '@taufik-nurrohman/to';

const FILTER_COMMIT_TIME = 10;
const SEARCH_CLEAR_TIME = 500;

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_BEGIN = 'Home';
const KEY_DELETE_LEFT = 'Backspace';
const KEY_DELETE_RIGHT = 'Delete';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_PAGE_DOWN = 'PageDown';
const KEY_PAGE_UP = 'PageUp';
const KEY_TAB = 'Tab';

const OPTION_SELF = 0;

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_mask, mask, self, state} = $,
        {options, value} = _mask,
        {strict} = state,
        hasSize = getDatum(mask, 'size'), option, v;
    let count = _options.count();
    if (selectOnly) {
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if ("" !== q && q === text.slice(0, toCount(q)) && !getAria(v[2], 'disabled')) {
                selectToOption(v[2], $);
                if (hasSize) {
                    scrollTo(v[2]);
                }
                return 0;
            }
            --count;
        });
    } else {
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if ("" === q || hasValue(q, text)) {
                v[2].hidden = false;
            } else {
                v[2].hidden = true;
                --count;
            }
        });
        options.hidden = !count;
        let a = getValue(self), b;
        if (strict) {
            selectToOptionsNone($);
            // Silently select the first option without affecting the currently typed query and focus/select state
            if (count && (option = goToOptionFirst($))) {
                setAria(option, 'selected', true);
                setAttribute(option._[OPTION_SELF], 'selected', "");
                setValue(self, b = getOptionValue(option));
                option._[OPTION_SELF].selected = true;
            } else {
                setValue(self, b = "");
            }
        } else {
            setValue(self, b = query);
        }
        if (a !== b) {
            $.fire('change', ["" !== b ? b : null]);
        }
    }
    $.fire('search', [query = "" !== query ? query : null]);
    let call = state.options;
    // Only fetch when no other option(s) are available to query
    if (0 === count && isFunction(call)) {
        setAria(mask, 'busy', true);
        call = call.call($, query);
        if (isInstance(call, Promise)) {
            call.then(v => {
                createOptionsFrom($, v, options);
                letAria(mask, 'busy');
                let values = [];
                forEachMap($._options, v => values.push(getOptionValue(v[2])));
                $.fire('load', [query, values])[goToOptionFirst($) ? 'enter' : 'exit']().fit();
            });
        } else {
            createOptionsFrom($, call, options);
        }
    }
}, FILTER_COMMIT_TIME);

const name = 'OptionPicker';

function createOptions($, options, values) {
    let items, itemsParent, key, selected = [],
        {_options, self, state} = $,
        {n} = state,
        value = getValue(self);
    n += '__option';
    if (isInput(self)) {
        items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
    } else {
        items = getChildren(itemsParent = self);
    }
    // Reset the option(s) data, but leave the typed query in place, and do not fire the `let.options` hook
    _options.delete(null, 0, 0);
    forEachMap(values, (v, k) => {
        if (isArray(v) && v[1] && !v[1].disabled && v[1].selected) {
            selected.push(toValue(v[1].value ?? k));
        }
        // Set the option data, but do not fire the `set.option` hook
        _options.set(toValue(isArray(v) && v[1] ? (v[1].value ?? k) : k), v, 0);
    });
    if (!isFunction(state.options)) {
        state.options = values;
    }
    if (0 === toCount(selected)) {
        // If there is no selected option(s), get it from the current value
        if (hasKeyInMap(key = toValue(value), values)) {
            return [key];
        }
        // Or get it from the first option
        if (key = getOptionSelected($)) {
            return [getOptionValue(key, 1)];
        }
    }
    return selected;
}

function createOptionsFrom($, options, maskOptions) {
    const map = isInstance(options, Map) ? options : new Map;
    if (isArray(options)) {
        forEachArray(options, option => {
            if (isArray(option)) {
                option[0] = option[0] ?? "";
                option[1] = option[1] ?? {};
                setValueInMap(toValue(option[1].value ?? option[0]), option, map);
            } else {
                setValueInMap(toValue(option), [option, {}], map);
            }
        });
    } else if (isObject(options, 0)) {
        forEachObject(options, (v, k) => {
            if (isArray(v)) {
                options[k][0] = v[0] ?? "";
                options[k][1] = v[1] ?? {};
                setValueInMap(toValue(v[1].value ?? k), v, map);
            } else {
                setValueInMap(toValue(k), [v, {}], map);
            }
        });
    }
    return createOptions($, maskOptions, map);
}

function focusTo(node) {
    return node.focus(), node;
}

function focusToOption(option, picker) {
    if (option) {
        return focusTo(option), option;
    }
}

function focusToOptionFirst(picker, k) {
    let option;
    if (option = goToOptionFirst(picker, k)) {
        return focusToOption(option, picker);
    }
}

function focusToOptionLast(picker) {
    return focusToOptionFirst(picker, 'Last');
}

function getOptionSelected($, strict) {
    let {_options, self} = $, selected;
    forEachMap(_options, (v, k) => {
        if (isArray(v) && v[2] && !getAria(v[2], 'disabled') && getAria(v[2], 'selected')) {
            return (selected = v[2]), 0;
        }
    });
    if (!isSet(selected) && (strict || !isInput(self))) {
        // Select the first option
        forEachMap(_options, (v, k) => {
            return (selected = v[2]), 0;
        });
    }
    return selected;
}

function getOptionValue(option, parseValue) {
    return getDatum(option, 'value', parseValue);
}

function getOptionsValues(options, parseValue) {
    return options.map(v => getOptionValue(v, parseValue));
}

function getOptions(self) {
    const map = new Map;
    let item, items, itemsParent, selected = [],
        value = getValue(self);
    if (isInput(self)) {
        items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
    } else {
        items = getChildren(itemsParent = self);
    }
    forEachArray(items, (v, k) => {
        let attributes = getAttributes(v);
        forEachArray(['disabled', 'selected'], k => {
            if (hasState(attributes, k)) {
                attributes[k] = "" === attributes[k] ? true : attributes[k];
                if ('selected' === k) {
                    selected.push(1);
                }
            } else {
                attributes[k] = null;
            }
        });
        if ('optgroup' === getName(v)) {
            forEachMap(getOptions(v), (vv, kk) => {
                vv[1]['&'] = v.label;
                setValueInMap(toValue(kk), vv, map);
            });
        } else {
            setValueInMap(toValue(v.value), [getText(v) || v.value, attributes, null, v], map);
        }
    });
    // If there is no selected option(s), get it from the current value
    if (0 === toCount(selected) && (item = getValueInMap(value = toValue(value), map))) {
        item[1].selected = true;
        setValueInMap(value, item, map);
    }
    return map;
}

function getOptionsSelected($) {
    let {_options} = $, selected = [];
    return forEachMap(_options, (v, k) => {
        if (isArray(v) && v[2] && !getAria(v[2], 'disabled') && getAria(v[2], 'selected')) {
            selected.push(v[2]);
        }
    }), selected;
}

function goToOptionFirst(picker, k) {
    let {_options} = picker, option;
    if (option = toValuesFromMap(_options)['find' + (k || "")](v => !getAria(v[2], 'disabled') && !v[2].hidden)) {
        return option[2];
    }
}

function goToOptionLast(picker, k) {
    return goToOptionFirst(picker, 'Last');
}

function isInput(self) {
    return 'input' === getName(self);
}

function onBlurTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, state} = picker,
        {options} = _mask,
        {strict} = state, option;
    if (strict) {
        if (!options.hidden && (option = getOptionSelected(picker, 1))) {
            selectToOption(option, picker);
        } else {
            options.hidden = false;
            selectToOptionsNone(picker, 1);
        }
    }
}

function onCutTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, self, strict} = picker,
        {hint} = _mask;
    let a = getValue(self), b;
    delay(() => {
        getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
        if (strict) {} else {
            if (a !== (b = getText($))) {
                setValue(self, b);
                picker.fire('change', ["" !== b ? b : null]);
            }
        }
    }, 1)();
}

function onFocusOption(e) {
    selectToNone();
}

// Focus on the “visually hidden” self will move its focus to the mask, maintains the natural flow of the tab(s)!
function onFocusSelf(e) {
    getReference(this).focus();
}

function onFocusTextInput(e) {
    let $ = this,
        picker = getReference($);
    getText($, 0) ? selectTo($) : picker.enter().fit();
}

let searchQuery = "";

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        picker = getReference($),
        {_mask, _options, mask, self, state} = picker,
        {hint, input} = _mask,
        {strict} = state;
    picker._event = e;
    delay(() => getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color'), 1)();
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
        delay(() => picker.enter().fit(), FILTER_COMMIT_TIME + 1)();
    }
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = getValueInMap(toValue(getValue(self)), _options.values);
        currentOption = currentOption ? currentOption[2] : 0;
        if (!currentOption || currentOption.hidden) {
            currentOption = toValueFirstFromMap(_options);
            currentOption = currentOption ? currentOption[2] : 0;
            while (currentOption && (getAria(currentOption, 'disabled') || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        exit = true;
        if (!getAria(mask, 'expanded')) {
            picker.enter(exit);
            currentOption && focusTo(currentOption);
        } else if (strict && KEY_ENTER === key) {
            // Automatically select the first option!
            selectToOptionFirst(picker) && picker.exit(exit);
        } else {
            currentOption && focusTo(currentOption);
        }
    } else if (KEY_TAB === key) {
        picker.exit();
    } else {
        delay(() => {
            if ("" === searchQuery || searchQuery !== getText($) + "") {
                filter(picker, $, _options);
                searchQuery = getText($) + "";
            }
        }, 1)();
    }
    if (exit) {
        offEventDefault(e);
        offEventPropagation(e);
    }
}

let searchTerm = "",
    searchTermClear = debounce(() => (searchTerm = ""), SEARCH_CLEAR_TIME);

function onKeyDownOption(e) {
    let $ = this, exit,
        key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        picker = getReference($),
        {_mask, _options, mask, self} = picker,
        {hint, input, value} = _mask;
    let optionNext, optionParent, optionPrev, valueCurrent, valueNext;
    picker._event = e;
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
        exit = true;
        if (valueCurrent = getElement('[data-value="' + getOptionValue($).replace(/"/g, '\\"') + '"]', getParent(value))) {
            focusTo(valueCurrent);
        }
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (picker.max > 1) {
            if (KEY_ESCAPE === key) {
                picker.exit(exit = true);
            } else if (KEY_TAB === key) {
                picker.exit(exit = false);
            } else {
                toggleToOption($, picker);
            }
        } else {
            if (KEY_ESCAPE !== key) {
                selectToOption($, picker);
            }
            picker.exit(exit = KEY_TAB !== key);
        }
    } else if (KEY_ARROW_DOWN === key || KEY_PAGE_DOWN === key) {
        exit = true;
        if (KEY_PAGE_DOWN === key && 'group' === getRole(optionParent = getParent($))) {
            optionNext = getNext(optionParent);
        } else {
            optionNext = getNext($);
        }
        // Skip disabled and hidden option(s)…
        while (optionNext && (getAria(optionNext, 'disabled') || optionNext.hidden)) {
            optionNext = getNext(optionNext);
        }
        if (optionNext) {
            // Next option is a group?
            if ('group' === getRole(optionNext)) {
                optionNext = getChildFirst(optionNext);
            }
        // Is the last option?
        } else {
            // Is in a group?
            if ((optionParent = getParent($)) && 'group' === getRole(optionParent)) {
                optionNext = getNext(optionParent);
            }
            // Next option is a group?
            if (optionNext && 'group' === getRole(optionNext)) {
                optionNext = getChildFirst(optionNext);
            }
        }
        // Skip disabled and hidden option(s)…
        while (optionNext && (getAria(optionNext, 'disabled') || optionNext.hidden)) {
            optionNext = getNext(optionNext);
        }
        optionNext ? focusToOption(optionNext, picker) : focusToOptionFirst(picker);
    } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
        exit = true;
        if (KEY_PAGE_UP === key && 'group' === getRole(optionParent = getParent($))) {
            optionPrev = getPrev(optionParent);
        } else {
            optionPrev = getPrev($);
        }
        // Skip disabled and hidden option(s)…
        while (optionPrev && (getAria(optionPrev, 'disabled') || optionPrev.hidden)) {
            optionPrev = getPrev(optionPrev);
        }
        if (optionPrev) {
            // Previous option is a group?
            if ('group' === getRole(optionPrev)) {
                optionPrev = getChildLast(optionPrev);
            }
        // Is the first option?
        } else {
            // Is in a group?
            if ((optionParent = getParent($)) && 'group' === getRole(optionParent)) {
                optionPrev = getPrev(optionParent);
            }
            // Previous option is a group?
            if (optionPrev && 'group' === getRole(optionPrev)) {
                optionPrev = getChildLast(optionPrev);
            }
        }
        // Skip disabled and hidden option(s)…
        while (optionPrev && (getAria(optionPrev, 'disabled') || optionPrev.hidden)) {
            optionPrev = getPrev(optionPrev);
        }
        optionPrev ? focusToOption(optionPrev, picker) : focusToOptionLast(picker);
    } else if (KEY_BEGIN === key) {
        exit = true;
        focusToOptionFirst(picker);
    } else if (KEY_END === key) {
        exit = true;
        focusToOptionLast(picker);
    } else {
        if (keyIsCtrl && 'a' === key && !isInput(self) && picker.max > 1) {
            exit = true;
            forEachMap(_options, (v, k) => {
                if (!getAria(v[2], 'disabled') && !v[2].hidden) {
                    letAria(valueCurrent = v[2], 'selected');
                    letAttribute(v[3], 'selected');
                    v[3].selected = false;
                    toggleToOption(valueCurrent, picker); // Force select
                }
            });
            valueCurrent && focusTo(valueCurrent);
        } else if (!keyIsCtrl) {
            isInput(self) && 1 === toCount(key) && !keyIsAlt && setStyle(hint, 'color', 'transparent');
            picker.exit(!(exit = false));
        }
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onKeyDownValue(e) {
    let $ = this, exit,
        key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        picker = getReference($),
        {_mask, _options, self} = picker,
        valueCurrent, valueNext, valuePrev;
    searchTermClear();
    if (isDisabled(self) || isReadOnly(self)) {
        return offEventDefault(e);
    }
    picker._event = e;
    if (KEY_DELETE_LEFT === key) {
        searchTerm = "";
        if (valueCurrent = getValueInMap(toValue(getOptionValue($)), _options.values)) {
            letAria(valueCurrent[2], 'selected');
            letAttribute(valueCurrent[3], 'selected');
            valueCurrent[3].selected = false;
            if ((valuePrev = getPrev($)) && hasDatum(valuePrev, 'value') || (valuePrev = getNext($)) && hasDatum(valuePrev, 'value')) {
                focusTo(_mask.value = valuePrev);
                offEvent('keydown', $, onKeyDownValue);
                offEvent('mousedown', $, onPointerDownValue);
                offEvent('touchstart', $, onPointerDownValue);
                letElement($);
            // Do not remove the only option value
            } else {
                letDatum($, 'value');
                setHTML($, "");
            }
        }
        let max = picker.max;
        if (max !== Infinity && max > toCount(getOptionsSelected(picker))) {
            forEachMap(_options, (v, k) => {
                if (!v[3].disabled) {
                    letAria(v[2], 'disabled');
                    setAttribute(v[2], 'tabindex', 0);
                }
            });
        }
    } else if (KEY_DELETE_RIGHT === key) {
        searchTerm = "";
        if (valueCurrent = getValueInMap(toValue(getOptionValue($)), _options.values)) {
            letAria(valueCurrent[2], 'selected');
            letAttribute(valueCurrent[3], 'selected');
            valueCurrent[3].selected = false;
            if ((valueNext = getNext($)) && hasDatum(valueNext, 'value') || (valueNext = getPrev($)) && hasDatum(valueNext, 'value')) {
                focusTo(_mask.value = valueNext);
                offEvent('keydown', $, onKeyDownValue);
                offEvent('mousedown', $, onPointerDownValue);
                offEvent('touchstart', $, onPointerDownValue);
                letElement($);
            // Do not remove the only option value
            } else {
                letDatum($, 'value');
                setHTML($, "");
            }
        }
    } else if (KEY_ESCAPE === key) {
        searchTerm = "";
        picker.exit(exit = true);
    } else if (KEY_TAB === key) {
        searchTerm = "";
        picker.exit(exit = false);
    } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || KEY_PAGE_DOWN === key || KEY_PAGE_UP === key || ("" === searchTerm && ' ' === key)) {
        if (KEY_ENTER === key || ("" === searchTerm && ' ' === key)) {
            if (valueCurrent = getValueInMap(toValue(getOptionValue($)), _options.values)) {
                focusTo(valueCurrent[2]);
            }
        } else {
            picker.enter(exit = true).fit();
        }
    } else if (KEY_ARROW_LEFT === key) {
        exit = true;
        if ((valuePrev = getPrev($)) && hasDatum(valuePrev, 'value')) {
            focusTo(valuePrev);
        }
    } else if (KEY_ARROW_RIGHT === key) {
        exit = true;
        if ((valueNext = getNext($)) && hasDatum(valueNext, 'value')) {
            focusTo(valueNext);
        }
    } else if (1 === toCount(key) && !keyIsAlt && !keyIsCtrl) {
        searchTerm += key;
    }
    if ("" !== searchTerm) {
        filter(picker, searchTerm, _options, exit = true);
    }
    exit && offEventDefault(e);
}

function onPointerDownValue(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($), v;
    picker._event = e;
    focusTo($);
    if ((v = getPrev($)) && hasDatum(v, 'value') || (v = getNext($)) && hasDatum(v, 'value')) {
        offEventPropagation(e);
    }
}

function onPasteTextInput(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
    delay(() => getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color'), 1)();
    insertAtSelection($, e.clipboardData.getData('text/plain'));
}

// The default state is `0`. When the pointer is pressed on the option mask, its value will become `1`. This check is
// done to distinguish between a “touch only” and a “touch move” on touch device(s). It is also checked on pointer
// device(s) and should not give a wrong result.
let currentPointerState = 0,

    touchTop = false,
    touchTopCurrent = 0;

function onPointerDownMask(e) {
    // This is necessary for device(s) that support both pointer and touch control so that they will not execute both
    // `mousedown` and `touchstart` event(s), causing the option picker’s option(s) to open and then close immediately.
    // Note that this will also disable the native pane scrolling feature on touch device(s).
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_options, self} = picker,
        {target} = e;
    picker._event = e;
    if (isDisabled(self) || isReadOnly(self) || getDatum($, 'size')) {
        return;
    }
    if ('listbox' === getRole(target) || getParent(target, '[role=listbox]')) {
        // The user is likely browsing through the available option(s) by dragging the scroll bar
        return;
    }
    forEachMap(_options, v => v[2].hidden = false);
    picker[getReference(R) !== picker ? 'enter' : 'exit'](true).fit();
}

function onPointerDownOption(e) {
    let $ = this;
    focusTo($), (getReference($)._event = e);
    currentPointerState = 1; // Pointer is “down”
}

function onPointerDownRoot(e) {
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    if ('touchstart' === e.type) {
        touchTop = e.touches[0].clientY;
    }
    let {mask, state} = picker,
        {n} = state,
        {target} = e;
    picker._event = e;
    if (mask !== target && mask !== getParent(target, '.' + n)) {
        if (getDatum(mask, 'size')) {
            picker.blur();
        } else {
            letReference($), picker.exit();
        }
    }
}

function onPointerMoveRoot(e) {
    let $ = this,
        picker = getReference($);
    if (picker) {
        picker._event = e;
        let {_mask} = picker,
            {options} = _mask;
        if (1 === currentPointerState) {
            ++currentPointerState;
        }
        // Programmatically re-enable the swipe feature in the option(s) list because the default `touchstart` event was
        // disabled. It does not have the innertia effect as in the native after-swipe reaction, but it is better than
        // doing nothing :\
        if ('touchmove' === e.type && false !== touchTop) {
            touchTopCurrent = e.touches[0].clientY;
            let scroll = getScroll(options);
            scroll[1] -= (touchTopCurrent - touchTop);
            setScroll(options, scroll);
            touchTop = touchTopCurrent;
        }
    }
}

function onPointerUpOption(e) {
    let $ = this,
        picker = getReference($),
        {_mask} = picker,
        {options} = _mask;
    picker._event = e;
    // A “touch only” event is valid only if the pointer has not been “move(d)” up to this event
    if (currentPointerState > 1) {} else {
        if (picker.max > 1) {
            toggleToOption($, picker);
        } else {
            selectToOption($, picker), picker.exit(true);
        }
    }
    currentPointerState = 0; // Reset current pointer state
}

function onPointerUpRoot() {
    currentPointerState = 0; // Reset current pointer state
    touchTop = false;
}

function onResetForm(e) {
    getReference(this).reset()._event = e;
}

function onResizeWindow(e) {
    let picker = getReference(R);
    picker && (picker.fit()._event = e);
}

function onScrollWindow(e) {
    onResizeWindow.call(this, e);
}

function scrollTo(node) {
    node.scrollIntoView({
        block: 'nearest'
    });
}

function selectToOption(option, picker) {
    let {_mask, _options, self} = picker,
        {hint, input, value} = _mask;
    if (option) {
        let a = getValue(self), b;
        selectToOptionsNone(picker);
        setAria(option, 'selected', true);
        setAttribute(option._[OPTION_SELF], 'selected', "");
        setValue(self, b = getOptionValue(option));
        option._[OPTION_SELF].selected = true;
        if (isInput(self)) {
            setAria(input, 'activedescendant', getID(option));
            setStyle(hint, 'color', 'transparent');
            setText(input, getText(option));
        } else {
            setDatum(value, 'value', b);
            setHTML(value, getHTML(option));
        }
        if (a !== b) {
            picker.fire('change', ["" !== b ? b : null]);
        }
        return option;
    }
}

function selectToOptionFirst(picker, k) {
    let option;
    if (option = goToOptionFirst(picker, k)) {
        return selectToOption(option, picker);
    }
}

function selectToOptionLast(picker) {
    return selectToOptionFirst(picker, 'Last');
}

function selectToOptions(options, picker) {}

function selectToOptionsNone(picker, fireValue) {
    let {_mask, _options, self} = picker,
        {hint, input, options, value} = _mask, v;
    forEachMap(_options, v => {
        letAria(v[2], 'selected');
        letAttribute(v[3], 'selected');
        v[3].selected = false;
    });
    if (fireValue) {
        setValue(self, v = "");
        if (isInput(self)) {
            letAria(input, 'activedescendant');
            letStyle(hint, 'color');
            setText(input, "");
        } else {
            letDatum(value, 'value');
            setHTML(value, v);
        }
    }
}

function toggleToOption(option, picker) {
    let {_mask, _options, self, state} = picker,
        {value} = _mask,
        {max, min} = state,
        selected, selectedFirst, valueCurrent, valueNext;
    if (option) {
        let a = getOptionsValues(getOptionsSelected(picker)), b, c;
        if (getAria(option, 'selected')) {
            if (min > 0 && (c = toCount(a)) <= min) {
                picker.fire('min.options', [c, min]);
            } else {
                letAria(option, 'selected');
                letAttribute(option._[OPTION_SELF], 'selected');
                option._[OPTION_SELF].selected = false;
            }
        } else {
            setAria(option, 'selected', true);
            setAttribute(option._[OPTION_SELF], 'selected', "");
            option._[OPTION_SELF].selected = true;
        }
        if (!isInput(self)) {
            b = getOptionsValues(getOptionsSelected(picker));
            if (max !== Infinity && (c = toCount(b)) === max) {
                forEachMap(_options, (v, k) => {
                    if (!getAria(v[2], 'selected')) {
                        letAttribute(v[2], 'tabindex');
                        setAria(v[2], 'disabled', true);
                    }
                });
                picker.fire('max.options', [c, max]);
            } else {
                forEachMap(_options, (v, k) => {
                    if (!v[3].disabled) {
                        letAria(v[2], 'disabled');
                        setAttribute(v[2], 'tabindex', 0);
                    }
                });
            }
            selected = getOptionsSelected(picker);
            selectedFirst = selected.shift();
            if (selectedFirst) {
                setDatum(value, 'value', getOptionValue(selectedFirst));
                setHTML(value, getHTML(selectedFirst));
                while ((valueCurrent = getNext(value)) && hasDatum(valueCurrent, 'value')) {
                    offEvent('keydown', valueCurrent, onKeyDownValue);
                    offEvent('mousedown', valueCurrent, onPointerDownValue);
                    offEvent('touchstart', valueCurrent, onPointerDownValue);
                    letReference(valueCurrent, picker), letElement(valueCurrent);
                }
                valueCurrent = value;
                forEachArray(selected, (v, k) => {
                    valueNext = setID(letID(value.cloneNode(true)));
                    valueNext.tabIndex = -1;
                    onEvent('keydown', valueNext, onKeyDownValue);
                    onEvent('mousedown', valueNext, onPointerDownValue);
                    onEvent('touchstart', valueNext, onPointerDownValue);
                    letAria(valueNext, 'selected');
                    setDatum(valueNext, 'value', getOptionValue(v));
                    setHTML(valueNext, getHTML(v));
                    setReference(valueNext, picker), setNext(valueCurrent, valueNext);
                    valueCurrent = valueNext;
                });
            }
        }
        if (a.sort().join('\n') !== b.sort().join('\n')) {
            picker.fire('change', [b]);
        }
        return option;
    }
}

function OptionPicker(self, state) {
    const $ = this;
    if (!self) {
        return $;
    }
    // Return new instance if `OptionPicker` was called without the `new` operator
    if (!isInstance($, OptionPicker)) {
        return new OptionPicker(self, state);
    }
    setReference(self, hook($, OptionPicker._));
    return $.attach(self, fromStates({}, OptionPicker.state, isBoolean(state) ? {
        strict: state
    } : (state || {})));
}

function OptionPickerOptions(of, options) {
    const $ = this;
    // Return new instance if `OptionPickerOptions` was called without the `new` operator
    if (!isInstance($, OptionPickerOptions)) {
        return new OptionPickerOptions(of, options);
    }
    $.of = of;
    $.values = new Map;
    if (options) {
        createOptionsFrom(of, options, of._mask.options);
    }
    return $;
}

OptionPicker.from = function (self, state) {
    return new OptionPicker(self, state);
};

OptionPicker.of = getReference;

OptionPicker.state = {
    'max': null,
    'min': null,
    'n': 'option-picker',
    'options': null,
    'size': null,
    'strict': false,
    'with': []
};

OptionPicker.version = '2.0.0';

setObjectAttributes(OptionPicker, {
    name: {
        value: name
    }
}, 1);

setObjectAttributes(OptionPicker, {
    active: {
        get: function () {
            return this._active;
        },
        set: function (value) {
            let $ = this,
                {self} = $,
                v = !!value;
            $._active = v;
            self.disabled = !v;
            return $.detach().attach();
        }
    },
    fix: {
        get: function () {
            return this._fix;
        },
        set: function (value) {
            let $ = this,
                {self} = $,
                v = !!value;
            if (!isInput(self)) {
                return $; // Ignore element(s) other than `<input>`
            }
            $._fix = v;
            self.readOnly = !v;
            return $.detach().attach();
        }
    },
    max: {
        get: function () {
            let $ = this,
                {self, state} = $;
            return !isInput(self) && self.multiple ? state.max : 1;
        },
        set: function (value) {
            let $ = this,
                {mask, self, state} = $;
            value = (Infinity === value || isInteger(value)) && value > 1 ? value : 1;
            if (isInput(self)) {
                return $; // Ignore element(s) other than `<select>`
            }
            if (value > 1) {
                setAria(mask, 'multiselectable', self.multiple = true);
                state.max = value;
            } else {
                letAria(mask, 'multiselectable');
                self.multiple = false;
                state.max = value;
            }
            return $;
        }
    },
    min: {
        get: function () {
            let $ = this,
                {state} = $,
                {min} = state;
            return !isInteger(min) || min < 0 ? 0 : min;
        },
        set: function (value) {
            let $ = this,
                {state} = $;
            state.min = isInteger(value) && value > 0 ? value : 0;
            return $;
        }
    },
    options: {
        get: function () {
            return this._options;
        },
        set: function (options) {
            let $ = this,
                {_mask, _options, self} = $, selected;
            if (isFloat(options) || isInteger(options) || isString(options)) {
                options = [options];
            }
            let value = $.value; // The previous value
            if (toCount(selected = createOptionsFrom($, options, _mask.options))) {
                // Sets the value of `self.value` so that change(s) in value are not detected when we set the value of
                // `$.value` after this
                setValue(self, selected[0]);
                // Setting the value of `$.value` will not trigger the `change` hook because the `$.value` value has
                // already been made equal to the `self.value` value
                $.value = $._value = selected[0];
                // $.values = selected;
                // Fire the `change` hook manually
                if (value !== $.value) {
                    $.fire('change', [$.value]);
                }
            }
            let values = [];
            forEachMap(_options, v => values.push(getOptionValue(v[2])));
            return $.fire('set.options', [values]);
        }
    },
    size: {
        get: function () {
            let $ = this,
                {self, state} = $, size;
            if (isInput(self)) {
                return null;
            }
            size = self.size ?? (state.size || 1);
            return !isInteger(size) || size < 1 ? 1 : size; // <https://html.spec.whatwg.org#attr-select-size>
        },
        set: function (value) {
            let $ = this,
                {_mask, mask, self, state} = $,
                {options} = _mask,
                size = !isInteger(value) || value < 1 ? 1 : value;
            if (isInput(self)) {
                return $; // Ignore element(s) other than `<select>`
            }
            self.size = state.size = size;
            if (1 === size) {
                letDatum(mask, 'size');
                letStyle(options, 'max-height');
                letReference(R);
            } else {
                let option = goToOptionFirst($);
                if (option) {
                    let optionsGap = getStyle(options, 'gap', false),
                        optionsPaddingBottom = getStyle(options, 'padding-bottom', false),
                        optionHeight = getStyle(option, 'height', false) ?? getStyle(option, 'min-height', false) ?? getStyle(option, 'line-height', false);
                    setDatum(mask, 'size', size);
                    setStyle(options, 'max-height', 'calc((' + optionHeight + ' + max(' + optionsGap + ',' + optionsPaddingBottom + '))*' + size + ')');
                    setReference(R, $);
                }
            }
            return $;
        }
    },
    text: {
        get: function () {
            let $ = this,
                {_mask} = $,
                {input, text} = _mask;
            return text ? getText(input) : null;
        },
        set: function (value) {
            let $ = this,
                {_mask, self} = $,
                {hint, input, text} = _mask, v;
            if (!text) {
                return $;
            }
            setText(input, v = fromValue(value));
            return (v ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color')), $;
        }
    },
    value: {
        get: function () {
            let value = getValue(this.self);
            return "" !== value ? value : null;
        },
        set: function (value) {
            let $ = this,
                {_active, _options, mask, self} = $, v;
            if (!_active) {
                return $;
            }
            if (v = getValueInMap(toValue(value), _options.values)) {
                selectToOption(v[2], $);
            }
            return $;
        }
    },
    // TODO: `<select multiple>`
    values: {
        get: function () {
        },
        set: function (values) {
        }
    }
});

OptionPicker._ = setObjectMethods(OptionPicker, {
    attach: function (self, state) {
        let $ = this;
        self = self || $.self;
        state = state || $.state;
        $._event = null;
        $._options = new OptionPickerOptions($);
        $._value = getValue(self) || null;
        $.self = self;
        $.state = state;
        let {max, n} = state,
            isDisabledSelf = isDisabled(self),
            isInputSelf = isInput(self),
            isMultipleSelect = max && max > 1 || (!isInputSelf && self.multiple),
            isReadOnlySelf = isReadOnly(self);
        $._active = !isDisabledSelf && !isReadOnlySelf;
        $._fix = isInputSelf && isReadOnlySelf;
        const arrow = setElement('span', {
            'class': n + '__arrow',
            'role': 'none'
        });
        const form = getParentForm(self);
        const mask = setElement('div', {
            'aria': {
                'disabled': isDisabled(self) ? 'true' : false,
                'expanded': 'false',
                'haspopup': 'listbox',
                'multiselectable': isMultipleSelect ? 'true' : false,
                'readonly': isInputSelf && isReadOnlySelf ? 'true' : false
            },
            'class': n,
            'role': 'combobox'
        });
        $.mask = mask;
        const maskOptions = setElement('div', {
            'class': n + '__options',
            'role': 'listbox'
        });
        const maskOptionsBody = setElement('div', {
            'role': 'none'
        });
        const maskValues = setElement('div', {
            'class': n + '__values',
            'role': 'group'
        });
        const text = setElement('span', {
            'class': n + '__' + (isInputSelf ? 'text' : 'value'),
            'tabindex': isInputSelf ? false : 0
        });
        const textInput = setElement('span', {
            'aria': {
                'autocomplete': 'list',
                'disabled': isDisabledSelf ? 'true' : false,
                'multiline': 'false',
                'placeholder': isInputSelf ? self.placeholder : false,
                'readonly': isReadOnlySelf ? 'true' : false,
            },
            'autocapitalize': 'off',
            'contenteditable': isDisabledSelf || isReadOnlySelf || !isInputSelf ? false : "",
            'role': 'searchbox',
            'spellcheck': !isInputSelf ? false : 'false',
            'tabindex': isReadOnlySelf && isInputSelf ? 0 : false
        });
        const textInputHint = setElement('span', isInputSelf ? self.placeholder + "" : "", {
            'role': 'none'
        });
        setChildLast(mask, maskValues);
        setChildLast(mask, maskOptions);
        setChildLast(maskOptions, maskOptionsBody);
        setChildLast(maskValues, text);
        setChildLast(maskValues, arrow);
        if (isInputSelf) {
            onEvent('blur', textInput, onBlurTextInput);
            onEvent('cut', textInput, onCutTextInput);
            onEvent('focus', textInput, onFocusTextInput);
            onEvent('keydown', textInput, onKeyDownTextInput);
            onEvent('paste', textInput, onPasteTextInput);
            setChildLast(text, textInput);
            setChildLast(text, textInputHint);
            setReference(textInput, $);
        } else {
            onEvent('keydown', text, onKeyDownValue);
            onEvent('mousedown', text, onPointerDownValue);
            onEvent('touchstart', text, onPointerDownValue);
            setReference(text, $);
        }
        setClass(self, n + '__self');
        setNext(self, mask);
        if (form) {
            onEvent('reset', form, onResetForm);
            setID(form);
            setReference(form, $);
        }
        onEvent('focus', self, onFocusSelf);
        onEvent('mousedown', R, onPointerDownRoot);
        onEvent('mousedown', mask, onPointerDownMask);
        onEvent('mousemove', R, onPointerMoveRoot);
        onEvent('mouseup', R, onPointerUpRoot);
        onEvent('resize', W, onResizeWindow, {passive: true});
        onEvent('scroll', W, onScrollWindow, {passive: true});
        onEvent('touchend', R, onPointerUpRoot);
        onEvent('touchmove', R, onPointerMoveRoot, {passive: true});
        onEvent('touchstart', R, onPointerDownRoot);
        onEvent('touchstart', mask, onPointerDownMask);
        self.tabIndex = -1;
        setReference(mask, $);
        let _mask = {};
        _mask.arrow = arrow;
        _mask.hint = isInputSelf ? textInputHint : null;
        _mask.input = isInputSelf ? textInput : null;
        _mask.of = self;
        _mask.options = maskOptions;
        _mask.self = mask;
        _mask[isInputSelf ? 'text' : 'value'] = text;
        $._mask = _mask;
        let {_active} = $,
            {options} = state, selected;
        // Force the `this._active` value to `true` to set the initial value
        $._active = true;
        if (isFunction(options)) {
            setAria(mask, 'busy', 'true');
            options = options.call($, null);
            if (isInstance(options, Promise)) {
                options.then(options => {
                    letAria(mask, 'busy');
                    if (toCount(selected = createOptionsFrom($, options, maskOptions))) {
                        $.value = selected[0];
                        // $.values = selected;
                    } else if (selected = getOptionSelected($, 1)) {
                        $.value = getOptionValue(selected);
                        // $.values = selected;
                    }
                    let values = [];
                    forEachMap($._options, v => values.push(getOptionValue(v[2])));
                    $.fire('load', [null, values])[$.options.open ? 'enter' : 'exit']().fit();
                });
            } else {
                if (toCount(selected = createOptionsFrom($, options, maskOptions))) {
                    $.value = selected[0];
                    // $.values = selected;
                }
            }
        } else {
            if (toCount(selected = createOptionsFrom($, options || getOptions(self), maskOptions))) {
                $.value = selected[0];
                // $.values = selected;
            }
        }
        // After the initial value has been set, restore the previous `this._active` value
        $._active = _active;
        // Force `id` attribute(s)
        setAria(mask, 'controls', getID(setID(maskOptions)));
        setAria(mask, 'labelledby', getID(setID(text)));
        setAria(self, 'hidden', true);
        setAria(textInput, 'controls', getID(maskOptions));
        setID(arrow);
        setID(mask);
        setID(maskOptionsBody);
        setID(maskValues);
        setID(self);
        setID(textInput);
        setID(textInputHint);
        $.max = isMultipleSelect ? (max ?? Infinity) : 1;
        $.min = isInputSelf ? 0 : 1;
        $.size = state.size ?? (isInputSelf ? 1 : self.size);
        // Attach extension(s)
        if (isSet(state) && isArray(state.with)) {
            forEachArray(state.with, (v, k) => {
                if (isString(v)) {
                    v = OptionPicker[v];
                }
                // `const Extension = function (self, state = {}) {}`
                if (isFunction(v)) {
                    v.call($, self, state);
                // `const Extension = {attach: function (self, state = {}) {}, detach: function (self, state = {}) {}}`
                } else if (isObject(v) && isFunction(v.attach)) {
                    v.attach.call($, self, state);
                }
            });
        }
        return $;
    },
    blur: function () {
        let $ = this,
            {_mask, mask} = $,
            {input} = _mask;
        if (input) {
            selectToNone();
        }
        return (input || mask).blur(), $.exit();
    },
    detach: function () {
        let $ = this,
            {_mask, mask, self, state} = $,
            {input, value} = _mask;
        const form = getParentForm(self);
        $._active = false;
        $._options = new OptionPickerOptions($);
        $._value = getValue(self) || null; // Update initial value to be the current value
        if (form) {
            offEvent('reset', form, onResetForm);
        }
        if (input) {
            offEvent('blur', input, onBlurTextInput);
            offEvent('cut', input, onCutTextInput);
            offEvent('focus', input, onFocusTextInput);
            offEvent('keydown', input, onKeyDownTextInput);
            offEvent('paste', input, onPasteTextInput);
        }
        if (value) {
            offEvent('keydown', value, onKeyDownValue);
        }
        offEvent('focus', self, onFocusSelf);
        offEvent('mousedown', R, onPointerDownRoot);
        offEvent('mousedown', mask, onPointerDownMask);
        offEvent('mousemove', R, onPointerMoveRoot);
        offEvent('mouseup', R, onPointerUpRoot);
        offEvent('resize', W, onResizeWindow);
        offEvent('scroll', W, onScrollWindow);
        offEvent('touchend', R, onPointerUpRoot);
        offEvent('touchmove', R, onPointerMoveRoot);
        offEvent('touchstart', R, onPointerDownRoot);
        offEvent('touchstart', mask, onPointerDownMask);
        // Detach extension(s)
        if (isArray(state.with)) {
            forEachArray(state.with, (v, k) => {
                if (isString(v)) {
                    v = OptionPicker[v];
                }
                if (isObject(v) && isFunction(v.detach)) {
                    v.detach.call($, self, state);
                }
            });
        }
        self.tabIndex = null;
        letAria(self, 'hidden');
        letClass(self, state.n + '__self');
        letElement(mask);
        $._mask = {
            of: self
        };
        $.mask = null;
        return $;
    },
    enter: function (focus, mode) {
        let $ = this, option,
            {_active, _mask, _options, mask, self} = $,
            {input, options} = _mask;
        if (!_active) {
            return $;
        }
        setAria(mask, 'expanded', toCount(getChildren(options)) > 0);
        let theRootReference = getReference(R);
        if (theRootReference && $ !== theRootReference) {
            theRootReference.exit(); // Exit other(s)
        }
        setReference(R, $); // Link current picker to the root target
        $.fire('enter');
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else if (option = getValueInMap(toValue(getValue(self)), _options.values)) {
                focusTo(option[2]), delay(() => scrollTo(option[2]), 1)();
            }
        }
        return $;
    },
    exit: function (focus, mode) {
        let $ = this,
            {_active, _mask, _options, mask, self} = $,
            {input, value} = _mask;
        if (!_active) {
            return $;
        }
        forEachMap(_options, v => v[2].hidden = false);
        setAria(mask, 'expanded', false);
        letReference(R);
        $.fire('exit');
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else {
                focusTo(value);
            }
        }
        return $;
    },
    fit: function () {
        let $ = this,
            {_active, _mask, mask} = $,
            {options} = _mask;
        if (!_active || !getAria(mask, 'expanded') || getDatum(mask, 'size')) {
            return $;
        }
        setStyle(options, 'max-height', 0);
        let borderMaskBottom = getStyle(mask, 'border-bottom-width', false),
            borderMaskTop = getStyle(mask, 'border-top-width', false),
            rectMask = getRect(mask),
            rectWindow = getRect(W);
        if (rectMask[1] + (rectMask[3] / 2) > (rectWindow[3] / 2)) {
            setStyles(options, {
                'bottom': '100%',
                'max-height': 'calc(' + rectMask[1] + 'px + ' + borderMaskBottom + ')',
                'top': 'auto'
            });
        } else {
            setStyles(options, {
                'bottom': 'auto',
                'max-height': 'calc(' + (rectWindow[3] - rectMask[1] - rectMask[3]) + 'px + ' + borderMaskTop + ')',
                'top': '100%'
            });
        }
        return $.fire('fit');
    },
    focus: function (mode) {
        let $ = this,
            {_mask, mask} = $,
            {input, value} = _mask;
        if (input) {
            focusTo(input), selectTo(input, mode);
        } else {
            focusTo(value);
        }
        return $;
    },
    reset: function (focus, mode) {
        let $ = this,
            {_active, _value} = $;
        if (!_active) {
            return $;
        }
        if (picker.max > 1) {
            // TODO
        } else {
            $.value = _value;
        }
        return focus ? $.focus(mode) : $;
    }
});

setObjectAttributes(OptionPickerOptions, {
    name: {
        value: name + 'Options'
    }
}, 1);

setObjectAttributes(OptionPickerOptions, {
    open: {
        get: function () {
            let $ = this,
                {of} = $,
                {mask} = of;
            return getAria(mask, 'expanded');
        }
    }
});

setObjectMethods(OptionPickerOptions, {
    at: function (key) {
        return getValueInMap(toValue(key), this.values);
    },
    count: function () {
        return this.values.size;
    },
    delete: function (key, _fireValue = 1, _fireHook = 1) {
        let $ = this,
            {of, values: map} = $,
            {_active, _mask, self, state} = of,
            {options} = _mask, r;
        if (!_active) {
            return false;
        }
        if (!isSet(key)) {
            forEachMap(map, (v, k) => $.let(k, 0));
            selectToOptionsNone(of, _fireValue);
            options.hidden = true;
            return _fireHook && of.fire('let.options', [[]]) && 0 === $.count();
        }
        if (!(r = getValueInMap(key = toValue(key), map))) {
            return (_fireHook && of.fire('not.option', [key])), false;
        }
        let parent = getParent(r[2]),
            parentReal = getParent(r[3]),
            value = getOptionValue(r[2]),
            valueReal = of.value;
        offEvent('focus', r[2], onFocusOption);
        offEvent('keydown', r[2], onKeyDownOption);
        offEvent('mousedown', r[2], onPointerDownOption);
        offEvent('mouseup', r[2], onPointerUpOption);
        offEvent('touchend', r[2], onPointerUpOption);
        offEvent('touchstart', r[2], onPointerDownOption);
        letElement(r[2]), letElement(r[3]);
        r = letValueInMap(key, map);
        // Remove empty group(s)
        parent && 'group' === getRole(parent) && 0 === toCount(getChildren(parent)) && letElement(parent);
        parentReal && 'optgroup' === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
        // Clear value if there are no option(s)
        if (0 === toCount(getChildren(options))) {
            selectToOptionsNone(of, !isInput(self));
            options.hidden = true;
        // Reset value to the first option if removed option is the selected option
        } else {
            setValue(self, "");
            value === valueReal && selectToOptionFirst(of);
        }
        if (!isFunction(state.options)) {
            state.options = map;
        }
        return (_fireHook && of.fire('let.option', [key])), r;
    },
    get: function (key) {
        let $ = this,
            {of, values: map} = $,
            value = getValueInMap(toValue(key), map), parent;
        if (value && (parent = getParent(value[2])) && 'group' === getRole(parent)) {
            return [getElementIndex(value[2]), getElementIndex(parent)];
        }
        return value ? getElementIndex(value[2]) : -1;
    },
    has: function (key) {
        return hasKeyInMap(toValue(key), this.values);
    },
    let: function (key, _fireHook = 1) {
        return this.delete(key, 1, _fireHook);
    },
    set: function (key, value, _fireHook = 1) {
        let $ = this,
            {of, values: map} = $,
            {_active} = of;
        if (!_active) {
            return false;
        }
        if ($.has(key = toValue(key))) {
            return (_fireHook && of.fire('has.option', [key])), false;
        }
        let {_mask, self, state} = of,
            {options} = _mask,
            {n} = state,
            classes, items, itemsParent, option, optionGroup, optionGroupReal, optionReal, styles;
        n += '__option';
        if (isInput(self)) {
            items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
        } else {
            items = getChildren(itemsParent = self);
        }
        options.hidden = false;
        // Force `id` attribute(s)
        setID(itemsParent);
        // `picker.options.set('asdf')`
        if (!isSet(value)) {
            value = [key, {}];
        // `picker.options.set('asdf', 'asdf')`
        } else if (isFloat(value) || isInteger(value) || isString(value)) {
            value = [value, {}];
        // `picker.options.set('asdf', [ … ])`
        } else {}
        if (hasState(value[1], '&')) {
            optionGroup = getElement('.' + n + 's-batch[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', getChildFirst(options));
            if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                setChildLast(getChildFirst(options), optionGroup = setElement('span', {
                    'class': n + 's-batch',
                    'data': {
                        'value': value[1]['&']
                    },
                    'role': 'group',
                    'title': getState(value[1], 'title') ?? false
                }));
                setChildLast(itemsParent, optionGroupReal = setElement('optgroup', {
                    'label': value[1]['&'],
                    'title': getState(value[1], 'title') ?? false
                }));
                if (classes = getState(value[1], 'class')) {
                    setClasses(optionGroup, classes);
                    setClasses(optionGroupReal, classes);
                }
                if (isObject(styles = getState(value[1], 'style'))) {
                    setStyles(optionGroup, styles);
                    setStyles(optionGroupReal, styles);
                } else if (styles) {
                    setAttribute(optionGroup, 'style', styles);
                    setAttribute(optionGroupReal, 'style', styles);
                }
                // Force `id` attribute(s)
                setID(optionGroup);
                setID(optionGroupReal);
            }
        } else {
            optionGroup = optionGroupReal = false;
        }
        let {disabled, selected, value: v} = value[1];
        // if (isDisabled(self)) {
        //     disabled = true;
        // }
        v = fromValue(v || key);
        option = value[2] || setElement('span', fromValue(value[0]), {
            'aria': {
                'disabled': disabled ? 'true' : false,
                'selected': selected ? 'true' : false
            },
            'class': n,
            'data': {
                'batch': getState(value[1], '&') ?? false,
                'value': v
            },
            'role': 'option',
            'tabindex': disabled ? false : -1,
            'title': getState(value[1], 'title') ?? false
        });
        optionReal = value[3] || setElement('option', fromValue(value[0]), {
            'disabled': disabled ? "" : false,
            'selected': selected ? "" : false,
            'title': getState(value[1], 'title') ?? false,
            'value': v
        });
        if (classes = getState(value[1], 'class')) {
            setClasses(option, classes);
            setClasses(optionReal, classes);
        }
        if (isObject(styles = getState(value[1], 'style'))) {
            setStyles(option, styles);
            setStyles(optionReal, styles);
        } else if (styles) {
            setAttribute(option, 'style', styles);
            setAttribute(optionReal, 'style', styles);
        }
        // Force `id` attribute(s)
        setID(option);
        setID(optionReal);
        option._ = {};
        option._[OPTION_SELF] = optionReal;
        if (!disabled && !value[2]) {
            onEvent('focus', option, onFocusOption);
            onEvent('keydown', option, onKeyDownOption);
            onEvent('mousedown', option, onPointerDownOption);
            onEvent('mouseup', option, onPointerUpOption);
            onEvent('touchend', option, onPointerUpOption);
            onEvent('touchstart', option, onPointerDownOption);
        }
        setChildLast(optionGroup || getChildFirst(options), option);
        setChildLast(optionGroupReal || itemsParent, optionReal);
        setReference(option, of);
        value[2] = option;
        value[3] = optionReal;
        setValueInMap(key, value, map);
        if (!isFunction(state.options)) {
            state.options = map;
        }
        return (_fireHook && of.fire('set.option', [key])), true;
    }
});

// In order for an object to be iterable, it must have a `Symbol.iterator` key
getPrototype(OptionPickerOptions)[Symbol.iterator] = function () {
    return this.values[Symbol.iterator]();
};

OptionPicker.Options = OptionPickerOptions;

export default OptionPicker;