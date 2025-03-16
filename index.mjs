import {D, R, W, getAria, getAttribute, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getRole, getState, getStyle, getText, getValue, hasClass, hasState, isDisabled, isReadOnly, letAria, letAttribute, letClass, letDatum, letElement, letStyle, setAria, setAttribute, setChildLast, setClass, setClasses, setDatum, setElement, setHTML, setID, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {/* focusTo, */selectTo, selectToNone} from '@taufik-nurrohman/selection';
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

function focusTo(node) {
    return node.focus(), node;
}

function focusToOption(option) {
    if (option) {
        return focusTo(option), option;
    }
}

function focusToOptionFirst(k) {
    let option;
    if (option = goToOptionFirst(k)) {
        return focusToOption(option);
    }
}

function focusToOptionLast() {
    return focusToOptionFirst('Last');
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

function getOptionsSelected(options) {}

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

function scrollTo(node) {
    node.scrollIntoView({block: 'nearest'});
}

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_event, _mask, mask, self, state} = $,
        {options, value} = _mask,
        {strict} = state,
        hasSize = getDatum(mask, 'size'), option;
    let {count} = _options;
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
        if (strict) {
            selectToOptionsNone($);
            // Silently select the first option without affecting the currently typed query and focus/select state
            if (count && (option = goToOptionFirst($))) {
                setAria(option, 'selected', true);
                setAttribute(option._[OPTION_SELF], 'selected', "");
                setValue(self, getOptionValue(option));
            } else {
                setValue(self, "");
            }
        } else {
            setValue(self, query);
        }
    }
    $.fire('search', [_event, query]);
    let call = state.options;
    // Only fetch when no other option(s) are available to query
    if (0 === count && isFunction(call)) {
        setAria(mask, 'busy', true);
        call = call.call($, query);
        if (isInstance(call, Promise)) {
            call.then(v => {
                createOptionsFrom($, v, options);
                letAria(mask, 'busy');
                $.fire('load', [_event, query, v])[$.options.open ? 'enter' : 'exit']().fit();
            });
        } else {
            createOptionsFrom($, call, options);
        }
    }
}, FILTER_COMMIT_TIME);

function onBlurMask(e) {
    let $ = this,
        picker = getReference($);
    picker.fire('blur', [e]).fire('blur.self', [e])._event = e;
}

function onBlurOption(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
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
            selectToOptionsNone(picker, 1);
        }
    }
    picker.fire('blur', [e])._event = e;
}

function onCutTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
    delay(() => getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color'), 1)();
    picker.fire('cut', [e])._event = e;
}

function onFocusMask(e) {
    let $ = this,
        picker = getReference($);
    picker.fire('focus', [e]).fire('focus.self', [e])._event = e;
}

function onFocusOption(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
    selectToNone();
}

function onFocusSelf(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
    picker.focus();
}

function onFocusTextInput(e) {
    let $ = this,
        picker = getReference($);
    picker._event = e;
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
        let currentOption = getValueInMap(toValue(getValue(self)), _options._o);
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
        if (KEY_PAGE_DOWN === key && 'group' === getRole(parentOption = getParent($))) {
            nextOption = getNext(parentOption);
        } else {
            nextOption = getNext($);
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (getAria(nextOption, 'disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        if (nextOption) {
            // Next option is a group?
            if ('group' === getRole(nextOption)) {
                nextOption = getChildFirst(nextOption);
            }
        // Is the last option?
        } else {
            // Is in a group?
            if ((parentOption = getParent($)) && 'group' === getRole(parentOption)) {
                nextOption = getNext(parentOption);
            }
            // Next option is a group?
            if (nextOption && 'group' === getRole(nextOption)) {
                nextOption = getChildFirst(nextOption);
            }
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (getAria(nextOption, 'disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        nextOption ? focusToOption(nextOption) : focusToOptionFirst();
    } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
        exit = true;
        if (KEY_PAGE_UP === key && 'group' === getRole(parentOption = getParent($))) {
            prevOption = getPrev(parentOption);
        } else {
            prevOption = getPrev($);
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (getAria(prevOption, 'disabled') || prevOption.hidden)) {
            prevOption = getPrev(prevOption);
        }
        if (prevOption) {
            // Previous option is a group?
            if ('group' === getRole(prevOption)) {
                prevOption = getChildLast(prevOption);
            }
        // Is the first option?
        } else {
            // Is in a group?
            if ((parentOption = getParent($)) && 'group' === getRole(parentOption)) {
                prevOption = getPrev(parentOption);
            }
            // Previous option is a group?
            if (prevOption && 'group' === getRole(prevOption)) {
                prevOption = getChildLast(prevOption);
            }
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (getAria(prevOption, 'disabled') || prevOption.hidden)) {
            prevOption = getPrev(prevOption);
        }
        prevOption ? focusToOption(prevOption) : focusToOptionLast();
    } else if (KEY_BEGIN === key) {
        exit = true;
        focusToOptionFirst();
    } else if (KEY_END === key) {
        exit = true;
        focusToOptionLast();
    } else {
        isInput(self) && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
        picker.exit(!(exit = false));
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPasteTextInput(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
    delay(() => getText($, 0) ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color'), 1)();
    setText($, e.clipboardData.getData('text/plain')), selectTo($); // Paste as plain text
    picker.fire('paste', [e])._event = e;
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
    if ('listbox' === getRole(target) || getParent(target, '[role=listbox]')) {
        // The user is likely browsing the available option(s) by dragging the scroll bar
        return;
    }
    forEachMap(_options, v => v[2].hidden = false);
    picker.fire('focus', [e]).fire('focus.self', [e])[getAria($, 'expanded') ? 'exit' : 'enter'](true).fit();
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
        setAria(option, 'selected', true);
        setAttribute(option._[OPTION_SELF], 'selected', "");
        setValue(self, b = getOptionValue(option));
        if (isInput(self)) {
            setAria(input, 'activedescendant', getID(option));
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
    let {_event, _mask, _options, self} = picker,
        {hint, input, options, value} = _mask, v;
    forEachMap(_options, v => {
        letAria(v[2], 'selected');
        letAttribute(v[3], 'selected');
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

OptionPicker.version = '2.0.0';

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
                {_event, _mask, mask, state} = $,
                {options} = _mask,
                size = !isInteger(value) ? 1 : (value < 1 ? 1 : value);
            state.size = size;
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
                {hint, input, text} = _mask, v;
            if (text) {
                setText(input, v = fromValue(value));
                v ? setStyle(hint, 'color', 'transparent') : letStyle(hint, 'color');
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
            'aria': {
                'expanded': 'false',
                'haspopup': 'listbox',
                'multiselectable': self.multiple ? 'true' : false
            },
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
            'aria': {
                'autocomplete': 'list',
                'disabled': isDisabled(self) ? 'true' : false,
                'multiline': 'false',
                'placeholder': isInputSelf ? self.placeholder : false,
                'readonly': isReadOnly(self) ? 'true' : false,
            },
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
                    forEachMap($._options, (v, k) => values.push(k));
                    $.fire('load', [$._event, null, values])[$.options.open ? 'enter' : 'exit']().fit();
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
        setID(maskValues);
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
            {_active, _event, _mask, _options, mask, self} = $,
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
        setReference(W, $);
        $.fire('enter', [_event]);
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else if (option = getValueInMap(toValue(getValue(self)), _options._o)) {
                focusTo(option[2]), delay(() => scrollTo(option[2]), 1)();
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
        setAria(mask, 'expanded', false);
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
    delete: function (key, _fireValue = 1, _fireHook = 1) {
        let $ = this,
            {_o, of} = $,
            {_active, _event, _mask, self} = of,
            {options} = _mask, r;
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
        parent && 'group' === getRole(parent) && 0 === toCount(getChildren(parent)) && letElement(parent);
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
        if (value && (parent = getParent(value[2])) && 'group' === getRole(parent)) {
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
            optionGroup = getElement('.' + n + 's-batch[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', options);
            if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
                setChildLast(options, optionGroup = setElement('span', {
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
        if (isDisabled(self)) {
            disabled = true;
        }
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