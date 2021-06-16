import {B, W, getAttribute, getChildren, getName, getParent, getStyle, getText, hasAttribute, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setData, setElement, setNext, setStyle, setStyles, setText, toggleClass} from '@taufik-nurrohman/document';
import {fireEvent, offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {fromStates} from '@taufik-nurrohman/from';
import {hook} from '@taufik-nurrohman/hook';
import {isInstance} from '@taufik-nurrohman/is';
import {getOffset, getRect, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {toCount, toNumber, toObjectCount} from '@taufik-nurrohman/to';

let name = 'OP';

function OP(source, state = {}) {

    if (!source) return;

    const $ = this;

    // Return new instance if `OP` was called without the `new` operator
    if (!isInstance($, OP)) {
        return new OP(source, state);
    }

    // Already instantiated, skip!
    if (source[name]) {
        return;
    }

    let {fire, hooks} = hook($);

    $.state = state = fromStates(OP.state, state);

    $.option = null;
    $.options = {};
    $.source = source;
    $.value = source.value;

    // Store current instance to `OP.instances`
    OP.instances[source.id || source.name || toObjectCount(OP.instances)] = $;

    // Mark current DOM as active option picker to prevent duplicate instance
    source[name] = 1;

    function getValue() {
        let value =  source.value;
        return "" !== value ? value : null;
    }

    function setValue(value) {
        source.value = value;
    }

    let className = state['class'],

        selectBox = setElement(source, {
            'class': className + '-source',
            'tabindex': -1
        }),
        selectBoxItems = getChildren(selectBox),
        selectBoxMultiple = selectBox.multiple, // TODO
        selectBoxOptionIndex = 0,
        selectBoxOptions = selectBox.options,
        selectBoxSize = selectBox.size,
        selectBoxTitle = selectBox.title,
        selectBoxValue = getValue(),
        selectBoxWindow = state.parent || B,

        selectBoxFake = setElement('div', {
            'class': className,
            'tabindex': 0,
            'title': selectBoxTitle
        }),
        selectBoxFakeLabel = setElement('b', '\u200c'),
        selectBoxFakeDropDown = setElement('div', {
            'tabindex': -1
        }),
        selectBoxFakeOptions = [],
        keyIsCtrl = false,
        keyIsShift = false;

    setChildLast(selectBoxFake, selectBoxFakeLabel);
    setNext(selectBox, selectBoxFake);

    function onSelectBoxChange(e) {
        onSelectBoxInput.call(this, e);
    }

    function onSelectBoxFocus(e) {
        selectBoxFake.focus();
    }

    function onSelectBoxInput() {
        let selectBoxFakeOption = selectBoxFakeOptions.find(selectBoxFakeOption => {
            return selectBoxValue === selectBoxFakeOption._value;
        });
        selectBoxFakeOption && fireEvent('click', selectBoxFakeOption);
    }

    function onSelectBoxFakeOptionBlur() {
        letClass(this, 'focus');
    }

    function onSelectBoxFakeOptionClick(e) {
        let selectBoxFakeOption = this,
            selectBoxValuePrevious = selectBoxValue;
        selectBoxValue = selectBoxFakeOption._value;
        $.option = selectBoxValue;
        setText(selectBoxFakeLabel, getText(selectBoxFakeOption));
        selectBoxFakeOptions.forEach(selectBoxFakeOption => {
            toggleClass(selectBoxFakeOption, 'active', selectBoxValue === selectBoxFakeOption._value);
        });
        e.isTrusted && selectBoxFake.focus();
        if (selectBoxValue !== selectBoxValuePrevious) {
            setValue(selectBoxValue);
            fireEvent('input', selectBox); // `input` must come first
            fireEvent('change', selectBox);
        }
        offEventDefault(e);
    }

    function onSelectBoxFakeBlur(e) {
        letClass(this, 'focus');
    }

    function onSelectBoxFakeClick(e) {
        if (selectBoxSize) {
            setClass(selectBoxFake, 'open');
            return;
        }
        toggleClass(selectBoxFake, 'open');
        if (hasClass(selectBoxFake, 'open')) {
            setSelectBoxFakeOptionsPosition(selectBoxFake);
        }
    }

    function onSelectBoxFakeFocus() {
        setClass(this, 'focus');
    }

    function onSelectBoxFakeKeyDown(e) {
        let key = e.key,
            selectBoxOptionIndexCurrent = selectBox.selectedIndex,
            selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
            isOpen = hasClass(selectBoxFake, 'open');
        keyIsCtrl = e.ctrlKey;
        keyIsShift = e.shiftKey;
        if ('ArrowDown' === key) {
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!hasClass(selectBoxFakeOption, 'dead')) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                fireEvent('click', selectBoxFakeOption);
                toggleClass(selectBoxFake, isOpen);
            }
            offEventDefault(e);
        } else if ('ArrowUp' === key) {
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!hasClass(selectBoxFakeOption, 'dead')) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                fireEvent('click', selectBoxFakeOption);
                toggleClass(selectBoxFake, isOpen);
            }
            offEventDefault(e);
        } else if ('End' === key) {
            selectBoxOptionIndexCurrent = toCount(selectBoxOptions);
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!hasClass(selectBoxFakeOption, 'dead')) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                fireEvent('click', selectBoxFakeOption);
                toggleClass(selectBoxFake, isOpen);
            }
            offEventDefault(e);
        } else if ('Enter' === key) {
            toggleClass(selectBoxFake, 'open');
            offEventDefault(e);
        } else if ('Escape' === key) {
            !selectBoxSize && letClass(selectBoxFake, 'open');
            // offEventDefault(e);
        } else if ('Home' === key) {
            selectBoxOptionIndexCurrent = 0;
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!hasClass(seletBoxFakeOption, 'dead')) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                fireEvent('click', selectBoxFakeOption);
                toggleClass(selectBoxFake, isOpen);
            }
            offEventDefault(e);
        } else if ('Tab' === key) {
            selectBoxFakeOption && fireEvent('click', selectBoxFakeOption);
            !selectBoxSize && letClass(selectBoxFake, 'open');
            // offEventDefault(e);
        }
        hasClass(selectBoxFake, 'open') && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeKeyUp() {
        keyIsCtrl = false;
        keyIsShift = false;
    }

    function onSelectBoxWindowClick(e) {
        let target = e.target;
        if (target !== selectBoxFake) {
            while (target = getParent(target)) {
                if (selectBoxFake === target) {
                    break;
                }
            }
        }
        if (selectBoxFake !== target) {
            letClass(selectBoxFake, 'open');
        }
    }

    function setSelectBoxFakeOptions(selectBoxItem, parent) {
        if ('optgroup' === getName(selectBoxItem)) {
            let selectBoxFakeOptionGroup = setElement('span'),
                selectBoxItems = getChildren(selectBoxItem);
            selectBoxFakeOptionGroup.title = selectBoxItem.label;
            for (let i = 0, j = toCount(selectBoxItems); i < j; ++i) {
                setSelectBoxFakeOptions(selectBoxItems[i], selectBoxFakeOptionGroup);
            }
            setChildLast(parent, selectBoxFakeOptionGroup);
            return;
        }
        let selectBoxOptionValue = getAttribute(selectBoxItem, 'value', false),
            selectBoxOptionText = getText(selectBoxItem),
            selectBoxFakeOption = setElement('a', selectBoxOptionText, {
                'tabindex': -1,
                'title': selectBoxOptionText
            });
        selectBoxOptionValue = selectBoxOptionValue || selectBoxOptionText;
        selectBoxFakeOption._index = selectBoxOptionIndex;
        selectBoxFakeOption._value = selectBoxOptionValue;
        setData(selectBoxFakeOption, {
            index: selectBoxOptionIndex,
            value: selectBoxOptionValue
        });
        $.options[selectBoxOptionValue] = selectBoxOptionText;
        if (selectBoxItem.disabled) {
            setClass(selectBoxFakeOption, 'dead');
        } else {
            onEvent('click', selectBoxFakeOption, onSelectBoxFakeOptionClick);
        }
        setChildLast(parent, selectBoxFakeOption);
        selectBoxFakeOptions.push(selectBoxFakeOption);
        if (selectBoxOptionValue === selectBoxValue) {
            setClass(selectBoxFakeOption, 'active');
            setText(selectBoxFakeLabel, selectBoxOptionText);
            setValue(selectBoxValue);
            $.option = selectBoxValue;
        }
        ++selectBoxOptionIndex;
    }

    function setSelectBoxFakeOptionsPosition(selectBoxFake) {
        let selectBoxFakeBorderTopWidth = toNumber(getStyle(selectBoxFake, 'border-top-width')),
            selectBoxFakeBorderBottomWidth = toNumber(getStyle(selectBoxFake, 'border-bottom-width'));
        if (!selectBoxSize) {
            let [left, top, width, height] = getRect(selectBoxFake),
                heightWindow = getSize(W)[1],
                heightMax = heightWindow - top - height;
            setStyles(selectBoxFakeDropDown, {
                'bottom': "",
                'left': left,
                'max-height': heightMax,
                'top': top + height - selectBoxFakeBorderTopWidth,
                'width': width
            });
            if (heightMax < (heightWindow - height) / 2) {
                heightMax = top;
                setStyles(selectBoxFakeDropDown, {
                    'top': "",
                    'bottom': heightWindow - top - selectBoxFakeBorderBottomWidth,
                    'max-height': heightMax + selectBoxFakeBorderTopWidth
                });
                setClass(selectBoxFakeDropDown, 'up');
            } else {
                letClass(selectBoxFakeDropDown, 'up');
            }
        }
        let selectBoxFakeOption = selectBoxFakeOptions.find(selectBoxFakeOption => {
            return hasClass(selectBoxFakeOption, 'active');
        });
        if (selectBoxFakeOption) {
            let height = getSize(selectBoxFakeOption)[1],
                heightParent = getSize(selectBoxFakeDropDown)[1],
                [left, top] = getOffset(selectBoxFakeOption),
                topScroll = getScroll(selectBoxFakeDropDown)[1];
            if (top < topScroll) {
                setScroll(selectBoxFakeDropDown, [left, top]);
            } else if (top + height - heightParent > topScroll) {
                setScroll(selectBoxFakeDropDown, [left, top + height - heightParent]);
            }
        }
    }

    if (selectBox.disabled) {
        setClass(selectBoxFake, 'dead');
    } else {
        onEvent('click', selectBoxWindow, onSelectBoxWindowClick);
        onEvent('focus', selectBox, onSelectBoxFocus);
        onEvent('change', selectBox, onSelectBoxChange);
        onEvent('input', selectBox, onSelectBoxInput);
        onEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
        onEvent('click', selectBoxFake, onSelectBoxFakeClick);
        onEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
        onEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
        onEvent('keyup', selectBoxFake, onSelectBoxFakeKeyUp);
    }
    let j = toCount(selectBoxItems);
    if (j) {
        setChildLast(selectBoxFake, selectBoxFakeDropDown);
        for (let i = 0; i < j; ++i) {
            setSelectBoxFakeOptions(selectBoxItems[i], selectBoxFakeDropDown);
        }
        if (selectBoxSize) {
            let selectBoxFakeOption = selectBoxFakeOptions[0],
                selectBoxFakeOptionSize = getSize(selectBoxFakeOption),
                heightMax = selectBoxFakeOptionSize[1] * selectBoxSize;
            setStyle(selectBoxFakeDropDown, 'max-height', heightMax);
        }
    }

    if (selectBoxMultiple) {
        // TODO
    }

    if (selectBoxSize) {
        // Force `open` class
        setClass(selectBoxFake, 'open');
    }

    $.get = () => getValue();

    $.pop = () => {
        if (!source[name]) {
            return $; // Already ejected
        }
        delete source[name];
        offEvent('click', selectBoxWindow, onSelectBoxWindowClick);
        offEvent('change', selectBox, onSelectBoxChange);
        offEvent('focus', selectBox, onSelectBoxFocus);
        offEvent('input', selectBox, onSelectBoxInput);
        letClass(selectBox, className + '-source');
        offEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
        offEvent('click', selectBoxFake, onSelectBoxFakeClick);
        offEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
        offEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
        offEvent('keyup', selectBoxFake, onSelectBoxFakeKeyUp);
        letText(selectBoxFake);
        letElement(selectBoxFake);
        return fire('pop', [getValue()]);
    };

    $.set = value => {
        setValue(value);
        fireEvent(source, 'input');
        fireEvent(source, 'change');
        return $;
    };

    $.self = selectBoxFake;

    return $;

}

OP.instances = {};

OP.state = {
    'class': 'option-picker',
    'parent': null
};

OP.version = '1.0.0';

export default OP;
