import {D, R, W, focusTo, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getHTML, getName, getNext, getParent, getParentForm, getPrev, getState, getStyle, getText, getValue, hasClass, hasState, isDisabled, isReadOnly, letAttribute, letClass, letDatum, letElement, letStyle, selectNone, selectTo, setAttribute, setChildLast, setClass, setClasses, setDatum, setElement, setHTML, setNext, setStyle, setStyles, setText} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {forEachArray, forEachMap, forEachObject, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toKeysFromMap, toKeyFirstFromMap, toKeyLastFromMap, toValuesFromMap, toValueFirstFromMap, toValueLastFromMap} from '@taufik-nurrohman/f';
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
    // Reset the option(s) data, but leave the typed query in place
    _options.delete(null, 0);
    forEachMap(values, (v, k) => {
        if (isArray(v) && v[1] && !v[1].disabled && v[1].selected) {
            selected.push(toValue(v[1].value || k));
        }
        setValueInMap(toValue(isArray(v) && v[1] ? (v[1].value || k) : k), v, _options);
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
    let {_options, state} = picker,
        {n} = state, option;
    n += '__option--disabled';
    if (option = toValuesFromMap(_options)['find' + (k || "")](v => !v[2].hidden && !hasClass(v[2], n))) {
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
    let {_options, self, state} = $,
        {n} = state, selected;
    n += '__option';
    forEachMap(_options, (v, k) => {
        if (isArray(v) && v[2] && !hasClass(v[2], n + '--disabled') && hasClass(v[2], n + '--selected')) {
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
        {n, strict} = state,
        hasSize = getDatum(mask, 'size');
    n += '__option--disabled';
    let {count} = _options;
    if (selectOnly) {
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v[2], n)) {
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
        self.value = strict ? "" : query;
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
                $.fire('load', [_event, v, query]).fit();
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
    picker._event = e;
    letClass($, n += '--focus');
    letClass($, n += '-self');
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
                selectToOptionsNone(picker, 0, 1);
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
    picker._event = e;
    setClass($, n += '--focus');
    setClass($, n += '-self');
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
        {n, strict} = state;
    picker._event = e;
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
        delay(() => picker.enter().fit(), FILTER_COMMIT_TIME + 1)();
    }
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = getValueInMap(toValue(getValue(self)), _options);
        currentOption = currentOption ? currentOption[2] : 0;
        if (!currentOption || currentOption.hidden) {
            currentOption = toValueFirstFromMap(_options);
            currentOption = currentOption ? currentOption[2] : 0;
            while (currentOption && (hasClass(currentOption, n + '__option--disabled') || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        exit = true;
        if (!hasClass(mask, n + '--open')) {
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
        picker.exit(!(exit = false));
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
        {_mask, _options, mask, self, state} = picker,
        {hint, input, value} = _mask,
        {n} = state;
    n += '__option';
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
        if (KEY_PAGE_DOWN === key && hasClass(parentOption = getParent($), n + '-group')) {
            nextOption = getNext(parentOption);
        } else {
            nextOption = getNext($);
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (hasClass(nextOption, n + '--disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        if (nextOption) {
            // Next option is a group?
            if (hasClass(nextOption, n + '-group')) {
                nextOption = getChildFirst(nextOption);
            }
        // Is the last option?
        } else {
            // Is in a group?
            if ((parentOption = getParent($)) && hasClass(parentOption, n + '-group')) {
                nextOption = getNext(parentOption);
            }
            // Next option is a group?
            if (nextOption && hasClass(nextOption, n + '-group')) {
                nextOption = getChildFirst(nextOption);
            }
        }
        // Skip disabled and hidden option(s)…
        while (nextOption && (hasClass(nextOption, n + '--disabled') || nextOption.hidden)) {
            nextOption = getNext(nextOption);
        }
        nextOption ? focusToOption(nextOption, picker, 1) : focusToOptionFirst(picker, 1);
    } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
        exit = true;
        if (KEY_PAGE_UP === key && hasClass(parentOption = getParent($), n + '-group')) {
            prevOption = getPrev(parentOption);
        } else {
            prevOption = getPrev($);
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (hasClass(prevOption, n + '--disabled') || prevOption.hidden)) {
            prevOption = getPrev(prevOption);
        }
        if (prevOption) {
            // Previous option is a group?
            if (hasClass(prevOption, n + '-group')) {
                prevOption = getChildLast(prevOption);
            }
        // Is the first option?
        } else {
            // Is in a group?
            if ((parentOption = getParent($)) && hasClass(parentOption, n + '-group')) {
                prevOption = getPrev(parentOption);
            }
            // Previous option is a group?
            if (prevOption && hasClass(prevOption, n + '-group')) {
                prevOption = getChildLast(prevOption);
            }
        }
        // Skip disabled and hidden option(s)…
        while (prevOption && (hasClass(prevOption, n + '--disabled') || prevOption.hidden)) {
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
    let $ = this,
        picker = getReference($),
        {_options, self, state} = picker,
        {n} = state,
        {target} = e;
    offEventDefault(e);
    if (isDisabled(self) || isReadOnly(self) || getDatum($, 'size')) {
        return;
    }
    picker._event = e;
    if (hasClass(target, n + '__options') || getParent(target, '.' + n + '__options')) {
        // The user is likely browsing the available option(s) by dragging the scroll bar
        return;
    }
    forEachMap(_options, v => v[2].hidden = false);
    picker[hasClass($, n + '--open') ? 'exit' : 'enter'](true).fit();
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
    return picker.fire('submit', [e]);
}

function selectToOption(option, picker) {
    let {_event, _mask, _options, self, state} = picker,
        {hint, input, value} = _mask,
        {n} = state;
    n += '__option--selected';
    if (option) {
        let a = getValue(self), b;
        selectToOptionsNone(picker);
        setAttribute(option._[OPTION_SELF], 'selected', "");
        setClass(option, n);
        self.value = (b = getOptionValue(option));
        if (isInput(self)) {
            setText(hint, "");
            setText(input, getText(option));
        } else {
            setDatum(value, 'value', b);
            setHTML(value, getHTML(option));
        }
        if (b !== a) {
            picker.fire('change', [_event, toValue(b)]);
        }
        return option;
    }
}

function selectToOptionFirst(picker, k) {
    let {_options, state} = picker,
        {n} = state, option;
    n += '__option--disabled';
    if (option = toValuesFromMap(_options)['find' + (k || "")](v => !v[2].hidden && !hasClass(v[2], n))) {
        return selectToOption(option[2], picker);
    }
}

function selectToOptionLast(picker) {
    return selectToOptionFirst(picker, 'Last');
}

function selectToOptions(options, picker) {}

function selectToOptionsNone(picker, fireHook, fireValue) {
    let {_event, _mask, _options, self, state} = picker,
        {hint, input, options, value} = _mask,
        {n} = state;
    n += '__option--selected';
    let a = getValue(self), b;
    forEachMap(_options, v => {
        letAttribute(v[3], 'selected');
        letClass(v[2], n);
    });
    if (fireValue) {
        self.value = (b = "");
        if (isInput(self)) {
            setText(hint, self.placeholder);
            setText(input, "");
        } else {
            letDatum(value, 'value');
            setHTML(value, "");
        }
        if (fireHook && b !== a) {
            picker.fire('change', [_event, toValue(b)]);
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
    if (!isInstance($, OptionPickerOptions)) {
        return new OptionPickerOptions(of, options);
    }
    $.count = 0;
    $.map = new Map;
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
    'name': {
        value: name
    }
}, 0);

setObjectAttributes(OptionPicker, {
    'options': {
        get: function () {
            return this._options;
        },
        set: function (options) {
            let $ = this,
                {_mask, _options, state} = $,
                {n} = state, selected;
            n += '__option';
            if (isFloat(options) || isInteger(options) || isString(options)) {
                options = [options];
            }
            if (toCount(selected = createOptionsFrom($, options, _mask.options))) {
                $.value = selected[0];
                // $.values = selected;
            }
        }
    },
    'size': {
        get: function () {
            let size = this.state.size || 1;
            if (!isInteger(size)) {
                return 1;
            }
            return size < 1 ? 1 : size; // <https://html.spec.whatwg.org#attr-select-size>
        },
        set: function (value) {
            let $ = this,
                {_mask, _options, mask, state} = $,
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
        }
    },
    'text': {
        get: function () {
            let $ = this,
                {_mask} = $,
                {input, text} = _mask;
            return text ? getText(input) : null;
        },
        set: function (value) {
            let $ = this,
                {_mask, self} = $,
                {hint, input, text} = _mask;
            if (text) {
                setText(input, fromValue(value));
                if (getText(input, false)) {
                    setText(hint, "");
                } else {
                    setText(hint, self.placeholder + "");
                }
            }
        }
    },
    'value': {
        get: function () {
            let value = getValue(this.self);
            return "" === value ? null : value;
        },
        set: function (value) {
            let $ = this,
                {_options, mask, state} = $,
                {n} = state, v;
            if (v = getValueInMap(toValue(value), _options)) {
                selectToOption(v[2], $);
            }
        }
    },
    // TODO: `<select multiple>`
    'values': {
        get: function () {
        },
        set: function (values) {
        }
    }
});

OptionPicker._ = setObjectMethods(OptionPicker, {
    'attach': function (self, state) {
        let $ = this;
        self = self || $.self;
        state = state || $.state;
        $._active = !isDisabled(self) && !isReadOnly(self);
        $._event = null;
        $._options = new OptionPickerOptions($);
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
            'class': n,
            'tabindex': isDisabled(self) || isInputSelf ? false : 0
        });
        $.mask = mask;
        const maskOptions = setElement('div', {
            'class': n + '__options'
        });
        const maskValues = setElement('div', {
            'class': n + '__values'
        });
        const text = setElement('span', {
            'class': n + '__' + (isInputSelf ? 'text' : 'value')
        });
        const textInput = setElement('span', {
            'autocapitalize': 'off',
            'contenteditable': isDisabled(self) || isReadOnly(self) || !isInputSelf ? false : "",
            'spellcheck': !isInputSelf ? false : 'false'
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
            setReference(form, $);
        }
        onEvent('focus', self, onFocusSelf);
        onEvent('mousedown', R, onPointerDownRoot);
        onEvent('mousedown', mask, onPointerDownMask);
        onEvent('mousemove', R, onPointerMoveRoot);
        onEvent('mouseup', R, onPointerUpRoot);
        onEvent('resize', W, onResizeWindow);
        onEvent('scroll', W, onScrollWindow);
        onEvent('touchend', R, onPointerUpRoot);
        onEvent('touchmove', R, onPointerMoveRoot);
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
        let {options} = state, selected;
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
                    $.fire('load', [$._event, options, null]).fit();
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
    'blur': function () {
        selectNone();
        let $ = this,
            {_mask, mask} = $,
            {input} = _mask;
        return (input || mask).blur(), $.exit();
    },
    'detach': function () {
        let $ = this,
            {_mask, mask, self, state} = $,
            {input} = _mask;
        const form = getParentForm(self);
        $._active = false;
        $._options = new OptionPickerOptions($, state.options = getOptions(self));
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
        letClass(self, state.n + '__self');
        letElement(mask);
        $._mask = {
            of: self
        };
        $.mask = null;
        return $;
    },
    'enter': function (focus, mode) {
        let $ = this, option,
            {_event, _mask, _options, mask, self, state} = $,
            {input} = _mask,
            {n} = state;
        setClass(mask, n + '--open');
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
            } else if (option = getValueInMap(toValue(getValue(self)), _options)) {
                focusTo(option[2]);
            }
            $.fire('focus', [_event]).fire('focus.option', [_event]);
        }
        return $;
    },
    'exit': function (focus, mode) {
        let $ = this,
            {_event, _mask, _options, mask, self, state} = $,
            {input} = _mask,
            {n} = state;
        // forEachMap(_options, v => v[2].hidden = false);
        letClass(mask, n + '--open');
        $.fire('exit', [_event]);
        if (focus) {
            if (isInput(self)) {
                focusTo(input), selectTo(input, mode);
            } else {
                focusTo(mask);
            }
            $.fire('focus', [_event]).fire('focus.self', [_event]);
        }
        return $;
    },
    'fit': function () {
        let $ = this,
            {_mask, mask} = $,
            {options} = _mask;
        if (getDatum(mask, 'size')) {
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
        return $;
    },
    'focus': function (mode) {
        let $ = this,
            {_mask, mask} = $,
            {input} = _mask;
        if (input) {
            return focusTo(input), selectTo(input, mode), $;
        }
        return focusTo(mask), $;
    },
    'reset': function (focus, mode) {
        let $ = this;
        $.value = $._value;
        $.fire('reset', [$._event]);
        return focus ? $.focus(mode) : $;
    }
});

setObjectAttributes(OptionPickerOptions, {
    'name': {
        value: 'Options'
    }
}, 0);

setObjectMethods(OptionPickerOptions, {
    'delete': function (key, _fireValue = 1) {
        let $ = this,
            {map, of} = $,
            {_mask, self, state} = of,
            {options} = _mask,
            {n} = state, r;
        if (!isSet(key)) {
            forEachMap(map, (v, k) => $.let(k));
            selectToOptionsNone(of, 1, _fireValue);
            options.hidden = true;
            return 0 === $.count;
        }
        if (!(r = $.get(toValue(key)))) {
            return false;
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
        if (r = letValueInMap(toValue(key), map)) {
            --$.count;
        }
        // Remove empty group(s)
        parent && hasClass(parent, n + '__option-group') && 0 === toCount(getChildren(parent)) && letElement(parent);
        parentReal && 'optgroup' === getName(parentReal) && 0 === toCount(getChildren(parentReal)) && letElement(parentReal);
        // Reset value to the first option if removed option is the selected option
        if (0 === toCount(getChildren(options))) {
            selectToOptionsNone(of, 1, !isInput(self));
            options.hidden = true;
        } else {
            value === valueReal && selectToOptionFirst(of);
        }
        return r;
    },
    'get': function (key) {
        return getValueInMap(toValue(key), this.map);
    },
    'has': function (key) {
        return hasKeyInMap(toValue(key), this.map);
    },
    'let': function (key) {
        return this.delete(key);
    },
    'set': function (key, value) {
        let $ = this;
        if ($.has(key)) {
            return $;
        }
        let items, itemsParent,
            option, optionReal,
            optionGroup, optionGroupReal,
            {map, of} = $,
            {_mask, self, state} = of,
            {options} = _mask,
            {n} = state, classes, styles;
        n += '__option';
        if (isInput(self)) {
            items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
        } else {
            items = getChildren(itemsParent = self);
        }
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
            'class': n + (disabled ? ' ' + n + '--disabled' : "") + (selected ? ' ' + n + '--selected' : ""),
            'data-group': getState(value[1], '&') ?? false,
            'data-value': v,
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
        setValueInMap(toValue(key), value, map);
        return (of.value = of.value), $;
    }
});

// In order for an object to be iterable, it must have a `Symbol.iterator` key
OptionPickerOptions.prototype[Symbol.iterator] = function () {
    return this.map.entries();
};

OptionPicker.Options = OptionPickerOptions;

export default OptionPicker;