
$.fn.getFeed = function(o, callback) {
	
	'use strict';
	
	// Declare variables
	var ns
		,i18n
		,templates
		,dateTemplates
		,feedsrc
		,self
		,template
		,dateTemplate
		,vocab
		,dateTemplateMustacheFunc
    ;
	
	if ($.isFunction(o)) {
    	callback = o;
    	o = {};
	}

	// Default options
	o = $.extend({
		template: 'base'
		,dateTemplate: 'base'
		,num: 4
		,lang: 'en'
		,replace: true
	}, o);

    // Namespace
	ns = o.namespace || 'getfeed';
	
	// Internationalisation
	i18n = {
		en  : {
			months: ['January','February','March','April','May','June','July','August','September','October','November','December']
			,shortMonthsLength: 3
		}
		,ga: {
			months: ['Eanáir','Feabhra','Márta','Aibreán','Bealtaine','Meitheamh','Iúil','Lúnasa','Meán Fómhair','Deireadh Fómhair','Samhain','Nollaig']
			,shortMonthsLength: undefined // undefined is unshortened
		}
	};
	
	// Templates
	templates = {
		base: '<ul class="{{templateclass}}">'+
			'{{#items}}'+
				'<li>'+
					'<a{{href}}>'+
						'<div class="{{headerclass}}">{{title}}</div>'+
						'<div class="{{bodyclass}}">{{body}}</div>'+
						'<div class="{{footerclass}}"><span class="{{dateclass}}">{{#datetemplate}}{{/datetemplate}}</span></div>'+
					'</a>'+
				'</li>'+
			'{{/items}}'+
			'</ul>'
	};
	
	// Date Templates
	dateTemplates = {
		base: '<span class="{{monthclass}}">{{F}}</span> <span class="{{dayclass}}">{{j}}</span> <span class="{{yearclass}}">{{Y}}</span>'
	};
	
	// Feed source URL taken from data attribute
	feedsrc = ns;
	
	// Default to base if the wanted template does not exist
	if (templates[o.template] === undefined) {
		o.template = 'base';
	}
	
	// Default to base if the wanted date template does not exist
	if (dateTemplates[o.dateTemplate] === undefined) {
		o.dateTemplate = 'base';
	}
	
	// Allow extending of the i18n library through the options object passed in
	if (o.i18n) {
    	i18n = $.extend(i18n, o.i18n);
	}
    
    // Get the vocabulary to use based on the lang option passed in, defaults to English
	vocab = i18n[o.lang] === undefined ? i18n.en : i18n[o.lang];
	
	// Allow a custom template to be passed in
    template = o.customTemplate || templates[o.template];

    // Allow a custom date template to be passed in
    dateTemplate = o.customDateTemplate || dateTemplates[o.dateTemplate];
    
    dateTemplateMustacheFunc = function () {
		return function (text, render) {
			return render(dateTemplate);
		};
	};
	
	// Save this
	self = this;
	
	// Get down to it
	// Load up mustache.js, which is used for the templates
	return $.ajax({
            url: '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.2/mustache.min.js',
            dataType: "script"
        })
        .done(function() {
            
            self.each(function(i) {
			
				var $this = $(this)
				
				    // Get the feed src URL
					,q = $this.data(feedsrc) || $this.attr('href')
				;
				
				// If there is a feed src URL carry on
				if (q) {
				    // Use Google APIs to convert the RSS feed and return JSONP
					$.ajax({
						url: '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&q='+encodeURI(q)+'&num='+o.num
						,dataType: 'jsonp'
					})
					.done(function(d) {
						
						var status = d.responseStatus
							,$output
							,view = {
								items: []
                        		,headerclass: ns + '-header'
                        		,bodyclass: ns + '-body'
                        		,footerclass: ns + '-footer'
                        		,dateclass: ns + '-date'
                        		,dayclass: ns + '-day'
                        		,monthclass: ns + '-month'
                        		,yearclass: ns + '-year'
								,templateclass: ns + '-' + o.template
							}
							,entries
							,entriesLength
							,j
							,pdate
						;
						d = d.responseData;
						
						// Check we get a 200 ok, there is a feed object, the feed is rss20 (not tested with other types yet) and there are entries
						if (status === 200 && d.feed && d.feed.type === 'rss20' && d.feed.entries && d.feed.entries.length) {
							
							entries = d.feed.entries;
							entriesLength = entries.length;
							
							for (j = 0; j < entriesLength; j+=1) {
								
								// Grab the published date
								pdate = new Date(entries[j].publishedDate);
								
								// Create a view object for Mustache.js to do its job
								view.items[view.items.length] = {
									title: entries[j].title
									,content: entries[j].contentSnippet
									// Apply a separate Date Template
									,datetemplate: dateTemplateMustacheFunc
									// Set dates using the terminology in php.net/date
									,F: vocab.months[pdate.getMonth()]
									,M: vocab.months[pdate.getMonth()].slice(0,vocab.shortMonthsLength)
									,j: pdate.getDate()
									,Y: pdate.getFullYear()
									,last: j === entriesLength - 1
									,notlast: j !== entriesLength - 1
									,notlasttwo: entriesLength > 2 && j < entriesLength - 2
									
									// Create a href
									,href: entries[j].link ? ' href='+entries[j].link : ''
								};
								
							}
							
							// Create the output using Mustache.js and add the feed src URL to the output so it can be reused if needed
							$output = $(Mustache.render(template, view)).data(feedsrc, q);
							
							// If replace is true the current element is replaced with the output, otherwise the output is stored in data attribute
							if (o.replace) {
                                $this = $output.replaceAll($this);
							}
							else {
    							$this.data(ns + '-output', $output);
							}
							
						}
						
						// If callback is set call it
        				if (callback) {
        					callback.call($this[0], i);
        				}
        				
					});
				}
				else {
					// If callback is set call it
				    if (callback) {
					    callback.call($this[0], i);
				    }
				}
			});

        })
    ;
};