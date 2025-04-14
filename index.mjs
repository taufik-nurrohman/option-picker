import {/* focusTo, */insertAtSelection, selectTo, selectToNone} from '@taufik-nurrohman/selection';
import {R, W, getAria, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getRole, getState, getStyle, getText, getValue, hasState, isDisabled, isReadOnly, letAria, letAttribute, letClass, letDatum, letElement, letID, letStyle, setAria, setAttribute, setChildLast, setClass, setClasses, setDatum, setElement, setHTML, setID, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {forEachArray, forEachMap, forEachObject, forEachSet, getPrototype, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, onAnimationsEnd, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toValuesFromMap, toValueFirstFromMap} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {getScroll, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isBoolean, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toMapCount, toSetCount, toValue} from '@taufik-nurrohman/to';

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
const OPTION_TEXT = 1;

const VALUE_SELF = 0;
const VALUE_TEXT = 1;

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_mask, mask, self, state} = $,
        {options} = _mask,
        {strict} = state, option;
    let count = _options.count();
    if (selectOnly) {
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if ("" !== q && q === text.slice(0, toCount(q)) && !getAria(v[2], 'disabled')) {
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
                setAria(option, 'selected', true);
                option.$[OPTION_SELF].selected = true;
                setValue(self, getOptionValue(option));
            } else {
                setValue(self, "");
            }
        } else {
            setValue(self, query);
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
                createOptions($, v);
                letAria(mask, 'busy');
                $.fire('load', [query, $.values])[goToOptionFirst($) ? 'enter' : 'exit']().fit();
            });
        } else {
            createOptions($, call);
        }
    }
}, FILTER_COMMIT_TIME);

const name = 'OptionPicker';

function createOptions($, options) {
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
    let {_options, self, state} = $,
        {n} = state,
        key, r = [], value = getValue(self);
    n += '__option';
    // Reset the option(s) data, but leave the typed query in place, and do not fire the `let.options` hook
    _options.delete(null, 0, 0);
    forEachMap(map, (v, k) => {
        if (isArray(v) && v[1] && !v[1].disabled && v[1].selected) {
            r.push(toValue(v[1].value ?? k));
        }
        // Set the option data, but do not fire the `set.option` hook
        _options.set(toValue(isArray(v) && v[1] ? (v[1].value ?? k) : k), v, 0);
    });
    if (!isFunction(state.options)) {
        state.options = map;
    }
    if (0 === toCount(r)) {
        // If there is no selected option(s), get it from the current value
        if (hasKeyInMap(key = toValue(value), map)) {
            return [key];
        }
        // Or get it from the first option
        if (key = getOptionSelected($)) {
            return [getOptionValue(key, 1)];
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

function getOptionsValues(options, parseValue) {
    return options.map(v => getOptionValue(v, parseValue));
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
    delay(() => {
        getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
        if (strict) {} else {
            setValue(self, getText($));
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
        {hint} = _mask,
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
        keyIsShift = e.shiftKey,
        picker = getReference($),
        {_mask, _options, max, self} = picker,
        {hint, value} = _mask,
        optionNext, optionParent, optionPrev, valueCurrent;
    picker._event = e;
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
        exit = true;
        if (value && (valueCurrent = getElement('[data-value="' + getOptionValue($).replace(/"/g, '\\"') + '"]', getParent(value)))) {
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
        if (keyIsShift && max > 1) {
            if (optionNext) {
                if (!getAria(optionNext, 'selected')) {
                    toggleToOption(optionNext, picker);
                } else {
                    if (optionPrev = getPrev($)) {
                        if ('group' === getRole(optionPrev)) {
                            optionPrev = false;
                        } else {
                            while (optionPrev && (getAria(optionPrev, 'disabled') || optionPrev.hidden)) {
                                optionPrev = getNext(optionPrev);
                            }
                        }
                    }
                    if (!optionPrev || !getAria(optionPrev, 'selected')) {
                        // This removes the selection
                        toggleToOption($, picker);
                    }
                }
                focusToOption(optionNext, picker);
            }
        } else {
            optionNext ? focusToOption(optionNext, picker) : focusToOptionFirst(picker);
        }
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
        if (keyIsShift && max > 1) {
            if (optionPrev) {
                if (!getAria(optionPrev, 'selected')) {
                    toggleToOption(optionPrev, picker);
                } else {
                    if (optionNext = getNext($)) {
                        if ('group' === getRole(optionNext)) {
                            optionNext = false;
                        } else {
                            while (optionNext && (getAria(optionNext, 'disabled') || optionNext.hidden)) {
                                optionNext = getNext(optionNext);
                            }
                        }
                    }
                    if (!optionNext || !getAria(optionNext, 'selected')) {
                        // This removes the selection
                        toggleToOption($, picker);
                    }
                }
                focusToOption(optionPrev, picker);
            }
        } else {
            optionPrev ? focusToOption(optionPrev, picker) : focusToOptionLast(picker);
        }
    } else if (KEY_BEGIN === key) {
        exit = true;
        focusToOptionFirst(picker);
    } else if (KEY_END === key) {
        exit = true;
        focusToOptionLast(picker);
    } else {
        if (keyIsCtrl && !keyIsShift && 'a' === key && !isInput(self) && max > 1) {
            exit = true;
            forEachMap(_options, (v, k) => {
                if (!getAria(v[2], 'disabled') && !v[2].hidden) {
                    letAria(valueCurrent = v[2], 'selected');
                    v[3].selected = false;
                    toggleToOption(valueCurrent, picker); // Force select
                }
            });
            valueCurrent && focusTo(valueCurrent);
        } else if (!keyIsCtrl) {
            if (1 === toCount(key) && !keyIsAlt) {
                if (isInput(self)) {
                    setStyle(hint, 'color', 'transparent');
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
        keyIsShift = e.shiftKey,
        picker = getReference($),
        {_mask, _options, max, min, self} = picker,
        {options, value, values} = _mask,
        valueCurrent, valueNext, valuePrev;
    searchTermClear();
    if (isDisabled(self) || isInput(self) && isReadOnly(self)) {
        return offEventDefault(e);
    }
    picker._event = e;
    if (getAria($, 'selected') && (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key)) {
        searchTerm = "";
        if (min === toSetCount(values)) {
            picker.fire('min.options', [min, min]);
        } else {
            let index = 0;
            forEachSet(values, v => {
                if (min > index) {
                    if (valueCurrent = getValueInMap(getOptionValue(v, 1), _options.values)) {
                        if (min < 1) {
                            letAria(valueCurrent[2], 'selected');
                            valueCurrent[3].selected = false;
                            letDatum(v, 'value');
                            setHTML(v.$[VALUE_TEXT], "");
                        }
                    }
                    focusTo(_mask.value = v);
                } else if (getAria(v, 'selected')) {
                    if (valueCurrent = getValueInMap(getOptionValue(v, 1), _options.values)) {
                        letAria(valueCurrent[2], 'selected');
                        valueCurrent[3].selected = false;
                    }
                    offEvent('keydown', v, onKeyDownValue);
                    offEvent('mousedown', v, onPointerDownValue);
                    offEvent('touchstart', v, onPointerDownValue);
                    letValueInMap(v, values), letElement(v);
                }
                ++index;
            });
        }
        forEachSet(values, v => letAria(v, 'selected'));
    } else if (KEY_DELETE_LEFT === key) {
        searchTerm = "";
        let countValues = toSetCount(values);
        if (min < countValues) {
            if (valueCurrent = getValueInMap(getOptionValue($, 1), _options.values)) {
                letAria(valueCurrent[2], 'selected');
                valueCurrent[3].selected = false;
                if ((valuePrev = getPrev($)) && hasKeyInMap(valuePrev, values) || (valuePrev = getNext($)) && hasKeyInMap(valuePrev, values)) {
                    focusTo(_mask.value = valuePrev);
                    offEvent('keydown', $, onKeyDownValue);
                    offEvent('mousedown', $, onPointerDownValue);
                    offEvent('touchstart', $, onPointerDownValue);
                    letValueInMap($, values), letElement($);
                // Do not remove the only option value
                } else {
                    letDatum(_mask.value = $, 'value');
                    setHTML($.$[VALUE_TEXT], "");
                    // No option(s) selected
                    if (0 === min) {
                        selectToOptionsNone(picker, 1);
                    }
                }
            }
        } else {
            picker.fire('min.options', [countValues, min]);
        }
        if (max !== Infinity && max > countValues) {
            forEachMap(_options, (v, k) => {
                if (!v[3].disabled) {
                    letAria(v[2], 'disabled');
                    setAttribute(v[2], 'tabindex', 0);
                }
            });
        }
    } else if (KEY_DELETE_RIGHT === key) {
        searchTerm = "";
        let countValues = toSetCount(values);
        if (min < countValues) {
            if (valueCurrent = getValueInMap(getOptionValue($, 1), _options.values)) {
                letAria(valueCurrent[2], 'selected');
                valueCurrent[3].selected = false;
                if ((valueNext = getNext($)) && hasKeyInMap(valueNext, values) || (valueNext = getPrev($)) && hasKeyInMap(valueNext, values)) {
                    focusTo(_mask.value = valueNext);
                    offEvent('keydown', $, onKeyDownValue);
                    offEvent('mousedown', $, onPointerDownValue);
                    offEvent('touchstart', $, onPointerDownValue);
                    letValueInMap($, values), letElement($);
                // Do not remove the only option value
                } else {
                    letDatum(_mask.value = $, 'value');
                    setHTML($.$[VALUE_TEXT], "");
                    // No option(s) selected
                    if (0 === min) {
                        selectToOptionsNone(picker, 1);
                    }
                }
            }
        } else {
            picker.fire('min.options', [countValues, min]);
        }
        if (max !== Infinity && max > countValues) {
            forEachMap(_options, (v, k) => {
                if (!v[3].disabled) {
                    letAria(v[2], 'disabled');
                    setAttribute(v[2], 'tabindex', 0);
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
            if (valueCurrent = getValueInMap(getOptionValue($, 1), _options.values)) {
                focus = false;
                onAnimationsEnd(options, () => focusTo(valueCurrent[2]), scrollTo(valueCurrent[2]));
            }
            if (getAria($, 'selected')) {
                letAria($, 'selected');
            } else {
                setAria($, 'selected', true);
            }
        }
        if (picker.size < 2) {
            setStyle(options, 'max-height', 0);
        }
        picker.enter(focus).fit();
    } else if (KEY_ARROW_LEFT === key) {
        exit = true;
        if ((valuePrev = getPrev($)) && hasKeyInMap(valuePrev, values)) {
            if (keyIsShift) {
                if (getAria(valuePrev, 'selected')) {
                    letAria($, 'selected');
                } else {
                    setAria($, 'selected', true);
                    setAria(valuePrev, 'selected', true);
                }
            }
            focusTo(valuePrev);
        }
    } else if (KEY_ARROW_RIGHT === key) {
        exit = true;
        if ((valueNext = getNext($)) && hasKeyInMap(valueNext, values)) {
            if (keyIsShift) {
                if (getAria(valueNext, 'selected')) {
                    letAria($, 'selected');
                } else {
                    setAria($, 'selected', true);
                    setAria(valueNext, 'selected', true);
                }
            }
            focusTo(valueNext);
        }
    } else if (1 === toCount(key) && !keyIsAlt) {
        exit = true;
        if (keyIsCtrl && !keyIsShift && 'r' === key) {
            exit = false; // Native reload :(
        } else if (keyIsCtrl && !keyIsShift && 'a' === key && max > 1) {
            // Select all visually
            setAria(valueCurrent = value, 'selected', true);
            while ((valueNext = getNext(valueCurrent)) && hasKeyInMap(valueNext, values)) {
                setAria(valueCurrent = valueNext, 'selected', true);
            }
            while ((valuePrev = getPrev(valueCurrent)) && hasKeyInMap(valuePrev, values)) {
                setAria(valueCurrent = valuePrev, 'selected', true);
            }
        } else if (!keyIsCtrl) {
            searchTerm += key;
        }
    }
    if ("" !== searchTerm) {
        filter(picker, searchTerm, _options, true);
    }
    exit && offEventDefault(e);
}

function onPointerDownValue(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask, max} = picker,
        {values} = _mask;
    picker._event = e;
    // Clear all selection(s) on “click”
    forEachSet(values, v => letAria(v, 'selected'));
    // Do not show option(s) on “click” value if it is not the only value for `<select multiple>`
    max > 1 && toSetCount(values) > 1 && (picker.exit(), focusTo($), offEventPropagation(e));
}

function onPasteTextInput(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask} = picker,
        {hint} = _mask;
    delay(() => getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color'), 1)();
    insertAtSelection($, e.clipboardData.getData('text/plain'));
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
        {_mask, _options, self} = picker,
        {options} = _mask,
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
    if (picker.size < 2) {
        setStyle(options, 'max-height', 0);
    }
    picker[getReference(R) !== picker ? 'enter' : 'exit'](true).fit();
}

function onPointerDownOption(e) {
    let $ = this;
    getReference($)._event = e;
    // Add an “active” effect on `touchstart` to indicate which option is about to be selected. We don’t need this
    // indication on `mousedown` because pointer device(s) already have a hover state that is clear enough to indicate
    // which option is about to be selected.
    if ('touchstart' === e.type && !getAria($, 'disabled')) {
        setAria($, 'selected', true);
    }
    currentPointerState = 1; // Pointer is “down”
}

function onPointerDownRoot(e) {
    if ('touchstart' === e.type) {
        touchTop = e.touches[0].clientY;
    }
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    picker._event = e;
    let {mask} = picker,
        {target} = e;
    if (mask !== target && mask !== getParent(target, '[role=combobox]')) {
        letReference($), picker.exit();
    }
}

function onPointerMoveRoot(e) {
    touchTopCurrent = 'touchmove' === e.type ? e.touches[0].clientY : false;
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    picker._event = e;
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
function onPointerUpOption(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
    // A “touch only” event is valid only if the pointer has not been “move(d)” up to this event
    if (1 === currentPointerState) {
        if (!getAria($, 'disabled')) {
            if (picker.max > 1) {
                toggleToOption($, picker), focusTo($);
            } else {
                selectToOption($, picker), (picker.size < 2 ? picker.exit(true) : focusTo($));
            }
        }
    } else {
        // Remove the “active” effect that was previously added on `touchstart`
        letAria($, 'selected');
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

function onSubmitForm(e) {
    let $ = this,
        picker = getReference($),
        {max, min} = picker,
        count = toCount(getOptionsSelected(picker));
    if (count < min) {
        picker.fire('min.options', [count, min]);
        offEventDefault(e);
    } else if (count > max) {
        picker.fire('max.options', [count, max]);
        offEventDefault(e);
    }
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
    let {_mask, min, self} = picker,
        {hint, input, value} = _mask, optionReal, v;
    if (option) {
        optionReal = option.$[OPTION_SELF];
        selectToOptionsNone(picker);
        optionReal.selected = true;
        setAria(option, 'selected', true);
        setValue(self, v = getOptionValue(option));
        if (isInput(self)) {
            setAria(input, 'activedescendant', getID(option));
            setStyle(hint, 'color', 'transparent');
            setText(input, getText(option));
        } else {
            setDatum(value, 'value', v);
            setHTML(value.$[VALUE_TEXT], getHTML(option.$[OPTION_TEXT]));
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

function selectToOptionsNone(picker, fireValue) {
    let {_mask, _options, self} = picker,
        {hint, input, value} = _mask, v;
    forEachMap(_options, v => {
        letAria(v[2], 'selected');
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
            setHTML(value.$[VALUE_TEXT], v);
        }
    }
}

function toggleToOption(option, picker) {
    let {_mask, _options, max, min, self, state} = picker,
        {value, values} = _mask,
        {n} = state,
        selected, selectedFirst, valueCurrent, valueNext;
    if (option) {
        let optionReal = option.$[OPTION_SELF],
            a = getOptionsValues(getOptionsSelected(picker)), b, c;
        if (getAria(option, 'selected') && optionReal.selected) {
            if (min > 0 && (c = toCount(a)) <= min) {
                picker.fire('min.options', [c, min]);
            } else {
                letAria(option, 'selected');
                optionReal.selected = false;
            }
        } else {
            setAria(option, 'selected', true);
            optionReal.selected = true;
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
            } else if (c > max) {
                letAria(option, 'selected');
                optionReal.selected = false;
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
                setHTML(value.$[VALUE_TEXT], getHTML(selectedFirst.$[OPTION_TEXT]));
                letValueInMap(value, values);
                forEachSet(values, v => {
                    offEvent('keydown', v, onKeyDownValue);
                    offEvent('mousedown', v, onPointerDownValue);
                    offEvent('touchstart', v, onPointerDownValue);
                    letReference(v, picker), letElement(v);
                    return -1; // Remove
                });
                values.add(valueCurrent = value); // Add the only value to the set
                forEachArray(selected, (v, k) => {
                    valueNext = setID(letID(value.cloneNode(true)));
                    valueNext.tabIndex = -1;
                    valueNext.$ = {};
                    valueNext.$[VALUE_SELF] = null;
                    valueNext.$[VALUE_TEXT] = getElement('.' + n + '__v', valueNext);
                    onEvent('keydown', valueNext, onKeyDownValue);
                    onEvent('mousedown', valueNext, onPointerDownValue);
                    onEvent('touchstart', valueNext, onPointerDownValue);
                    letAria(valueNext, 'selected');
                    setDatum(valueNext, 'value', getOptionValue(v));
                    setHTML(valueNext.$[VALUE_TEXT], getHTML(v.$[OPTION_TEXT]));
                    setReference(valueNext, picker), values.add(setNext(valueCurrent, valueNext));
                    valueCurrent = valueNext;
                });
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
    $.values = new Map;
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
    'with': []
};

OptionPicker.version = '2.0.1';

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
            self.disabled = !($._active = v);
            if (v) {
                letAria(mask, 'disabled');
                if (input) {
                    letAria(input, 'disabled');
                    setAttribute(input, 'contenteditable', "");
                } else if (inputReadOnly) {
                    setAttribute(inputReadOnly, 'tabindex', 0);
                }
            } else {
                setAria(mask, 'disabled', true);
                if (input) {
                    setAria(input, 'disabled', true);
                    letAttribute(input, 'contenteditable');
                } else if (inputReadOnly) {
                    letAttribute(inputReadOnly, 'tabindex');
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
            $._active = !($._fix = self.readOnly = v);
            if (v) {
                letAttribute(input, 'contenteditable');
                setAria(input, 'readonly', true);
                setAria(mask, 'readonly', true);
                setAttribute(input, 'tabindex', 0);
            } else {
                letAria(input, 'readonly');
                letAria(mask, 'readonly');
                letAttribute(input, 'tabindex');
                setAttribute(input, 'contenteditable', "");
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
                {_active, mask, self, state} = $;
            if (!_active || isInput(self)) {
                return $;
            }
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
                {_active, state} = $;
            if (!_active) {
                return $;
            }
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
                {_active, _mask, max} = $, selected;
            if (!_active) {
                return $;
            }
            if (isFloat(options) || isInteger(options) || isString(options)) {
                options = [options];
            }
            if (toCount(selected = createOptions($, options))) {
                let isMultipleSelect = max > 1;
                $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
            }
            let values = [];
            forEachMap($._options, v => values.push(getOptionValue(v[2])));
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
                {_active, _mask} = $,
                {hint, input, text} = _mask, v;
            if (!_active || !text) {
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
                {_active, _options} = $, option;
            if (!_active) {
                return $;
            }
            if (option = getValueInMap(toValue(value), _options.values)) {
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
                    if (option = getValueInMap(toValue(v), _options.values)) {
                        toggleToOption(option[2], $);
                    }
                });
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
        $._event = null;
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
            theInputPlaceholder = self.placeholder;
        $._active = !isDisabledSelf && !isReadOnlySelf;
        $._fix = isInputSelf && isReadOnlySelf;
        const arrow = setElement('span', {
            'class': n + '__arrow',
            'role': 'none'
        });
        const form = getParentForm(self);
        const mask = setElement('div', {
            'aria': {
                'disabled': isDisabledSelf ? 'true' : false,
                'expanded': 'false',
                'haspopup': 'listbox',
                'multiselectable': isMultipleSelect ? 'true' : false,
                'readonly': isInputSelf && isReadOnlySelf ? 'true' : false
            },
            'class': n,
            'role': 'combobox'
        });
        $.mask = mask;
        const maskFlex = setElement('div', {
            'class': n + '__flex',
            'role': 'group'
        });
        const maskOptions = setElement('div', {
            'class': n + '__options',
            'role': 'listbox'
        });
        const maskOptionsLot = setElement('div', {
            'class': n + '__options-lot',
            'role': 'none'
        });
        const text = setElement('span', {
            'class': n + '__' + (isInputSelf ? 'text' : 'value'),
            'tabindex': isInputSelf ? false : 0
        });
        if (!isInputSelf) {
            text.$ = {};
            text.$[VALUE_SELF] = null;
            setChildLast(text, text.$[VALUE_TEXT] = setElement('span', {
                'class': n + '__v',
                'role': 'none'
            }));
        }
        const textInput = setElement('span', {
            'aria': {
                'autocomplete': 'list',
                'disabled': isDisabledSelf ? 'true' : false,
                'multiline': 'false',
                'placeholder': isInputSelf ? theInputPlaceholder : false,
                'readonly': isReadOnlySelf ? 'true' : false,
            },
            'autocapitalize': 'off',
            'contenteditable': isDisabledSelf || isReadOnlySelf || !isInputSelf ? false : "",
            'role': 'searchbox',
            'spellcheck': !isInputSelf ? false : 'false',
            'tabindex': isReadOnlySelf && isInputSelf ? 0 : false
        });
        const textInputHint = setElement('span', isInputSelf ? theInputPlaceholder + "" : "", {
            'aria': {
                'hidden': 'true'
            }
        });
        setChildLast(mask, maskFlex);
        setChildLast(mask, maskOptions);
        setChildLast(maskOptions, maskOptionsLot);
        setChildLast(maskFlex, text);
        setChildLast(maskFlex, arrow);
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
        setChildLast(mask, self);
        if (form) {
            onEvent('reset', form, onResetForm);
            onEvent('submit', form, onSubmitForm);
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
        _mask[isInputSelf ? 'text' : 'value'] = text;
        if (!isInputSelf) {
            _mask.values.add(text); // Add the only value to the set
        }
        $._mask = _mask;
        // Re-assign some state value(s) using the setter to either normalize or reject the initial value
        $.max = isMultipleSelect ? (max ?? Infinity) : 1;
        $.min = isInputSelf ? 0 : (min ?? 1);
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
                    if (toCount(selected = createOptions($, options))) {
                        $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                    } else if (selected = getOptionSelected($, 1)) {
                        selected = getOptionValue(selected);
                        $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? [selected] : selected;
                    }
                    $.fire('load', [null, $.values])[$.options.open ? 'enter' : 'exit']().fit();
                });
            } else {
                if (toCount(selected = createOptions($, options))) {
                    $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
                }
            }
        } else {
            if (toCount(selected = createOptions($, options || getOptions(self)))) {
                $['value' + (isMultipleSelect ? 's' : "")] = $['_value' + (isMultipleSelect ? 's' : "")] = isMultipleSelect ? selected : selected[0];
            }
        }
        // After the initial value has been set, restore the previous `this._active` value
        $._active = _active;
        // Has to be set after the option(s) are set, because from that point on we want to get the computed size of the
        // option to set the correct height for the option(s) based on the `size` attribute value.
        $.size = state.size ?? (isInputSelf ? 1 : self.size);
        // Force `id` attribute(s)
        setAria(mask, 'controls', getID(setID(maskOptions)));
        setAria(mask, 'labelledby', getID(setID(text)));
        setAria(self, 'hidden', true);
        setAria(textInput, 'controls', getID(maskOptions));
        setID(arrow);
        setID(mask);
        setID(maskFlex);
        setID(maskOptionsLot);
        setID(self);
        setID(textInput);
        setID(textInputHint);
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
        $._value = null;
        $._values = [];
        if (form) {
            offEvent('reset', form, onResetForm);
            offEvent('submit', form, onSubmitForm);
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
            offEvent('mousedown', value, onPointerDownValue);
            offEvent('touchstart', value, onPointerDownValue);
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
            {_active, _mask, _options, mask, self} = $,
            {input, lot, options, value, values} = _mask;
        if (!_active) {
            return $;
        }
        setAria(mask, 'expanded', toCount(getChildren(lot)) > 0);
        let theRootReference = getReference(R);
        if (theRootReference && $ !== theRootReference) {
            theRootReference.exit(); // Exit other(s)
        }
        setReference(R, $); // Link current picker to the root target
        // Clear all selection(s) on “click”
        forEachSet(values, v => letAria(v, 'selected'));
        $.fire('enter');
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else if (option = getValueInMap(toValue(getValue(self)), _options.values)) {
                onAnimationsEnd(options, () => focusTo(option[2]), scrollTo(option[2]));
            } else if (option = goToOptionFirst($)) {
                onAnimationsEnd(options, () => focusTo(option), scrollTo(option));
            } else {
                focusTo(value);
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
            {_mask} = $,
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
            {_active, _value, _values, max} = $;
        if (!_active) {
            return $;
        }
        if (max > 1) {
            $.values = _values;
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

OptionPickerOptions._ = setObjectMethods(OptionPickerOptions, {
    at: function (key) {
        return getValueInMap(toValue(key), this.values);
    },
    count: function () {
        return toMapCount(this.values);
    },
    delete: function (key, _fireHook = 1, _fireValue = 1) {
        let $ = this,
            {of, values} = $,
            {_active, _mask, self, state} = of,
            {lot, options} = _mask, r;
        if (!_active) {
            return false;
        }
        if (!isSet(key)) {
            forEachMap(values, (v, k) => $.delete(k, 0, 0));
            selectToOptionsNone(of, _fireValue);
            options.hidden = true;
            return _fireHook && of.fire('let.options', [[]]) && 0 === $.count();
        }
        if (!(r = getValueInMap(key = toValue(key), values))) {
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
        r = letValueInMap(key, values);
        // Remove empty group(s)
        parent && 'group' === getRole(parent) && 0 === toCount(getChildren(parent)) && letElement(parent);
        parentReal && 'optgroup' === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
        // Clear value if there are no option(s)
        if (0 === toCount(getChildren(lot))) {
            selectToOptionsNone(of, !isInput(self));
            options.hidden = true;
        // Reset value to the first option if removed option is the selected option
        } else {
            setValue(self, "");
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
        if (value && (parent = getParent(value[2])) && 'group' === getRole(parent)) {
            return [getElementIndex(value[2]), getElementIndex(parent)];
        }
        return value ? getElementIndex(value[2]) : -1;
    },
    has: function (key) {
        return hasKeyInMap(toValue(key), this.values);
    },
    let: function (key, _fireHook = 1) {
        return this.delete(key, _fireHook, 1);
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
            classes, items, itemsParent, option, optionGroup, optionGroupReal, optionReal, optionText, styles;
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
            optionGroup = getElement('.' + n + '__options-batch[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', lot);
            optionGroupReal = getElement('optgroup[label="' + value[1]['&'].replace(/"/g, '\\"') + '"]', self) || setElement('optgroup', {
                'label': value[1]['&'],
                'title': getState(value[1], 'title') ?? false
            });
            if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                setChildLast(lot, optionGroup = setElement('span', {
                    'class': n + '__options-batch',
                    'data': {
                        'value': value[1]['&']
                    },
                    'role': 'group',
                    'title': getState(value[1], 'title') ?? false
                }));
                setChildLast(itemsParent, optionGroupReal);
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
        v = fromValue(v || key);
        option = value[2] || setElement('span', {
            'aria': {
                'disabled': disabled ? 'true' : false,
                'selected': selected ? 'true' : false
            },
            'class': n + '__option',
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
        optionText = value[2] ? value[2].$[OPTION_TEXT] : setElement('span', fromValue(value[0]), {
            'class': n + '__v',
            'role': 'none'
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
        option.$ = {};
        option.$[OPTION_SELF] = optionReal;
        option.$[OPTION_TEXT] = optionText;
        if (!disabled && !value[2]) {
            onEvent('focus', option, onFocusOption);
            onEvent('keydown', option, onKeyDownOption);
            onEvent('mousedown', option, onPointerDownOption);
            onEvent('mouseup', option, onPointerUpOption);
            onEvent('touchend', option, onPointerUpOption);
            onEvent('touchstart', option, onPointerDownOption);
        }
        setChildLast(option, optionText);
        setChildLast(optionGroup || lot, option);
        setChildLast(optionGroupReal || itemsParent, optionReal);
        setReference(option, of);
        value[2] = option;
        value[3] = optionReal;
        setValueInMap(key, value, values);
        if (!isFunction(state.options)) {
            state.options = values;
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