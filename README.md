getFeed
=======

jQuery plugin to replace a feed link with the feed

##Usage

Replace a feed link with a feed
```
$('.getfeed').getFeed();
...
<a href=”http://somesite.com/feed/” class=”getfeed”>The feed</a>
```

Replace a link with its data attribute set to point to the feed, with the feed
```
$('[data-getfeed]').getFeed();
...
<a href=”http://somesite.com/” data-getfeed=”http://somesite.com/feed/”>The blog</a>
```

##Advanced Usage
```javascript
$('[data-getfeed]').getFeed({options...}, callback...);
```

###Options
**replace**  
Replace the element with the output, defaults to true

**num**  
The  maximum number of items to display, defaults to 5

**i18n**  
Object to drop in custom internationalisation

**lang**  
The language to use, defaults to ‘en’
Out of the box the plugin provides only English and Gaeilge

**template**  
Name of the template to use defined within the plugin, defaults to ‘base’

**dateTemplate**  
Name of the date template to use defined within the plugin, default to ‘base’

**customTemplate**  
Drop in a custom template

**customDateTemplate**  
Drop in a custom date template to use for the date in the template

**namespace**  
The namespace for the plugin, affects the data attribute data-[ns]-src, class names in the template

###Callback
Called for each element when complete. Useful when not using the replace option: {replace:false}

##Examples
Use i18n to set English to use the months a, b, c… instead of January, February, March…
```javascript
$('[data-getfeed]').getFeed({i18n: {'en': {months:['a','b','c','d','e','f','g','h','i','j','k','l']}}});
Use a custom template and date template
$('[data-getfeed]').getFeed({
        customTemplate: '<div>{{#items}}<a{{href}}>{{title}}</a> {{#datetemplate}}{{/datetemplate}}{{/items}}</div>'
        ,customDateTemplate: '{{j}}'
});
});
```

Replace the getfeed-src element manually
```javascript
$('[data-getfeed]').getFeed({replace:false}, function() {
        var $this = $(this)
            ,$output = $this.data('getfeed-output')
        ;
        if ($output) {
            $output.replaceAll($this);
    });
});
```

Same as above but the second time after a delay of two seconds and using a custom template
```javascript
$('[data-getfeed]').getFeed({replace:false}, function() {
        var $this = $(this)
            ,$output = $this.data('getfeed-output')
        ;
        if ($output) {
            $output.replaceAll($this);
            setTimeout(function() {
                $output.getFeed({customTemplate:'<p>{{#items}}{{#last}} and {{/last}}<a{{href}}>{{title}}</a>{{#notlasttwo}}, {{/notlasttwo}}{{/items}}</p>'}, function() {
                    var $this = $(this)
                        ,$output = $this.data('getfeed-output')
                    ;
                    if ($output) {
                        $output.replaceAll($this);
                    }
                });
            }, 2000);
        }
});
```


