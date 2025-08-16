function Flide(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error(`Flide: can not found container '${selector}'`);
        return;
    }

    this.opt = Object.assign({}, options);

    this.sliders = Array.from(this.container.children);

    this._init();
}

Flide.prototype._init = function () {
    this.container.classList.add("flide-wrapper");
    this._createTrack();
    this._createNavigation();
};

Flide.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("flide-track");
    this.sliders.map((slider) => {
        slider.classList.add("flide-slide");
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
    console.log(step);
};
