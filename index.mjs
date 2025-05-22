import {/* focusTo, */insertAtSelection, selectTo, selectToNone} from '@taufik-nurrohman/selection';
import {R, W, getAria, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getRole, getState, getStyle, getText, getValue, hasState, isDisabled, isReadOnly, isRequired, letAria, letAttribute, letClass, letDatum, letElement, letID, letStyle, setAria, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setID, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {forEachArray, forEachMap, forEachObject, forEachSet, getPrototype, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, onAnimationsEnd, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toValuesFromMap, toValueFirstFromMap} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect, getScroll, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isBoolean, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toMapCount, toSetCount, toValue} from '@taufik-nurrohman/to';
import {toPattern} from '@taufik-nurrohman/pattern';

const EVENT_DOWN = 'down';
const EVENT_MOVE = 'move';
const EVENT_UP = 'up';

const EVENT_BLUR = 'blur';
const EVENT_CUT = 'cut';
const EVENT_FOCUS = 'focus';
const EVENT_INPUT = 'input';
const EVENT_INVALID = 'invalid';
const EVENT_KEY = 'key';
const EVENT_KEY_DOWN = EVENT_KEY + EVENT_DOWN;
const EVENT_MOUSE = 'mouse';
const EVENT_MOUSE_DOWN = EVENT_MOUSE + EVENT_DOWN;
const EVENT_MOUSE_MOVE = EVENT_MOUSE + EVENT_MOVE;
const EVENT_MOUSE_UP = EVENT_MOUSE + EVENT_UP;
const EVENT_PASTE = 'paste';
const EVENT_RESET = 'reset';
const EVENT_RESIZE = 'resize';
const EVENT_SCROLL = 'scroll';
const EVENT_SUBMIT = 'submit';
const EVENT_TOUCH = 'touch';
const EVENT_TOUCH_END = EVENT_TOUCH + 'end';
const EVENT_TOUCH_MOVE = EVENT_TOUCH + EVENT_MOVE;
const EVENT_TOUCH_START = EVENT_TOUCH + 'start';
const EVENT_WHEEL = 'wheel';

const KEY_DOWN = 'Down';
const KEY_LEFT = 'Left';
const KEY_RIGHT = 'Right';
const KEY_UP = 'Up';

const KEY_ARROW = 'Arrow';
const KEY_ARROW_DOWN = KEY_ARROW + KEY_DOWN;
const KEY_ARROW_LEFT = KEY_ARROW + KEY_LEFT;
const KEY_ARROW_RIGHT = KEY_ARROW + KEY_RIGHT;
const KEY_ARROW_UP = KEY_ARROW + KEY_UP;
const KEY_BEGIN = 'Home';
const KEY_DELETE_LEFT = 'Backspace';
const KEY_DELETE_RIGHT = 'Delete';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_PAGE = 'Page';
const KEY_PAGE_DOWN = KEY_PAGE + KEY_DOWN;
const KEY_PAGE_UP = KEY_PAGE + KEY_UP;
const KEY_TAB = 'Tab';

const OPTION_SELF = 0;
const OPTION_TEXT = 1;

const TOKEN_CONTENTEDITABLE = 'contenteditable';
const TOKEN_DISABLED = 'disabled';
const TOKEN_FALSE = 'false';
const TOKEN_GROUP = 'group';
const TOKEN_INVALID = 'invalid';
const TOKEN_OPTGROUP = 'opt' + TOKEN_GROUP;
const TOKEN_READONLY = 'readonly';
const TOKEN_READ_ONLY = 'readOnly';
const TOKEN_REQUIRED = 'required';
const TOKEN_SELECTED = 'selected';
const TOKEN_TABINDEX = 'tabindex';
const TOKEN_TAB_INDEX = 'tabIndex';
const TOKEN_TEXT = 'text';
const TOKEN_TRUE = 'true';
const TOKEN_VALUE = 'value';
const TOKEN_VALUES = TOKEN_VALUE + 's';
const TOKEN_VISIBILITY = 'visibility';

const VALUE_SELF = 0;
const VALUE_TEXT = 1;
const VALUE_X = 2;

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_mask, mask, self, state} = $,
        {options} = _mask,
        {pattern} = self,
        {strict} = state, option;
    let count = _options.count();
    if (selectOnly) {
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if ("" !== q && q === text.slice(0, toCount(q)) && !getAria(v[2], TOKEN_DISABLED)) {
                selectToOption(v[2], $);
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
        selectToOptionsNone($);
        if (strict) {
            // Silently select the first option without affecting the currently typed query and focus/select state
            if (count && "" !== q && (option = goToOptionFirst($))) {
                letAria(mask, TOKEN_INVALID);
                setAria(option, TOKEN_SELECTED, true);
                option.$[OPTION_SELF][TOKEN_SELECTED] = true;
                setValue(self, getOptionValue(option));
            } else {
                // No other option(s) are available to query
                if ("" !== q) {
                    setAria(mask, TOKEN_INVALID, true);
                } else {
                    letAria(mask, TOKEN_INVALID);
                }
                setValue(self, "");
            }
        } else {
            letAria(mask, TOKEN_INVALID);
            setValue(self, query);
            if (pattern) {
                if (!count && "" !== q && !toPattern('^' + pattern + '$', "").test(query)) {
                    setAria(mask, TOKEN_INVALID, true);
                }
            }
        }
    }
    $.fire('search', [query = "" !== query ? query : null]);
    let call = state.options;
    // Only fetch when no other option(s) are available to query, or when the current search query is empty
    if ((0 === count || "" === q) && isFunction(call)) {
        setAria(mask, 'busy', true);
        call = call.call($, query);
        if (isInstance(call, Promise)) {
            call.then(v => {
                createOptions($, v);
                letAria(mask, 'busy');
                $.fire('load', [query, $[TOKEN_VALUES]])[goToOptionFirst($) ? 'enter' : 'exit']().fit();
            });
        } else {
            createOptions($, call);
        }
    }
})[0];

const [letError, letErrorAbort] = delay(function (picker) {
    letAria(picker.mask, TOKEN_INVALID);
});

const setError = function (picker) {
    setAria(picker.mask, TOKEN_INVALID, true);
};

const [toggleHint] = delay(function (picker) {
    let {_mask} = picker,
        {input} = _mask;
    toggleHintByValue(picker, getText(input, 0));
});

const toggleHintByValue = function (picker, value) {
    let {_mask} = picker,
        {hint} = _mask;
    value ? setStyle(hint, TOKEN_VISIBILITY, 'hidden') : letStyle(hint, TOKEN_VISIBILITY);
};

const name = 'OptionPicker';

function createOptions($, options) {
    const map = isInstance(options, Map) ? options : new Map;
    if (isArray(options)) {
        forEachArray(options, option => {
            if (isArray(option)) {
                option[0] = option[0] ?? "";
                option[1] = option[1] ?? {};
                setValueInMap(toValue(option[1][TOKEN_VALUE] ?? option[0]), option, map);
            } else {
                setValueInMap(toValue(option), [option, {}], map);
            }
        });
    } else if (isObject(options, 0)) {
        forEachObject(options, (v, k) => {
            if (isArray(v)) {
                options[k][0] = v[0] ?? "";
                options[k][1] = v[1] ?? {};
                setValueInMap(toValue(v[1][TOKEN_VALUE] ?? k), v, map);
            } else {
                setValueInMap(toValue(k), [v, {}], map);
            }
        });
    }
    let {_options, self, state} = $,
        {n} = state,
        r = [], value = getValue(self);
    n += '__option';
    // Reset the option(s) data, but leave the typed query in place, and do not fire the `let.options` hook
    _options.let(null, 0, 0);
    forEachMap(map, (v, k) => {
        if (isArray(v) && v[1] && (!getState(v[1], 'active') || v[1].active) && v[1].mark) {
            r.push(v[1][TOKEN_VALUE] ?? k);
        }
        // Set the option data, but do not fire the `set.option` hook
        _options.set(toValue(isArray(v) && v[1] ? (v[1][TOKEN_VALUE] ?? k) : k), v, 0);
    });
    if (!isFunction(state.options)) {
        state.options = map;
    }
    if (0 === toCount(r)) {
        // If there is no selected option(s), get it from the current value
        if (hasKeyInMap(toValue(value), map)) {
            return [value];
        }
        // Or get it from the first option
        if (value = getOptionSelected($)) {
            return [getOptionValue(value)];
        }
    }
    return r;
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

function getOptionNext(option) {
    let optionNext = getNext(option), optionParent;
    // Skip disabled and hidden option(s)…
    while (optionNext && (getAria(optionNext, TOKEN_DISABLED) || optionNext.hidden)) {
        optionNext = getNext(optionNext);
    }
    if (optionNext) {
        // Next option is a group?
        if (TOKEN_GROUP === getRole(optionNext)) {
            optionNext = getChildFirst(optionNext);
        }
    // Is the last option?
    } else {
        // Is in a group?
        if ((optionParent = getParent(option)) && TOKEN_GROUP === getRole(optionParent)) {
            optionNext = getNext(optionParent);
        }
        // Next option is a group?
        if (optionNext && TOKEN_GROUP === getRole(optionNext)) {
            optionNext = getChildFirst(optionNext);
        }
    }
    // Skip disabled and hidden option(s)…
    while (optionNext && (getAria(optionNext, TOKEN_DISABLED) || optionNext.hidden)) {
        optionNext = getNext(optionNext);
    }
    return optionNext;
}

function getOptionPrev(option) {
    let optionParent, optionPrev = getPrev(option);
    // Skip disabled and hidden option(s)…
    while (optionPrev && (getAria(optionPrev, TOKEN_DISABLED) || optionPrev.hidden)) {
        optionPrev = getPrev(optionPrev);
    }
    if (optionPrev) {
        // Previous option is a group?
        if (TOKEN_GROUP === getRole(optionPrev)) {
            optionPrev = getChildLast(optionPrev);
        }
    // Is the first option?
    } else {
        // Is in a group?
        if ((optionParent = getParent(option)) && TOKEN_GROUP === getRole(optionParent)) {
            optionPrev = getPrev(optionParent);
        }
        // Previous option is a group?
        if (optionPrev && TOKEN_GROUP === getRole(optionPrev)) {
            optionPrev = getChildLast(optionPrev);
        }
    }
    // Skip disabled and hidden option(s)…
    while (optionPrev && (getAria(optionPrev, TOKEN_DISABLED) || optionPrev.hidden)) {
        optionPrev = getPrev(optionPrev);
    }
    return optionPrev;
}

function getOptionSelected($, strict) {
    let {_options, self} = $, selected;
    forEachMap(_options, (v, k) => {
        if (isArray(v) && v[2] && !getAria(v[2], TOKEN_DISABLED) && getAria(v[2], TOKEN_SELECTED)) {
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
    return getValue(option, parseValue);
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
        attributes.active = true;
        attributes.mark = false;
        if (hasState(attributes, TOKEN_DISABLED)) {
            attributes.active = "" === attributes[TOKEN_DISABLED] ? false : !!attributes[TOKEN_DISABLED];
            delete attributes[TOKEN_DISABLED];
        } else if (hasState(attributes, TOKEN_SELECTED)) {
            attributes.mark = "" === attributes[TOKEN_SELECTED] ? true : !!attributes[TOKEN_SELECTED];
            delete attributes[TOKEN_SELECTED];
        }
        if (TOKEN_OPTGROUP === getName(v)) {
            forEachMap(getOptions(v), (vv, kk) => {
                vv[1]['&'] = v.label;
                setValueInMap(toValue(kk), vv, map);
            });
        } else {
            setValueInMap(toValue(v[TOKEN_VALUE]), [getText(v) || v[TOKEN_VALUE], attributes, null, v], map);
        }
    });
    // If there is no selected option(s), get it from the current value
    if (0 === toCount(selected) && (item = getValueInMap(value = toValue(value), map))) {
        item[1].mark = true;
        setValueInMap(value, item, map);
    }
    return map;
}

function getOptionsValues(options, parseValue) {
    return options.map(v => getOptionValue(v, parseValue));
}

function getOptionsSelected($) {
    let {_options} = $, selected = [];
    return forEachMap(_options, (v, k) => {
        if (isArray(v) && v[2] && !getAria(v[2], TOKEN_DISABLED) && getAria(v[2], TOKEN_SELECTED)) {
            selected.push(v[2]);
        }
    }), selected;
}

function goToOptionFirst(picker, k) {
    let {_options} = picker, option;
    if (option = toValuesFromMap(_options)['find' + (k || "")](v => !getAria(v[2], TOKEN_DISABLED) && !v[2].hidden)) {
        return option[2];
    }
}

function goToOptionLast(picker) {
    return goToOptionFirst(picker, 'Last');
}

function isInput(self) {
    return 'input' === getName(self);
}

function onBlurTextInput() {
    let $ = this,
        picker = getReference($),
        {_mask, state} = picker,
        {options} = _mask,
        {strict, time} = state,
        {error} = time, option;
    if (strict) {
        if (!options.hidden && (option = getOptionSelected(picker, 1))) {
            selectToOption(option, picker);
        } else {
            letError(isInteger(error) && error > 0 ? error : 0, picker);
            options.hidden = false;
            selectToOptionsNone(picker, 1);
        }
    }
}

function onCutTextInput() {
    let $ = this,
        picker = getReference($),
        {self, state} = picker,
        {strict} = state;
    delay(() => {
        if (!strict) {
            setValue(self, getText($));
        }
    })[0](1);
    toggleHint(1, picker);
}

function onFocusOption() {
    selectToNone();
}

// Focus on the “visually hidden” self will move its focus to the mask, maintains the natural flow of the tab(s)!
function onFocusSelf() {
    focusTo(getReference(this));
}

function onFocusTextInput() {
    letErrorAbort();
    let $ = this,
        picker = getReference($);
    getText($, 0) ? selectTo($) : picker.enter().fit();
}

function onInvalidSelf(e) {
    e && offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {state} = picker,
        {time} = state,
        {error} = time;
    letError(isInteger(error) && error > 0 ? error : 0, picker), setError(picker);
}

let searchQuery = "";

function onInputTextInput(e) {
    let $ = this,
        {inputType} = e,
        picker = getReference($),
        {_active} = picker;
    if (!_active) {
        return offEventDefault(e);
    }
    if ('deleteContent' === inputType.slice(0, 13) && !getText($, 0)) {
        toggleHintByValue(picker, 0);
    } else if ('insertText' === inputType) {
        toggleHintByValue(picker, 1);
    }
}

function onKeyDownArrow(e) {
    let $ = this,
        picker = getReference($),
        {options} = picker,
        key = e.key, exit;
    if (KEY_ENTER === key || ' ' === key) {
        picker[options.open ? 'exit' : 'enter'](!(exit = true)).fit();
    } else if (KEY_ESCAPE === key) {
        picker.exit(exit = true);
    } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_TAB === key) {
        picker.enter(exit = true);
    }
    exit && offEventDefault(e);
}

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        keyIsCtrl = e.ctrlKey,
        picker = getReference($),
        {_active} = picker;
    if (!_active) {
        return offEventDefault(e);
    }
    let {_options, mask, self, state} = picker,
        {strict, time} = state,
        {search} = time;
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key) && !keyIsCtrl) {
        picker.enter().fit();
        searchQuery = 0; // This will make a difference and force the filter to execute
    }
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = _options.at(getValue(self));
        currentOption = currentOption ? currentOption[2] : 0;
        if (!currentOption || currentOption.hidden) {
            currentOption = toValueFirstFromMap(_options);
            currentOption = currentOption ? currentOption[2] : 0;
            while (currentOption && (getAria(currentOption, TOKEN_DISABLED) || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        exit = true;
        if (!getAria(mask, 'expanded')) {
            picker.enter(false).fit();
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
            // Only execute the filter if the previous search query is different from the current search query
            if ("" === searchQuery || searchQuery !== getText($) + "") {
                filter(search[0], picker, $, _options);
                searchQuery = getText($) + "";
            }
        })[0](1);
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

let searchTerm = "",
    searchTermClear = debounce(() => searchTerm = "")[0];

function onKeyDownOption(e) {
    let $ = this, exit,
        key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        keyIsShift = e.shiftKey,
        picker = getReference($),
        {_mask, max, self} = picker,
        {value} = _mask,
        optionNext, optionParent, optionPrev, valueCurrent;
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
        exit = true;
        if (value && (valueCurrent = getElement('[value="' + (getOptionValue($) + "").replace(/"/g, '\\"') + '"]', getParent(value)))) {
            focusTo(valueCurrent);
        } else {
            picker.exit(exit);
        }
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (max > 1) {
            if (KEY_ESCAPE === key) {
                picker.exit(exit = true);
            } else if (KEY_TAB === key) {
                picker.exit(exit = false);
            } else {
                exit = true;
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
        if (KEY_PAGE_DOWN === key && TOKEN_GROUP === getRole(optionParent = getParent($))) {
            optionNext = getOptionNext(optionParent);
        } else {
            optionNext = getOptionNext($);
        }
        optionNext ? focusToOption(optionNext, picker) : focusToOptionFirst(picker);
    } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
        exit = true;
        if (KEY_PAGE_UP === key && TOKEN_GROUP === getRole(optionParent = getParent($))) {
            optionPrev = getOptionPrev(optionParent);
        } else {
            optionPrev = getOptionPrev($);
        }
        optionPrev ? focusToOption(optionPrev, picker) : focusToOptionLast(picker);
    } else if (KEY_BEGIN === key) {
        exit = true;
        focusToOptionFirst(picker);
    } else if (KEY_END === key) {
        exit = true;
        focusToOptionLast(picker);
    } else {
        if (!keyIsCtrl) {
            if (1 === toCount(key) && !keyIsAlt) {
                if (isInput(self)) {
                    toggleHintByValue(picker, key);
                } else {
                    searchTerm += key; // Initialize search term, right before exit
                }
            }
            !keyIsShift && picker.exit(!(exit = false));
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
        {_active, _fix, _mask, _options, max, min, self, state} = picker,
        {options, values} = _mask,
        {time} = state,
        {search} = time,
        valueCurrent, valueNext, valuePrev;
    searchTermClear(search[1]);
    if (!_active || isInput(self) && _fix) {
        return offEventDefault(e);
    }
    if (KEY_DELETE_LEFT === key) {
        searchTerm = "";
        let countValues = toSetCount(values);
        if (min < countValues) {
            if (valueCurrent = _options.at(getOptionValue($))) {
                letAria(valueCurrent[2], TOKEN_SELECTED);
                valueCurrent[3][TOKEN_SELECTED] = false;
                if ((valuePrev = getPrev($)) && hasKeyInMap(valuePrev, values) || (valuePrev = getNext($)) && hasKeyInMap(valuePrev, values)) {
                    focusTo(_mask[TOKEN_VALUE] = valuePrev);
                    offEvent(EVENT_KEY_DOWN, $, onKeyDownValue);
                    offEvent(EVENT_MOUSE_DOWN, $, onPointerDownValue);
                    offEvent(EVENT_MOUSE_DOWN, $.$[VALUE_X], onPointerDownValueX);
                    offEvent(EVENT_TOUCH_START, $, onPointerDownValue);
                    offEvent(EVENT_TOUCH_START, $.$[VALUE_X], onPointerDownValueX);
                    letValueInMap($, values), letElement($);
                // Do not remove the only option value
                } else {
                    letAttribute(_mask[TOKEN_VALUE] = $, TOKEN_VALUE);
                    setHTML($.$[VALUE_TEXT], "");
                    // No option(s) selected
                    if (0 === min) {
                        selectToOptionsNone(picker, 1);
                    }
                }
            }
        } else {
            onInvalidSelf.call(self);
            picker.fire('min.options', [countValues, min]);
        }
        if (max !== Infinity && max > countValues) {
            forEachMap(_options, (v, k) => {
                if (!v[3][TOKEN_DISABLED]) {
                    letAria(v[2], TOKEN_DISABLED);
                    setAttribute(v[2], TOKEN_TABINDEX, 0);
                }
            });
        }
    } else if (KEY_DELETE_RIGHT === key) {
        searchTerm = "";
        let countValues = toSetCount(values);
        if (min < countValues) {
            if (valueCurrent = _options.at(getOptionValue($))) {
                letAria(valueCurrent[2], TOKEN_SELECTED);
                valueCurrent[3][TOKEN_SELECTED] = false;
                if ((valueNext = getNext($)) && hasKeyInMap(valueNext, values) || (valueNext = getPrev($)) && hasKeyInMap(valueNext, values)) {
                    focusTo(_mask[TOKEN_VALUE] = valueNext);
                    offEvent(EVENT_KEY_DOWN, $, onKeyDownValue);
                    offEvent(EVENT_MOUSE_DOWN, $, onPointerDownValue);
                    offEvent(EVENT_MOUSE_DOWN, $.$[VALUE_X], onPointerDownValueX);
                    offEvent(EVENT_TOUCH_START, $, onPointerDownValue);
                    offEvent(EVENT_TOUCH_START, $.$[VALUE_X], onPointerDownValueX);
                    letValueInMap($, values), letElement($);
                // Do not remove the only option value
                } else {
                    letAttribute(_mask[TOKEN_VALUE] = $, TOKEN_VALUE);
                    setHTML($.$[VALUE_TEXT], "");
                    // No option(s) selected
                    if (0 === min) {
                        selectToOptionsNone(picker, 1);
                    }
                }
            }
        } else {
            onInvalidSelf.call(self);
            picker.fire('min.options', [countValues, min]);
        }
        if (max !== Infinity && max > countValues) {
            forEachMap(_options, (v, k) => {
                if (!v[3][TOKEN_DISABLED]) {
                    letAria(v[2], TOKEN_DISABLED);
                    setAttribute(v[2], TOKEN_TABINDEX, -1);
                }
            });
        }
    } else if (KEY_ESCAPE === key) {
        searchTerm = "";
        picker.exit(exit = true);
    } else if (KEY_TAB === key) {
        searchTerm = "";
        picker.exit(exit = false);
    } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || KEY_PAGE_DOWN === key || KEY_PAGE_UP === key || ("" === searchTerm && ' ' === key)) {
        let focus = exit = true;
        if (KEY_ENTER === key || ' ' === key) {
            if (valueCurrent = _options.at(getOptionValue($))) {
                focus = false;
                onAnimationsEnd(options, () => focusTo(valueCurrent[2]), scrollTo(valueCurrent[2]));
            }
        }
        if (picker.size < 2) {
            setStyle(options, 'max-height', 0);
        }
        picker.enter(focus).fit();
    } else if (KEY_ARROW_LEFT === key) {
        exit = true;
        if ((valuePrev = getPrev($)) && hasKeyInMap(valuePrev, values)) {
            focusTo(valuePrev);
        }
    } else if (KEY_ARROW_RIGHT === key) {
        exit = true;
        if ((valueNext = getNext($)) && hasKeyInMap(valueNext, values)) {
            focusTo(valueNext);
        }
    } else if (1 === toCount(key) && !keyIsAlt) {
        exit = true;
        if (!keyIsCtrl) {
            searchTerm += key;
        }
    }
    if ("" !== searchTerm) {
        filter(search[0], picker, searchTerm, _options, true);
    }
    exit && offEventDefault(e);
}

function onPointerDownValue(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask, _options} = picker,
        {options} = _mask, option;
    if (_options.open) {
        focusTo($);
    } else {
        if (option = _options.at(getOptionValue($))) {
            onAnimationsEnd(options, () => delay(() => (focusTo(option[2]), scrollTo(option[2])))[0](1));
        }
    }
}

function onPointerDownValueX(e) {
    let $ = this,
        value = getParent($),
        picker = getReference(value),
        {_options} = picker,
        option = _options.at(getOptionValue(value))[2];
    option && toggleToOption(option, picker);
    picker.enter(true).fit(), offEventDefault(e), offEventPropagation(e);
}

function onPasteTextInput(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {self, state} = picker,
        {strict} = state;
    delay(() => {
        if (!strict) {
            setValue(self, getText($));
        }
    })[0](1);
    toggleHint(1, picker), insertAtSelection($, e.clipboardData.getData('text/plain'));
}

// The default state is `0`. When the pointer is pressed on the option mask, its value will become `1`. This check is
// done to distinguish between a “touch only” and a “touch move” on touch device(s). It is also checked on pointer
// device(s) and should not give a wrong result.
let currentPointerState = 0,

    touchTop = false,
    touchTopCurrent = false;

function onPointerDownMask(e) {
    // This is necessary for device(s) that support both pointer and touch control so that they will not execute both
    // `mousedown` and `touchstart` event(s), causing the option picker’s option(s) to open and then close immediately.
    // Note that this will also disable the native pane scrolling feature on touch device(s).
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_active, _fix, _mask, _options, max, self} = picker,
        {arrow, options} = _mask,
        {target} = e, focusToArrow;
    if (_fix) {
        return focusTo(picker);
    }
    if (!_active || getDatum($, 'size')) {
        return;
    }
    if (arrow === target) {
        focusToArrow = 1;
    }
    // The user is likely browsing through the available option(s) by dragging the scroll bar
    if (options === target) {
        return;
    }
    while ($ !== target) {
        target = getParent(target);
        if (arrow === target) {
            focusToArrow = 1;
            break;
        }
        if (options === target) {
            return;
        }
    }
    forEachMap(_options, v => v[2].hidden = false);
    if (picker.size < 2) {
        setStyle(options, 'max-height', 0);
    }
    if (getReference(R) !== picker) {
        picker.enter(!focusToArrow).fit();
        if (focusToArrow) {
            focusTo(arrow);
        }
    } else {
        picker.exit(!focusToArrow ? 1 === max || isInput(self) : 0);
        if (focusToArrow) {
            focusTo(arrow);
        }
    }
}

function onPointerDownOption(e) {
    let $ = this;
    // Add an “active” effect on `touchstart` to indicate which option is about to be selected. We don’t need this
    // indication on `mousedown` because pointer device(s) already have a hover state that is clear enough to indicate
    // which option is about to be selected.
    if (EVENT_TOUCH_START === e.type && !getAria($, TOKEN_DISABLED)) {
        setAria($, TOKEN_SELECTED, true);
    }
    currentPointerState = 1; // Pointer is “down”
}

function onPointerDownRoot(e) {
    if (EVENT_TOUCH_START === e.type) {
        touchTop = e.touches[0].clientY;
    }
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    let {mask, state} = picker,
        {n} = state,
        {target} = e;
    if (mask !== target && mask !== getParent(target, '.' + n)) {
        picker.exit();
    }
}

function onPointerMoveRoot(e) {
    touchTopCurrent = EVENT_TOUCH_MOVE === e.type ? e.touches[0].clientY : false;
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    let {_mask} = picker,
        {lot} = _mask, v;
    if (false !== touchTop && false !== touchTopCurrent) {
        if (1 === currentPointerState && touchTop !== touchTopCurrent) {
            ++currentPointerState;
        }
        // Programmatically re-enable the swipe feature in the option(s) list because the default `touchstart` event
        // has been disabled. It does not have the innertia effect as in the native after-swipe reaction, but it is
        // still better than doing nothing :\
        v = getScroll(lot);
        v[1] -= (touchTopCurrent - touchTop);
        setScroll(lot, v);
        touchTop = touchTopCurrent;
    }
}

// The actual option selection happens when the pointer is released, to clearly identify whether we want to select an
// option or just want to scroll through the option(s) list by swiping over the option on touch device(s).
function onPointerUpOption() {
    let $ = this,
        picker = getReference($);
    // A “touch only” event is valid only if the pointer has not been “move(d)” up to this event
    if (1 === currentPointerState) {
        if (!getAria($, TOKEN_DISABLED)) {
            if (picker.max > 1) {
                toggleToOption($, picker), focusTo($);
            } else {
                selectToOption($, picker), (picker.size < 2 ? picker.exit(true) : focusTo($));
            }
        }
    } else {
        // Remove the “active” effect that was previously added on `touchstart`
        letAria($, TOKEN_SELECTED);
    }
    currentPointerState = 0; // Reset current pointer state
}

function onPointerUpRoot() {
    currentPointerState = 0; // Reset current pointer state
    touchTop = false;
}

function onResetForm() {
    getReference(this).reset();
}

function onSubmitForm(e) {
    let $ = this,
        picker = getReference($),
        {max, min, self} = picker,
        count = toCount(getOptionsSelected(picker));
    if (count < min) {
        onInvalidSelf.call(self);
        picker.fire('min.options', [count, min]), offEventDefault(e);
    } else if (count > max) {
        onInvalidSelf.call(self);
        picker.fire('max.options', [count, max]), offEventDefault(e);
    }
}

function onResizeWindow() {
    let picker = getReference(R);
    picker && picker.fit();
}

function onScrollWindow() {
    onResizeWindow.call(this);
}

function onWheelMask(e) {
    let $ = this,
        picker = getReference($),
        {_active} = picker;
    if (!_active) {
        return;
    }
    let {_mask} = picker,
        {options} = _mask,
        {deltaY, target} = e,
        optionCurrent, optionNext, optionPrev;
    if (options === target) {
        return;
    }
    while ($ !== target) {
        target = getParent(target);
        if (options === target) {
            return;
        }
    }
    if (!(optionCurrent = getOptionSelected(picker))) {
        return;
    }
    offEventDefault(e);
    if (deltaY < 0) {
        if (optionPrev = getOptionPrev(optionCurrent)) {
            focusTo(selectToOption(optionPrev, picker));
        } else {
            focusTo(selectToOptionLast(picker));
        }
    } else {
        if (optionNext = getOptionNext(optionCurrent)) {
            focusTo(selectToOption(optionNext, picker));
        } else {
            focusTo(selectToOptionFirst(picker));
        }
    }
}

function scrollTo(node) {
    node.scrollIntoView({
        block: 'nearest'
    });
}

function selectToOption(option, picker) {
    let {_mask, mask, self} = picker,
        {input, value} = _mask, optionReal, v;
    if (option) {
        optionReal = option.$[OPTION_SELF];
        selectToOptionsNone(picker);
        optionReal[TOKEN_SELECTED] = true;
        setAria(option, TOKEN_SELECTED, true);
        setValue(self, v = getOptionValue(option));
        if (isInput(self)) {
            letAria(mask, TOKEN_INVALID);
            setAria(input, 'activedescendant', getID(option));
            setText(input, getText(option));
            toggleHintByValue(picker, 1);
        } else {
            setHTML(value.$[VALUE_TEXT], getHTML(option.$[OPTION_TEXT]));
            setValue(value, v);
        }
        return picker.fire('change', ["" !== v ? v : null]), option;
    }
}

function selectToOptionFirst(picker) {
    let option;
    if (option = goToOptionFirst(picker)) {
        return selectToOption(option, picker);
    }
}

function selectToOptionLast(picker) {
    let option;
    if (option = goToOptionLast(picker)) {
        return selectToOption(option, picker);
    }
}

function selectToOptionsNone(picker, fireValue) {
    let {_mask, _options, self} = picker,
        {input, value} = _mask, v;
    forEachMap(_options, v => {
        letAria(v[2], TOKEN_SELECTED);
        v[3][TOKEN_SELECTED] = false;
    });
    if (fireValue) {
        setValue(self, v = "");
        if (isInput(self)) {
            letAria(input, 'activedescendant');
            setText(input, "");
            toggleHintByValue(picker, 0);
        } else {
            letAttribute(value, TOKEN_VALUE);
            setHTML(value.$[VALUE_TEXT], v);
            if (v = value.$[VALUE_X]) {
                letElement(v);
            }
        }
    }
}

function toggleToOption(option, picker) {
    let {_mask, _options, max, min, self, state} = picker,
        {value, values} = _mask,
        {n} = state,
        selected, selectedFirst, valueCurrent, valueNext, valueNextX;
    if (option) {
        let optionReal = option.$[OPTION_SELF],
            a = getOptionsValues(getOptionsSelected(picker)), b, c;
        if (getAria(option, TOKEN_SELECTED) && optionReal[TOKEN_SELECTED]) {
            if (min > 0 && (c = toCount(a)) <= min) {
                onInvalidSelf.call(self);
                picker.fire('min.options', [c, min]);
            } else {
                letAria(option, TOKEN_SELECTED);
                optionReal[TOKEN_SELECTED] = false;
            }
        } else {
            setAria(option, TOKEN_SELECTED, true);
            optionReal[TOKEN_SELECTED] = true;
        }
        if (!isInput(self)) {
            b = getOptionsValues(getOptionsSelected(picker));
            if (max !== Infinity && (c = toCount(b)) === max) {
                forEachMap(_options, (v, k) => {
                    if (!getAria(v[2], TOKEN_SELECTED)) {
                        letAttribute(v[2], TOKEN_TABINDEX);
                        setAria(v[2], TOKEN_DISABLED, true);
                    }
                });
            } else if (c > max) {
                letAria(option, TOKEN_SELECTED);
                optionReal[TOKEN_SELECTED] = false;
                forEachMap(_options, (v, k) => {
                    if (!getAria(v[2], TOKEN_SELECTED)) {
                        letAttribute(v[2], TOKEN_TABINDEX);
                        setAria(v[2], TOKEN_DISABLED, true);
                    }
                });
                onInvalidSelf.call(self);
                picker.fire('max.options', [c, max]);
            } else {
                forEachMap(_options, (v, k) => {
                    if (!v[3][TOKEN_DISABLED]) {
                        letAria(v[2], TOKEN_DISABLED);
                        setAttribute(v[2], TOKEN_TABINDEX, -1);
                    }
                });
            }
            selected = getOptionsSelected(picker);
            selectedFirst = selected.shift();
            if (selectedFirst) {
                setChildLast(value, value.$[VALUE_X]);
                setHTML(value.$[VALUE_TEXT], getHTML(selectedFirst.$[OPTION_TEXT]));
                setValue(value, getOptionValue(selectedFirst));
                letValueInMap(value, values);
                forEachSet(values, v => {
                    offEvent(EVENT_KEY_DOWN, v, onKeyDownValue);
                    offEvent(EVENT_MOUSE_DOWN, v, onPointerDownValue);
                    offEvent(EVENT_MOUSE_DOWN, v.$[VALUE_X], onPointerDownValueX);
                    offEvent(EVENT_TOUCH_START, v, onPointerDownValue);
                    offEvent(EVENT_TOUCH_START, v.$[VALUE_X], onPointerDownValueX);
                    letReference(v, picker), letElement(v);
                    return -1; // Remove
                });
                values.add(valueCurrent = value); // Add the only value to the set
                forEachArray(selected, (v, k) => {
                    valueNext = setID(letID(value.cloneNode(true)));
                    valueNext[TOKEN_TAB_INDEX] = -1;
                    valueNext.$ = {};
                    valueNext.$[VALUE_SELF] = null;
                    valueNext.$[VALUE_TEXT] = getElement('.' + n + '__v', valueNext);
                    valueNext.$[VALUE_X] = valueNextX = getElement('.' + n + '__x', valueNext);
                    onEvent(EVENT_KEY_DOWN, valueNext, onKeyDownValue);
                    onEvent(EVENT_MOUSE_DOWN, valueNext, onPointerDownValue);
                    onEvent(EVENT_MOUSE_DOWN, valueNextX, onPointerDownValueX);
                    onEvent(EVENT_TOUCH_START, valueNext, onPointerDownValue);
                    onEvent(EVENT_TOUCH_START, valueNextX, onPointerDownValueX);
                    setHTML(valueNext.$[VALUE_TEXT], getHTML(v.$[OPTION_TEXT]));
                    setReference(valueNext, picker), values.add(setNext(valueCurrent, valueNext));
                    setValue(valueNext, getOptionValue(v));
                    valueCurrent = valueNext;
                });
            } else {
                selectToOptionsNone(picker, 1);
            }
        }
        return picker.fire('change', [b]), option;
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
    $[TOKEN_VALUES] = new Map;
    if (options) {
        createOptions(of, options);
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
    'time': {
        'error': 1000,
        'search': [10, 500]
    },
    'with': []
};

OptionPicker.version = '2.2.3';

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
                {_mask, mask, self} = $,
                {input, value: inputReadOnly} = _mask,
                v = !!value;
            self[TOKEN_DISABLED] = !($._active = v);
            if (v) {
                letAria(mask, TOKEN_DISABLED);
                if (input) {
                    letAria(input, TOKEN_DISABLED);
                    setAttribute(input, TOKEN_CONTENTEDITABLE, "");
                } else if (inputReadOnly) {
                    setAttribute(inputReadOnly, TOKEN_TABINDEX, 0);
                }
            } else {
                setAria(mask, TOKEN_DISABLED, true);
                if (input) {
                    setAria(input, TOKEN_DISABLED, true);
                    letAttribute(input, TOKEN_CONTENTEDITABLE);
                } else if (inputReadOnly) {
                    letAttribute(inputReadOnly, TOKEN_TABINDEX);
                }
            }
            return $;
        }
    },
    fix: {
        get: function () {
            return this._fix;
        },
        set: function (value) {
            let $ = this,
                {_mask, mask, self} = $,
                {input} = _mask,
                v = !!value;
            if (!isInput(self)) {
                return $;
            }
            $._active = !($._fix = self[TOKEN_READ_ONLY] = v);
            if (v) {
                letAttribute(input, TOKEN_CONTENTEDITABLE);
                setAria(input, TOKEN_READONLY, true);
                setAria(mask, TOKEN_READONLY, true);
                setAttribute(input, TOKEN_TABINDEX, 0);
            } else {
                letAria(input, TOKEN_READONLY);
                letAria(mask, TOKEN_READONLY);
                letAttribute(input, TOKEN_TABINDEX);
                setAttribute(input, TOKEN_CONTENTEDITABLE, "");
            }
            return $;
        }
    },
    max: {
        get: function () {
            let $ = this,
                {state} = $,
                {max} = state;
            return Infinity === max || isInteger(max) && max > 0 ? max : 1;
        },
        set: function (value) {
            let $ = this,
                {_active} = $;
            if (!_active) {
                return $;
            }
            let {self} = $;
            if (isInput(self)) {
                return $;
            }
            let {mask, state} = $;
            value = (Infinity === value || isInteger(value)) && value > 0 ? value : 0;
            self.multiple = value > 1;
            state.max = value;
            value > 1 ? setAria(mask, 'multiselectable', true) : letAria(mask, 'multiselectable');
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
                {_active} = $;
            if (!_active) {
                return $;
            }
            let {state} = $;
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
                {_active, max} = $, selected;
            if (!_active) {
                return $;
            }
            if (isFloat(options) || isInteger(options) || isString(options)) {
                options = [options];
            }
            if (toCount(selected = createOptions($, options))) {
                let isMultipleSelect = max > 1;
                $[TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = $['_' + TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
            }
            let optionsValues = [];
            forEachMap($._options, v => optionsValues.push(getOptionValue(v[2], 1)));
            return $.fire('set.options', [optionsValues]);
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
                {_active, _mask, mask, self, state} = $,
                {options} = _mask,
                size = !isInteger(value) || value < 1 ? 1 : value;
            if (isInput(self)) {
                return $;
            }
            self.size = state.size = size;
            if (1 === size) {
                letDatum(mask, 'size');
                letStyle(options, 'max-height');
                _active && letReference(R);
            } else {
                let option = goToOptionFirst($);
                if (option) {
                    let optionsBorderBottom = getStyle(options, 'border-bottom-width', false),
                        optionsBorderTop = getStyle(options, 'border-top-width', false),
                        optionsGap = getStyle(options, 'gap', false),
                        optionHeight = getStyle(option, 'height', false) ?? getStyle(option, 'min-height', false) ?? getStyle(option, 'line-height', false);
                    setDatum(mask, 'size', size);
                    setStyle(options, 'max-height', 'calc(' + optionsBorderTop + ' + ' + optionsBorderBottom + ' + (' + optionHeight + '*' + size + ') + calc(' + optionsGap + '*' + size + '))');
                    _active && setReference(R, $);
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
                {_active} = $;
            if (!_active) {
                return $;
            }
            let {text} = _mask;
            if (!text) {
                return $;
            }
            let {input} = _mask, v;
            return setText(input, v = fromValue(value)), toggleHintByValue($, v), $;
        }
    },
    value: {
        get: function () {
            let value = getValue(this.self);
            return "" !== value ? value : null;
        },
        set: function (value) {
            let $ = this,
                {_active, _options} = $, option;
            if (!_active) {
                return $;
            }
            if (option = _options.at(value)) {
                selectToOption(option[2], $);
            }
            return $;
        }
    },
    values: {
        get: function () {
            return getOptionsValues(getOptionsSelected(this));
        },
        set: function (values) {
            let $ = this,
                {_active, _options} = $, option;
            if (!_active || $.max < 2) {
                return $;
            }
            selectToOptionsNone($);
            if (isFloat(values) || isInteger(values) || isString(values)) {
                values = [values];
            }
            if (isArray(values)) {
                forEachArray(values, v => {
                    if (option = _options.at(v)) {
                        toggleToOption(option[2], $);
                    }
                });
            }
            return $;
        }
    },
    vital: {
        get: function () {
            return this._vital;
        },
        set: function (value) {
            let $ = this,
                {_mask, mask, min, self} = $,
                {input} = _mask,
                v = !!value;
            self[TOKEN_REQUIRED] = v;
            if (v) {
                if (0 === min) {
                    $.min = 1;
                }
                input && setAria(input, TOKEN_REQUIRED, true);
                setAria(mask, TOKEN_REQUIRED, true);
            } else {
                $.min = 0;
                input && letAria(input, TOKEN_REQUIRED);
                letAria(mask, TOKEN_REQUIRED);
            }
            return $;
        }
    }
});

OptionPicker._ = setObjectMethods(OptionPicker, {
    attach: function (self, state) {
        let $ = this;
        self = self || $.self;
        state = state || $.state;
        $._options = new OptionPickerOptions($);
        $._value = null;
        $._values = [];
        $.self = self;
        $.state = state;
        let {max, min, n} = state,
            isDisabledSelf = isDisabled(self),
            isInputSelf = isInput(self),
            isMultipleSelect = max && max > 1 || (!isInputSelf && self.multiple),
            isReadOnlySelf = isReadOnly(self),
            isRequiredSelf = isRequired(self),
            theInputID = self.id,
            theInputName = self.name,
            theInputPlaceholder = self.placeholder;
        $._active = !isDisabledSelf && !isReadOnlySelf;
        $._fix = isInputSelf && isReadOnlySelf;
        $._vital = isRequiredSelf;
        if (isRequiredSelf && min < 1) {
            state.min = min = 1; // Force minimum option(s) to select to be `1`
        }
        const arrow = setElement('span', {
            'aria': {
                'hidden': TOKEN_TRUE
            },
            'class': n + '__arrow',
            'tabindex': -1
        });
        const form = getParentForm(self);
        const mask = setElement('div', {
            'aria': {
                'disabled': isDisabledSelf ? TOKEN_TRUE : false,
                'expanded': TOKEN_FALSE,
                'haspopup': 'listbox',
                'multiselectable': isMultipleSelect ? TOKEN_TRUE : false,
                'readonly': isInputSelf && isReadOnlySelf ? TOKEN_TRUE : false,
                'required': isRequiredSelf ? TOKEN_TRUE : false
            },
            'class': n,
            'role': 'combobox'
        });
        $.mask = mask;
        const maskFlex = setElement('div', {
            'class': n + '__flex',
            'role': TOKEN_GROUP
        });
        const maskOptions = setElement('div', {
            'class': n + '__options',
            'role': 'listbox'
        });
        const maskOptionsLot = setElement('div', {
            'class': n + '__options-lot',
            'role': 'none'
        });
        const textOrValue = setElement(isInputSelf ? 'span' : 'data', {
            'class': n + '__' + (isInputSelf ? TOKEN_TEXT : TOKEN_VALUE),
            'tabindex': isInputSelf ? false : 0
        });
        const textInput = setElement('span', {
            'aria': {
                'autocomplete': 'list',
                'disabled': isDisabledSelf ? TOKEN_TRUE : false,
                'multiline': TOKEN_FALSE,
                'placeholder': isInputSelf ? theInputPlaceholder : false,
                'readonly': isReadOnlySelf ? TOKEN_TRUE : false,
                'required': isRequiredSelf ? TOKEN_TRUE : false
            },
            'autocapitalize': 'off',
            'contenteditable': isDisabledSelf || isReadOnlySelf || !isInputSelf ? false : "",
            'role': 'searchbox',
            'spellcheck': !isInputSelf ? false : TOKEN_FALSE,
            'tabindex': isReadOnlySelf && isInputSelf ? 0 : false
        });
        const textInputHint = setElement('span', isInputSelf ? theInputPlaceholder + "" : "", {
            'aria': {
                'hidden': TOKEN_TRUE
            }
        });
        const valueX = setElement('span', {
            'aria': {
                'hidden': TOKEN_TRUE
            },
            'class': n + '__x',
            'tabindex': -1
        });
        setChildLast(mask, maskFlex);
        setChildLast(mask, maskOptions);
        setChildLast(maskOptions, maskOptionsLot);
        setChildLast(maskFlex, textOrValue);
        setChildLast(maskFlex, arrow);
        if (isInputSelf) {
            onEvent(EVENT_BLUR, textInput, onBlurTextInput);
            onEvent(EVENT_CUT, textInput, onCutTextInput);
            onEvent(EVENT_FOCUS, textInput, onFocusTextInput);
            onEvent(EVENT_INPUT, textInput, onInputTextInput);
            onEvent(EVENT_KEY_DOWN, textInput, onKeyDownTextInput);
            onEvent(EVENT_PASTE, textInput, onPasteTextInput);
            setChildLast(textOrValue, textInput);
            setChildLast(textOrValue, textInputHint);
            setReference(textInput, $);
        } else {
            onEvent(EVENT_KEY_DOWN, textOrValue, onKeyDownValue);
            onEvent(EVENT_MOUSE_DOWN, textOrValue, onPointerDownValue);
            onEvent(EVENT_TOUCH_START, textOrValue, onPointerDownValue);
            setReference(textOrValue, $);
        }
        setClass(self, n + '__self');
        setNext(self, mask);
        setChildLast(mask, self);
        if (form) {
            onEvent(EVENT_RESET, form, onResetForm);
            onEvent(EVENT_SUBMIT, form, onSubmitForm);
            setID(form);
            setReference(form, $);
        }
        onEvent(EVENT_FOCUS, self, onFocusSelf);
        onEvent(EVENT_INVALID, self, onInvalidSelf);
        onEvent(EVENT_KEY_DOWN, arrow, onKeyDownArrow);
        onEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
        onEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
        onEvent(EVENT_WHEEL, mask, onWheelMask);
        self[TOKEN_TAB_INDEX] = -1;
        setReference(arrow, $);
        setReference(mask, $);
        let _mask = {
            arrow: arrow,
            flex: maskFlex,
            hint: isInputSelf ? textInputHint : null,
            input: isInputSelf ? textInput : null,
            lot: maskOptionsLot,
            of: self,
            options: maskOptions,
            self: mask,
            values: new Set
        };
        _mask[isInputSelf ? TOKEN_TEXT : TOKEN_VALUE] = textOrValue;
        // Re-assign some state value(s) using the setter to either normalize or reject the initial value
        $.max = max = isMultipleSelect ? (max ?? Infinity) : 1;
        $.min = min = isInputSelf ? 0 : (min ?? 1);
        if (!isInputSelf) {
            textOrValue.$ = {};
            textOrValue.$[VALUE_SELF] = null;
            setChildLast(textOrValue, textOrValue.$[VALUE_TEXT] = setID(setElement('span', {
                'class': n + '__v',
                'role': 'none'
            })));
            if (max > 1) {
                onEvent(EVENT_MOUSE_DOWN, valueX, onPointerDownValueX);
                onEvent(EVENT_TOUCH_START, valueX, onPointerDownValueX);
                setChildLast(textOrValue, textOrValue.$[VALUE_X] = valueX);
            }
            _mask[TOKEN_VALUES].add(textOrValue); // Add the only value to the set
        }
        $._mask = _mask;
        let {_active} = $,
            {options} = state, selected;
        // Force the `this._active` value to `true` to set the initial value
        $._active = true;
        if (isFunction(options)) {
            setAria(mask, 'busy', true);
            options = options.call($, null);
            if (isInstance(options, Promise)) {
                options.then(options => {
                    letAria(mask, 'busy');
                    if (toCount(selected = createOptions($, options))) {
                        $[TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = $['_' + TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                    } else if (selected = getOptionSelected($, 1)) {
                        selected = getOptionValue(selected);
                        $[TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = $['_' + TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? [selected] : selected;
                    }
                    $.fire('load', [null, $[TOKEN_VALUES]])[$.options.open ? 'enter' : 'exit']().fit();
                });
            } else {
                if (toCount(selected = createOptions($, options))) {
                    $[TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = $['_' + TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                }
            }
        } else {
            if (toCount(selected = createOptions($, options || getOptions(self)))) {
                $[TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = $['_' + TOKEN_VALUE + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
            }
        }
        // After the initial value has been set, restore the previous `this._active` value
        $._active = _active;
        // Has to be set after the option(s) are set, because from that point on we want to get the computed size of the
        // option to set the correct height for the option(s) based on the `size` attribute value.
        $.size = state.size ?? (isInputSelf ? 1 : self.size);
        // Force `id` attribute(s)
        setAria(mask, 'controls', getID(setID(maskOptions)));
        setAria(mask, 'labelledby', getID(setID(textOrValue)));
        setAria(self, 'hidden', true);
        setAria(textInput, 'controls', getID(maskOptions));
        setID(arrow);
        setID(mask);
        setID(maskFlex);
        setID(maskOptionsLot);
        setID(self);
        setID(textInput);
        setID(textInputHint);
        setID(valueX);
        theInputID && setDatum(mask, 'id', theInputID);
        theInputName && setDatum(mask, 'name', theInputName);
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
            {arrow, input, value} = _mask;
        const form = getParentForm(self);
        $._active = false;
        $._options = new OptionPickerOptions($);
        $._value = null;
        $._values = [];
        if (form) {
            offEvent(EVENT_RESET, form, onResetForm);
            offEvent(EVENT_SUBMIT, form, onSubmitForm);
        }
        if (input) {
            offEvent(EVENT_BLUR, input, onBlurTextInput);
            offEvent(EVENT_CUT, input, onCutTextInput);
            offEvent(EVENT_FOCUS, input, onFocusTextInput);
            offEvent(EVENT_INPUT, input, onInputTextInput);
            offEvent(EVENT_KEY_DOWN, input, onKeyDownTextInput);
            offEvent(EVENT_PASTE, input, onPasteTextInput);
        }
        if (value) {
            offEvent(EVENT_KEY_DOWN, value, onKeyDownValue);
            offEvent(EVENT_MOUSE_DOWN, value, onPointerDownValue);
            offEvent(EVENT_TOUCH_START, value, onPointerDownValue);
            let valueX = value.$[VALUE_X];
            if (valueX) {
                offEvent(EVENT_MOUSE_DOWN, valueX, onPointerDownValueX);
                offEvent(EVENT_TOUCH_START, valueX, onPointerDownValueX);
            }
        }
        offEvent(EVENT_FOCUS, self, onFocusSelf);
        offEvent(EVENT_INVALID, self, onInvalidSelf);
        offEvent(EVENT_KEY_DOWN, arrow, onKeyDownArrow);
        offEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
        offEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
        offEvent(EVENT_WHEEL, mask, onWheelMask);
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
        self[TOKEN_TAB_INDEX] = null;
        letAria(self, 'hidden');
        letClass(self, state.n + '__self');
        setNext(mask, self);
        letElement(mask);
        $._mask = {
            of: self
        };
        $.mask = null;
        return $;
    },
    enter: function (focus, mode) {
        let $ = this, option,
            {_active, _fix, _mask, _options, mask, self} = $,
            {input, lot, options, value} = _mask,
            isInputSelf = isInput(self);
        if (_fix && focus && isInputSelf) {
            return (focusTo(input), selectTo(input, mode)), $;
        }
        if (!_active) {
            return $;
        }
        setAria(mask, 'expanded', toCount(getChildren(lot)) > 0);
        let theRootReference = getReference(R);
        if (theRootReference && $ !== theRootReference) {
            theRootReference.exit(); // Exit other(s)
        }
        setReference(R, $); // Link current picker to the root target
        $.fire('enter');
        if (focus) {
            if (isInputSelf) {
                focusTo(input), selectTo(input, mode);
            } else if (option = _options.at(getValue(self))) {
                onAnimationsEnd(options, () => focusTo(option[2]), scrollTo(option[2]));
            } else if (option = goToOptionFirst($)) {
                onAnimationsEnd(options, () => focusTo(option), scrollTo(option));
            } else {
                focusTo(value);
            }
        }
        onEvent(EVENT_MOUSE_DOWN, R, onPointerDownRoot);
        onEvent(EVENT_MOUSE_MOVE, R, onPointerMoveRoot);
        onEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        onEvent(EVENT_RESIZE, W, onResizeWindow, {passive: true});
        onEvent(EVENT_SCROLL, W, onScrollWindow, {passive: true});
        onEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
        onEvent(EVENT_TOUCH_MOVE, R, onPointerMoveRoot, {passive: true});
        onEvent(EVENT_TOUCH_START, R, onPointerDownRoot);
        return $;
    },
    exit: function (focus, mode) {
        let $ = this,
            {_active, _fix, _mask, _options, mask, self} = $,
            {input, value} = _mask,
            isInputSelf = isInput(self);
        if (_fix && focus && isInputSelf) {
            return (focusTo(input), selectTo(input, mode)), $;
        }
        if (!_active) {
            return $;
        }
        forEachMap(_options, v => v[2].hidden = false);
        setAria(mask, 'expanded', false);
        letReference(R);
        $.fire('exit');
        if (focus) {
            if (isInputSelf) {
                focusTo(input), selectTo(input, mode);
            } else {
                focusTo(value);
            }
        }
        offEvent(EVENT_MOUSE_DOWN, R, onPointerDownRoot);
        offEvent(EVENT_MOUSE_MOVE, R, onPointerMoveRoot);
        offEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        offEvent(EVENT_RESIZE, W, onResizeWindow);
        offEvent(EVENT_SCROLL, W, onScrollWindow);
        offEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
        offEvent(EVENT_TOUCH_MOVE, R, onPointerMoveRoot);
        offEvent(EVENT_TOUCH_START, R, onPointerDownRoot);
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
            {_active, _fix, _mask} = $,
            {input, value} = _mask;
        if (!_active && !_fix) {
            return $;
        }
        if (input) {
            focusTo(input), selectTo(input, mode);
        } else {
            focusTo(value);
        }
        return $;
    },
    reset: function (focus, mode) {
        let $ = this,
            {_active, _fix, _value, _values, max} = $;
        if (_fix) {
            return focus ? $.focus(mode) : $;
        }
        if (!_active) {
            return $;
        }
        if (max > 1) {
            $[TOKEN_VALUES] = _values;
        } else {
            $[TOKEN_VALUE] = _value;
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

OptionPickerOptions._ = setObjectMethods(OptionPickerOptions, {
    at: function (key) {
        return getValueInMap(toValue(key), this[TOKEN_VALUES]);
    },
    count: function () {
        return toMapCount(this[TOKEN_VALUES]);
    },
    // To be used by the `letValueInMap()` function
    delete: function (key, _fireHook = 1, _fireValue = 1) {
        let $ = this,
            {of, values} = $,
            {_active, _mask, self, state} = of,
            {lot, options} = _mask, r;
        if (!_active) {
            return false;
        }
        if (!isSet(key)) {
            forEachMap(values, (v, k) => $.let(k, 0, 0));
            selectToOptionsNone(of, _fireValue);
            options.hidden = true;
            return (_fireHook && of.fire('let.options', [[]])), 0 === $.count();
        }
        if (!(r = getValueInMap(key = toValue(key), values))) {
            return (_fireHook && of.fire('not.option', [key])), false;
        }
        let parent = getParent(r[2]),
            parentReal = getParent(r[3]),
            value = getOptionValue(r[2]),
            valueReal = of[TOKEN_VALUE];
        offEvent(EVENT_FOCUS, r[2], onFocusOption);
        offEvent(EVENT_KEY_DOWN, r[2], onKeyDownOption);
        offEvent(EVENT_MOUSE_DOWN, r[2], onPointerDownOption);
        offEvent(EVENT_MOUSE_UP, r[2], onPointerUpOption);
        offEvent(EVENT_TOUCH_END, r[2], onPointerUpOption);
        offEvent(EVENT_TOUCH_START, r[2], onPointerDownOption);
        letElement(r[2]), letElement(r[3]);
        r = letValueInMap(key, values);
        // Remove empty group(s)
        parent && TOKEN_GROUP === getRole(parent) && 0 === toCount(getChildren(parent)) && letElement(parent);
        parentReal && TOKEN_OPTGROUP === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
        // Clear value if there are no option(s)
        if (0 === toCount(getChildren(lot))) {
            selectToOptionsNone(of, !isInput(self));
            options.hidden = true;
        // Reset value to the first option if removed option is the selected option
        } else {
            value === valueReal && selectToOptionFirst(of);
        }
        if (!isFunction(state.options)) {
            state.options = values;
        }
        return (_fireHook && of.fire('let.option', [key])), r;
    },
    get: function (key) {
        let $ = this,
            {values} = $,
            value = getValueInMap(toValue(key), values), parent;
        if (value && (parent = getParent(value[2])) && TOKEN_GROUP === getRole(parent)) {
            return [getElementIndex(value[2]), getElementIndex(parent)];
        }
        return value ? getElementIndex(value[2]) : -1;
    },
    has: function (key) {
        return hasKeyInMap(toValue(key), this[TOKEN_VALUES]);
    },
    let: function (key, _fireHook = 1, _fireValue = 1) {
        return this.delete(key, _fireHook, _fireValue);
    },
    set: function (key, value, _fireHook = 1) {
        let $ = this,
            {of, values} = $,
            {_active} = of;
        if (!_active) {
            return false;
        }
        if ($.has(key = toValue(key))) {
            return (_fireHook && of.fire('has.option', [key])), false;
        }
        let {_mask, self, state} = of,
            {lot, options} = _mask,
            {n} = state,
            items, itemsParent, option, optionGroup, optionGroupReal, optionReal, optionText;
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
            optionGroup = getElement('.' + n + '__options-batch[value="' + fromValue(value[1]['&']).replace(/"/g, '\\"') + '"]', lot);
            optionGroupReal = getElement(TOKEN_OPTGROUP + '[label="' + fromValue(value[1]['&']).replace(/"/g, '\\"') + '"]', self) || setElement(TOKEN_OPTGROUP, {
                'label': value[1]['&'],
                'title': getState(value[1], 'title') ?? false
            });
            if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                setChildLast(lot, optionGroup = setElement('data', {
                    'class': n + '__options-batch',
                    'role': TOKEN_GROUP,
                    'title': getState(value[1], 'title') ?? false,
                    'value': value[1]['&']
                }));
                setChildLast(itemsParent, optionGroupReal);
                // Force `id` attribute(s)
                setID(optionGroup);
                setID(optionGroupReal);
            }
        } else {
            optionGroup = optionGroupReal = false;
        }
        let {active, mark, value: v} = value[1];
        if (!isSet(active)) {
            active = true;
        }
        v = fromValue(v || key);
        option = value[2] || setElement('data', {
            'aria': {
                'disabled': active ? false : TOKEN_TRUE,
                'selected': mark ? TOKEN_TRUE : false
            },
            'class': n + '__option',
            'data': {
                'batch': getState(value[1], '&') ?? false,
            },
            'role': 'option',
            'tabindex': active ? -1 : false,
            'title': getState(value[1], 'title') ?? false,
            'value': v
        });
        optionReal = value[3] || setElement('option', fromValue(value[0]), {
            'disabled': active ? false : "",
            'selected': mark ? "" : false,
            'title': getState(value[1], 'title') ?? false,
            'value': v
        });
        optionText = value[2] ? value[2].$[OPTION_TEXT] : setElement('span', fromValue(value[0]), {
            'class': n + '__v',
            'role': 'none'
        });
        // Force `id` attribute(s)
        setID(option);
        setID(optionReal);
        setID(optionText);
        option.$ = {};
        option.$[OPTION_SELF] = optionReal;
        option.$[OPTION_TEXT] = optionText;
        if (active && !value[2]) {
            onEvent(EVENT_FOCUS, option, onFocusOption);
            onEvent(EVENT_KEY_DOWN, option, onKeyDownOption);
            onEvent(EVENT_MOUSE_DOWN, option, onPointerDownOption);
            onEvent(EVENT_MOUSE_UP, option, onPointerUpOption);
            onEvent(EVENT_TOUCH_END, option, onPointerUpOption);
            onEvent(EVENT_TOUCH_START, option, onPointerDownOption);
        }
        setChildLast(option, optionText);
        setChildLast(optionGroup || lot, option);
        setChildLast(optionGroupReal || itemsParent, optionReal);
        setReference(option, of);
        value[2] = option;
        value[3] = optionReal;
        _fireHook && of.fire('is.option', [key]);
        setValueInMap(key, value, values);
        if (!isFunction(state.options)) {
            state.options = values;
        }
        return (_fireHook && of.fire('set.option', [key])), true;
    }
});

// In order for an object to be iterable, it must have a `Symbol.iterator` key
getPrototype(OptionPickerOptions)[Symbol.iterator] = function () {
    return this[TOKEN_VALUES][Symbol.iterator]();
};

OptionPicker.Options = OptionPickerOptions;

export default OptionPicker;