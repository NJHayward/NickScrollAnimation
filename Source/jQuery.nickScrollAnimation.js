/*
 *  Created by Nick
 *  Created 9-Jul-2020
 */

class nickScrollAnimationType {
    static get NA_BounceScale() { return "bounceScale"; }
    static get NA_LargenScale() { return "largenScale"; }
    static get NA_SlideFromRight() { return "SlideFromRight"; }
    static get NA_SlideFromLeft() { return "SlideFromLeft"; }
    static get NA_SlideFromBottom() { return "slideFromBottom"; }
    static get NA_SlideFromLeftDelayed() { return "SlideFromLeftDelay"; }
    static get NA_SlideFromRightDelayed() { return "SlideFromRightDelay"; }
}

/*
 * must be called in the <head> if it is being used file to make elements invisible before the DOM loads.
 * 
 * AnimationFields Array Syntax should be:
 
    AnimationFields: new Array(
        [ElementSelector, NickScrollAnimationType, AnimationTime, MaxWidthToPerform, MinWidthToPerform, IncrementAmount]
    )

    AnimationFields: new Array(
        [String, String, Integer, Optional Integer, Optional Integer, Optional Integer]
    )

    e.g.
        jQuery(document).nickScrollAnimation({
            StartDelay: 500,
            PercentageFromBottom: 20,
            DoOnLoadAnimations: true,
            AnimationFields: new Array(
                ["#landingContent", nickScrollAnimationType.NA_BounceScale, 1],
                ["#aboutSkillsCenter", nickScrollAnimationType.NA_SlideFromLeftDelayed, 1, 660],
                ["#aboutSkillsCenter", nickScrollAnimationType.NA_LargenScale, 1, null, 661],
                [".projectTile", nickScrollAnimationType.NA_BounceScale, 1, null, null, 0.4]
            )
        });
 */
(function ($) {
    $.fn.nickScrollAnimation = function (settings) {

        //initialise initial vars
        //var thisObj;

        //default config vars
        var defaultStartDelay = 500;
        var defaultPercentageFromBottom = 20;
        var defaultDoOnLoadAnimations = true;
        var defaultAnimationFields = new Array();

        //setup key vars
        //thisObj = jQuery(this);

        //setup config settings
        var config = {
            StartDelay: defaultStartDelay,
            PercentageFromBottom: defaultPercentageFromBottom,
            DoOnLoadAnimations: defaultDoOnLoadAnimations,
            AnimationFields: JSON.parse(JSON.stringify(defaultAnimationFields))
        };
        if (settings) $.extend(true, config, settings);
        CheckConfig();

        //hide elements initially (this is done before checking as the DOM may not have loaded yet)
        HideElements();
        CheckElements();

        //implement start delay.  this will delay the handling of animations for the given time.   usually good for google font loading.
        setTimeout(function () {
            //setup the scroll watcher to perform the animations as the page is scrolled
            SetupAnimations();

            //if config says so, perform aniumatiosn for anythign in range when the page loads
            if (config.DoOnLoadAnimations) {
                jQuery(document).ready(function () {
                    PerformAnimations();
                });
            }
        }, config.StartDelay);

        function CheckConfig() {
            //Check each setting for nulls or incorrect type and if so we will put them back to default so we can trust them

            //check StartTimeout is a number
            if (config.StartDelay === null || typeof config.StartDelay !== "number") {
                config.StartDelay = defaultStartDelay;
            }

            //check PercentageFromBottom is a number
            if (config.PercentageFromBottom === null || typeof config.PercentageFromBottom !== "number") {
                config.PercentageFromBottom = defaultPercentageFromBottom;
            }

            //check PercentageFromBottom is a number
            if (config.DoOnLoadAnimations === null || typeof config.DoOnLoadAnimations !== "boolean") {
                config.DoOnLoadAnimations = defaultDoOnLoadAnimations;
            }

            //check animation fields data..  in this case as returning to default will stop all workign if the arrays are specified incorrectly we will remove the item that is incorrect and carry on.
            if (config.AnimationFields === null || typeof config.AnimationFields !== "object") {
                config.AnimationFields = JSON.parse(JSON.stringify(defaultAnimationFields));
            }
            else {
                //check the arrays members are also objects.
                for (var i = 0; i < config.AnimationFields.length; i++) {
                    var fieldData = config.AnimationFields[i];

                    //check we have the object and that object has between 3 to 6 children
                    if (fieldData === null || typeof fieldData !== "object" || (fieldData.length < 3 || fieldData.length > 6)) {
                        //remove item it is wrong
                        RemoveAnimationField(i);
                        continue;
                    }

                    //check the children are strings and option values are either null or numbers
                    for (var j = 0; j < fieldData.length; j++) {
                        if (j === 2) {
                            //if its the third entry we will need it as an integer
                            if (typeof fieldData[j] !== "number") {
                                //remove item it is wrong
                                RemoveAnimationField(i);
                                break;
                            }
                        }
                        else if (j >= 3) {
                            //if its the 4th or 5th or 6th (above is -1 as it is an index) entry we will need it as null or a number.  this is an optional param that if it is there is should be a number.
                            if (fieldData[j] !== null && typeof fieldData[j] !== "number") {
                                //remove item it is wrong
                                RemoveAnimationField(i);
                                break;
                            }
                        }
                        else
                        {
                            if (typeof fieldData[j] !== "string") {
                                //remove item it is wrong
                                RemoveAnimationField(i);
                                break;
                            }
                        }
                    }
                }
            }
        }

        /* This will Hide any elements on the page.  Will hide them before the DOM loads if nickScrollAnimation called within the head tag. */
        function HideElements() {
            var idList = new Array();

            //go thru each element and try to hide
            for (var i = 0; i < config.AnimationFields.length; i++) {
                //add to list
                idList.push(config.AnimationFields[i][0]);
            }

            if (idList.length > 0) {
                var cssToInject = "";
                //loop the ids so we can deal with them individually creating css rules for each one.  this way if there is somthing wrong with one it wont effect the others.
                for (var x = 0; x < idList.length; x++) {
                    //as is outside text being written into object model.. make sure the html tags cant be manipulated in anyway.
                    //i beleive it is protected anyway as it is a created object being appended... but just in case.  
                    //if the user was to load the ids from a querystring this would possibly stop cross site scripting.
                    var idToInject = escape(idList[x]).replace(/%23/g, "#");//.replace(/>/g, "&gt;").replace(/</g, "&lt;"); 
                    cssToInject = cssToInject + idToInject + " { visibility: hidden; }\r\n";
                }

                //inject the css to the end of the head tag
                var sheet = document.createElement('style');
                sheet.innerHTML = cssToInject;
                document.head.appendChild(sheet);
            }
        }

        function CheckElements() {
            //check each element and remove it from the list if it doesnt actually exist, as we are looking for the actual element we must do it when DOM has loaded.
            jQuery(document).ready(function () {
                for (var i = 0; i < config.AnimationFields.length; i++) {
                    var exists = false;

                    try {
                        var elmCheck = jQuery(config.AnimationFields[i][0]);
                        if (elmCheck.length > 0) {
                            exists = true;
                        }
                    }
                    catch (err) {
                        //we can have js errors if the selector is wrong syntax, we will ignore as we want it to keep working but without that item.
                    }

                    if (!exists) {
                        //it doesnt exist, remove from array so we no longer deal with it
                        RemoveAnimationField(i);
                    }
                }
            });
        }

        function SetupAnimations() {
            //perform only when document is ready
            jQuery(document).ready(function () {
                //perform when the user scrolls
                jQuery(document).scroll(function () {
                    PerformAnimations();
                });
            });
        }

        function PerformAnimations() {
            //loop through the Animation fields and see if they are in range to perform animation
            for (var i = 0; i < config.AnimationFields.length; i++) {
                var curElms = jQuery(config.AnimationFields[i][0]);
                var animationType = config.AnimationFields[i][1]; //this is a string that can be created outside of our control so it will not be written directly into the css... this is done witha  token instead.
                var animationTime = config.AnimationFields[i][2]; //we know this is a number so we can write it directly the the css

                //we have optional parameters.
                //check for MaxWidth and if it is present.. if we have a max width check we are in the area to execute this animation.
                if (config.AnimationFields[i].length >= 4) {
                    var MaxWidth = config.AnimationFields[i][3];
                    if (MaxWidth !== null && window.innerWidth > MaxWidth) {
                        continue;
                    }
                }
                //check for MinWidth and if it is present.. if we have a min width check we are in the area to execute this animation.
                if (config.AnimationFields[i].length >= 5) {
                    var MinWidth = config.AnimationFields[i][4];
                    if (MinWidth !== null && window.innerWidth < MinWidth) {
                        continue;
                    }
                }

                //check for increment amount optional parameter.  this will only apply when there is more then one object for this animationfield...
                //it will increment the animation time by this amount each object it finds ready for animation..
                var incrementAmount = 0;
                if (config.AnimationFields[i].length >= 6) {
                    incrementAmount = config.AnimationFields[i][5];
                }

                //the element could be multiple elements so loop through each one and set the animation specified if it is ready for it.
                curElms.each(function () {
                    var curElm = jQuery(this);

                    //make sure current element isnt already visible and that it is in range
                    if (IsReadyForAnim(curElm) && curElm.css("visibility") === "hidden") {

                        //check the type of animation
                        switch (animationType) {
                            case nickScrollAnimationType.NA_BounceScale:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'bounceScale ' + animationTime + 's',
                                    '-moz-animation': 'bounceScale ' + animationTime + 's',
                                    '-ms-animation': 'bounceScale ' + animationTime + 's',
                                    '-o-animation': 'bounceScale ' + animationTime + 's',
                                    'animation': 'bounceScale ' + animationTime + 's'
                                });
                                break;
                            case nickScrollAnimationType.NA_LargenScale:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'largenScale ' + animationTime + 's',
                                    '-moz-animation': 'largenScale ' + animationTime + 's',
                                    '-ms-animation': 'largenScale ' + animationTime + 's',
                                    '-o-animation': 'largenScale ' + animationTime + 's',
                                    'animation': 'largenScale ' + animationTime + 's'
                                });
                                break;
                            case nickScrollAnimationType.NA_SlideFromRight:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'SlideFromRight ' + animationTime + 's',
                                    '-moz-animation': 'SlideFromRight ' + animationTime + 's',
                                    '-ms-animation': 'SlideFromRight ' + animationTime + 's',
                                    '-o-animation': 'SlideFromRight ' + animationTime + 's',
                                    'animation': 'SlideFromRight ' + animationTime + 's'
                                });
                                break;
                            case nickScrollAnimationType.NA_SlideFromLeft:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'SlideFromLeft ' + animationTime + 's',
                                    '-moz-animation': 'SlideFromLeft ' + animationTime + 's',
                                    '-ms-animation': 'SlideFromLeft ' + animationTime + 's',
                                    '-o-animation': 'SlideFromLeft ' + animationTime + 's',
                                    'animation': 'SlideFromLeft ' + animationTime + 's'
                                });
                                break;
                            case nickScrollAnimationType.NA_SlideFromBottom:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'slideFromBottom ' + animationTime + 's',
                                    '-moz-animation': 'slideFromBottom ' + animationTime + 's',
                                    '-ms-animation': 'slideFromBottom ' + animationTime + 's',
                                    '-o-animation': 'slideFromBottom ' + animationTime + 's',
                                    'animation': 'slideFromBottom ' + animationTime + 's'
                                });
                                break;
                            case nickScrollAnimationType.NA_SlideFromLeftDelayed:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'SlideFromLeftDelay ' + animationTime + 's',
                                    '-moz-animation': 'SlideFromLeftDelay ' + animationTime + 's',
                                    '-ms-animation': 'SlideFromLeftDelay ' + animationTime + 's',
                                    '-o-animation': 'SlideFromLeftDelay ' + animationTime + 's',
                                    'animation': 'SlideFromLeftDelay ' + animationTime + 's'
                                });
                                break;
                            case nickScrollAnimationType.NA_SlideFromRightDelayed:
                                curElm.css({
                                    'visibility': 'visible',
                                    '-webkit-animation': 'SlideFromRightDelay ' + animationTime + 's',
                                    '-moz-animation': 'SlideFromRightDelay ' + animationTime + 's',
                                    '-ms-animation': 'SlideFromRightDelay ' + animationTime + 's',
                                    '-o-animation': 'SlideFromRightDelay ' + animationTime + 's',
                                    'animation': 'SlideFromRightDelay ' + animationTime + 's'
                                });
                                break;
                            default:
                                break;
                        }

                        //there may be other elements part of this animation field (selecting by classname) so increment the animationTime by the specified amount.
                        //this will be zero if nothing is set in there config when setting this up.
                        animationTime = animationTime + incrementAmount;
                    }
                });
            }
        }

        function IsReadyForAnim(elm) {
            var topOfScreen = jQuery(window).scrollTop();
            var bottomOfScreen = topOfScreen + jQuery(window).height();
            var delayAnimFooter = jQuery(window).height() * (config.PercentageFromBottom / 100);

            var topOfElm = elm.offset().top;
            var bottomOfElm = topOfElm + elm.height();

            //if the element is within the percentage from bottom limit.. load it.
            if (topOfElm >= topOfScreen) {
                if (topOfElm <= (bottomOfScreen - delayAnimFooter)) {
                    return true;
                }
            }

            //if the elm is way if the top of screen but bottom is in the limit.
            if (topOfElm < topOfScreen && bottomOfElm > topOfScreen && bottomOfElm <= (bottomOfScreen - delayAnimFooter)) {
                return true;
            }

            //if the elm is way if the top of screen and bottom is off the bottom of the screen
            if (topOfElm < topOfScreen && bottomOfElm > (bottomOfScreen - delayAnimFooter)) {
                return true;
            }

            //if we have scrolled to the bottom of the page... load anything in the bottom 20% that wont be caught above.
            //if the elm in the bottom [PercentageFromBottom] of the document height?
            if ((jQuery(document).height() - delayAnimFooter) <= elm.position().top) {
                //and are we scrolled to the bottom of the page (-50 px as some phones dont quite go to the bottom)
                if (bottomOfScreen > (jQuery(document).height()-50)) {
                    return true;
                }
            }

            return false;
        }

        function RemoveAnimationField(fieldIndex) {
            //only deal with numbered indexs
            if (typeof fieldIndex !== "number") {
                return;
            }

            console.log("Animation field '" + config.AnimationFields[fieldIndex][0] + "' has detected errors and will be ignored. Check the syntax of the AnimationFields or that the object exists.");

            //it doesnt exist, remove from array so we no longer deal with it
            config.AnimationFields = config.AnimationFields.filter(function (elem) {
                return elem !== config.AnimationFields[fieldIndex];
            });
        }
    };
}(jQuery));