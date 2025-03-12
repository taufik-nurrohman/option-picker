import {D, R, W, focusTo, getAttribute, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getState, getStyle, getText, getValue, hasClass, hasState, isDisabled, isReadOnly, letAttribute, letClass, letDatum, letElement, letStyle, selectNone, selectTo, setAttribute, setChildLast, setClass, setClasses, setDatum, setElement, setHTML, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {forEachArray, forEachMap, forEachObject, getPrototype, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toKeysFromMap, toKeyFirstFromMap, toKeyLastFromMap, toValuesFromMap, toValueFirstFromMap, toValueLastFromMap} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getOffset, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {getRect} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toValue} from '@taufik-nurrohman/to';

const FILTER_COMMIT_TIME = 10;
const SEARCH_CLEAR_TIME = 500;

const KEY_ARROW_DOWN = 'ArrowDown';
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

const bounce = debounce($ => $.fit(), 10);

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

function focusToOption(option, picker, focusOnly) {
    let {mask, state} = picker,
        {n} = state;
    if (option) {
        focusToOptionsNone(picker);
        focusOnly ? focusTo(option) : setClass(option, n + '__option--focus');
        return option;
    }
}

function focusToOptionFirst(picker, focusOnly, k) {
    let {_options} = picker, option;
    if (option = toValuesFromMap(_options)['find' + (k || "")](v => !getAttribute(v[2], 'aria-disabled') && !v[2].hidden)) {
        return focusToOption(option[2], picker, focusOnly);
    }
}

function focusToOptionLast(picker, focusOnly) {
    return focusToOptionFirst(picker, focusOnly, 'Last');
}

function focusToOptions(options, picker) {}

function focusToOptionsNone(picker) {
    let {_options, mask, state} = picker,
        {n} = state;
    n += '__option--focus';
    forEachMap(_options, v => letClass(v[2], n));
}

function getOptionSelected($, strict) {
    let {_options, self} = $, selected;
    forEachMap(_options, (v, k) => {
        if (isArray(v) && v[2] && !getAttribute(v[2], 'aria-disabled') && getAttribute(v[2], 'aria-selected')) {
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

function getOptionsSelected(options) {}

function isInput(self) {
    return 'input' === getName(self);
}

function scrollTo(node, view) {
    node.scrollIntoView({block: 'nearest'});
}

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_event, _mask, mask, self, state} = $,
        {options, value} = _mask,
        {strict} = state,
        hasSize = getDatum(mask, 'size');
    let {count} = _options;
    if (selectOnly) {
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if ("" !== q && q === text.slice(0, toCount(q)) && !getAttribute(v[2], 'aria-disabled')) {
                selectToOption(v[2], $);
                if (hasSize) {
                    scrollTo(v[2], options);
                }
                return 0;
            }
            --count;
        });
    } else {
        focusToOptionsNone($);
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
        // Focus visually to the first option!
        if (strict) {
            focusToOptionFirst($);
        }
        setValue(self, strict ? "" : query);
    }
    $.fire('search', [_event, query]);
    let call = state.options;
    // Only fetch when no other option(s) are available to query
    if (0 === count && isFunction(call)) {
        setAttribute(mask, 'aria-busy', 'true');
        call = call.call($, query);
        if (isInstance(call, Promise)) {
            call.then(v => {
                createOptionsFrom($, v, options);
                letAttribute(mask, 'aria-busy');
                $.fire('load', [_event, query, v]).fit();
            });
        } else {
            createOptionsFrom($, call, options);
        }
    }
}, FILTER_COMMIT_TIME);

function onBlurMask(e) {
    let $ = this,
        picker = getReference($),
        {state} = picker,
        {n} = state;
    letClass($, n += '--focus');
    letClass($, n += '-self');
    picker.fire('blur', [e]).fire('blur.self', [e])._event = e;
}

function onBlurOption(e) {
    let $ = this,
        picker = getReference($),
        {mask, state} = picker,
        {n} = state;
    picker._event = e;
    letClass($, n + '__option--focus');
    letClass(mask, n += '--focus');
    letClass(mask, n + '-option');
}

function onBlurTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, mask, state} = picker,
        {text} = _mask,
        {n, strict} = state, option;
    picker._event = e;
    letClass(text, n + '__text--focus');
    letClass(mask, n += '--focus');
    letClass(mask, n + '-text');
    if (strict) {
        if (option = getOptionSelected(picker)) {
            selectToOption(option, picker);
        } else {
            // Automatically select the first option, or select none!
            if (!selectToOptionFirst(picker)) {
                selectToOptionsNone(picker, 1);
            }
        }
    }
}

function onCutTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
    picker._event = e;
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
}

function onFocusMask(e) {
    let $ = this,
        picker = getReference($),
        {state} = picker,
        {n} = state;
    setClass($, n += '--focus');
    setClass($, n += '-self');
    picker.fire('focus', [e]).fire('focus.self', [e])._event = e;
}

function onFocusOption(e) {
    let $ = this,
        picker = getReference($),
        {mask, state} = picker,
        {n} = state;
    selectNone();
    picker._event = e;
    setClass($, n + '__option--focus');
    setClass(mask, n += '--focus');
    setClass(mask, n += '-option');
}

function onFocusSelf(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
    picker.focus();
}

function onFocusTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, mask, self, state} = picker,
        {text} = _mask,
        {n} = state;
    picker._event = e;
    setClass(text, n + '__text--focus');
    setClass(mask, n += '--focus');
    setClass(mask, n += '-text');
    getText($, false) ? selectTo($) : picker.enter().fit();
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
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
        delay(() => picker.enter().fit(), FILTER_COMMIT_TIME + 1)();
    }
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = getValueInMap(toValue(getValue(self)), _options._o);
        currentOption = currentOption ? currentOption[2] : 0;
        if (!currentOption || currentOption.hidden) {
            currentOption = toValueFirstFromMap(_options);
            currentOption = currentOption ? currentOption[2] : 0;
            while (currentOption && (getAttribute(currentOption, 'aria-disabled') || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        exit = true;
        if (!getAttribute(mask, 'aria-expanded')) {
            picker.enter(exit);
            currentOption && focusTo(currentOption);
        } else if (strict && KEY_ENTER === key) {
            // Automatically select the first option!
            selectToOptionFirst(picker) && picker.exit(exit);
        } else {
            currentOption && focusTo(currentOption);
        }
    } else if (KEY_TAB === key) {
        strict && selectToOptionFirst(picker) && picker.exit();
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

function onKeyDownMask(e) {
    let $ = this, exit,
        key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        picker = getReference($),
        {_options, self} = picker;
    searchTermClear();
    if (isDisabled(self) || isReadOnly(self)) {
        return offEventDefault(e);
    }
    picker._event = e;
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
        searchTerm = "";
    } else if (KEY_ESCAPE === key) {
        searchTerm = "";
        picker.exit(exit = true);
    } else if (KEY_TAB === key) {
        searchTerm = "";
        picker.exit(exit = false);
    } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || KEY_PAGE_DOWN === key || KEY_PAGE_UP === key || ("" === searchTerm && ' ' === key)) {
        picker.enter(exit = true).fit();
    } else if (1 === toCount(key) && !keyIsAlt && !keyIsCtrl) {
        searchTerm += key;
    }
    if ("" !== searchTerm) {
        filter(picker, searchTerm, _options, exit = true);
    }
    exit && offEventDefault(e);
}

function onKeyDownOption(e) {
    let $ = this, exit,
        key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        picker = getReference($),
        {_mask, _options, mask, self} = picker,
        {hint, input, value} = _mask;
    let nextOption, parentOption, prevOption;
    picker._event = e;
    if (KEY_DELETE_LEFT === key) {
        picker.exit(exit = true);
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (KEY_ESCAPE !== key) {
            selectToOption($, picker);
        }
        picker.exit(exit = KEY_TAB !== key);
    } else if (KEY_ARROW_DOWN === key || KEY_PAGE_DOWN === key) {
        exit = true;
        if (KEY_PAGE_DOWN === key && 'group' === getAttribute(parentOption = getParent($), 'role')) {
            nextOption = getNext(parentOption);
        } else {
            nextOption = getNext($);
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (getAttribute(nextOption, 'aria-disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        if (nextOption) {
            // Next option is a group?
            if ('group' === getAttribute(nextOption, 'role')) {
                nextOption = getChildFirst(nextOption);
            }
        // Is the last option?
        } else {
            // Is in a group?
            if ((parentOption = getParent($)) && 'group' === getAttribute(parentOption, 'role')) {
                nextOption = getNext(parentOption);
            }
            // Next option is a group?
            if (nextOption && 'group' === getAttribute(nextOption, 'role')) {
                nextOption = getChildFirst(nextOption);
            }
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (getAttribute(nextOption, 'aria-disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        nextOption ? focusToOption(nextOption, picker, 1) : focusToOptionFirst(picker, 1);
    } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
        exit = true;
        if (KEY_PAGE_UP === key && 'group' === getAttribute(parentOption = getParent($), 'role')) {
            prevOption = getPrev(parentOption);
        } else {
            prevOption = getPrev($);
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (getAttribute(prevOption, 'aria-disabled') || prevOption.hidden)) {
            prevOption = getPrev(prevOption);
        }
        if (prevOption) {
            // Previous option is a group?
            if ('group' === getAttribute(prevOption, 'role')) {
                prevOption = getChildLast(prevOption);
            }
        // Is the first option?
        } else {
            // Is in a group?
            if ((parentOption = getParent($)) && 'group' === getAttribute(parentOption, 'role')) {
                prevOption = getPrev(parentOption);
            }
            // Previous option is a group?
            if (prevOption && 'group' === getAttribute(prevOption, 'role')) {
                prevOption = getChildLast(prevOption);
            }
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (getAttribute(prevOption, 'aria-disabled') || prevOption.hidden)) {
            prevOption = getPrev(prevOption);
        }
        prevOption ? focusToOption(prevOption, picker, 1) : focusToOptionLast(picker, 1);
    } else if (KEY_BEGIN === key) {
        exit = true;
        focusToOptionFirst(picker, 1);
    } else if (KEY_END === key) {
        exit = true;
        focusToOptionLast(picker, 1);
    } else {
        isInput(self) && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
        picker.exit(!(exit = false));
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPasteTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
    picker._event = e;
    delay(() => setText($, getText($)))(); // Convert to plain text
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
}

function onPointerDownMask(e) {
    // This will prevent us from being able to focus natively on the mask because current `e.type` is `mousedown` or
    // `touchstart`, so we will have to fire the `focus` and `focus.self` hook(s) manually as if it were actually going
    // to focus natively.
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_options, self} = picker,
        {target} = e;
    picker._event = e;
    if (isDisabled(self) || isReadOnly(self) || getDatum($, 'size')) {
        return;
    }
    if ('listbox' === getAttribute(target, 'role') || getParent(target, '[role=listbox]')) {
        // The user is likely browsing the available option(s) by dragging the scroll bar
        return;
    }
    forEachMap(_options, v => v[2].hidden = false);
    picker.fire('focus', [e]).fire('focus.self', [e])[getAttribute($, 'aria-expanded') ? 'exit' : 'enter'](true).fit();
}

let optionsScrollTop = 0;

function onPointerDownOption(e) {
    let $ = this,
        picker = getReference($),
        {_mask, mask} = picker,
        {options} = _mask;
    picker._event = e;
    // Select it immediately, then close the option(s) list when the event occurs with a mouse
    if ('mousedown' === e.type) {
        selectToOption($, picker);
        if (!getDatum(mask, 'size')) {
            picker.exit(true);
        }
    // Must be a `touchstart` event, just focus on the option. To touch an option does not always mean to select it, the
    // user may be about to scroll the option(s) list
    } else {
        focusTo($), (optionsScrollTop = getScroll(options)[1]);
    }
    offEventDefault(e);
}

let touchTop = false;

function onPointerDownRoot(e) {
    if ('touchstart' === e.type) {
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
    picker._event = e;
    if (mask !== target && mask !== getParent(target, '.' + n)) {
        if (getDatum(mask, 'size')) {
            picker.blur();
        } else {
            letReference($);
            picker.exit();
        }
    }
}

function onPointerMoveRoot(e) {
    if (false === touchTop) {
        return;
    }
    let $ = this,
        picker = getReference($);
    picker._event = e;
    if ('touchmove' === e.type && picker) {
        let {_mask} = picker,
            {options} = _mask,
            touchTopCurrent = e.touches[0].clientY;
        // Programmatically re-enable the swipe feature in the option(s) list because the default `touchstart` event was
        // disabled. It does not have the innertia effect as in the native after-swipe reaction, but it is better than
        // doing nothing :\
        if (options) {
            let scroll = getScroll(options);
            scroll[1] -= touchTopCurrent - touchTop;
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
    // Select it, then close the option(s) list if the `touchstart` (that was done before this `touchend` event) event
    // is not intended to perform a scroll action. This is done by comparing the scroll offset of the option(s) list at
    // the first time `touchstart` event is fired with the scroll offset of the option(s) list when `touchend` event
    // (this event) is fired. If it has a difference, then it scrolls ;)
    if (getScroll(options)[1] === optionsScrollTop) {
        selectToOption($, picker), picker.exit(true);
    }
}

function onPointerUpRoot() {
    touchTop = false;
}

function onResetForm(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
    picker.reset();
}

function onResizeWindow(e) {
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    bounce(picker), (picker._event = e);
}

function onScrollWindow(e) {
    onResizeWindow.call(this, e);
}

function onSubmitForm(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
    return picker.fire('submit', [e, picker.value]);
}

function selectToOption(option, picker) {
    let {_event, _mask, _options, self} = picker,
        {hint, input, value} = _mask;
    if (option) {
        let a = getValue(self), b;
        selectToOptionsNone(picker);
        setAttribute(option, 'aria-selected', 'true');
        setAttribute(option._[OPTION_SELF], 'selected', "");
        setValue(self, b = getOptionValue(option));
        if (isInput(self)) {
            setAttribute(input, 'aria-activedescendant', getID(option));
            setText(hint, "");
            setText(input, getText(option));
        } else {
            setDatum(value, 'value', b);
            setHTML(value, getHTML(option));
        }
        if (a !== b) {
            picker.fire('change', [_event, toValue(b)]);
        }
        return option;
    }
}

function selectToOptionFirst(picker, k) {
    let {_options, state} = picker, option;
    if (option = toValuesFromMap(_options)['find' + (k || "")](v => !getAttribute(v[2], 'aria-disabled') && !v[2].hidden)) {
        return selectToOption(option[2], picker);
    }
}

function selectToOptionLast(picker) {
    return selectToOptionFirst(picker, 'Last');
}

function selectToOptions(options, picker) {}

function selectToOptionsNone(picker, fireValue) {
    let {_event, _mask, _options, self} = picker,
        {hint, input, options, value} = _mask, v;
    forEachMap(_options, v => {
        letAttribute(v[2], 'aria-selected');
        letAttribute(v[3], 'selected');
    });
    if (fireValue) {
        setValue(self, v = "");
        if (isInput(self)) {
            letAttribute(input, 'aria-activedescendant');
            setText(hint, self.placeholder);
            setText(input, "");
        } else {
            letDatum(value, 'value');
            setHTML(value, v);
        }
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
    return $.attach(self, fromStates({}, OptionPicker.state, (state || {})));
}

function OptionPickerOptions(of, options) {
    const $ = this;
    // Return new instance if `OptionPickerOptions` was called without the `new` operator
    if (!isInstance($, OptionPickerOptions)) {
        return new OptionPickerOptions(of, options);
    }
    $._o = new Map;
    $.count = 0;
    $.of = of;
    if (options && toCount(options)) {
        createOptionsFrom(of, options, of._mask.options);
    }
    return $;
}

OptionPicker.from = function (self, state) {
    return new OptionPicker(self, state);
};

OptionPicker.of = getReference;

OptionPicker.state = {
    'n': 'option-picker',
    'options': null,
    'size': null,
    'strict': false,
    'with': []
};

OptionPicker.version = '%(version)';

setObjectAttributes(OptionPicker, {
    name: {
        value: name
    }
}, 1);

setObjectAttributes(OptionPicker, {
    options: {
        get: function () {
            return this._options;
        },
        set: function (options) {
            let $ = this,
                {_event, _mask, _options, self} = $, selected;
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
                    $.fire('change', [_event, $.value]);
                }
            }
            let values = [];
            forEachMap(_options, (v, k) => values.push(k));
            return $.fire('set.options', [_event, values]);
        }
    },
    size: {
        get: function () {
            let size = this.state.size || 1;
            if (!isInteger(size)) {
                return 1;
            }
            return size < 1 ? 1 : size; // <https://html.spec.whatwg.org#attr-select-size>
        },
        set: function (value) {
            let $ = this,
                {_event, _mask, _options, mask, state} = $,
                {options} = _mask,
                {n} = state,
                size = !isInteger(value) ? 1 : (value < 1 ? 1 : value);
            state.size = size;
            if (1 === size) {
                letDatum(mask, 'size');
                letStyle(options, 'max-height');
                letReference(R);
            } else {
                let option = toValuesFromMap(_options).find(_option => !_option[2].hidden);
                if (option) {
                    let optionsGap = getStyle(options, 'gap', false),
                        optionsPaddingBottom = getStyle(options, 'padding-bottom', false),
                        optionHeight = getStyle(option, 'height', false) ?? getStyle(option, 'min-height', false) ?? getStyle(option, 'line-height', false);
                    setDatum(mask, 'size', size);
                    setStyle(options, 'max-height', 'calc((' + optionHeight + ' + max(' + optionsGap + ',' + optionsPaddingBottom + '))*' + size + ')');
                    setReference(R, $);
                }
            }
            return $.fire('set.size', [_event, size]);
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
                {_event, _mask, self} = $,
                {hint, input, text} = _mask;
            if (text) {
                setText(input, fromValue(value));
                setText(hint, getText(input, false) ? "" : self.placeholder + "");
            }
            return $.fire('set.text', [_event, value]);
        }
    },
    value: {
        get: function () {
            let value = getValue(this.self);
            return "" === value ? null : value;
        },
        set: function (value) {
            let $ = this,
                {_active, _event, _options, mask, state} = $,
                {n} = state, v;
            if (!_active) {
                return $;
            }
            if (v = getValueInMap(toValue(value), _options._o)) {
                selectToOption(v[2], $);
            }
            return $.fire('set.value', [_event, value]);
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
        $._active = !isDisabled(self) && !isReadOnly(self);
        $._event = null;
        $._options = new OptionPickerOptions($, [], 1);
        $._value = getValue(self) || null;
        $.self = self;
        $.state = state;
        let isInputSelf = isInput(self),
            {n} = state;
        const arrow = setElement('span', {
            'class': n + '__arrow'
        });
        const form = getParentForm(self);
        const mask = setElement('div', {
            'aria-expanded': 'false',
            'aria-haspopup': 'listbox',
            'aria-multiselectable': self.multiple ? 'true' : false,
            'class': n,
            'role': 'combobox',
            'tabindex': isDisabled(self) || isInputSelf ? false : 0
        });
        $.mask = mask;
        const maskOptions = setElement('div', {
            'class': n + '__options',
            'role': 'listbox'
        });
        const maskValues = setElement('div', {
            'class': n + '__values',
            'role': 'group'
        });
        const text = setElement('span', {
            'class': n + '__' + (isInputSelf ? 'text' : 'value')
        });
        const textInput = setElement('span', {
            'aria-autocomplete': 'list',
            'aria-disabled': isDisabled(self) ? 'true' : false,
            'aria-multiline': 'false',
            'aria-placeholder': isInputSelf ? self.placeholder : false,
            'aria-readonly': isReadOnly(self) ? 'true' : false,
            'autocapitalize': 'off',
            'contenteditable': isDisabled(self) || isReadOnly(self) || !isInputSelf ? false : "",
            'role': 'searchbox',
            'spellcheck': !isInputSelf ? false : 'false',
            'tabindex': isReadOnly(self) && isInputSelf ? 0 : false
        });
        const textInputHint = setElement('span', isInputSelf ? self.placeholder + "" : "");
        setChildLast(mask, maskValues);
        setChildLast(mask, maskOptions);
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
            onEvent('blur', mask, onBlurMask);
            onEvent('focus', mask, onFocusMask);
            onEvent('keydown', mask, onKeyDownMask);
        }
        setClass(self, n + '__self');
        setNext(self, mask);
        if (form) {
            form.id = getID(form);
            onEvent('reset', form, onResetForm);
            onEvent('submit', form, onSubmitForm);
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
        $.size = state.size ?? (isInputSelf ? 1 : self.size);
        let {_active} = $,
            {options} = state, selected;
        // Force the `this._active` value to `true` to set the initial value
        $._active = true;
        if (isFunction(options)) {
            setAttribute(mask, 'aria-busy', 'true');
            options = options.call($, null);
            if (isInstance(options, Promise)) {
                options.then(options => {
                    letAttribute(mask, 'aria-busy');
                    if (toCount(selected = createOptionsFrom($, options, maskOptions))) {
                        $.value = selected[0];
                        // $.values = selected;
                    } else if (selected = getOptionSelected($, 1)) {
                        $.value = getOptionValue(selected);
                        // $.values = selected;
                    }
                    let values = [];
                    forEachMap($._options, (v, k) => values.push(k));
                    $.fire('load', [$._event, null, values]).fit();
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
        arrow.id = getID(arrow);
        mask.id = getID(mask);
        maskOptions.id = getID(maskOptions);
        maskValues.id = getID(maskValues);
        self.id = getID(self);
        text.id = getID(text);
        textInput.id = getID(textInput);
        textInputHint.id = getID(textInputHint);
        setAttribute(mask, 'aria-controls', getID(maskOptions));
        setAttribute(mask, 'aria-labelledby', getID(text));
        setAttribute(self, 'aria-hidden', 'true');
        setAttribute(textInput, 'aria-controls', getID(maskOptions));
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
            selectNone();
        }
        return (input || mask).blur(), $.exit();
    },
    detach: function () {
        let $ = this,
            {_mask, mask, self, state} = $,
            {input} = _mask;
        const form = getParentForm(self);
        $._active = false;
        $._options = new OptionPickerOptions($, state.options = getOptions(self), 1);
        $._value = getValue(self) || null; // Update initial value to be the current value
        if (form) {
            offEvent('reset', form, onResetForm);
            offEvent('submit', form, onSubmitForm);
        }
        if (input) {
            offEvent('blur', input, onBlurTextInput);
            offEvent('blur', mask, onBlurMask);
            offEvent('cut', input, onCutTextInput);
            offEvent('focus', input, onFocusTextInput);
            offEvent('focus', mask, onFocusMask);
            offEvent('keydown', input, onKeyDownTextInput);
            offEvent('keydown', mask, onKeyDownMask);
            offEvent('paste', input, onPasteTextInput);
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
        letAttribute(self, 'aria-hidden');
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
            {_active, _event, _mask, _options, mask, self} = $,
            {input} = _mask;
        if (!_active) {
            return $;
        }
        setAttribute(mask, 'aria-expanded', 'true');
        let theRootReference = getReference(R);
        if (theRootReference && $ !== theRootReference) {
            theRootReference.exit(); // Exit other(s)
        }
        setReference(R, $); // Link current picker to the root target
        setReference(W, $);
        $.fire('enter', [_event]);
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else if (option = getValueInMap(toValue(getValue(self)), _options._o)) {
                focusTo(option[2]);
            }
        }
        return $;
    },
    exit: function (focus, mode) {
        let $ = this,
            {_active, _event, _mask, _options, mask, self} = $,
            {input} = _mask;
        if (!_active) {
            return $;
        }
        forEachMap(_options, v => v[2].hidden = false);
        setAttribute(mask, 'aria-expanded', 'false');
        $.fire('exit', [_event]);
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else {
                focusTo(mask);
            }
        }
        return $;
    },
    fit: function () {
        let $ = this,
            {_active, _event, _mask, mask} = $,
            {options} = _mask;
        if (!_active || !getAttribute(mask, 'aria-expanded') || getDatum(mask, 'size')) {
            return $;
        }
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
        return $.fire('fit', [_event]);
    },
    focus: function (mode) {
        let $ = this,
            {_event, _mask, mask} = $,
            {input} = _mask;
        if (input) {
            focusTo(input), selectTo(input, mode);
        } else {
            focusTo(mask);
        }
        return $.fire('focus', [_event]).fire('focus.self', [_event]);
    },
    reset: function (focus, mode) {
        let $ = this,
            {_active, _event, _value} = $;
        if (!_active) {
            return $;
        }
        let value = $.value; // The previous value
        $.value = _value;
        $.fire('reset', [_event, value]);
        return focus ? $.focus(mode) : $;
    }
});

setObjectAttributes(OptionPickerOptions, {
    name: {
        value: 'Options'
    }
}, 1);

setObjectAttributes(OptionPickerOptions, {
    open: {
        get: function () {
            let $ = this,
                {of} = $,
                {mask} = of;
            return getAttribute(mask, 'aria-expanded');
        }
    }
});

setObjectMethods(OptionPickerOptions, {
    delete: function (key, _fireValue = 1, _fireHook = 1) {
        let $ = this,
            {_o, of} = $,
            {_active, _event, _mask, self, state} = of,
            {options} = _mask,
            {n} = state, r;
        if (!_active) {
            return false;
        }
        if (!isSet(key)) {
            forEachMap(_o, (v, k) => $.let(k, 0));
            selectToOptionsNone(of, _fireValue);
            options.hidden = true;
            return _fireHook && of.fire('let.options', [_event, []]) && 0 === $.count;
        }
        if (!(r = getValueInMap(key = toValue(key), _o))) {
            return (_fireHook && of.fire('not.option', [_event, key])), false;
        }
        let parent = getParent(r[2]),
            parentReal = getParent(r[3]),
            value = getOptionValue(r[2]),
            valueReal = of.value;
        offEvent('blur', r[2], onBlurOption);
        offEvent('focus', r[2], onFocusOption);
        offEvent('keydown', r[2], onKeyDownOption);
        offEvent('mousedown', r[2], onPointerDownOption);
        offEvent('touchend', r[2], onPointerUpOption);
        offEvent('touchstart', r[2], onPointerDownOption);
        letElement(r[2]), letElement(r[3]);
        if (r = letValueInMap(key, _o)) {
            --$.count;
        }
        // Remove empty group(s)
        parent && 'group' === getAttribute(parent, 'role') && 0 === toCount(getChildren(parent)) && letElement(parent);
        parentReal && 'optgroup' === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
        // Clear value if there are no option(s)
        if (0 === toCount(getChildren(options))) {
            selectToOptionsNone(of, !isInput(self));
            options.hidden = true;
        // Reset value to the first option if removed option is the selected option
        } else {
            // setValue(self, "");
            value === valueReal && selectToOptionFirst(of);
        }
        return (_fireHook && of.fire('let.option', [_event, key])), r;
    },
    get: function (key) {
        let $ = this,
            {_o, of} = $,
            value = getValueInMap(toValue(key), _o), parent;
        if (value && (parent = getParent(value[2])) && 'group' === getAttribute(parent, 'role')) {
            return [getElementIndex(value[2]), getElementIndex(parent)];
        }
        return value ? getElementIndex(value[2]) : -1;
    },
    has: function (key) {
        return hasKeyInMap(toValue(key), this._o);
    },
    let: function (key, _fireHook = 1) {
        return this.delete(key, 1, _fireHook);
    },
    set: function (key, value, _fireHook = 1) {
        let $ = this,
            {_o, of} = $,
            {_active, _event} = of;
        if (!_active) {
            return false;
        }
        if ($.has(key = toValue(key))) {
            return (_fireHook && of.fire('has.option', [_event, key])), false;
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
        // Force `id` attribute(s)
        itemsParent.id = getID(itemsParent);
        options.hidden = false;
        // `picker.options.set('asdf')`
        if (!isSet(value)) {
            value = [key, {}];
        // `picker.options.set('asdf', 'asdf')`
        } else if (isFloat(value) || isInteger(value) || isString(value)) {
            value = [value, {}];
        // `picker.options.set('asdf', [ … ])`
        } else {}
        if (hasState(value[1], '&')) {
            optionGroup = getElement('.' + n + '-group[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', options);
            if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                setChildLast(options, optionGroup = setElement('span', {
                    'class': n + '-group',
                    'data-value': value[1]['&'],
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
                if (styles = getState(value[1], 'style')) {
                    setStyles(optionGroup, styles);
                    setStyles(optionGroupReal, styles);
                }
                // Force `id` attribute(s)
                optionGroup.id = getID(optionGroup);
                optionGroupReal.id = getID(optionGroupReal);
            }
        } else {
            optionGroup = optionGroupReal = false;
        }
        let {disabled, selected, value: v} = value[1];
        if (isDisabled(self)) {
            disabled = true;
        }
        v = fromValue(v || key);
        option = value[2] || setElement('span', fromValue(value[0]), {
            'aria-disabled': disabled ? 'true' : false,
            'aria-selected': selected ? 'true' : false,
            'class': n,
            'data-group': getState(value[1], '&') ?? false,
            'data-value': v,
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
        if (styles = getState(value[1], 'style')) {
            setStyles(option, styles);
            setStyles(optionReal, styles);
        }
        // Force `id` attribute(s)
        option.id = getID(option);
        optionReal.id = getID(optionReal);
        option._ = {};
        option._[OPTION_SELF] = optionReal;
        if (!disabled && !value[2]) {
            onEvent('blur', option, onBlurOption);
            onEvent('focus', option, onFocusOption);
            onEvent('keydown', option, onKeyDownOption);
            onEvent('mousedown', option, onPointerDownOption);
            onEvent('touchend', option, onPointerUpOption);
            onEvent('touchstart', option, onPointerDownOption);
        }
        setChildLast(optionGroup || options, option);
        setChildLast(optionGroupReal || itemsParent, optionReal);
        setReference(option, of);
        value[2] = option;
        value[3] = optionReal;
        ++$.count;
        setValueInMap(key, value, _o);
        return (_fireHook && of.fire('set.option', [_event, key])), true;
    }
});

// In order for an object to be iterable, it must have a `Symbol.iterator` key
getPrototype(OptionPickerOptions)[Symbol.iterator] = function () {
    return this._o[Symbol.iterator]();
};

OptionPicker.Options = OptionPickerOptions;

export default OptionPicker;