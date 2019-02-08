/**
 * demo1.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2019, Codrops
 * http://www.codrops.com
 */
{
    const MathUtils = {
        lineEq: (y2, y1, x2, x1, currentVal) => {
            // y = mx + b 
            var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
            return m * currentVal + b;
        },
        lerp: (a, b, n) =>  (1 - n) * a + n * b
    };

    // Window size
    let winsize;
    const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};
    calcWinsize();
    window.addEventListener('resize', calcWinsize);

    const getMousePos = (ev) => {
        let posx = 0;
        let posy = 0;
        if (!ev) ev = window.event;
        if (ev.pageX || ev.pageY) {
            posx = ev.pageX;
            posy = ev.pageY;
        }
        else if (ev.clientX || ev.clientY) 	{
            posx = ev.clientX + body.scrollLeft + docEl.scrollLeft;
            posy = ev.clientY + body.scrollTop + docEl.scrollTop;
        }
        return {x: posx, y: posy};
    }
    // Track the mouse position
    let mousePos = {x: winsize.width/2, y: winsize.height/2};
    window.addEventListener('mousemove', ev => mousePos = getMousePos(ev));
    
    // Custom mouse cursor.
    class CursorFx {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.toggle = this.DOM.el.querySelector('.cursor__inner--circle');
            
            this.DOM.title = this.DOM.el.querySelector('.cursor__inner--text');
            this.bounds = {
                toggle: this.DOM.toggle.getBoundingClientRect(),
                title: this.DOM.title.getBoundingClientRect()
            };
            this.lastMousePos = {
                toggle: {x: mousePos.x - this.bounds.toggle.width/2, y: mousePos.y - this.bounds.toggle.height/2},
                title: {x: mousePos.x - this.bounds.title.width/2, y: mousePos.y - this.bounds.title.height/2}
            };
            this.lastScale = 1;
            this.lastOpacity = 1;
            requestAnimationFrame(() => this.render());
        }
        render() {
            // Mouse movement distance on the x-axis
            const diff = this.lastMousePos.toggle.x - (mousePos.x - this.bounds.toggle.width/2);
            // Check if mouse is on the right side of the viewport
            const rightSide = mousePos.x >= winsize.width/2;
            // Switch the side of the title element
            this.DOM.title.style.left = rightSide ? 'auto' : '30px';
            this.DOM.title.style.right = rightSide ? '30px' : 'auto';
            // The position of the title/toggle and the viewport side will determine the speed for both of these elements
            const lerpFactor = {
                toggle: rightSide ? diff < 0 ? 0.15 : 0.1 : diff < 0 ? 0.1 : 0.15,
                title: rightSide ? diff < 0 ? 0.1 : 0.15 : diff < 0 ? 0.15 : 0.1
            };
            // Update the mouse position values given the previous calculated lerp value
            this.lastMousePos.toggle.x = MathUtils.lerp(this.lastMousePos.toggle.x, mousePos.x - this.bounds.toggle.width/2, lerpFactor.toggle);
            this.lastMousePos.toggle.y = MathUtils.lerp(this.lastMousePos.toggle.y, mousePos.y - this.bounds.toggle.height/2, lerpFactor.toggle);
            this.lastMousePos.title.x = MathUtils.lerp(this.lastMousePos.title.x, mousePos.x - this.bounds.title.width/2, lerpFactor.title);
            this.lastMousePos.title.y = MathUtils.lerp(this.lastMousePos.title.y, mousePos.y - this.bounds.title.height/2, lerpFactor.title);
            // Also the scale and opacity values for the toggle
            this.lastScale = MathUtils.lerp(this.lastScale, 1, 0.15);
            this.lastOpacity = MathUtils.lerp(this.lastOpacity, 1, 0.1);
            // Apply the styles
            this.DOM.toggle.style.transform = `translateX(${(this.lastMousePos.toggle.x)}px) translateY(${this.lastMousePos.toggle.y}px) scale(${this.lastScale})`;
            this.DOM.toggle.style.opacity = this.lastOpacity;
            this.DOM.title.style.transform = `translateX(${(this.lastMousePos.title.x)}px) translateY(${this.lastMousePos.title.y}px)`;
            
            requestAnimationFrame(() => this.render());
        }
        setTitle(title) {
            // Sets the title content
            this.DOM.title.innerHTML = title;
        }
        click() {
            // Scales down and fades out the mouse toggle
            this.lastScale = .5;
            this.lastOpacity = 0;
        }
        toggle() {
            const isCircle = this.DOM.toggle.classList.contains('cursor__inner--circle');
            this.DOM.toggle.classList[isCircle ? 'remove' : 'add']('cursor__inner--circle');
            this.DOM.toggle.classList[isCircle ? 'add' : 'remove']('cursor__inner--cross');
            this.DOM.title.style.opacity = isCircle ? 0 : 1;
        }
    }

    const cursor = new CursorFx(document.querySelector('.cursor'));

    class Grid {
        constructor(el) {
            this.DOM = {el: el};
            // The grid element
            this.DOM.grid = this.DOM.el.querySelector('.grid');
            // Thr grid items
            this.DOM.items = [...this.DOM.grid.children];
            // totla number of grid items
            this.itemsTotal = this.DOM.items.length;
            // The content element ("behind" the grid)
            this.DOM.content = document.querySelector('.content');
            this.DOM.contentTitle = this.DOM.content.querySelector('.content__title');
            // Calculate heights of both the grid wrap and the grid, and also:
            // . the difference between them (then used for the grid/mousemove translation)
            // . the number of rows/columns 
            this.calculateSize();
            // The grid will be initially translated so it is in the center
            this.gridTranslation = {x: 0, y: -1*this.extraHeight/2};
            // Linear interpolation easing percentage (for the grid movement on mouse move)
            this.lerpFactor = 0.04;
            this.initEvents();
            requestAnimationFrame(() => this.render());
        }
        calculateSize() {
            // The height of the grid wrap
            this.height = this.DOM.el.offsetHeight;
            // The difference between the height of the grid wrap and the height of the grid. This is the amount we can translate the grid
            this.extraHeight = this.DOM.grid.offsetHeight - this.height;
            // Number of grid columns. The CSS variable --cell-number gives us the number of rows
            this.columns = this.itemsTotal/getComputedStyle(this.DOM.grid).getPropertyValue('--cell-number');
            // The animejs stagger function needs an array [cols,rows]
            this.gridDef = [this.columns, this.itemsTotal/this.columns];
        }
        initEvents() {
            // Window resize event 
            // The lerpFactor will change to 1 so theres no delay when translating the grid (or we would see the gaps on the top and bottom)
            window.addEventListener('resize', () => {
                this.lerpFactor = 1;
                // Recalculate..
                this.calculateSize();
                this.columns = this.itemsTotal/getComputedStyle(this.DOM.grid).getPropertyValue('--cell-number');
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => this.lerpFactor = 0.04, 250);
            });

            this.DOM.items.forEach((item, pos) => {
                // The item's title.
                const title = item.dataset.title;
                // Show the title next to the cursor.
                item.addEventListener('mouseenter', () => cursor.setTitle(title));
                item.addEventListener('click', () => {
                    // Position of the clicked item
                    this.pos = pos;
                    this.title = title;
                    // Start the effect and show the content behind
                    this.showContent();
                    // Force to show the title next to the cursor (it might not update because of the grid animation - the item under the mouse can be a different one than the one the user moved the mouse to)
                    cursor.setTitle(title);
                });
            });
            
            // Show back the grid.
            this.DOM.content.addEventListener('click', () => this.showGrid());
        }
        // This is where the main grid effect takes place
        // Animates the boxes out and reveals the content "behind"
        showContent() {
            if ( this.isAnimating ) {
                return false;
            }
            this.isAnimating = true;
            // Set the content background image and title
            this.DOM.content.style.backgroundImage = this.DOM.items[this.pos].querySelector('.grid__item-inner').style.backgroundImage.replace(/img/g, 'img/large');
            this.DOM.contentTitle.innerHTML = this.title;
            // Scales down and fades out the mouse toggle
            cursor.click();
            cursor.toggle();
            
            this.animation = anime({
                targets: this.DOM.items,
                duration: 20,
                easing: 'easeOutQuad',
                opacity: 0,
                delay: anime.stagger(70, {grid: this.gridDef, from: this.pos})
            });
            this.animation.finished.then(() => {
                // Pointer events class
                this.DOM.el.classList.add('grid-wrap--hidden');
                this.isAnimating = false;
            });

            /*
            // Animates the title
            anime({
                targets: this.DOM.contentTitle,
                duration: 1700,
                delay: 200,
                easing: 'easeOutExpo',
                opacity: [0,1],
                translateY: [50,0]
            });
            */
        }
        showGrid() {
            if ( this.isAnimating ) {
                return false;
            }
            this.isAnimating = true;
            cursor.click();
            cursor.toggle();
            this.DOM.el.classList.remove('grid-wrap--hidden');
            // Could have used the reverse() but there seems to be a bug (glitch)..
            this.animation = anime({
                targets: this.DOM.items,
                duration: 20,
                easing: 'easeOutQuad',
                opacity: [0,1],
                delay: anime.stagger(70, {grid: this.gridDef, from: this.pos, direction: 'reverse'})
            });
            this.animation.finished.then(() => this.isAnimating = false);
        }
        // Translate the grid when moving the mouse
        render() {
            // The translation will be either 0 or -1*this.extraHeight depending on the position of the mouse on the y-axis
            this.gridTranslation.y = MathUtils.lerp(this.gridTranslation.y, Math.min(Math.max(MathUtils.lineEq(-1*this.extraHeight, 0, this.height-this.height*.1, this.height*.1, mousePos.y), -1*this.extraHeight),0), this.lerpFactor);
            this.DOM.grid.style.transform = `translateY(${this.gridTranslation.y}px)`; 
            requestAnimationFrame(() => this.render());
        }
    }

    // Initialize the grid
    new Grid(document.querySelector('.grid-wrap'));

    // Preload all the images in the page
    imagesLoaded(document.querySelectorAll('.grid__item-inner, img'), {background: true}, () => document.body.classList.remove('loading'));
}