( function () {
  'use strict';

  /**
   * Infinite carousel using the clone trick:
   *
   *   DOM order: [ clone-set ] [ real slides ] [ clone-set ]
   *
   * The viewport starts at the first real slide. When the user
   * scrolls into either clone zone, we instantly teleport back to
   * the matching real slide so the loop is seamless.
   *
   * Arrow clicks and auto-scroll drive navigation; CSS scroll-snap
   * handles the per-card alignment on both pointer and touch input.
   */
  function initCarousel( root ) {
    var viewport = root.querySelector( '.vh-tag-carousel__viewport' );
    var track    = root.querySelector( '.vh-tag-carousel__track' );
    var prevBtn  = root.querySelector( '.vh-tag-carousel__arrow--prev' );
    var nextBtn  = root.querySelector( '.vh-tag-carousel__arrow--next' );

    if ( ! viewport || ! track || ! prevBtn || ! nextBtn ) return;

    var originals = Array.from(
      track.querySelectorAll( '.vh-tag-carousel__card' )
    );
    var count = originals.length;

    if ( count < 2 ) return;

    // --- Build clone sets ---
    // Prepend: insert in reversed order so final DOM order is A B C … (matching originals)
    originals
      .slice()
      .reverse()
      .forEach( function ( card ) {
        var clone = card.cloneNode( true );
        clone.setAttribute( 'aria-hidden', 'true' );
        clone.removeAttribute( 'id' );
        track.insertBefore( clone, track.firstChild );
      } );

    // Append: forward order
    originals.forEach( function ( card ) {
      var clone = card.cloneNode( true );
      clone.setAttribute( 'aria-hidden', 'true' );
      clone.removeAttribute( 'id' );
      track.appendChild( clone );
    } );

    // After cloning:
    //   indices 0 … count-1        → clone set (mirrors end)
    //   indices count … 2*count-1  → real slides
    //   indices 2*count … 3*count-1 → clone set (mirrors start)
    var realStart = count;
    var realEnd   = count * 2 - 1;

    // Distance between card leading edges (card width + gap)
    function getCardStep() {
      var cards = track.querySelectorAll( '.vh-tag-carousel__card' );
      if ( cards.length < 2 ) return cards[ 0 ] ? cards[ 0 ].offsetWidth : 0;
      var r0 = cards[ 0 ].getBoundingClientRect();
      var r1 = cards[ 1 ].getBoundingClientRect();
      return r1.left - r0.left;
    }

    // Jump without scroll-snap interference
    function scrollInstant( left ) {
      var saved = viewport.style.scrollSnapType;
      viewport.style.scrollSnapType = 'none';
      viewport.scrollLeft = left;
      requestAnimationFrame( function () {
        requestAnimationFrame( function () {
          viewport.style.scrollSnapType = saved;
        } );
      } );
    }

    function initPosition() {
      scrollInstant( getCardStep() * realStart );
    }

    requestAnimationFrame( initPosition );

    // Re-anchor on resize so position doesn't drift
    var resizeTimer;
    window.addEventListener( 'resize', function () {
      clearTimeout( resizeTimer );
      resizeTimer = setTimeout( initPosition, 150 );
    } );

    function currentIndex() {
      var step = getCardStep();
      return step > 0 ? Math.round( viewport.scrollLeft / step ) : realStart;
    }

    // Teleport back to the real slide that matches the current clone
    function checkLoop() {
      var idx  = currentIndex();
      var step = getCardStep();
      if ( idx < realStart ) {
        scrollInstant( viewport.scrollLeft + step * count );
      } else if ( idx > realEnd ) {
        scrollInstant( viewport.scrollLeft - step * count );
      }
    }

    var loopTimer;
    var isScrolling = false;

    // scrollend is the cleanest hook; debounced scroll covers older browsers
    viewport.addEventListener( 'scrollend', function () {
      isScrolling = false;
      checkLoop();
    } );

    viewport.addEventListener(
      'scroll',
      function () {
        clearTimeout( loopTimer );
        loopTimer = setTimeout( function () {
          isScrolling = false;
          checkLoop();
        }, 160 );
      },
      { passive: true }
    );

    function scrollToIndex( idx ) {
      if ( isScrolling ) return;
      isScrolling = true;
      viewport.scrollTo( { left: getCardStep() * idx, behavior: 'smooth' } );
    }

    function goNext() { scrollToIndex( currentIndex() + 1 ); }
    function goPrev() { scrollToIndex( currentIndex() - 1 ); }

    nextBtn.addEventListener( 'click', function () { pauseAuto(); goNext(); } );
    prevBtn.addEventListener( 'click', function () { pauseAuto(); goPrev(); } );

    // --- Auto-scroll ---
    var autoTimer   = null;
    var resumeTimer = null;

    function startAuto() {
      if ( autoTimer ) return;
      autoTimer = setInterval( goNext, 4000 );
    }

    function stopAuto() {
      clearInterval( autoTimer );
      autoTimer = null;
    }

    // After user interaction, wait 8 s before resuming
    function pauseAuto() {
      stopAuto();
      clearTimeout( resumeTimer );
      resumeTimer = setTimeout( startAuto, 8000 );
    }

    root.addEventListener( 'mouseenter', stopAuto );
    root.addEventListener( 'mouseleave', startAuto );
    viewport.addEventListener( 'touchstart', pauseAuto, { passive: true } );

    // Respect prefers-reduced-motion
    var reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );

    if ( ! reducedMotion.matches ) {
      startAuto();
    }

    reducedMotion.addEventListener( 'change', function ( e ) {
      if ( e.matches ) {
        stopAuto();
      } else {
        startAuto();
      }
    } );
  }

  document
    .querySelectorAll( '.vh-tag-carousel' )
    .forEach( initCarousel );
} )();
