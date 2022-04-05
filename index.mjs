import {D, W, getAttribute, getChildren, getClasses, getHTML, getName, getParent, getStyle, getText, hasAttribute, hasClass, letAttribute, letClass, letElement, letText, setAttribute, setChildLast, setClass, setData, setElement, setHTML, setNext, setStyle, setStyles, setText, toggleClass} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getOffset, getRect, getScroll, getSize, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isInstance, isString} from '@taufik-nurrohman/is';
import {offEvent, offEvents, offEventDefault, onEvent, onEvents} from '@taufik-nurrohman/event';
import {toArray, toCaseLower, toCount, toNumber, toObjectCount, toValue} from '@taufik-nurrohman/to';

let name = 'OP',
    PROP_INDEX = 'i',
    PROP_SOURCE = '$',
    PROP_VALUE = 'v';

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_DELETE_LEFT = 'Backspace';
const KEY_DELETE_RIGHT = 'Delete';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_START = 'Home';
const KEY_TAB = 'Tab';

const ZERO_WIDTH_SPACE = '\u200c';

function selectElementContents(node) {
    let range = D.createRange();
    range.selectNodeContents(node);
    let selection = W.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function OP(source, state = {}) {

    const $ = this;

    if (!source) {
        return $;
    }

    // Already instantiated, skip!
    if (source[name]) {
        return source[name];
    }

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
        content = content || ZERO_WIDTH_SPACE;
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
        } else {
            source.value = value;
        }
    }

    let classNameB = state['class'],
        classNameE = classNameB + '__',
        classNameM = classNameB + '--',

        classNameInputB = classNameE + 'input',
        classNameInputM = classNameInputB + '--',

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
            'tabindex': -1
        }),

        selectBoxFakeInput = 'input' === getName(selectBox) ? setElement('span', "", {
            'class': classNameInputB
        }) : null,

        selectBoxPlaceholder = selectBoxFakeInput ? source.placeholder : "",
        selectBoxFakeInputPlaceholder = setElement('span', selectBoxPlaceholder),

        selectBoxFakeInputValue = setElement('span', "", {
            'contenteditable': "",
            'tabindex': 0
        }),

        selectBoxIsDisabled = () => selectBox.disabled,
        selectBoxItems = getChildren(selectBox),
        selectBoxMultiple = selectBox.multiple,
        selectBoxOptionIndex = 0,
        selectBoxOptions = selectBox.options,
        selectBoxParent = state.parent || D,
        selectBoxSize = 'input' === getName(selectBox) ? 0 : selectBox.size,
        selectBoxTitle = selectBox.title,
        selectBoxValue = getValue(),

        selectBoxFake = setElement('div', {
            'class': classNameB,
            'tabindex': selectBoxFakeInput || selectBoxIsDisabled() ? false : 0,
            'title': selectBoxTitle
        }),

        selectBoxFakeLabel = setElement('div', ZERO_WIDTH_SPACE, {
            'class': classNameValuesB
        }),

        selectBoxList = selectBox.list,

        selectBoxFakeBorderBottomWidth = 0,
        selectBoxFakeBorderTopWidth = 0,

        selectBoxFakeDropDown = setElement('div', {
            'class': classNameOptionsB,
            'tabindex': -1
        }),

        selectBoxFakeOptions = [],

        _keyIsCtrl = false,
        _keyIsShift = false;

    if (selectBoxMultiple && !selectBoxSize) {
        selectBox.size = selectBoxSize = state.size;
    }

    if (selectBoxFakeInput && selectBoxList) {
        selectBoxItems = getChildren(selectBoxList);
        selectBoxOptions = selectBoxList.options;
        selectBoxSize = null;
        if (selectBoxValue) {
            setHTML(selectBoxFakeInputPlaceholder, ZERO_WIDTH_SPACE);
            setText(selectBoxFakeInputValue, selectBoxValue);
        }
    }

    if (selectBoxFakeInput) {
        setChildLast(selectBoxFakeInput, selectBoxFakeInputValue);
        setChildLast(selectBoxFakeInput, selectBoxFakeInputPlaceholder);
    }

    setChildLast(selectBoxFake, selectBoxFakeInput || selectBoxFakeLabel);
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

    function doFit() {
        selectBoxFakeBorderBottomWidth = toNumber(getStyle(selectBoxFake, 'border-bottom-width'));
        selectBoxFakeBorderTopWidth = toNumber(getStyle(selectBoxFake, 'border-top-width'));
        setSelectBoxFakeOptionsPosition(selectBoxFake);
    }

    function doToggle(force) {
        toggleClass(selectBoxFake, classNameM + 'open', force);
        let isOpen = isEnter();
        fire(isOpen ? 'enter' : 'exit', getLot());
        return isOpen;
    }

    function doValue(content, index, value, classNames) {
        return setElement('span', content, {
            'class': classNameValueB + ' ' + classNames,
            'data-index': index,
            'data-value': value
        }).outerHTML;
    }

    function isEnter() {
        return hasClass(selectBoxFake, classNameM + 'open');
    }

    function onSelectBoxFocus() {
        (selectBoxFakeInput ? selectBoxFakeInputValue : selectBoxFake).focus();
    }

    function onSelectBoxFakeOptionClick(e) {
        if (!selectBoxOptions || selectBoxIsDisabled()) {
            return;
        }
        let selectBoxFakeLabelContent = [],
            content, index, value,
            selectBoxFakeOption = this,
            selectBoxOption = selectBoxFakeOption[PROP_SOURCE],
            selectBoxValuePrevious = selectBoxValue;
        selectBoxOptionIndex = selectBoxFakeOption[PROP_INDEX];
        selectBoxValue = selectBoxFakeOption[PROP_VALUE];
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
            for (let i = 0, j = toCount(selectBoxOptions), v; i < j; ++i) {
                if (getOptionSelected(selectBoxOptions[i])) {
                    content = getText(v = selectBoxFakeOptions[i]);
                    index = v[PROP_INDEX];
                    value = v[PROP_VALUE];
                    selectBoxFakeLabelContent.push(doValue(content, index, value, getClasses(v, false)));
                }
            }
            setLabelContent(selectBoxFakeLabelContent.join('<span>' + state.join + '</span>'));
            fire('change', getLot());
            return;
        }
        content = getText(selectBoxFakeOption);
        index = selectBoxFakeOption[PROP_INDEX];
        value = selectBoxFakeOption[PROP_VALUE];
        if (content && selectBoxFakeInput) {
            setHTML(selectBoxFakeInputPlaceholder, ZERO_WIDTH_SPACE);
            setText(selectBoxFakeInputValue, content);
        }
        setLabelContent(doValue(content, index, value, getClasses(selectBoxFakeOption, false)));
        if (selectBoxFakeInput) {
            selectElementContents(selectBoxFakeInputValue), setValue(content);
        }
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
        if (selectBoxFakeInput) {
            selectBoxFakeInputValue.focus();
        } else {
            doToggle() && doFit();
        }
    }

    function onSelectBoxFakeFocus(e) {
        selectBoxOptionIndex = selectBox.selectedIndex;
        doFocus();
    }

    function onSelectBoxFakeKeyDown(e) {
        if (!selectBoxOptions) {
            return;
        }
        _keyIsCtrl = e.ctrlKey;
        _keyIsShift = e.shiftKey;
        let key = e.key,
            selectBoxOptionIndexCurrent = selectBoxOptionIndex,
            selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
            selectBoxFakeOptionIsDisabled = selectBoxFakeOption => hasClass(selectBoxFakeOption, classNameOptionM + 'disabled'),
            doClick = selectBoxFakeOption => onSelectBoxFakeOptionClick.call(selectBoxFakeOption),
            isOpen = isEnter(); // Cache the enter state
        if (KEY_ARROW_DOWN === key) {
            // Continue walking down until it finds an option that is not disabled and not hidden
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption) && !selectBoxFakeOption.hidden) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                doClick(selectBoxFakeOption), doToggle(isOpen);
            }
            offEventDefault(e);
        } else if (KEY_ARROW_UP === key) {
            // Continue walking up until it finds an option that is not disabled and not hidden
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption) && !selectBoxFakeOption.hidden) {
                    break;
                }
            }
            if (selectBoxFakeOption) {
                doClick(selectBoxFakeOption), doToggle(isOpen);
            }
            offEventDefault(e);
        } else if (KEY_END === key) {
            // Start from the last option position + 1
            selectBoxOptionIndexCurrent = toCount(selectBoxOptions);
            // Continue walking up until it finds an option that is not disabled and not hidden
            while (selectBoxFakeOption = selectBoxFakeOptions[--selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption) && !selectBoxFakeOption.hidden) {
                    break;
                }
            }
            selectBoxFakeOption && (doClick(selectBoxFakeOption), doToggle(isOpen));
            offEventDefault(e);
        } else if (KEY_ENTER === key) {
            selectBoxFakeOption && doClick(selectBoxFakeOption);
            doToggle(), offEventDefault(e);
        } else if (KEY_ESCAPE === key) {
            !selectBoxSize && doExit();
            // offEventDefault(e);
        } else if (KEY_START === key) {
            // Start from the first option position - 1
            selectBoxOptionIndexCurrent = -1;
            // Continue walking up until it finds an option that is not disabled and not hidden
            while (selectBoxFakeOption = selectBoxFakeOptions[++selectBoxOptionIndexCurrent]) {
                if (!selectBoxFakeOptionIsDisabled(selectBoxFakeOption) && !selectBoxFakeOption.hidden) {
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
        isEnter() && !_keyIsCtrl && !_keyIsShift && doFit();
    }

    function onSelectBoxFakeKeyUp() {
        _keyIsCtrl = _keyIsShift = false;
    }

    function onSelectBoxFakeInputValueBlur() {
        doBlur();
    }

    function onSelectBoxFakeInputValueFocus() {
        if (!selectBoxOptions) {
            return;
        }
        let t = this,
            value = getText(t),
            selectBoxOption,
            selectBoxFakeOption;
        selectBoxOptionIndex = -1; // `<input>` does not have `selectedIndex` property!
        selectElementContents(t);
        for (let i = 0, j = toCount(selectBoxOptions); i < j; ++i) {
            selectBoxOption = selectBoxOptions[i];
            selectBoxFakeOption = selectBoxFakeOptions[i];
            if (value === getText(selectBoxOption)) {
                selectBoxOptionIndex = i;
                setOptionSelected(selectBoxOption);
                setOptionFakeSelected(selectBoxFakeOption);
            } else {
                letOptionSelected(selectBoxOption);
                letOptionFakeSelected(selectBoxFakeOption);
            }
        }
        doFocus(), (doToggle() && doFit());
    }

    let bounce = debounce((self, key, valuePrev) => {
            let value = getText(self), first, selectBoxFakeOption;
            if (null === value) {
                setHTML(selectBoxFakeInputPlaceholder, selectBoxPlaceholder);
                for (let i = 0, j = toCount(selectBoxFakeOptions); i < j; ++i) {
                    setHTML(selectBoxFakeOption = selectBoxFakeOptions[i], getText(selectBoxFakeOption));
                    selectBoxFakeOption.hidden = false;
                }
            } else {
                setHTML(selectBoxFakeInputPlaceholder, ZERO_WIDTH_SPACE);
                if (valuePrev !== (value = toCaseLower(value)) && (
                    KEY_ARROW_DOWN !== key &&
                    KEY_ARROW_LEFT !== key &&
                    KEY_ARROW_RIGHT !== key &&
                    KEY_ARROW_UP !== key &&
                    KEY_ENTER !== key
                )) {
                    for (let i = 0, j = toCount(selectBoxFakeOptions), v; i < j; ++i) {
                        letOptionSelected((selectBoxFakeOption = selectBoxFakeOptions[i])[PROP_SOURCE]);
                        letOptionFakeSelected(selectBoxFakeOption);
                        v = getText(selectBoxFakeOption);
                        if (v && toCaseLower(v).includes(value)) {
                            !first && (first = selectBoxFakeOption);
                            setHTML(selectBoxFakeOption, v.replace(new RegExp(value.replace(/[!$^*()+=[]{}|:<>,.?\/-]/g, '\\$&'), 'gi'), $0 => {
                                return '<mark>' + $0 + '</mark>';
                            }));
                            selectBoxFakeOption.hidden = false;
                        } else {
                            setHTML(selectBoxFakeOption, v);
                            selectBoxFakeOption.hidden = true;
                        }
                    }
                    // Always select the first match, but do not update the value
                    if (first) {
                        selectBoxOptionIndex = first[PROP_INDEX];
                        setOptionSelected(first[PROP_SOURCE]);
                        setOptionFakeSelected(first);
                    } else {
                        // No match!
                    }
                    valuePrev = value;
                } else {
                    let marked = 0;
                    for (let i = 0, j = toCount(selectBoxFakeOptions), v; i < j; ++i) {
                        selectBoxFakeOption = selectBoxFakeOptions[i];
                        v = getHTML(selectBoxFakeOption);
                        if (hasValue('</mark>', v)) {
                            ++marked;
                        }
                    }
                    // Reset all filter(s) if there is only one or none option marked
                    if (marked <= 1) {
                        for (let i = 0, j = toCount(selectBoxFakeOptions), v; i < j; ++i) {
                            selectBoxFakeOption = selectBoxFakeOptions[i];
                            v = getText(selectBoxFakeOption);
                            setHTML(selectBoxFakeOption, v);
                            selectBoxFakeOption.hidden = false;
                        }
                    }
                }
            }
            if (KEY_ENTER !== key && KEY_ESCAPE !== key && KEY_TAB !== key) {
                doEnter(), doFit();
            }
        }, 1);

    function onSelectBoxFakeInputValueKeyDown(e) {
        let t = this,
            key = e.key;
        onSelectBoxFakeKeyDown.call(t, e), bounce(t, key, getText(t));
    }

    function onSelectBoxFakeInputValueKeyUp() {
        onSelectBoxFakeKeyUp();
    }

    let waitForPaste = delay((input, placeholder) => {
            let value = getText(input);
            setHTML(placeholder, null !== value ? ZERO_WIDTH_SPACE : selectBoxPlaceholder);
            setText(input, value);
            selectElementContents(input);
        }, 1);

    function onSelectBoxFakeInputValuePaste() {
        waitForPaste(selectBoxFakeInputValue, selectBoxFakeInputPlaceholder);
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
            setLabelContent(doValue(selectBoxOptionText, selectBoxOptionIndex, selectBoxOptionValueReal, getClasses(selectBoxFakeOption, false)));
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
    onEvent('click', selectBoxFake, onSelectBoxFakeClick);

    if (selectBoxFakeInput) {
        onEvent('blur', selectBoxFakeInputValue, onSelectBoxFakeInputValueBlur);
        onEvent('focus', selectBoxFakeInputValue, onSelectBoxFakeInputValueFocus);
        onEvent('keydown', selectBoxFakeInputValue, onSelectBoxFakeInputValueKeyDown);
        onEvent('keyup', selectBoxFakeInputValue, onSelectBoxFakeInputValueKeyUp);
        onEvent('paste', selectBoxFakeInputValue, onSelectBoxFakeInputValuePaste);
    } else {
        onEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
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
        offEvent('click', selectBoxFake, onSelectBoxFakeClick);
        if (selectBoxFakeInput) {
            offEvent('blur', selectBoxFakeInputValue, onSelectBoxFakeInputValueBlur);
            offEvent('focus', selectBoxFakeInputValue, onSelectBoxFakeInputValueFocus);
            offEvent('keydown', selectBoxFakeInputValue, onSelectBoxFakeInputValueKeyDown);
            offEvent('keyup', selectBoxFakeInputValue, onSelectBoxFakeInputValueKeyUp);
            offEvent('paste', selectBoxFakeInputValue, onSelectBoxFakeInputValuePaste);
        } else {
            offEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
            offEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
            offEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
            offEvent('keyup', selectBoxFake, onSelectBoxFakeKeyUp);
        }
        letText(selectBoxFake);
        letElement(selectBoxFake);
        return fire('pop', getLot());
    };

    $.set = value => {
        if (!selectBoxOptions) {
            return $;
        }
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

OP.version = '1.3.6';

export default OP;