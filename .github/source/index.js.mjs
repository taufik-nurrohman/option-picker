import {B, W, getAttribute, getChildren, getName, getParent, getStyle, getText, hasAttribute, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setData, setElement, setNext, setStyle, setStyles, setText, toggleClass} from '@taufik-nurrohman/document';
import {fireEvent, fireEvents, offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {hook} from '@taufik-nurrohman/hook';
import {isInstance, isString} from '@taufik-nurrohman/is';
import {getOffset, getRect, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {toArray, toCount, toNumber, toObjectCount, toValue} from '@taufik-nurrohman/to';

let name = '%(js.name)';

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

    $.options = {};
    $.source = source;
    $.value = source.value;

    // Store current instance to `OP.instances`
    OP.instances[source.id || source.name || toObjectCount(OP.instances)] = $;

    // Mark current DOM as active option picker to prevent duplicate instance
    source[name] = 1;

    function getLot() {
        let value = getValue();
        return [isString(value) ? toValue(value) : value, $.options];
    }

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
        selectBoxMultiple = selectBox.multiple,
        selectBoxOptionIndex = 0,
        selectBoxOptions = selectBox.options,
        selectBoxParent = state.parent || B,
        selectBoxSize = selectBox.size,
        selectBoxTitle = selectBox.title,
        selectBoxValue = getValue(),

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

    function doBlur() {
        letClass(selectBoxFake, 'focus');
        fire('blur', getLot());
    }

    function doFocus() {
        setClass(selectBoxFake, 'focus');
        fire('focus', getLot());
    }

    function doEnter() {
        setClass(selectBoxFake, 'open');
        fire('enter', getLot());
    }

    function doExit() {
        if (selectBoxMultiple || selectBoxSize) {
            return;
        }
        letClass(selectBoxFake, 'open');
        fire('exit', getLot());
    }

    function doToggle(force) {
        toggleClass(selectBoxFake, 'open', force);
        let isOpen = isEnter();
        fire(isOpen ? 'enter' : 'exit', getLot());
        return isOpen;
    }

    function isEnter() {
        return hasClass(selectBoxFake, 'open');
    }

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

    function doSelectBoxOptionLet(selectBoxFakeOption) {
        letClass(selectBoxFakeOption, 'active');
        letAttribute(selectBoxFakeOption._item, 'selected');
        selectBoxFakeOption._item.selected = false;
    }

    function doSelectBoxOptionSet(selectBoxFakeOption) {
        setClass(selectBoxFakeOption, 'active');
        setAttribute(selectBoxFakeOption._item, 'selected', true);
        selectBoxFakeOption._item.selected = true;
    }

    function onSelectBoxFakeOptionClick(e) {
        let selectBoxFakeOption = this,
            selectBoxOption = selectBoxFakeOption._item,
            selectBoxValuePrevious = selectBoxValue;
        selectBoxValue = selectBoxFakeOption._value;
        let selectBoxFakeLabelText = [];
        e.isTrusted && selectBoxFake.focus();
        offEventDefault(e);
        if (keyIsCtrl) {
            if (hasClass(selectBoxFakeOption, 'active')) {
                doSelectBoxOptionLet(selectBoxFakeOption);
            } else {
                doSelectBoxOptionSet(selectBoxFakeOption);
            }
            for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                if (hasAttribute(selectBoxOptions[i], 'selected')) {
                    selectBoxFakeLabelText.push(getText(selectBoxFakeOptions[i]));
                }
            }
            setText(selectBoxFakeLabel, selectBoxFakeLabelText.join(', ') || '\u200c');
            // fireEvents(['input', 'change'], selectBox);
            // fire('change', getLot());
            return;
        }
        setText(selectBoxFakeLabel, getText(selectBoxFakeOption));
        selectBoxFakeOptions.forEach(selectBoxFakeOption => {
            if (selectBoxValue === selectBoxFakeOption._value) {
                doSelectBoxOptionSet(selectBoxFakeOption);
                setClass(selectBoxFakeOption, 'active');
            } else {
                doSelectBoxOptionLet(selectBoxFakeOption);
                letClass(selectBoxFakeOption, 'active');
            }
        });
        if (selectBoxValue !== selectBoxValuePrevious) {
            fireEvents(['input', 'change'], selectBox);
            fire('change', getLot());
        }
    }

    function onSelectBoxFakeBlur(e) {
        doBlur();
    }

    function onSelectBoxFakeClick(e) {
        if (selectBoxSize) {
            return doEnter();
        }
        doToggle() && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeFocus(e) {
        doFocus();
    }

    function onSelectBoxFakeKeyDown(e) {
        let key = e.key,
            selectBoxOptionIndexCurrent = selectBox.selectedIndex,
            selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
            selectBoxFakeOptionIsDead = selectBoxFakeOption => hasClass(selectBoxFakeOption, 'dead'),
            isOpen = isEnter();
        if (selectBoxMultiple) {
            keyIsCtrl = e.ctrlKey;
            keyIsShift = e.shiftKey;
        }
        if ('ArrowDown' === key) {
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('ArrowUp' === key) {
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('End' === key) {
            selectBoxOptionIndexCurrent = toCount(selectBoxOptions);
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('Enter' === key) {
            doToggle(), offEventDefault(e);
        } else if ('Escape' === key) {
            !selectBoxSize && doExit();
            // offEventDefault(e);
        } else if ('Home' === key) {
            selectBoxOptionIndexCurrent = 0;
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDead(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (fireEvent('click', selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('Tab' === key) {
            selectBoxFakeOption && fireEvent('click', selectBoxFakeOption);
            !selectBoxSize && doExit();
            // offEventDefault(e);
        }
        isOpen && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeKeyUp(e) {
        if (selectBoxMultiple) {
            keyIsCtrl = keyIsShift = false;
        }
    }

    function onSelectBoxParentClick(e) {
        let target = e.target;
        if (target !== selectBoxFake) {
            while (target = getParent(target)) {
                if (selectBoxFake === target) {
                    break;
                }
            }
        }
        selectBoxFake !== target && doExit();
    }

    function onSelectBoxWindowScroll() {
        isEnter() && setSelectBoxFakeOptionsPosition(selectBoxFake);
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
                'title': selectBoxOptionText
            });
        selectBoxOptionValue = selectBoxOptionValue || selectBoxOptionText;
        selectBoxFakeOption._index = selectBoxOptionIndex;
        selectBoxFakeOption._item = selectBoxItem;
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
        fire('fit', getLot());
    }

    if (selectBox.disabled) {
        setClass(selectBoxFake, 'dead');
    } else {
        onEvent('scroll', W, onSelectBoxWindowScroll);
        onEvent('click', selectBoxParent, onSelectBoxParentClick);
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

    if (selectBoxSize) {
        // Force `open` class
        setClass(selectBoxFake, 'open');
    }

    $.get = (parseValue = true) => {
        let value = getValue();
        return parseValue ? toValue(value) : value;
    };

    $.pop = () => {
        if (!source[name]) {
            return $; // Already ejected
        }
        delete source[name];
        onEvent('scroll', W, onSelectBoxWindowScroll);
        offEvent('click', selectBoxParent, onSelectBoxParentClick);
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
        return fire('pop', getLot());
    };

    $.set = value => {
        setValue(fromValue(value));
        fireEvents(['input', 'change'], source);
        fire('change', getLot());
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

OP.version = '%(version)';

export default OP;
