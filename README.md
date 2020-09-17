# NickScrollAnimation
Easy to use animation effect while scrolling down a page.  A simple way to make your website look awesome with very little effort.

# Usage

jQuery call must be in the header otherwise elements may be visible for a millisecond whent he page loads.
```jsx
$(document).nickScrollAnimation({
    StartDelay: 1500,
    PercentageFromBottom:20,
    DoOnLoadAnimations: true,
    AnimationFields: new Array(
        /*standard animations */
        ["#BounceScale", nickScrollAnimationType.NA_BounceScale, 1],
        ["#LargenScale", nickScrollAnimationType.NA_LargenScale, 1],
        ["#SlideFromBottom", nickScrollAnimationType.NA_SlideFromBottom, 1],
        ["#SlideFromRight", nickScrollAnimationType.NA_SlideFromRight, 1],
        ["#SlideFromLeft", nickScrollAnimationType.NA_SlideFromLeft, 1],
        /*incremental animations */
        [".incrementalSlideSelector", nickScrollAnimationType.NA_SlideFromLeft, 1, null, null, 1.0],
        [".incrementalBounceSelector", nickScrollAnimationType.NA_BounceScale, 1, null, null, 0.5],
    )
});
```

```html
<div>
    <div id="BounceScale">
        BounceScale
    </div>
    <div id="LargenScale">
        LargenScale
    </div>
    <div id="SlideFromBottom">
        SlideFromBottom
    </div>
    <div id="SlideFromRight">
        SlideFromRight
    </div>
    <div id="SlideFromLeft">
        SlideFromLeft
    </div>
</div>
<br />
<p>Incremental animations (refresh the page while here too see this better, good for menus)</p>
<div>
    <div class="incrementalSlideSelector">
        SlideFromLeft1
    </div>
    <div class="incrementalSlideSelector">
        SlideFromLeft2
    </div>
    <div class="incrementalSlideSelector">
        SlideFromLeft3
    </div>
    <div class="incrementalSlideSelector">
        SlideFromLeft4
    </div>
    <div class="incrementalSlideSelector">
        SlideFromLeft5
    </div>
    <div class="incrementalBounceSelector">
        Bounce1
    </div>
    <div class="incrementalBounceSelector">
        Bounce2
    </div>
    <div class="incrementalBounceSelector">
        Bounce3
    </div>
    <div class="incrementalBounceSelector">
        Bounce4
    </div>
    <div class="incrementalBounceSelector">
        Bounce5
    </div>
</div>
```

# Animations

| Animation |
| --- |
|nickScrollAnimationType.NA_BounceScale|
|nickScrollAnimationType.NA_LargenScale|
|nickScrollAnimationType.NA_SlideFromBottom|
|nickScrollAnimationType.NA_SlideFromRight|
|nickScrollAnimationType.NA_SlideFromLeft|


# Animations Field parameters

AnimationFields: new Array(
    [ElementSelector, NickScrollAnimationType, AnimationTime, MaxWidthToPerform, MinWidthToPerform, IncrementAmount]
)

ElementSelector :  the selector for the element  e.g  #myeleId or .myEleClass
NickScrollAnimationType : the animation effect wanted, see above section
AnimationTime: length of time for the animation to perform
MaxWidthToPerform: If set will only perform the animation when below this width.  good for alternate animations in mobile views
MinWidthToPerform: If set will only perform the animation when above this width.  good for animations in non mobile views
IncrementAmount: used when selecting multiple elements with class selector.  Increase the animation time by this amount when animating each element.  good for a menu that seems to fold out one after the other.
