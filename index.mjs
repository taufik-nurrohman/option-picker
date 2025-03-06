import {D, R, W, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getHTML, getName, getNext, getParent, getParentForm, getPrev, getStyle, getText, hasClass, letAttribute, letClass, letDatum, letElement, letStyle, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setNext, setStyle, setStyles, setText} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {getOffset, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount} from '@taufik-nurrohman/to';

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

// Extends the native `Map()` class to match my method naming preference: `count`, `get()`, `has()`, `let()`, `set()`
class TagPickerOptions extends Map {
    constructor(of, iterable) {
        super(iterable);
        this.picker = of || {};
    }
    get count() {
        return this.size;
    }
    let(key) {
        if (!isSet(key)) {
            // TODO
        }
        let {picker} = this,
            {_mask} = picker,
            {options} = _mask,
            option = this.get(key);
        if (!option) {
            return false;
        }
        // TODO
        //console.log(option);
        return super.delete(key);
    }
    set(k, v) {
        let items, itemsParent,
            option, optionReal,
            optionGroup, optionGroupReal,
            {picker} = this,
            {_mask, self, state} = picker,
            {options} = _mask,
            {n} = state;
        n += '__option';
        if ('input' === getName(self)) {
            items = (itemsParent = self.list) ? getChildren(itemsParent) : [];
        } else {
            items = getChildren(itemsParent = self);
        }
        if (!isSet(v)) {
            v = [k, {}];
        } else if (isFloat(v) || isInteger(v) || isString(v)) {
            v = [v, {}];
        }
        if ('&' in v[1]) {
            optionGroup = getElement('.' + n + '-group[data-value="' + v[1]['&'].replace(/"/g, '\\"') + '"]', options);
            if (!optionGroup || getOptionValue(optionGroup) !== v[1]['&']) {
                setChildLast(options, optionGroup = setElement('span', {
                    'class': n + '-group',
                    'data-value': v[1]['&']
                }));
                setChildLast(itemsParent, optionGroupReal = setElement('optgroup', {
                    'label': v[1]['&']
                }));
            }
        } else {
            optionGroup = optionGroupReal = false;
        }
        let {disabled, selected, value} = v[1];
        if (isDisabled(self)) {
            disabled = true;
        }
        value = fromValue(value || k);
        option = v[2] || setElement('span', fromValue(v[0]), {
            'class': n + (disabled ? ' ' + n + '--disabled' : "") + (selected ? ' ' + n + '--selected' : ""),
            'data-group': '&' in v[1] ? v[1]['&'] : false,
            'data-value': value,
            'tabindex': disabled ? false : -1
        });
        optionReal = v[3] || setElement('option', fromValue(v[0]), {
            'disabled': disabled ? "" : false,
            'selected': selected ? "" : false,
            'value': value
        });
        option._ = {};
        option._[OPTION_SELF] = optionReal;
        if (!disabled && !v[2]) {
            onEvent('blur', option, onBlurOption);
            onEvent('focus', option, onFocusOption);
            onEvent('keydown', option, onKeyDownOption);
            onEvent('mousedown', option, onPointerDownOption);
            onEvent('touchend', option, onPointerUpOption);
            onEvent('touchstart', option, onPointerDownOption);
        }
        setChildLast(optionGroup || options, option);
        setChildLast(optionGroupReal || itemsParent, optionReal);
        setReference(option, picker);
        v[2] = option;
        v[3] = optionReal;
        return super.set(value, v);
    }
};

function createOptions($, options, values) {
    let items, itemsParent,
        {self, state} = $,
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
    // $._options.let();
    $._options = new TagPickerOptions($, []);
    // Remove option(s) presentation
    setHTML(options, "");
    forEachMap(values, (v, k) => {
        setValueInMap(k, v, $._options);
    });
    $.state.options = values;
}

function createOptionsFrom($, options, maskOptions) {
    const map = isInstance(options, Map) ? options : new Map;
    if (isArray(options)) {
        forEachArray(options, option => {
            if (isArray(option)) {
                option[0] = option[0] ?? "";
                option[1] = option[1] ?? {};
                setValueInMap(fromValue(option[1].value ?? option[0]), option, map);
            } else {
                setValueInMap(fromValue(option), [option, {}], map);
            }
        });
    } else if (isObject(options, 0)) {
        for (let k in options) {
            if (isArray(options[k])) {
                options[k][0] = options[k][0] ?? "";
                options[k][1] = options[k][1] ?? {};
                setValueInMap(fromValue(options[k][1].value ?? k), options[k], map);
            } else {
                setValueInMap(fromValue(k), [options[k], {}], map);
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

function forEachArray(array, then) {
    array.forEach(then);
}

function forEachMap(map, then) {
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
                setValueInMap(fromValue(kk), vv, map);
            });
            continue;
        }
        setValueInMap(fromValue(v.value), [getText(v) || v.value, attributes, null, v], map);
    }
    // If there is no selected option(s), get it from the current value
    if (0 === toCount(selected) && (item = getValueInMap(value = fromValue(value), map))) {
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
            {_mask, state} = $,
            {n} = state;
        n += '__option';
        if (isFloat(options) || isInteger(options) || isString(options)) {
            options = [options];
        }
        createOptionsFrom($, options, _mask.options);
        let firstOption = toValuesFromMap($._options).find(v => !v[2].hidden && !hasClass(v[2], n + '--disabled'));
        firstOption && ($.value = getOptionValue(firstOption[2]));
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
        $.state.size = size;
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
            {_options} = $, v;
        if (v = getValueInMap(fromValue(value), _options)) {
            selectToOption(v[2], $);
        }
    }
});

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
    n += '__option';
    if (selectOnly) {
        let a = getValue(self), b;
        forEachMap(_options, v => {
            letAttribute(v[3], 'selected');
            letClass(v[2], n + '--selected');
        });
        try {
            forEachMap(_options, v => {
                let text = toCaseLower(getText(v[2]) + '\t' + (b = getOptionValue(v[2])));
                if ("" !== q && q === text.slice(0, toCount(q)) && !hasClass(v[2], n + '--disabled')) {
                    self.value = b;
                    setAttribute(v[3], 'selected', "");
                    setClass(v[2], n + '--selected');
                    setDatum(value, 'value', b);
                    setHTML(value, getHTML(v[2]));
                    if (b !== a) {
                        $.fire('change', [_event, b]);
                    }
                    if (hasSize) {
                        scrollTo(v[2], options);
                    }
                    throw "";
                }
            });
        } catch (e) {}
    } else {
        let size = _options.size;
        forEachMap(_options, v => {
            let text = toCaseLower(getText(v[2]) + '\t' + getOptionValue(v[2]));
            if (("" === q || hasValue(q, text)) && !hasClass(v[2], n + '--disabled')) {
                v[2].hidden = false;
                if (strict) {
                    // TODO: Focus visually to the first option
                }
            } else {
                v[2].hidden = true;
                --size;
            }
        });
        options.hidden = !size;
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
    letClass($, n += '--focus');
    letClass($, n += '-option');
}

function onBlurTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_mask, _options, mask, self, state} = picker,
        {options, text} = _mask,
        {n, strict} = state;
    picker._event = e;
    letClass(mask, n + '--focus-text');
    letClass(text, n + '__text--focus');
    if (strict) {
        // Automatically select the first option
        let currentOption = toValuesFromMap(_options).find(v => getText(v[2], false) === getText($, false)),
            firstOption = currentOption || toValuesFromMap(_options).find(v => !v[2].hidden && !hasClass(v[2], n + '__option--disabled'));
        if (firstOption && !options.hidden) {
            selectToOption(firstOption, picker);
        } else {
            forEachMap(_options, v => {
                letAttribute(v[3], 'selected');
                letClass(v[2], n + '__option--selected');
                v[2].hidden = false;
            });
            options.hidden = false;
            picker.text = self.value = "";
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
        {input, text} = _mask,
        {n} = state;
    picker._event = e;
    setClass(text, n + '__text--focus');
    setClass(mask, n += '--focus');
    setClass(mask, n += '-text');
    getText(input, false) ? selectTo($) : picker.enter().fit();
}

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        picker = getReference($),
        {_mask, _options, mask, self, state} = picker,
        {hint} = _mask,
        {n} = state;
    picker._event = e;
    delay(() => setText(hint, getText($, false) ? "" : self.placeholder), 1)();
    if (KEY_DELETE_LEFT === key || KEY_DELETE_RIGHT === key || 1 === toCount(key)) {
        delay(() => picker.enter().fit(), FILTER_COMMIT_TIME + 1)();
    }
    if (KEY_ARROW_DOWN === key || KEY_ARROW_UP === key || KEY_ENTER === key) {
        let currentOption = getValueInMap(getValue(self), _options);
        currentOption = currentOption ? currentOption[2] : 0;
        if (!currentOption || currentOption.hidden) {
            currentOption = toValueFirstFromMap(_options);
            currentOption = currentOption ? currentOption[2] : 0;
            while (currentOption && (hasClass(currentOption, n + '__option--disabled') || currentOption.hidden)) {
                currentOption = getNext(currentOption);
            }
        }
        if (KEY_ENTER === key && !hasClass(mask, n + '--open')) {
            console.log({currentOption});
            forEachMap(_options, v => v[2].hidden = false);
        }
        currentOption && !hasClass(mask, n + '--open') && picker.enter();
        currentOption && focusTo(currentOption);
        exit = true;
    } else if (KEY_TAB === key) {
        console.log('tab');
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
        firstOption, lastOption, nextOption, parentOption, prevOption;
    picker._event = e;
    if (KEY_DELETE_LEFT === key) {
        picker.exit(exit = true);
    } else if (KEY_ENTER === key || KEY_ESCAPE === key || KEY_TAB === key || ' ' === key) {
        if (KEY_ESCAPE !== key) {
            let a = getValue(self), b;
            if (prevOption = getValueInMap(a, _options)) {
                letAttribute(prevOption[3], 'selected');
                letClass(prevOption[2], n + '--selected');
            }
            setAttribute($._[OPTION_SELF], 'selected', "");
            setClass($, n + '--selected');
            self.value = (b = getOptionValue($));
            if (isInput) {
                setText(hint, "");
                setText(input, getText($));
            } else {
                setDatum(value, 'value', b);
                setHTML(value, getHTML($));
            }
            if (b !== a) {
                picker.fire('change', [e, b]);
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
            firstOption = toValuesFromMap(_options).find(v => !v[2].hidden && !hasClass(v[2], n + '--disabled'));
            firstOption && focusTo(firstOption[2]);
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
            lastOption = toValuesFromMap(_options).findLast(v => !v[2].hidden && !hasClass(v[2], n + '--disabled'));
            lastOption && focusTo(lastOption[2]);
        }
    } else if (KEY_BEGIN === key) {
        exit = true;
        firstOption = toValuesFromMap(_options).find(v => !v[2].hidden && !hasClass(v[2], n + '--disabled'));
        firstOption && focusTo(firstOption[2]);
    } else if (KEY_END === key) {
        exit = true;
        lastOption = toValuesFromMap(_options).findLast(v => !v[2].hidden && !hasClass(v[2], n + '--disabled'));
        lastOption && focusTo(lastOption[2]);
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

function selectToOption($, picker) {
    let {_event, _mask, _options, self, state} = picker,
        {hint, input, options, value} = _mask,
        {n} = state;
    n += '__option--selected';
    let a = getValue(self), b;
    forEachMap(_options, v => {
        if ($ === v[2]) {
            return;
        }
        letAttribute(v[3], 'selected');
        letClass(v[2], n);
    });
    setAttribute($._[OPTION_SELF], 'selected', "");
    setClass($, n);
    self.value = (b = getOptionValue($));
    if ('input' === getName(self)) {
        setText(hint, "");
        setText(input, getText($));
    } else {
        setDatum(value, 'value', b);
        setHTML(value, getHTML($));
    }
    if (b !== a) {
        picker.fire('change', [_event, b]);
    }
}

$$.attach = function (self, state) {
    let $ = this;
    self = self || $.self;
    state = state || $.state;
    $._active = !isDisabled(self) && !isReadOnly(self);
    $._event = null;
    $._options = new TagPickerOptions($, []);
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
    if (option = getValueInMap($._value, $._options) || (isInput ? 0 : toValuesFromMap($._options).find(_option => !isDisabled(_option[3])))) {
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
    setClass(mask, n + '--focus');
    setClass(mask, n + '--focus-option');
    setClass(mask, n += '--open');
    let theRootReference = getReference(R);
    if (theRootReference && $ !== theRootReference) {
        theRootReference.exit(); // Exit other(s)
    }
    setReference(R, $); // Link current picker to the root target
    setReference(W, $);
    $.fire('enter', [_event]);
    if (focus) {
        $.fire('focus', [_event]);
        if ('input' === getName(self)) {
            focusTo(input), selectTo(input);
        } else if (option = getValueInMap(getValue(self), _options)) {
            focusTo(option[2]);
        }
        $.fire('focus.option', [_event]);
    }
    return $;
};

$$.exit = function (focus) {
    let $ = this,
        {_event, _mask, mask, self, state} = $,
        {input} = _mask,
        {n} = state;
    letClass(mask, n + '--focus');
    letClass(mask, n + '--focus-option');
    letClass(mask, n += '--open');
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

export default OptionPicker;