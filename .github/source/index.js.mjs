import {getAttribute, getChildren, getName, getText, hasAttribute, hasClass, letAttribute, letClass, letElement, setAttribute, setChildLast, setClass, setData, setElement, setNext, setStyle, setText, toggleClass} from '@taufik-nurrohman/document';
import {fireEvent, offEvent, offEventDefault, onEvent} from '@taufik-nurrohman/event';
import {fromStates} from '@taufik-nurrohman/from';
import {hook} from '@taufik-nurrohman/hook';
import {} from '@taufik-nurrohman/is';
import {getSize} from '@taufik-nurrohman/rect';
import {toCount, toObjectCount} from '@taufik-nurrohman/to';

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
        selectBoxOptions = selectBox.options,
        selectBoxOptionIndex = 0,
        selectBoxOptionIndexCurrent = selectBox.selectedIndex,
        selectBoxSize = selectBox.size,
        selectBoxMultiple = selectBox.multiple, // TODO
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
        asdf;

    // if (!selectBoxValue && selectBoxOptions[0]) {
    //     selectBoxValue = selectBoxOptions[0].value; // Set default value to the first option value
    // }

    setChildLast(selectBoxFake, selectBoxFakeLabel);
    setNext(selectBox, selectBoxFake);

    function onSelectBoxChange(e) {
        onSelectBoxInput.call(this, e);
    }

    function onSelectBoxFocus(e) {
        selectBoxFake.focus();
    }

    function onSelectBoxInput() {
        // if (!selectBoxValue && selectBoxOptions[0]) {
        //     selectBoxValue = selectBoxOptions[0].value;
        // }
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

    function onSelectBoxFakeFocus() {
        letClass(this, 'focus');
    }

    function onSelectBoxFakeKeyDown(e) {
        let key = e.key,
            selectBoxFakeOption = selectBoxFakeOptions[selectBoxOptionIndexCurrent],
            isOpen = hasClass(selectBoxFake, 'open');
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
            selectBoxOptionIndexCurrent = -1;
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
        let selectBoxOptionValue = getAttribute(selectBoxItem, 'value'),
            selectBoxOptionText = getText(selectBoxItem),
            selectBoxFakeOption = setElement('a', selectBoxOptionText, {
                'tabindex': -1
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
            setEvent('click', selectBoxFakeOption, onSelectBoxFakeOptionClick);
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
        // let selectBox = getSelectBox(selectBoxFake),
        //     selectBoxFakeDropDown = getSelectBoxFakeDropDown(selectBoxFake),
        //     selectBoxFakeBorderTopWidth = W.parseInt(getStyle(selectBoxFake, 'border-top-width'), 10),
        //     selectBoxFakeBorderBottomWidth = W.parseInt(getStyle(selectBoxFake, 'border-bottom-width'), 10);
        // if (!selectBox.size) {
        //     let {height, left, top, width} = selectBoxFake.getBoundingClientRect(),
        //         heightWindow = W.innerHeight,
        //         heightMax = heightWindow - top - height;
        //     selectBoxFakeDropDown.style.top = (top + height - selectBoxFakeBorderTopWidth) + 'px';
        //     selectBoxFakeDropDown.style.bottom = "";
        //     selectBoxFakeDropDown.style.left = left + 'px';
        //     selectBoxFakeDropDown.style.width = width + 'px';
        //     selectBoxFakeDropDown.style.maxHeight = heightMax + 'px';
        //     if (heightMax < (heightWindow - height) / 2) {
        //         heightMax = top;
        //         selectBoxFakeDropDown.style.top = "";
        //         selectBoxFakeDropDown.style.bottom = (heightWindow - top - selectBoxFakeBorderBottomWidth) + 'px';
        //         selectBoxFakeDropDown.style.maxHeight = (heightMax + 1) + 'px';
        //         selectBoxFakeDropDown.classList.add('up');
        //     } else {
        //         selectBoxFakeDropDown.classList.remove('up');
        //     }
        // }
        // let selectBoxFakeOption = getSelectBoxFakeOptions(selectBoxFake).find(selectBoxFakeOption => {
        //     return selectBoxFakeOption.classList.contains('selected');
        // });
        // if (selectBoxFakeOption) {
        //     let height = selectBoxFakeOption.offsetHeight,
        //         heightParent = selectBoxFakeDropDown.offsetHeight,
        //         top = selectBoxFakeOption.offsetTop,
        //         topScroll = selectBoxFakeDropDown.scrollTop;
        //     if (top < topScroll) {
        //         selectBoxFakeDropDown.scrollTop = top;
        //     } else if (top + height - heightParent > topScroll) {
        //         selectBoxFakeDropDown.scrollTop = top + height - heightParent;
        //     }
        // }
    }

    if (selectBox.disabled) {
        setClass(selectBoxFake, 'dead');
    } else {
        setEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
        setEvent('click', selectBoxFake, onSelectBoxFakeClick);
        setEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
        setEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
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
    onEvent('focus', selectBox, onSelectBoxFocus);
    onEvent('change', selectBox, onSelectBoxChange);
    onEvent('input', selectBox, onSelectBoxInput);

    if (selectBoxMultiple) {
        // TODO
    }

    if (selectBoxSize) {
        // Force `open` class
        setClass(selectBoxFake, 'open');
    }

    $.get = () => getValue();

    $.option = null;
    $.options = {};

    $.pop = () => {
        if (!source[name]) {
            return $; // Already ejected
        }
        delete source[name];
        offEvent('focus', selectBox, onSelectBoxFocus);
        offEvent('change', selectBox, onSelectBoxChange);
        offEvent('input', selectBox, onSelectBoxInput);
        letClass(selectBox, className + '-source');
        offEvent('blur', selectBoxFake, onSelectBoxFakeBlur);
        offEvent('click', selectBoxFake, onSelectBoxFakeClick);
        offEvent('focus', selectBoxFake, onSelectBoxFakeFocus);
        offEvent('keydown', selectBoxFake, onSelectBoxFakeKeyDown);
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
    'class': 'option-picker'
};

OP.version = '%(version)';

export default OP;
