import {fromStates} from '@taufik-nurrohman/from';
import {getAttribute, getParentForm, letClass, letElement, setClass, setElement, setNext} from '@taufik-nurrohman/document';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isFunction, isInstance, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, onEvent} from '@taufik-nurrohman/event';
import {toCount} from '@taufik-nurrohman/to';

const name = 'OptionPicker';

function defineProperty(of, key, state) {
    Object.defineProperty(of, key, state);
}

function getValue(self) {
    return (self.value || getAttribute(self, 'value', false) || "").replace(/\r/g, "");
}

function isDisabled(self) {
    return self.disabled;
}

function isReadOnly(self) {
    return self.readOnly;
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

    self['_' + name] = hook($, OptionPicker.prototype);

    return $.attach(self, fromStates({}, OptionPicker.state, (state || {})));

}

OptionPicker.state = {
    'n': 'option-picker',
    'options': null,
    'with': []
};

OptionPicker.version = '%(version)';

defineProperty(OptionPicker, 'name', {
    value: name
});

const $$ = OptionPicker.prototype;

defineProperty($$, 'value', {
    get: function () {
        let value = this.self.value;
        return "" === value ? null : value;
    },
    set: function (value) {
        let $ = this;
        $.fire('change');
    }
});

function onResetForm(e) {
    let $ = this,
        picker = $['_' + name];
    picker.let().fire('reset', [e]);
}

function onSubmitForm(e) {
    let $ = this,
        picker = $['_' + name];
    return picker.fire('submit', [e]);
}

$$.attach = function (self, state) {
    let $ = this;
    self = self || $.self;
    state = state || $.state;
    $._active = !isDisabled(self) && !isReadOnly(self);
    $._options = {};
    $._value = getValue(self);
    $.self = self;
    $.state = state;
    let n = state.n;
    const form = getParentForm(self);
    const mask = setElement('div', {
        'class': n,
        'tabindex': isDisabled(self) ? false : -1
    });
    $.mask = mask;
    setClass(self, n + '__self');
    setNext(self, mask);
    if (form) {
        form['_' + name] = $;
        onEvent('reset', form, onResetForm);
        onEvent('submit', form, onSubmitForm);
    }
    self.tabIndex = -1;
    mask['_' + name] = $;
    let _mask = {};
    _mask.hint = null;
    _mask.input = null;
    _mask.of = self;
    _mask.options = null;
    _mask.self = mask;
    _mask.text = null;
    $._mask = _mask;
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

$$.blur = function () {};

$$.detach = function () {
    let $ = this,
        {_mask, mask, self, state} = $;
    const form = getParentForm(self);
    $._active = false;
    if (form) {
        offEvent('reset', form, onResetForm);
        offEvent('submit', form, onSubmitForm);
    }
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

$$.focus = function () {};

export default OptionPicker;