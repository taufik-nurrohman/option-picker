import {D, W, getAttribute, getChildren, getClasses, getHTML, getName, getParent, getStyle, getText, hasAttribute, hasClass, letAttribute, letClass, letElement, letText, setAttribute, setChildLast, setClass, setData, setElement, setHTML, setNext, setStyle, setStyles, setText, toggleClass} from '@taufik-nurrohman/document';
import {offEvent, offEvents, offEventDefault, onEvent, onEvents} from '@taufik-nurrohman/event';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getOffset, getRect, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isInstance, isString} from '@taufik-nurrohman/is';
import {toArray, toCount, toNumber, toObjectCount, toValue} from '@taufik-nurrohman/to';

let name = 'OP',
    PROP_INDEX = 'i',
    PROP_SOURCE = '$',
    PROP_VALUE = 'v';

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_START = 'Home';
const KEY_TAB = 'Tab';

function OP(source, state = {}) {

    if (!source) return;

    // Already instantiated, skip!
    if (source[name]) {
        return source[name];
    }

    const $ = this;

    // Return new instance if `OP` was called without the `new` operator
    if (!isInstance($, OP)) {
        return new OP(source, state);
    }

    let {fire, hooks} = hook($);

    $.state = state = fromStates({}, OP.state, state);

    $.options = {};
    $.source = source;

    // Store current instance to `OP.instances`
    OP.instances[source.id || source.name || toObjectCount(OP.instances)] = $;

    // Mark current DOM as active option picker to prevent duplicate instance
    source[name] = $;

    function getLot() {
        return [toValue(getValue()), $.options];
    }

    function getValue() {
        if (selectBoxMultiple) {
            let values = [];
            for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                if (getOptionSelected(selectBoxOptions[i])) {
                    values.push(getOptionValue(selectBoxOptions[i]));
                }
            }
            return values;
        }
        let value = source.value;
        return "" !== value ? value : null;
    }

    function getOptionValue(selectBoxOption) {
        let value = selectBoxOption.value || getText(selectBoxOption);
        return "" !== value ? value : null;
    }

    function getOptionSelected(selectBoxOption) {
        return hasAttribute(selectBoxOption, 'selected');
    }

    function getOptionFakeSelected(selectBoxFakeOption) {
        return hasClass(selectBoxFakeOption, classNameOptionM + 'selected');
    }

    function letOptionSelected(selectBoxOption) {
        letAttribute(selectBoxOption, 'selected');
        selectBoxOption.selected = false;
    }

    function letOptionFakeSelected(selectBoxFakeOption) {
        letClass(selectBoxFakeOption, classNameOptionM + 'selected');
    }

    function setOptionSelected(selectBoxOption) {
        setAttribute(selectBoxOption, 'selected', true);
        selectBoxOption.selected = true;
    }

    function setOptionFakeSelected(selectBoxFakeOption) {
        setClass(selectBoxFakeOption, classNameOptionM + 'selected');
    }

    function setLabelContent(content) {
        content = content || '\u200c';
        selectBoxFakeLabel.title = content.replace(/<.*?>/g, "");
        setHTML(selectBoxFakeLabel, content);
    }

    function setValue(value) {
        if (selectBoxMultiple) {
            let values = toArray(value), value;
            for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                value = getOptionValue(selectBoxOptions[i]);
                if (values.includes(toValue(value))) {
                    setOptionSelected(selectBoxOptions[i]);
                } else {
                    letOptionSelected(selectBoxOptions[i]);
                }
            }
        }
    }

    let classNameB = state['class'],
        classNameE = classNameB + '__',
        classNameM = classNameB + '--',

        classNameOptionB = classNameE + 'option',
        classNameOptionM = classNameOptionB + '--',

        classNameOptionsB = classNameE + 'options',
        classNameOptionsM = classNameOptionsB + '--',

        classNameValueB = classNameE + 'value',
        classNameValueM = classNameValueB + '--',

        classNameValuesB = classNameE + 'values',
        classNameValuesM = classNameValuesB + '--',

        selectBox = setElement(source, {
            'class': classNameE + 'source',
            'tabindex': '-1'
        }),
        selectBoxIsDisabled = () => selectBox.disabled,
        selectBoxItems = getChildren(selectBox),
        selectBoxMultiple = selectBox.multiple,
        selectBoxOptionIndex = 0,
        selectBoxOptions = selectBox.options,
        selectBoxParent = state.parent || D,
        selectBoxSize = selectBox.size,
        selectBoxTitle = selectBox.title,
        selectBoxValue = getValue(),

        selectBoxFake = setElement('div', {
            'class': classNameB,
            'tabindex': selectBoxIsDisabled() ? false : '0',
            'title': selectBoxTitle
        }),
        selectBoxFakeLabel = setElement('div', '\u200c', {
            'class': classNameValuesB
        }),
        selectBoxFakeBorderBottomWidth = 0,
        selectBoxFakeBorderTopWidth = 0,
        selectBoxFakeDropDown = setElement('div', {
            'class': classNameOptionsB,
            'tabindex': '-1'
        }),
        selectBoxFakeOptions = [],

        _keyIsCtrl = false,
        _keyIsShift = false;

    if (selectBoxMultiple && !selectBoxSize) {
        selectBox.size = selectBoxSize = state.size;
    }

    setChildLast(selectBoxFake, selectBoxFakeLabel);
    setNext(selectBox, selectBoxFake);

    function doBlur() {
        letClass(selectBoxFake, classNameM + 'focus');
        fire('blur', getLot());
    }

    function doFocus() {
        setClass(selectBoxFake, classNameM + 'focus');
        fire('focus', getLot());
    }

    function doEnter() {
        setClass(selectBoxFake, classNameM + 'open');
        fire('enter', getLot());
    }

    function doExit() {
        if (selectBoxMultiple || selectBoxSize) {
            return;
        }
        letClass(selectBoxFake, classNameM + 'open');
        fire('exit', getLot());
    }

    function doToggle(force) {
        toggleClass(selectBoxFake, classNameM + 'open', force);
        let isOpen = isEnter();
        fire(isOpen ? 'enter' : 'exit', getLot());
        return isOpen;
    }

    function doValue(content, value, index, classNames) {
        return '<span class="' + classNameValueB + ' ' + classNames + '" data-index="' + index + '"' + (value ? ' data-value="' + value + '"' : "") + '>' + content + '</span>'
    }

    function isEnter() {
        return hasClass(selectBoxFake, classNameM + 'open');
    }

    function onSelectBoxFocus() {
        selectBoxFake.focus();
    }

    function onSelectBoxFakeOptionClick(e) {
        if (selectBoxIsDisabled()) {
            return;
        }
        let selectBoxFakeOption = this,
            selectBoxOption = selectBoxFakeOption[PROP_SOURCE],
            selectBoxValuePrevious = selectBoxValue;
        selectBoxOptionIndex = selectBoxFakeOption[PROP_INDEX];
        selectBoxValue = selectBoxFakeOption[PROP_VALUE];
        let selectBoxFakeLabelContent = [],
            content, index, value;
        e && e.isTrusted && onSelectBoxFocus();
        offEventDefault(e);
        if (selectBoxMultiple && (_keyIsCtrl || _keyIsShift)) {
            if (getOptionFakeSelected(selectBoxFakeOption)) {
                letOptionSelected(selectBoxOption);
                letOptionFakeSelected(selectBoxFakeOption);
            } else {
                setOptionSelected(selectBoxOption);
                setOptionFakeSelected(selectBoxFakeOption);
            }
            for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
                if (getOptionSelected(selectBoxOptions[i])) {
                    content = getText(selectBoxFakeOptions[i]);
                    index = selectBoxFakeOptions[i][PROP_INDEX];
                    value = selectBoxFakeOptions[i][PROP_VALUE];
                    content = doValue(content, value, index, getClasses(selectBoxFakeOptions[i], false));
                    selectBoxFakeLabelContent.push(content);
                }
            }
            setLabelContent(selectBoxFakeLabelContent.join('<span>' + state.join + '</span>'));
            fire('change', getLot());
            return;
        }
        content = getText(selectBoxFakeOption);
        index = selectBoxFakeOption[PROP_INDEX];
        value = selectBoxFakeOption[PROP_VALUE];
        content = doValue(content, value, index, getClasses(selectBoxFakeOption, false));
        setLabelContent(content);
        selectBoxFakeOptions.forEach(selectBoxFakeOption => {
            if (selectBoxValue === selectBoxFakeOption[PROP_VALUE]) {
                setOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                setOptionFakeSelected(selectBoxFakeOption);
            } else {
                letOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                letOptionFakeSelected(selectBoxFakeOption);
            }
        });
        if (selectBoxValue !== selectBoxValuePrevious) {
            fire('change', getLot());
        }
    }

    function onSelectBoxFakeBlur(e) {
        doBlur();
    }

    function onSelectBoxFakeClick(e) {
        if (selectBoxIsDisabled()) {
            return;
        }
        selectBoxOptionIndex = selectBox.selectedIndex;
        if (selectBoxSize) {
            return doEnter();
        }
        selectBoxFakeBorderBottomWidth = toNumber(getStyle(selectBoxFake, 'border-bottom-width'));
        selectBoxFakeBorderTopWidth = toNumber(getStyle(selectBoxFake, 'border-top-width')),
        doToggle() && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeFocus(e) {
        selectBoxOptionIndex = selectBox.selectedIndex;
        doFocus();
    }

    function onSelectBoxFakeKeyDown(e) {
        _keyIsCtrl = e.ctrlKey;
        _keyIsShift = e.shiftKey;
        let key = e.key,
            selectBoxOptionIndexCurrent = selectBoxOptionIndex,
            selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
            selectBoxFakeOptionIsDisabled = selectBoxFakeOption => hasClass(selectBoxFakeOption, classNameOptionM + 'disabled'),
            doClick = selectBoxFakeOption => onSelectBoxFakeOptionClick.call(selectBoxFakeOption),
            isOpen = isEnter(); // Cache the enter state
        if (KEY_ARROW_DOWN === key) {
            // Continue walking down until it finds an option that is not disabled
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                doClick(selectBoxFakeOption), doToggle(isOpen);
            }
            if (selectBoxMultiple && _keyIsShift && (selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndex - 1])) {
                // TODO: Preserve selection on the previous option
                setOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                setOptionFakeSelected(selectBoxFakeOption);
            }
            offEventDefault(e);
        } else if (KEY_ARROW_UP === key) {
            // Continue walking up until it finds an option that is not disabled
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                doClick(selectBoxFakeOption), doToggle(isOpen);
            }
            if (selectBoxMultiple && _keyIsShift && (selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndex + 1])) {
                // TODO: Preserve selection on the next option
                setOptionSelected(selectBoxFakeOption[PROP_SOURCE]);
                setOptionFakeSelected(selectBoxFakeOption);
            }
            offEventDefault(e);
        } else if (KEY_END === key) {
            // Start from the last option position + 1
            selectBoxOptionIndexCurrent = toCount(selectBoxOptions);
            // Continue walking up until it finds an option that is not disabled
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if (KEY_ENTER === key) {
            doToggle(), offEventDefault(e);
        } else if (KEY_ESCAPE === key) {
            !selectBoxSize && doExit();
            // offEventDefault(e);
        } else if (KEY_START === key) {
            // Start from the first option position - 1
            selectBoxOptionIndexCurrent = -1;
            // Continue walking up until it finds an option that is not disabled
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if (KEY_TAB === key) {
            selectBoxFakeOption && doClick(selectBoxFakeOption);
            !selectBoxSize && doExit();
            // offEventDefault(e);
        }
        isEnter() && !_keyIsCtrl && !_keyIsShift && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeKeyUp() {
        _keyIsCtrl = _keyIsShift = false;
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

    function onSelectBoxWindow() {
        isEnter() && setSelectBoxFakeOptionsPosition(selectBoxFake, 1);
    }

    function setSelectBoxFakeOptions(selectBoxItem, parent) {
        if ('optgroup' === getName(selectBoxItem)) {
            let selectBoxFakeOptionGroup = setElement('span', {
                    'class': classNameOptionB + '-group' + (selectBoxItem.disabled ? ' ' + classNameOptionM + 'disabled' : "")
                }),
                selectBoxItems = getChildren(selectBoxItem);
            selectBoxFakeOptionGroup.title = selectBoxItem.label;
            for (let i = 0, j = toCount(selectBoxItems); i < j; ++i) {
                setSelectBoxFakeOptions(selectBoxItems[i], selectBoxFakeOptionGroup);
            }
            setChildLast(parent, selectBoxFakeOptionGroup);
            return;
        }
        let selectBoxOptionValue = getAttribute(selectBoxItem, 'value', false),
            selectBoxOptionValueReal = selectBoxOptionValue,
            selectBoxOptionText = getText(selectBoxItem),
            selectBoxOptionTitle = selectBoxItem.title,
            selectBoxFakeOption = setElement('a', selectBoxOptionText, {
                'class': classNameOptionB,
                'title': selectBoxOptionTitle || selectBoxOptionText
            });
        selectBoxOptionValue = selectBoxOptionValue || selectBoxOptionText;
        selectBoxFakeOption[PROP_INDEX] = selectBoxOptionIndex;
        selectBoxFakeOption[PROP_SOURCE] = selectBoxItem;
        selectBoxFakeOption[PROP_VALUE] = selectBoxOptionValue;
        setData(selectBoxFakeOption, {
            index: selectBoxOptionIndex,
            value: selectBoxOptionValueReal
        });
        $.options[selectBoxOptionValue] = selectBoxOptionText;
        let selectBoxOptionIsDisabled = selectBoxItem.disabled;
        if (selectBoxOptionIsDisabled) {
            setClass(selectBoxFakeOption, classNameOptionM + 'disabled');
        } else {
            onEvent('click', selectBoxFakeOption, onSelectBoxFakeOptionClick);
        }
        setChildLast(parent, selectBoxFakeOption);
        selectBoxFakeOptions.push(selectBoxFakeOption);
        if ("" === selectBoxOptionValueReal) {
            selectBoxOptionValue = null;
        }
        if (
            isArray(selectBoxValue) && hasValue(selectBoxOptionValue, selectBoxValue) ||
            selectBoxOptionValue === selectBoxValue
        ) {
            setClass(selectBoxFakeOption, classNameOptionM + 'selected');
            setLabelContent(doValue(selectBoxOptionText, selectBoxOptionValueReal, selectBoxOptionIndex, classNameOptionB + ' ' + (selectBoxOptionIsDisabled ? ' ' + classNameOptionM + 'disabled' : "")));
            setOptionSelected(selectBoxItem);
        } else {
            letOptionSelected(selectBoxItem);
        }
        ++selectBoxOptionIndex;
    }

    function setSelectBoxFakeOptionsPosition(selectBoxFake, useEvent) {
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
                letClass(selectBoxFake, classNameM + 'down');
                setClass(selectBoxFake, classNameM + 'up');
            } else {
                letClass(selectBoxFake, classNameM + 'up');
                setClass(selectBoxFake, classNameM + 'down');
            }
        }
        if (!useEvent) {
            let selectBoxFakeOption = selectBoxFakeOptions.find(selectBoxFakeOption => {
                return hasClass(selectBoxFakeOption, classNameOptionM + 'selected');
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
        fire('fit', getLot());
    }

    onEvents(['resize', 'scroll'], W, onSelectBoxWindow);
    onEvent('click', selectBoxParent, onSelectBoxParentClick);
    onEvent('focus', selectBox, onSelectBoxFocus);
    onEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
    onEvent('click', selectBoxFake, onSelectBoxFakeClick);
    onEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
    onEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
    onEvent('keyup', selectBoxFake, onSelectBoxFakeKeyUp);

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
        // Force `down` and `open` class
        setClass(selectBoxFake, classNameM + 'down');
        setClass(selectBoxFake, classNameM + 'open');
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
        offEvents(['resize', 'scroll'], W, onSelectBoxWindow);
        offEvent('click', selectBoxParent, onSelectBoxParentClick);
        offEvent('focus', selectBox, onSelectBoxFocus);
        letClass(selectBox, classNameE + 'source');
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
        selectBoxFakeOptions.forEach((selectBoxFakeOption, index) => {
            let selectBoxOption = selectBoxOptions[index];
            toggleClass(selectBoxFakeOption, classNameOptionM + 'selected', selectBoxOption && getOptionSelected(selectBoxOption));
        });
        fire('change', getLot());
        return $;
    };

    $.self = selectBoxFake;

    return $;

}

OP.instances = {};

OP.state = {
    'class': 'option-picker',
    'join': ', ',
    'parent': null,
    'size': 5
};

OP.version = '1.2.4';

export default OP;