import {D, R, W, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getHTML, getName, getNext, getParent, getParentForm, getPrev, getStyle, getText, hasClass, letAttribute, letClass, letDatum, letElement, letStyle, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setNext, setStyle, setStyles, setText} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {getOffset, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toValue} from '@taufik-nurrohman/to';

const FILTER_COMMIT_TIME = 50;
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
const references = new WeakMap;

function createOptions($, options, values) {
    let items, itemsParent,
        {_options, self, state} = $,
        {n} = state;
    n += '__option';
    if ('input' === getName(self)) {
        items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
    } else {
        items = getChildren(itemsParent = self);
    }
    // Remove option(s)
    for (let i = 0, j = toCount(items); i < j; ++i) {
        if ('optgroup' === getName(items[i])) {
            let itemsItems = getChildren(items[i]);
            for (let ii = 0, jj = toCount(itemsItems); ii < jj; ++ii) {
                itemsItems[ii] && letElement(itemsItems[ii]);
            }
        }
        items[i] && letElement(items[i]);
    }
    // Reset option(s) data
    _options.let();
    forEachMap(values, (v, k) => setValueInMap(toValue(k), v, _options));
    state.options = values;
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
        for (let k in options) {
            if (isArray(options[k])) {
                options[k][0] = options[k][0] ?? "";
                options[k][1] = options[k][1] ?? {};
                setValueInMap(toValue(options[k][1].value ?? k), options[k], map);
            } else {
                setValueInMap(toValue(k), [options[k], {}], map);
            }
        }
    }
    createOptions($, maskOptions, map);
}

function defineProperty(of, key, state) {
    Object.defineProperty(of, key, state);
}

function focusTo(node) {
    node.focus();
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

function forEachArray(array, then) {
    array.forEach(then);
}

function forEachMap(map, then) {
    if (map instanceof OptionPickerOptions) {
        map = map.map;
    }
    forEachArray(map, then);
}

function getOptionValue(option) {
    return getDatum(option, 'value', false);
}

function getOptions(self) {
    const map = new Map;
    let item, items, itemsParent, selected = [],
        value = getValue(self);
    if ('input' === getName(self)) {
        items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
    } else {
        items = getChildren(itemsParent = self);
    }
    for (let i = 0, j = toCount(items); i < j; ++i) {
        let v = items[i],
            attributes = getAttributes(v);
        forEachArray(['disabled', 'selected'], k => {
            if (k in attributes) {
                attributes[k] = "" === attributes[k] ? true : attributes[k];
                if ('selected' === k) {
                    selected.push(i);
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
            continue;
        }
        setValueInMap(toValue(v.value), [getText(v) || v.value, attributes, null, v], map);
    }
    // If there is no selected option(s), get it from the current value
    if (0 === toCount(selected) && (item = getValueInMap(value = toValue(value), map))) {
        item[1].selected = true;
        setValueInMap(value, item, map);
    }
    return map;
}

function getReference(key) {
    return getValueInMap(key, references) || null;
}

function getValue(self) {
    return (self.value || "").replace(/\r/g, "");
}

function getValueInMap(k, map) {
    return map.get(k);
}

function hasKeyInMap(k, map) {
    return map.has(k);
}

function isDisabled(self) {
    return self.disabled;
}

function isReadOnly(self) {
    return self.readOnly;
}

function letReference(k) {
    return letValueInMap(k, references);
}

function letValueInMap(k, map) {
    if (map instanceof OptionPickerOptions) {
        return map.let(k);
    }
    return map.delete(k);
}

function scrollTo(node, view) {
    node.scrollIntoView({block: 'nearest'});
}

function setReference(key, value) {
    return setValueInMap(key, value, references);
}

function setValueInMap(k, v, map) {
    return map.set(k, v);
}

function toKeyFirstFromMap(map) {
    return toKeysFromMap(map).shift();
}

function toKeyLastFromMap(map) {
    return toKeysFromMap(map).pop();
}

function toKeysFromMap(map) {
    let out = [];
    forEachMap(map, (v, k) => out.push(k));
    return out;
}

function toValueFirstFromMap(map) {
    return toValuesFromMap(map).shift();
}

function toValueLastFromMap(map) {
    return toValuesFromMap(map).pop();
}

function toValuesFromMap(map) {
    let out = [];
    forEachMap(map, v => out.push(v));
    return out;
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

defineProperty(OptionPicker, 'name', {
    value: name
});

const $$ = OptionPicker._ = OptionPicker.prototype;

defineProperty($$, 'options', {
    get: function () {
        return this._options;
    },
    set: function (options) {
        let $ = this,
            {_mask, _options, state} = $,
            {n} = state, option;
        n += '__option';
        if (isFloat(options) || isInteger(options) || isString(options)) {
            options = [options];
        }
        createOptionsFrom($, options, _mask.options);
        if (option = toValuesFromMap(_options).find(v => !v[2].hidden && !hasClass(v[2], n + '--disabled'))) {
            $.value = getOptionValue(option[2]);
        }
    }
});

defineProperty($$, 'size', {
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
})

defineProperty($$, 'text', {
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
})

defineProperty($$, 'value', {
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
});

// TODO: `<select multiple>`
defineProperty($$, 'values', {
    get: function () {
    },
    set: function (values) {
    }
});

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_event, _mask, mask, self, state} = $,
        {options, value} = _mask,
        {n, strict} = state,
        hasSize = getDatum(mask, 'size');
    n += '__option--disabled';
    if (selectOnly) {
        try {
            forEachMap(_options, v => {
                let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
                if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v[2], n)) {
                    selectToOption(v[2], $);
                    if (hasSize) {
                        scrollTo(v[2], options);
                    }
                    throw "";
                }
            });
        } catch (e) {}
    } else {
        let {count} = _options;
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
    if (isFunction(call)) {
        call = call.call($, query);
        if (isInstance(call, Promise)) {
            call.then(v => {
                createOptionsFrom($, v, options);
                $.fire('load', [_event, v, query]);
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
        {n, strict} = state;
    picker._event = e;
    letClass(text, n + '__text--focus');
    letClass(mask, n += '--focus');
    letClass(mask, n + '-text');
    if (strict) {
        // Automatically select the first option, or select none!
        if (!selectToOptionFirst(picker)) {
            selectToOptionsNone(picker);
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
        if (KEY_ENTER === key) {
            if (!hasClass(mask, n + '--open')) {
                selectToOptionsNone(picker);
                picker.enter();
            } else {
                if (strict) {
                    if (selectToOptionFirst(picker)) {
                        picker.exit(), focusTo(input), selectTo(input);
                    }
                }
            }
        }
        currentOption && focusTo(currentOption);
        exit = true;
    } else if (KEY_TAB === key) {
        picker.exit();
    } else {
        filter(picker, $, _options);
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
    let isInput = 'input' === getName(self),
        nextOption, parentOption, prevOption;
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
        isInput && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
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
        {self, state} = picker,
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
    picker.let().fire('reset', [e]);
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

function selectNone(node) {
    const selection = D.getSelection();
    if (node) {} else {
        // selection.removeAllRanges();
        if (selection.rangeCount) {
            selection.removeRange(selection.getRangeAt(0));
        }
    }
}

function selectTo(node, mode) {
    const selection = D.getSelection();
    selectNone();
    const range = D.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);
    if (1 === mode) {
        selection.collapseToEnd();
    } else if (-1 === mode) {
        selection.collapseToStart();
    }
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
        if ('input' === getName(self)) {
            setText(hint, "");
            setText(input, getText(option));
        } else {
            setDatum(value, 'value', b);
            setHTML(value, getHTML(option));
        }
        if (b !== a) {
            picker.fire('change', [_event, b]);
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

function selectToOptionsNone(picker, hook) {
    let {_event, _mask, _options, self, state} = picker,
        {hint, input, options, value} = _mask,
        {n} = state;
    options.hidden = false;
    n += '__option--selected';
    let a = getValue(self), b;
    forEachMap(_options, v => {
        letAttribute(v[3], 'selected');
        letClass(v[2], n);
        v[2].hidden = false;
    });
    self.value = (b = "");
    if ('input' === getName(self)) {
        setText(hint, self.placeholder);
        setText(input, "");
    } else {
        letDatum(value, 'value');
        setHTML(value, "");
    }
    if (hook && b !== a) {
        picker.fire('change', [_event, b]);
    }
}

$$.attach = function (self, state) {
    let $ = this;
    self = self || $.self;
    state = state || $.state;
    $._active = !isDisabled(self) && !isReadOnly(self);
    $._event = null;
    $._options = new OptionPickerOptions($);
    $._value = getValue(self) || null;
    $.self = self;
    $.state = state;
    let isInput = 'input' === getName(self),
        {n} = state;
    const arrow = setElement('span', {
        'class': n + '__arrow'
    });
    const form = getParentForm(self);
    const mask = setElement('div', {
        'class': n,
        'tabindex': isDisabled(self) || isInput ? false : 0
    });
    $.mask = mask;
    const maskOptions = setElement('div', {
        'class': n + '__options'
    });
    const maskValues = setElement('div', {
        'class': n + '__values'
    });
    const text = setElement('span', {
        'class': n + '__' + (isInput ? 'text' : 'value')
    });
    const textInput = setElement('span', {
        'autocapitalize': 'off',
        'contenteditable': isDisabled(self) || isReadOnly(self) || !isInput ? false : "",
        'spellcheck': !isInput ? false : 'false'
    });
    const textInputHint = setElement('span', isInput ? self.placeholder + "" : "");
    setChildLast(mask, maskValues);
    setChildLast(mask, maskOptions);
    setChildLast(maskValues, text);
    setChildLast(maskValues, arrow);
    if (isInput) {
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
    let _mask = {}, option;
    _mask.arrow = arrow;
    _mask.hint = isInput ? textInputHint : null;
    _mask.input = isInput ? textInput : null;
    _mask.of = self;
    _mask.options = maskOptions;
    _mask.self = mask;
    _mask[isInput ? 'text' : 'value'] = text;
    $._mask = _mask;
    $.size = state.size ?? (isInput ? 1 : self.size);
    let {options} = state;
    if (isFunction(options)) {
        options = options.call($, null);
        if (isInstance(options, Promise)) {
            options.then(options => {
                createOptionsFrom($, options, maskOptions);
                $.fire('load', [$._event, options, null]);
            });
        } else {
            createOptionsFrom($, options, maskOptions);
        }
    } else {
        createOptionsFrom($, options || getOptions(self), maskOptions);
    }
    // Attach the current value(s)
    if (option = getValueInMap(toValue($._value), $._options) || (isInput ? 0 : toValuesFromMap($._options).find(_option => !isDisabled(_option[3])))) {
        $.value = getOptionValue(option[2]);
    }
    // Attach extension(s)
    if (isSet(state) && isArray(state.with)) {
        for (let i = 0, j = toCount(state.with); i < j; ++i) {
            let value = state.with[i];
            if (isString(value)) {
                value = OptionPicker[value];
            }
            // `const Extension = function (self, state = {}) {}`
            if (isFunction(value)) {
                value.call($, self, state);
                continue;
            }
            // `const Extension = {attach: function (self, state = {}) {}, detach: function (self, state = {}) {}}`
            if (isObject(value) && isFunction(value.attach)) {
                value.attach.call($, self, state);
                continue;
            }
        }
    }
    return $;
};

$$.blur = function () {
    selectNone();
    let $ = this,
        {_mask, mask} = $,
        {input} = _mask;
    return (input || mask).blur(), $.exit();
};

$$.detach = function () {
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
        for (let i = 0, j = toCount(state.with); i < j; ++i) {
            let value = state.with[i];
            if (isString(value)) {
                value = OptionPicker[value];
            }
            if (isObject(value) && isFunction(value.detach)) {
                value.detach.call($, self, state);
                continue;
            }
        }
    }
    self.tabIndex = null;
    letClass(self, state.n + '__self');
    letElement(mask);
    $._mask = {
        of: self
    };
    $.mask = null;
    return $;
};

$$.enter = function (focus) {
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
        if ('input' === getName(self)) {
            focusTo(input), selectTo(input);
        } else if (option = getValueInMap(toValue(getValue(self)), _options)) {
            focusTo(option[2]);
        }
        $.fire('focus', [_event]).fire('focus.option', [_event]);
    }
    return $;
};

$$.exit = function (focus) {
    let $ = this,
        {_event, _mask, mask, self, state} = $,
        {input} = _mask,
        {n} = state;
    letClass(mask, n + '--open');
    $.fire('exit', [_event]);
    if (focus) {
        if ('input' === getName(self)) {
            focusTo(input), selectTo(input);
        } else {
            focusTo(mask);
        }
        $.fire('focus', [_event]).fire('focus.self', [_event]);
    }
    return $;
}

$$.fit = function () {
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
};

$$.focus = function (mode) {
    let $ = this,
        {_mask, mask} = $,
        {input} = _mask;
    if (input) {
        return focusTo(input), selectTo(input, mode), $;
    }
    return focusTo(mask), $;
};

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

defineProperty(OptionPickerOptions, 'name', {
    value: 'Options'
});

const $$$ = OptionPickerOptions.prototype;

$$$.get = function (key) {
    return getValueInMap(toValue(key), this.map);
};

$$$.has = function (key) {
    return hasKeyInMap(toValue(key), this.map);
};

$$$.let = function (key) {
    let $ = this,
        {map} = $, r;
    if (!isSet(key)) {
        forEachMap(map, (v, k) => $.let(k));
        return 0 === $.count;
    }
    if (!(r = $.get(toValue(key)))) {
        return false;
    }
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
    return r;
};

$$$.set = function (key, value) {
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
        {n} = state;
    n += '__option';
    if ('input' === getName(self)) {
        items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
    } else {
        items = getChildren(itemsParent = self);
    }
    if (!isSet(value)) {
        value = [key, {}];
    } else if (isFloat(value) || isInteger(value) || isString(value)) {
        value = [value, {}];
    }
    if ('&' in value[1]) {
        optionGroup = getElement('.' + n + '-group[data-value="' + value[1]['&'].replace(/"/g, '\\"') + '"]', options);
        if (!optionGroup || getOptionValue(optionGroup) !== value[1]['&']) {
            setChildLast(options, optionGroup = setElement('span', {
                'class': n + '-group',
                'data-value': value[1]['&']
            }));
            setChildLast(itemsParent, optionGroupReal = setElement('optgroup', {
                'label': value[1]['&']
            }));
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
        'data-group': '&' in value[1] ? value[1]['&'] : false,
        'data-value': v,
        'tabindex': disabled ? false : -1
    });
    optionReal = value[3] || setElement('option', fromValue(value[0]), {
        'disabled': disabled ? "" : false,
        'selected': selected ? "" : false,
        'value': v
    });
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
    return setValueInMap(toValue(key), value, map), $;
};

OptionPicker.Options = OptionPickerOptions;

export default OptionPicker;