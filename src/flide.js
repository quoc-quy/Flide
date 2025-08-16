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
        },
        options
    );

    this.sliders = Array.from(this.container.children);
    this.currentIndex = this.opt.loop ? this.opt.items : 0;
    this._init();
    this._updatePosition();
}

Flide.prototype._init = function () {
    this.container.classList.add("flide-wrapper");
    this._createTrack();
    this._createNavigation();
};

Flide.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("flide-track");

    const cloneHead = this.sliders
        .slice(-this.opt.items)
        .map((node) => node.cloneNode(true));
    const cloneTail = this.sliders
        .slice(0, this.opt.items)
        .map((node) => node.cloneNode(true));

    this.sliders = cloneHead.concat(this.sliders.concat(cloneTail));

    this.sliders.map((slider) => {
        slider.classList.add("flide-slide");
        slider.style.flexBasis = `calc(100% / ${this.opt.items})`;
        this.track.appendChild(slider);
    });
};

Flide.prototype._createNavigation = function () {
    this.btnPrev = document.createElement("button");
    this.btnPrev.classList.add("flide-prev");
    this.btnPrev.innerHTML = "<";

    this.btnNext = document.createElement("button");
    this.btnNext.classList.add("flide-next");
    this.btnNext.innerHTML = ">";

    this.container.append(this.track, this.btnPrev, this.btnNext);

    this.btnPrev.onclick = () => this.moveSlide(-1);
    this.btnNext.onclick = () => this.moveSlide(1);
};

Flide.prototype.moveSlide = function (step) {
    if (this._isAnimating) return;
    this._isAnimating = true;
    if (this.opt.loop) {
        this.currentIndex =
            (this.currentIndex + step + this.sliders.length) %
            this.sliders.length;

        this.track.ontransitionend = () => {
            const maxIndex = this.sliders.length - this.opt.items;
            if (this.currentIndex <= 0) {
                this.currentIndex = maxIndex - this.opt.items;
            } else if (this.currentIndex >= maxIndex) {
                this.currentIndex = this.opt.items;
            }
            this._updatePosition(true);
            this._isAnimating = false;
        };
    } else {
        this.currentIndex = Math.min(
            Math.max(this.currentIndex + step, 0),
            this.sliders.length - this.opt.items
        );
    }

    this._updatePosition();
};

Flide.prototype._updatePosition = function (instant = false) {
    this.track.style.transition = instant ? "none" : "transform .3s ease";
    this.offset = -(this.currentIndex * (100 / this.opt.items));
    this.track.style.transform = `translateX(${this.offset}%)`;
};
