# jQuery plugin for flexible input arrows
Creates arrows for incrementing and decrementing input value

## Options
* `min` `{Number}` - minimum value (default: `0`)
* `max` `{Number}` - maximum value (default: `Infinity`)
* `step` `{Number}` - change step (default: `1`)
* `emptyOnMin` `{Boolean}` - set empty string instead of minimum value (default: `false`)
* `renderPrev` `{Function}` - rendering previous arrow; context: `InputArrow` instance; arguments: `HTMLInputElement`, return `jQuery-element` (default: drawing `span` before the `HTMLInputElement`)
* `renderNext` `{Function}` - rendering next arrow; context: `InputArrow` instance; arguments: `HTMLInputElement`, return `jQuery-element` (default: drawing `span` after the `HTMLInputElement`)
* `encodeValue` `{Function}` - extra parsing value from `HTMLInputElement` (i. e., for cutting extra string or formatting) (default: `null`)
* `decodeValue` `{Function}` - extra processing value before setting in `HTMLInputElement` (i. e., for adding extra string or formatting) (default: `null`)
* `onChange` `{Function}` - handler for changings value; context: `InputArrow` instance, arguments: `newValue`, `oldValue` (default: `null`)
* `onIterate` `{Function}` - handler for each iteartion step (during fluent change); context: `InputArrow` instance, arguments: `newValue`, `oldValue` (default: `null`)
* `disabledClassName` `{String}` - additional className for arrows when the value cannot be decremented or incremented (default: `inputarrow-disabled`)
* `comma` `{Boolean}` - use comma instead of dot for real numbers (default: `false`)
* `gradientFactor` `{Number}` - factor for increasing coefficient for fluent mode; must be `> 1` (default: `1.1`)
* `gradientDefault` `{Number}` - default coefficient for fluent mode; must be `>= 1` (default: `1`)
* `gradientMax` `{Number}` - maximum coefficient for fluent mode; must be `>= 1` (default: `20`)
* `delay` `{Number}` - delay between touching arrow and starting fluent mode (default: `300`)
* `interval` `{Number}` - interval between iterations in fluent mode (default: `120`)

## Methods

### count
Single increment or decrement value
`@param` `{number}` Coefficient (-1 for decrementing, +1 for incrementing)
Example: `$('input').inputarrow('count', 1)`

### startCounting
Start fluent incrementing or decrementing value
`@param` `{number}` Coefficient (-1 for decrementing, +1 for incrementing)
Example: `$('input').inputarrow('startCounting', 1)`

### stopCounting
Stop fluent incrementing or decrementing value
Example: `$('input').inputarrow('stopCounting')`

### getValue
Get value from input
`@return` `{number}` The value
Example: `var value = $('input').inputarrow('getValue')`

### setValue
Set value for input
`@param` `{number}` The value
Example: `$('input').inputarrow('setValue', 1)`

### fit
Fit the input value for current constraints (min, max)
Example: `$('input').inputarrow('fit')`

### check
Check arrows for availability using min and max options
Example: `$('input').inputarrow('check')`

### destroy
Destroy all created elements and unbind connected events
Example: `$('input').inputarrow('destroy')`

## Examples
### Simple initialization
```
$('input').inputarrow()
```

### Initialization with options
```
$('input').inputarrow({
    min: 0,
    max: 100,
    step: 5,
    comma: true,
    emptyOnMin: true
})
```

### Initialization with custom rendering
```
$('input').inputarrow({
    renderPrev: function(input) {
        return $('<span class="custom-prev">prev</span>').insertBefore(input);
    },
    renderNext: function(input) {
        return $('<span class="custom-next">next</span>').insertAfter(input);
    },
    disabledClassName: 'custom-disabled'
});
```

### Initialization with custom value processing
```
$('input').inputarrow({
    encodeValue: function(value) {
        if (value === 'no bananas') {
            return 0;
        }
        return value.replace(/^(.*?)\sbananas?$/, '$1');
    },
    decodeValue: function(value) {
        if (value === 0) {
            return 'no bananas';
        }
        var unit = (value === 1) ? 'banana' : 'bananas';
        return value + ' ' + unit;
    },
    onChange: function(newValue, oldValue) {
        console.info('change from', oldValue, 'to', newValue);
    },
    onIterate: function(newValue, oldValue) {
        console.info('iterate from', oldValue, 'to', newValue);
    }
});
```
