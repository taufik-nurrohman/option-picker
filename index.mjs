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

    // Store current instance to `OP.instances`
    OP.instances[source.id || source.name || toObjectCount(OP.instances)] = $;

    // Mark current DOM as active option picker to prevent duplicate instance
    source[name] = 1;

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
        return hasClass(selectBoxFakeOption, 'active');
    }

    function letOptionSelected(selectBoxOption) {
        letAttribute(selectBoxOption, 'selected');
        selectBoxOption.selected = false;
    }

    function letOptionFakeSelected(selectBoxFakeOption) {
        letClass(selectBoxFakeOption, 'active');
    }

    function setOptionSelected(selectBoxOption) {
        setAttribute(selectBoxOption, 'selected', true);
        selectBoxOption.selected = true;
    }

    function setOptionFakeSelected(selectBoxFakeOption) {
        setClass(selectBoxFakeOption, 'active');
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

    let className = state['class'],

        selectBox = setElement(source, {
            'class': className + '-source',
            'tabindex': -1
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

    if (selectBoxMultiple && !selectBoxSize) {
        selectBox.size = selectBoxSize = state.size;
    }

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
        selectBoxValue = selectBoxFakeOption[PROP_VALUE];
        let selectBoxFakeLabelContent = [],
            content, index, value;
        e && e.isTrusted && onSelectBoxFocus();
        offEventDefault(e);
        if (selectBoxMultiple && keyIsCtrl) {
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
                    content = '<i class="' + getClasses(selectBoxFakeOptions[i], false) + '" data-index="' + index + '"' + (hasAttribute(selectBoxFakeOptions[i], 'data-value') ? ' data-value="' + value + '"' : "") + '>' + content + '</i>';
                    selectBoxFakeLabelContent.push(content);
                }
            }
            setLabelContent(selectBoxFakeLabelContent.join(state.join));
            fire('change', getLot());
            return;
        }
        content = getText(selectBoxFakeOption);
        index = selectBoxFakeOption[PROP_INDEX];
        value = selectBoxFakeOption[PROP_VALUE];
        content = '<i class="' + getClasses(selectBoxFakeOption, false) + '" data-index="' + index + '"' + (hasAttribute(selectBoxFakeOption, 'data-value') ? ' data-value="' + value + '"' : "") + '>' + content + '</i>';
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
        if (selectBoxSize) {
            return doEnter();
        }
        doToggle() && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeFocus(e) {
        doFocus();
    }

    function onSelectBoxFakeKeyDown(e) {
        keyIsCtrl = e.ctrlKey;
        keyIsShift = e.shiftKey;
        let key = e.key,
            selectBoxOptionIndexCurrent = selectBox.selectedIndex,
            selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
            selectBoxFakeOptionIsDisabled = selectBoxFakeOption => hasClass(selectBoxFakeOption, 'lock'),
            doClick = selectBoxFakeOption => onSelectBoxFakeOptionClick.call(selectBoxFakeOption),
            isOpen = isEnter();
        if ('ArrowDown' === key) {
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('ArrowUp' === key) {
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('End' === key) {
            selectBoxOptionIndexCurrent = toCount(selectBoxOptions);
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('Enter' === key) {
            doToggle(), offEventDefault(e);
        } else if ('Escape' === key) {
            !selectBoxSize && doExit();
            // offEventDefault(e);
        } else if ('Home' === key) {
            selectBoxOptionIndexCurrent = 0;
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption)) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if ('Tab' === key) {
            selectBoxFakeOption && doClick(selectBoxFakeOption);
            !selectBoxSize && doExit();
            // offEventDefault(e);
        }
        isOpen && !keyIsCtrl && !keyIsShift && setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function onSelectBoxFakeKeyUp() {
        keyIsCtrl = keyIsShift = false;
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
            selectBoxOptionValueReal = selectBoxOptionValue,
            selectBoxOptionText = getText(selectBoxItem),
            selectBoxFakeOption = setElement('a', selectBoxOptionText, {
                'title': selectBoxOptionText
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
            setClass(selectBoxFakeOption, 'lock');
        } else {
            onEvent('click', selectBoxFakeOption, onSelectBoxFakeOptionClick);
        }
        setChildLast(parent, selectBoxFakeOption);
        selectBoxFakeOptions.push(selectBoxFakeOption);
        if (
            isArray(selectBoxValue) && hasValue(selectBoxOptionValue, selectBoxValue) ||
            selectBoxOptionValue === selectBoxValue
        ) {
            setClass(selectBoxFakeOption, 'active');
            setLabelContent('<i class="active' + (selectBoxOptionIsDisabled ? ' lock' : "") + '" data-index="' + selectBoxOptionIndex + '"' + (selectBoxOptionValueReal ? ' data-value="' + selectBoxOptionValueReal + '"' : "") + '>' + selectBoxOptionText + '</i>');
            setOptionSelected(selectBoxItem);
        } else {
            letOptionSelected(selectBoxItem);
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
        offEvents(['resize', 'scroll'], W, onSelectBoxWindow);
        offEvent('click', selectBoxParent, onSelectBoxParentClick);
        offEvent('focus', selectBox, onSelectBoxFocus);
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
        selectBoxFakeOptions.forEach((selectBoxFakeOption, index) => {
            let selectBoxOption = selectBoxOptions[index];
            toggleClass(selectBoxFakeOption, 'active', selectBoxOption && getOptionSelected(selectBoxOption));
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

OP.version = '1.0.1';

export default OP;
