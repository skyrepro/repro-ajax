//----------------------------
// ajax-navigator.js
// Author: Navalex (Alexandre Navaro)
// Website: http://navalex.net
// Date: 05/16/2017
// Description: Allow an ajax navigation for any website, except form submitting
//----------------------------

(function ($) {
    jQuery.fn.internal_links = function() {
        var siteURL = "http://" + top.location.host.toString();

        var $internalLinks = $("a[href^='"+siteURL+"'], a[href^='/'], a[href^='./'], a[href^='../'], a[href^='#']");
        $internalLinks.each(function (e) {
            if ($(this).attr('rel') === undefined && $(this).attr('download') === undefined) {
                $(this).attr('rel', 'internal');
            }
        });
    };

    jQuery.ajax_navigator = function (options, callback) {
        var settings = $.extend({
            'page_container': '.content',
            'fadeOut': false,
            'fadeOutDuration': 0,
            'fadeIn': false,
            'fadeInDuration': 0
        }, options);

        // Function to change
        var ajax_content_change = function(url) {
            $.ajax({
                url: url,
                // If the call success
                success: function (html) {
                    // Prepare content updating
                    var content = $(html).filter(settings.page_container).contents(),
                        title = $(html).filter('title').text()
                    ;

                    // Change page title
                    document.title = title;

                    // Push new link to history
                    window.history.pushState(null, '', url);

                    // Prepare fades disabled
                    if(!settings.fadeOut) { settings.fadeOutDuration = 0; }
                    if(!settings.fadeIn) { settings.fadeInDuration = 0; }

                    // Update content
                    $(settings.page_container).fadeOut(settings.fadeOutTimer, function (e) {
                        $(this).empty().append(content).fadeIn(settings.fadeInTimer, function (e) {
                            if (typeof callback == 'function') {
                                callback.call(this);
                            }
                        });

                        // Update links from ajax response
                        $(document).internal_links();
                    });
                }
            });
        };

        // Wait document loading
        $(document).ready(function() {
            // Run internal_links on actual document
            $(this).internal_links();

            // Detect internal links click
            $(document).on('click', 'a[rel="internal"]', function (e) {
                // Disable default click
                e.preventDefault();

                // Store link for ajax call
                var url = $(this).attr('href');

                // Create ajax call
                ajax_content_change(url);
            });

            $(window).on('popstate', function() {
                this._popStateEventCount++;

                console.log('popstate');

                ajax_content_change(window.location);
            });
        });
    };
})(jQuery);
