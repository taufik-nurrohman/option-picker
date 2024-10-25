import {D, R, W, getAttributes, getChildFirst, getChildLast, getDatum, getHTML, getName, getNext, getParent, getParentForm, getPrev, getText, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setNext, setStyles, setText} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFunction, isInstance, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toObjectValues, toValue} from '@taufik-nurrohman/to';

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
const KEY_TAB = 'Tab';

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
            onEvent('touchstart', option, onPointerDownOption);
        }
        option._of = v[2];
        $._options[k] = option;
        setChildLast(optionGroup || options, option);
        setReference(option, $);
    });
    $.state.options = values;
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

function isDisabled(self) {
    return self.disabled;
}

function isReadOnly(self) {
    return self.readOnly;
}

function letValueInMap(k, map) {
    return map.delete(k);
}

function setReference(key, value) {
    return setValueInMap(key, value, references);
}

function setValueInMap(k, v, map) {
    return map.set(k, v);
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
    'with': []
};

OptionPicker.version = '2.0.0';

defineProperty(OptionPicker, 'name', {
    value: name
});

const $$ = OptionPicker.prototype;

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
        {_mask, self, state} = $,
        {value} = _mask,
        {n} = state;
    n += '__option';
    if (selectOnly) {
        let a = getValue(self), b;
        for (let k in _options) {
            let v = _options[k];
            letAttribute(v._of, 'selected');
            letClass(v, n + '--selected');
        }
        for (let k in _options) {
            let v = _options[k],
                text = toCaseLower(getText(v) + '\t' + (b = getDatum(v, 'value', false)));
            if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v, n + '--disabled')) {
                self.value = b;
                setAttribute(v._of, 'selected', "");
                setClass(v, n + '--selected');
                setDatum(value, 'value', b);
                setHTML(value, getHTML(v));
                if (b !== a) {
                    $.fire('change', [toValue(b)]);
                }
                break;
            }
        }
    } else {
        for (let k in _options) {
            let v = _options[k],
                text = toCaseLower(getText(v) + '\t' + getDatum(v, 'value', false));
            if (("" === q || hasValue(q, text)) && !hasClass(v, n + '--disabled')) {
                letAttribute(v, 'hidden');
            } else {
                setAttribute(v, 'hidden', "");
            }
        }
    }
    $.fire(selectOnly ? 'search' : 'filter', [query]);
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
        let currentOption = _options[getValue(self)];
        if (!currentOption || currentOption.hidden) {
            currentOption = toObjectValues(_options).shift();
            while (currentOption && (hasClass(currentOption, n) || currentOption.hidden)) {
                currentOption = getNext(currentOption);
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
        {_options} = picker;
    searchTermClear();
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key) {
        searchTerm = "";
    } else if (KEY_ESCAPE === key) {
        searchTerm = "";
        picker.exit(exit = true);
    } else if (KEY_TAB === key) {
        searchTerm = "";
        picker.exit(!(exit = false));
    } else if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key || ("" === searchTerm && ' ' === key)) {
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
    if (KEY_DELETE_LEFT === key) {
        picker.exit(exit = true);
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (KEY_ESCAPE !== key) {
            let a = getValue(self), b;
            if (prevOption = _options[getValue(self)]) {
                letAttribute(prevOption._of, 'selected');
                letClass(prevOption, n + '--selected');
            }
            setAttribute($._of, 'selected', "");
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
    } else if (KEY_ARROW_DOWN === key) {
        exit = true;
        nextOption = getNext($);
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
            let firstOption = toObjectValues(_options).find(v => !v.hidden && !hasClass(v, n + '--disabled'));
            firstOption && focusTo(firstOption);
        }
    } else if (KEY_ARROW_UP === key) {
        exit = true;
        prevOption = getPrev($);
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
            let lastOption = toObjectValues(_options).findLast(v => !v.hidden && !hasClass(v, n + '--disabled'));
            lastOption && focusTo(lastOption);
        }
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
        {state} = picker,
        {n} = state;
    picker[hasClass($, n + '--open') ? 'exit' : 'enter'](true).fit(), offEventDefault(e);
}

function onPointerDownOption(e) {
    let $ = this,
        picker = getReference($),
        {_mask, _options, self, state} = picker,
        {hint, input, value} = _mask,
        {n} = state;
    n += '__option--selected';
    let a = getValue(self), b;
    for (let k in _options) {
        let option = _options[k];
        if ($ === option) {
            continue;
        }
        letAttribute(option._of, 'selected');
        letClass(option, n);
    }
    setAttribute($._of, 'selected', "");
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
    offEventDefault(e);
}

function onPointerDownRoot(e) {
    let $ = this,
        picker = getReference($);
    if (!picker) {
        return;
    }
    let {mask, state} = picker,
        {n} = state,
        target = e.target;
    if (mask !== target && mask !== getParent(target, '.' + n)) {
        letValueInMap($, references);
        picker.exit();
    }
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

$$.attach = function (self, state) {
    let $ = this;
    self = self || $.self;
    state = state || $.state;
    $._active = !isDisabled(self) && !isReadOnly(self);
    $._options = {};
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
        options = options.call($);
    }
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
                continue;
            }
            setValueInMap(k, [options[k], {}], map);
        }
    }
    createOptions.call($, maskOptions, options = map);
    const maskValues = setElement('div', {
        'class': n + '__values'
    });
    const text = setElement('span', {
        'class': n + '__' + (isInput ? 'text' : 'value')
    });
    const textInput = setElement('span', {
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
    onEvent('mousedown', R, onPointerDownRoot);
    onEvent('mousedown', mask, onPointerDownMask);
    onEvent('resize', W, onResizeWindow);
    onEvent('scroll', W, onScrollWindow);
    onEvent('touchstart', R, onPointerDownRoot);
    onEvent('touchstart', mask, onPointerDownMask);
    self.tabIndex = -1;
    setReference(mask, $);
    let _mask = {}, option;
    _mask.hint = isInput ? textInputHint : null;
    _mask.input = isInput ? textInput : null;
    _mask.of = self;
    _mask.options = maskOptions;
    _mask.root = R;
    _mask.self = mask;
    _mask[isInput ? 'text' : 'value'] = text;
    $._mask = _mask;
    // Attach the current value(s)
    if (option = $._options[$._value]) {
        setAttribute(option._of, 'selected', "");
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
    offEvent('mousedown', R, onPointerDownRoot);
    offEvent('mousedown', mask, onPointerDownMask);
    offEvent('resize', W, onResizeWindow);
    offEvent('scroll', W, onScrollWindow);
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
        } else if (option = _options[getValue(self)]) {
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
    let rectMask = getRect(mask),
        rectWindow = getRect(W);
    if (rectMask[1] + (rectMask[3] / 2) > (rectWindow[3] / 2)) {
        setStyles(options, {
            'bottom': '100%',
            'max-height': rectMask[1],
            'top': 'auto'
        });
    } else {
        setStyles(options, {
            'bottom': 'auto',
            'max-height': rectWindow[3] - rectMask[1] - rectMask[3],
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
    return (mask && focusTo(mask)), $;
};

export default OptionPicker;