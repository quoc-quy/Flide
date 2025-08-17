function Flide(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error(`Flide: can not found container '${selector}'`);
        return;
    }

    this.opt = Object.assign(
        {
            items: 1,
            loop: false,
            speed: 300,
            nav: true,
            controls: true,
            controlsText: ["<", ">"],
            prevButton: null,
            nextButton: null,
            slideBy: 1,
            autoplay: false,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
        },
        options
    );

    this.originalSlides = Array.from(this.container.children);
    this.sliders = this.originalSlides.slice(0);
    this.currentIndex = this.opt.loop ? this._getCloneCount() : 0;

    this._init();
    this._updatePosition();
}

Flide.prototype._init = function () {
    this.container.classList.add("flide-wrapper");
    this._createContent();
    this._createTrack();

    const showNav = this._getSlideCount() > this.opt.items;

    if (this.opt.controls && showNav) {
        this._createControl();
    }

    if (this.opt.nav && showNav) {
        this._createNav();
    }

    if (this.opt.autoplay) {
        this._startAutoplay();

        if (this.opt.autoplayHoverPause) {
            this.container.onmouseenter = () => this._stopAutoplay();
            this.container.onmouseleave = () => this._startAutoplay();
        }
    }
};

Flide.prototype._startAutoplay = function () {
    if (this.autoplayTimer) return;

    const slideBy = this._getSlideBy();
    this.autoplayTimer = setInterval(() => {
        this.moveSlide(slideBy);
    }, this.opt.autoplayTimeout);
};

Flide.prototype._stopAutoplay = function () {
    clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
};

Flide.prototype._createContent = function () {
    this.content = document.createElement("div");
    this.content.className = "flide-content";
    this.container.appendChild(this.content);
};

Flide.prototype._getCloneCount = function () {
    const slideCount = this._getSlideCount();

    if (slideCount <= this.opt.items) return 0;

    const slideBy = this._getSlideBy();
    const cloneCount = slideBy + this.opt.items;

    return cloneCount > slideCount ? slideCount : cloneCount;
};

Flide.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("flide-track");

    const cloneCount = this._getCloneCount();
    if (this.opt.loop && cloneCount > 0) {
        const cloneHead = this.sliders
            .slice(-cloneCount)
            .map((node) => node.cloneNode(true));
        const cloneTail = this.sliders
            .slice(0, cloneCount)
            .map((node) => node.cloneNode(true));

        this.sliders = cloneHead.concat(this.sliders.concat(cloneTail));
    }

    this.sliders.map((slider) => {
        slider.classList.add("flide-slide");
        slider.style.flexBasis = `calc(100% / ${this.opt.items})`;
        this.track.appendChild(slider);
    });
    this.content.appendChild(this.track);
};

Flide.prototype._createControl = function () {
    this.btnPrev = this.opt.prevButton
        ? document.querySelector(this.opt.prevButton)
        : document.createElement("button");
    this.btnNext = this.opt.nextButton
        ? document.querySelector(this.opt.nextButton)
        : document.createElement("button");

    if (!this.opt.prevButton) {
        this.btnPrev.innerHTML = this.opt.controlsText[0];
        this.btnPrev.classList.add("flide-prev");
        this.content.append(this.btnPrev);
    }

    if (!this.opt.nextButton) {
        this.btnNext.innerHTML = this.opt.controlsText[1];
        this.btnNext.classList.add("flide-next");
        this.content.append(this.btnNext);
    }
    const slideBy = this._getSlideBy();

    this.btnPrev.onclick = () => this.moveSlide(-slideBy);
    this.btnNext.onclick = () => this.moveSlide(slideBy);
};

Flide.prototype.moveSlide = function (step) {
    if (this._isAnimating) return;
    this._isAnimating = true;

    const maxIndex = this.sliders.length - this.opt.items;

    this.currentIndex = Math.min(
        Math.max(this.currentIndex + step, 0),
        maxIndex
    );

    setTimeout(() => {
        if (this.opt.loop) {
            if (this.currentIndex < this._getCloneCount()) {
                this.currentIndex += this._getSlideCount();
                this._updatePosition(true);
            } else if (this.currentIndex > this._getSlideCount()) {
                this.currentIndex -= this._getSlideCount();
                this._updatePosition(true);
            }
        }
        this._isAnimating = false;
    }, this.opt.speed);

    this._updatePosition();
};

Flide.prototype._getSlideBy = function () {
    return this.opt.slideBy === "page" ? this.opt.items : this.opt.slideBy;
};

Flide.prototype._getSlideCount = function () {
    return this.originalSlides.length;
};

Flide.prototype._createNav = function () {
    this.navWrapper = document.createElement("div");
    this.navWrapper.classList.add("flide-nav");

    const slideCount = this._getSlideCount();

    const pageCount = Math.ceil(slideCount / this.opt.items);

    for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement("button");
        dot.className = "flide-dot";

        if (i === 0) dot.classList.add("active");

        dot.onclick = () => {
            this.currentIndex = this.opt.loop
                ? i * this.opt.items + this._getCloneCount()
                : i * this.opt.items;
            this._updatePosition();
        };

        this.navWrapper.appendChild(dot);
    }

    this.container.appendChild(this.navWrapper);
};

Flide.prototype._updateNav = function () {
    if (!this.navWrapper) return;
    let realIndex = this.currentIndex;

    if (this.opt.loop) {
        const slideCount = this._getSlideCount();
        realIndex =
            (this.currentIndex - this._getCloneCount() + slideCount) %
            slideCount;
    }

    const pageIndex = Math.floor(realIndex / this.opt.items);

    const dots = Array.from(this.navWrapper.children);
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === pageIndex);
    });
};

Flide.prototype._updatePosition = function (instant = false) {
    this.track.style.transition = instant
        ? "none"
        : `transform ease ${this.opt.speed}ms`;
    this.offset = -(this.currentIndex * (100 / this.opt.items));
    this.track.style.transform = `translateX(${this.offset}%)`;

    if (this.opt.nav && !instant) {
        this._updateNav();
    }
};
