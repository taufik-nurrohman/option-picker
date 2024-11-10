import {D, R, W, getAttributes, getChildFirst, getChildLast, getDatum, getHTML, getName, getNext, getParent, getParentForm, getPrev, getStyle, getText, hasClass, letAttribute, letClass, letDatum, letElement, letStyle, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setNext, setStyle, setStyles, setText} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {getOffset, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
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

function createOptions(options, values) {
    let $ = this, optionGroup,
        {self, state} = $,
        {n} = state;
    n += '__option';
    values = isInstance(values, Map) && values.size > 0 ? values : getOptions(self);
    forEachMap(values, (v, k) => {
        if ('data-group' in v[1]) {
            if (!optionGroup || getDatum(optionGroup, 'value', false) !== v[1]['data-group']) {
                setChildLast(options, optionGroup = setElement('span', {
                    'class': n + '-group',
                    'data-value': v[1]['data-group']
                }));
            }
        } else {
            optionGroup = false;
        }
        let {disabled, selected, value} = v[1];
        let option = setElement('span', v[0], {
            'class': n + (disabled ? ' ' + n + '--disabled' : "") + (selected ? ' ' + n + '--selected' : ""),
            'data-value': fromValue(value || k),
            'tabindex': disabled ? false : -1
        });
        if (!disabled) {
            onEvent('blur', option, onBlurOption);
            onEvent('focus', option, onFocusOption);
            onEvent('keydown', option, onKeyDownOption);
            onEvent('mousedown', option, onPointerDownOption);
            onEvent('touchend', option, onPointerUpOption);
            onEvent('touchstart', option, onPointerDownOption);
        }
        option._ = {};
        option._[OPTION_SELF] = v[2];
        setChildLast(optionGroup || options, option);
        setReference(option, $);
        setValueInMap(k, option, $._options);
    });
    $.state.options = values;
}

function createOptionsCall($, options, maskOptions) {
    const map = new Map;
    if (isArray(options)) {
        forEachArray(options, option => {
            if (isArray(option)) {
                option[0] = option[0] ?? "";
                option[1] = option[1] ?? {};
                setValueInMap(option[0], option, map);
            } else {
                setValueInMap(option, [option, {}], map);
            }
        });
    } else if (isObject(options)) {
        for (let k in options) {
            if (isArray(options[k])) {
                options[k][0] = options[k][0] ?? "";
                options[k][1] = options[k][1] ?? {};
                setValueInMap(k, options[k], map);
            } else {
                setValueInMap(k, [options[k], {}], map);
            }
        }
    }
    createOptions.call($, maskOptions, map);
}

function defineProperty(of, key, state) {
    Object.defineProperty(of, key, state);
}

function focusTo(node) {
    node.focus();
}

function forEachArray(array, then) {
    array.forEach(then);
}

function forEachMap(map, then) {
    forEachArray(map, then);
}

function getOptions(self) {
    const map = new Map;
    const value = getValue(self);
    let item, items, selected = [];
    if ('input' === getName(self)) {
        items = self.list;
        items = items ? items.children : [];
    } else {
        items = self.children;
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
                vv[1]['data-group'] = v.label;
                setValueInMap(kk, vv, map);
            });
            continue;
        }
        setValueInMap(v.value, [getText(v) || v.value, attributes, v], map);
    }
    // If there is no selected option(s), get it from the current value
    if (0 === toCount(selected) && (item = getValueInMap(value, map))) {
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

    setReference(self, hook($, OptionPicker.prototype));

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

OptionPicker.version = '%(version)';

defineProperty(OptionPicker, 'name', {
    value: name
});

const $$ = OptionPicker.prototype;

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
        $.state.size = size;
        if (1 === size) {
            letDatum(mask, 'size');
            letStyle(options, 'max-height');
            letReference(R);
        } else {
            let option = toValuesFromMap(_options).find(_option => !_option.hidden);
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

defineProperty($$, 'value', {
    get: function () {
        let value = getValue(this.self);
        return "" === value ? null : value;
    },
    set: function (value) {
        let $ = this;
        $.fire('change', [toValue(value)]);
    }
});

const filter = debounce(($, input, _options, selectOnly) => {
    let query = isString(input) ? input : getText(input) || "",
        q = toCaseLower(query),
        {_mask, mask, self, state} = $,
        {options, value} = _mask,
        {n} = state,
        hasSize = getDatum(mask, 'size');
    n += '__option';
    if (selectOnly) {
        let a = getValue(self), b;
        forEachMap(_options, (v, k) => {
            letAttribute(v._[OPTION_SELF], 'selected');
            letClass(v, n + '--selected');
        });
        try {
            forEachMap(_options, (v, k) => {
                let text = toCaseLower(getText(v) + '\t' + (b = getDatum(v, 'value', false)));
                if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v, n + '--disabled')) {
                    self.value = b;
                    setAttribute(v._[OPTION_SELF], 'selected', "");
                    setClass(v, n + '--selected');
                    setDatum(value, 'value', b);
                    setHTML(value, getHTML(v));
                    if (b !== a) {
                        $.fire('change', [toValue(b)]);
                    }
                    if (hasSize) {
                        scrollTo(v, options);
                    }
                    throw "";
                }
            });
        } catch (e) {}
    } else {
        let count = _options.size;
        forEachMap(_options, (v, k) => {
            let text = toCaseLower(getText(v) + '\t' + getDatum(v, 'value', false));
            if (("" === q || hasValue(q, text)) && !hasClass(v, n + '--disabled')) {
                v.hidden = false;
            } else {
                v.hidden = true;
                --count;
            }
        });
        options.hidden = !count;
    }
    $.fire('search', [query]);
    let optionsCall = state.options;
    if (isFunction(optionsCall)) {
        optionsCall = optionsCall.call($, query);
        if (isInstance(optionsCall, Promise)) {
            optionsCall.then(v => {
                createOptionsCall($, v, options);
                $.fire('load', [v, query]);
            });
        }
    }
}, FILTER_COMMIT_TIME);

function onBlurMask() {
    let $ = this,
        picker = getReference($),
        {state} = picker,
        {n} = state;
    letClass($, n += '--focus');
    letClass($, n += '-self');
}

function onBlurOption() {
    let $ = this,
        picker = getReference($),
        {mask, state} = picker,
        {n} = state;
    letClass($, n += '--focus');
    letClass($, n += '-option');
}

function onBlurTextInput() {
    let $ = this,
        picker = getReference($),
        {_mask, mask, state} = picker,
        {text} = _mask,
        {n} = state;
    letClass(mask, n + '--focus-text');
    letClass(text, n + '__text--focus');
}

function onCutTextInput() {
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
}

function onFocusMask() {
    let $ = this,
        picker = getReference($),
        {state} = picker,
        {n} = state;
    setClass($, n += '--focus');
    setClass($, n += '-self');
}

function onFocusOption() {
    let $ = this,
        picker = getReference($),
        {mask, state} = picker,
        {n} = state;
    selectNone();
    setClass(mask, n += '--focus');
    setClass(mask, n += '-option');
}

function onFocusSelf() {
    let $ = this,
        picker = getReference($);
    picker.focus();
}

function onFocusTextInput() {
    let $ = this,
        picker = getReference($),
        {_mask, mask, self, state} = picker,
        {input, text} = _mask,
        {n} = state;
    setClass(text, n + '__text--focus');
    setClass(mask, n += '--focus');
    setClass(mask, n += '-text');
    getText(input, false) ? selectTo($) : picker.enter().fit();
}

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        picker = getReference($),
        {_mask, _options, self, state} = picker,
        {hint} = _mask,
        {n} = state;
    n += '__option--disabled';
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
        delay(() => picker.enter().fit(), FILTER_COMMIT_TIME + 1)();
    }
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = getValueInMap(getValue(self), _options);
        if (!currentOption || currentOption.hidden) {
            currentOption = toValueFirstFromMap(_options);
            while (currentOption && (hasClass(currentOption, n) || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        currentOption && focusTo(currentOption);
        exit = true;
    } else if (KEY_TAB === key) {
        if (state.strict) {
            // TODO: Automatically select the first option
        }
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
        firstOption, lastOption, nextOption, parentOption, prevOption;
    if (KEY_DELETE_LEFT === key) {
        picker.exit(exit = true);
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (KEY_ESCAPE !== key) {
            let a = getValue(self), b;
            if (prevOption = getValueInMap(a, _options)) {
                letAttribute(prevOption._[OPTION_SELF], 'selected');
                letClass(prevOption, n + '--selected');
            }
            setAttribute($._[OPTION_SELF], 'selected', "");
            setClass($, n + '--selected');
            self.value = (b = getDatum($, 'value', false));
            if (isInput) {
                setText(hint, "");
                setText(input, getText($));
            } else {
                setDatum(value, 'value', b);
                setHTML(value, getHTML($));
            }
            if (b !== a) {
                picker.fire('change', [toValue(b)]);
            }
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
        if (nextOption) {
            focusTo(nextOption);
        } else {
            firstOption = toValuesFromMap(_options).find(v => !v.hidden && !hasClass(v, n + '--disabled'));
            firstOption && focusTo(firstOption);
        }
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
        if (prevOption) {
            focusTo(prevOption);
        } else {
            lastOption = toValuesFromMap(_options).findLast(v => !v.hidden && !hasClass(v, n + '--disabled'));
            lastOption && focusTo(lastOption);
        }
    } else if (KEY_BEGIN === key) {
        exit = true;
        firstOption = toValuesFromMap(_options).find(v => !v.hidden && !hasClass(v, n + '--disabled'));
        firstOption && focusTo(firstOption);
    } else if (KEY_END === key) {
        exit = true;
        lastOption = toValuesFromMap(_options).findLast(v => !v.hidden && !hasClass(v, n + '--disabled'));
        lastOption && focusTo(lastOption);
    } else {
        isInput && 1 === toCount(key) && !keyIsAlt && !keyIsCtrl && setText(hint, "");
        picker.exit(!(exit = false));
    }
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPasteTextInput() {
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {hint} = _mask;
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
    // Select it, then close the option(s) list if the `touchstart` (that was done before this `touchend` event) event
    // is not intended to perform a scroll action. This is done by comparing the scroll offset of the option(s) list at
    // the first time `touchstart` event is fired with the scroll offset of the option(s) list when `touchend` event
    // (this event) is fired. If it has a difference, then it scrolls ;)
    if (getScroll(options)[1] === optionsScrollTop) {
        selectToOption($, picker), picker.exit(true);
    }
}

function onPointerUpRoot(e) {
    touchTop = false;
}

function onResetForm(e) {
    let $ = this,
        picker = getReference($);
    picker.let().fire('reset', [e]);
}

function onResizeWindow() {
    let $ = this,
        picker = getReference($);
    picker && bounce(picker);
}

function onScrollWindow() {
    onResizeWindow.call(this);
}

function onSubmitForm(e) {
    let $ = this,
        picker = getReference($);
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

function selectToOption($, picker) {
    let {_mask, _options, self, state} = picker,
        {hint, input, options, value} = _mask,
        {n} = state;
    n += '__option--selected';
    let a = getValue(self), b;
    forEachMap(_options, (v, k) => {
        if ($ === v) {
            return;
        }
        letAttribute(v._[OPTION_SELF], 'selected');
        letClass(v, n);
    });
    setAttribute($._[OPTION_SELF], 'selected', "");
    setClass($, n);
    self.value = (b = getDatum($, 'value', false));
    if ('input' === getName(self)) {
        setText(hint, "");
        setText(input, getText($));
    } else {
        setDatum(value, 'value', b);
        setHTML(value, getHTML($));
    }
    if (b !== a) {
        picker.fire('change', [toValue(b)]);
    }
}

$$.attach = function (self, state) {
    let $ = this;
    self = self || $.self;
    state = state || $.state;
    $._active = !isDisabled(self) && !isReadOnly(self);
    $._options = new Map;
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
    let {options} = state;
    if (isFunction(options)) {
        options = options.call($, null);
        if (isInstance(options, Promise)) {
            options.then(options => {
                createOptionsCall($, options, maskOptions);
                $.fire('load', [options, null]);
            });
        }
    }
    if (!isInstance(options, Promise)) {
        createOptionsCall($, options, maskOptions);
    }
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
    onEvent('touchmove', R, onPointerMoveRoot, {passive: false});
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
    _mask.root = R;
    _mask.self = mask;
    _mask[isInput ? 'text' : 'value'] = text;
    $._mask = _mask;
    $.size = state.size ?? (isInput ? 1 : self.size);
    // Attach the current value(s)
    if (option = getValueInMap($._value, $._options) || (isInput ? 0 : toValuesFromMap($._options).find(_option => !isDisabled(_option._[OPTION_SELF])))) {
        setAttribute(option._[OPTION_SELF], 'selected', "");
        if (isInput) {
            setText(textInput, getText(option));
            if (getText(textInput, false)) {
                setText(textInputHint, "");
            }
        } else {
            setDatum(text, 'value', getDatum(option, 'value', false));
            setHTML(text, getHTML(option));
        }
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
        {_mask, _options, mask, self, state} = $,
        {input} = _mask,
        {n} = state;
    setClass(mask, n + '--focus');
    setClass(mask, n + '--focus-option');
    setClass(mask, n += '--open');
    let theRootReference = getReference(R);
    if (theRootReference && $ !== theRootReference) {
        theRootReference.exit(); // Exit other(s)
    }
    setReference(R, $); // Link current picker to the root target
    setReference(W, $);
    $.fire('enter');
    if (focus) {
        $.fire('focus');
        if ('input' === getName(self)) {
            focusTo(input), selectTo(input);
        } else if (option = getValueInMap(getValue(self), _options)) {
            focusTo(option);
        }
        $.fire('focus.option');
    }
    return $;
};

$$.exit = function (focus) {
    let $ = this,
        {_mask, mask, self, state} = $,
        {input} = _mask,
        {n} = state;
    letClass(mask, n + '--focus');
    letClass(mask, n + '--focus-option');
    letClass(mask, n += '--open');
    $.fire('exit');
    if (focus) {
        if ('input' === getName(self)) {
            focusTo(input), selectTo(input);
        } else {
            focusTo(mask);
        }
        $.fire('focus').fire('focus.self');
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

export default OptionPicker;