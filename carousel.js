/**
 * =========================================================================
 * КАРУСЕЛЬ-ПЛАГИН (carousel.js) - АВТОНОМНЫЙ ДВИЖОК
 * =========================================================================
 * 
 * Это чистый плагин для каруселей, который можно подключать к любым блокам.
 * Не содержит хардкода конкретных селекторов сайта или файлов базы данных.
 * Все настройки передаются через Объект Конфигурации (API).
 */
class Carousel {
    constructor(options = {}) {
        this.options = Object.assign({
            container: null,
            trackSelector: '.carousel-track',
            slideSelector: '.carousel-slide',
            prevBtn: null,
            nextBtn: null,
            dotsSelector: null,
            
            // Настройки анимации и таймингов
            speed: 800,                   // Скорость анимации в мс
            interval: 3000,               // Интервал автопрокрутки в мс
            slidesToScroll: 1,            // Шаг перелистывания (по сколько слайдов)
            itemsPerSlide: 2,             // Картинки в одном слайде (при генерации)
            
            // Режимы
            autoplay: true,
            infinite: true,
            pauseOnHover: true,
            timingFunction: 'cubic-bezier(0.25, 1, 0.4, 1)',
            
            // Загрузка данных
            dataSource: null,
            
            // Адаптивность
            responsive: []
        }, options);

        this.container = typeof this.options.container === 'string'
            ? document.querySelector(this.options.container)
            : this.options.container;

        if (!this.container) {
            console.warn(`Carousel Plugin: Контейнер "${this.options.container}" не найден.`);
            return;
        }

        this.track = this.container.querySelector(this.options.trackSelector);
        if (!this.track) {
            // Если трека нет, создаем его автоматически
            this.track = document.createElement('div');
            this.track.className = this.options.trackSelector.replace('.', '');
            this.container.appendChild(this.track);
        }

        this.prevBtn = typeof this.options.prevBtn === 'string'
            ? document.querySelector(this.options.prevBtn)
            : (this.options.prevBtn || this.container.querySelector('.prev'));

        this.nextBtn = typeof this.options.nextBtn === 'string'
            ? document.querySelector(this.options.nextBtn)
            : (this.options.nextBtn || this.container.querySelector('.next'));

        this.dots = this.options.dotsSelector
            ? Array.from(document.querySelectorAll(this.options.dotsSelector))
            : Array.from(this.container.querySelectorAll('.carousel-dot'));

        this.timer = null;
        this.isTransitioning = false;

        // Применяем адаптивные настройки при необходимости
        this.applyResponsiveSettings();

        // Запуск инициализации (с поддержкой async загрузки данных)
        this.initAsync();
    }

    applyResponsiveSettings() {
        if (!Array.isArray(this.options.responsive) || this.options.responsive.length === 0) return;
        const windowWidth = window.innerWidth;

        // Сортируем брейкпоинты по возрастанию
        const sortedBreakpoints = [...this.options.responsive].sort((a, b) => a.breakpoint - b.breakpoint);
        
        for (const res of sortedBreakpoints) {
            if (windowWidth <= res.breakpoint && res.settings) {
                Object.assign(this.options, res.settings);
                break;
            }
        }
    }

    async initAsync() {
        // Если указан источник данных (JSON file URL)
        if (this.options.dataSource) {
            await this.loadDataAndBuildSlides(this.options.dataSource);
        }

        this.originalSlides = Array.from(this.track.querySelectorAll(this.options.slideSelector));
        this.realCount = this.originalSlides.length;

        if (this.realCount === 0) {
            console.warn('Carousel Plugin: Слайды не найдены.');
            return;
        }

        // Настройка клонирования для бесшовного бесконечного цикла
        if (this.options.infinite && this.realCount > 1) {
            this.setupClones();
            this.trackIndex = 1;
        } else {
            this.trackIndex = 0;
        }

        this.setTrackPosition(false);
        this.bindEvents();

        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }

    async loadDataAndBuildSlides(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) return;

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return;

            this.track.innerHTML = '';
            const itemsPerSlide = this.options.itemsPerSlide || 1;

            for (let i = 0; i < data.length; i += itemsPerSlide) {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');

                let html = '';
                for (let j = 0; j < itemsPerSlide; j++) {
                    const item = data[i + j];
                    if (item) {
                        const imgSrc = (item.img && Array.isArray(item.img)) ? item.img[0] : (item.src || item.image || '');
                        const altText = item.name || item.title || 'Slide Image';
                        if (imgSrc) {
                            html += `<img src="${imgSrc}" alt="${altText}">`;
                        }
                    }
                }

                slide.innerHTML = html;
                this.track.appendChild(slide);
            }
        } catch (err) {
            console.log('Carousel Plugin: Ошибка загрузки JSON, используются стандартные слайды из HTML');
        }
    }

    setupClones() {
        const existingClones = this.track.querySelectorAll('.carousel-clone');
        existingClones.forEach(c => c.remove());

        const firstClone = this.originalSlides[0].cloneNode(true);
        firstClone.classList.add('carousel-clone');

        const lastClone = this.originalSlides[this.realCount - 1].cloneNode(true);
        lastClone.classList.add('carousel-clone');

        this.track.appendChild(firstClone);
        this.track.insertBefore(lastClone, this.originalSlides[0]);
    }

    getRealIndex() {
        if (!this.options.infinite || this.realCount <= 1) return this.trackIndex;
        if (this.trackIndex === 0) return this.realCount - 1;
        if (this.trackIndex === this.realCount + 1) return 0;
        return this.trackIndex - 1;
    }

    setTrackPosition(animated = true) {
        if (animated) {
            this.isTransitioning = true;
            this.track.style.transition = `transform ${this.options.speed}ms ${this.options.timingFunction}`;
        } else {
            this.track.style.transition = 'none';
        }

        const percentage = this.trackIndex * 100;
        this.track.style.transform = `translateX(-${percentage}%)`;

        const realIdx = this.getRealIndex();
        if (this.dots.length > 0) {
            this.dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === realIdx);
            });
        }
    }

    next() {
        if (this.isTransitioning) return;
        this.trackIndex += (this.options.slidesToScroll || 1);
        this.setTrackPosition(true);
    }

    prev() {
        if (this.isTransitioning) return;
        this.trackIndex -= (this.options.slidesToScroll || 1);
        this.setTrackPosition(true);
    }

    handleTransitionEnd() {
        this.isTransitioning = false;
        if (!this.options.infinite || this.realCount <= 1) return;

        if (this.trackIndex >= this.realCount + 1) {
            this.trackIndex = 1;
            this.setTrackPosition(false);
        } else if (this.trackIndex <= 0) {
            this.trackIndex = this.realCount;
            this.setTrackPosition(false);
        }
    }

    bindEvents() {
        this.track.addEventListener('transitionend', (e) => {
            if (e.target === this.track) {
                this.handleTransitionEnd();
            }
        });

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.next();
                this.resetAutoplay();
            });
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prev();
                this.resetAutoplay();
            });
        }

        if (this.dots.length > 0) {
            this.dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    if (this.isTransitioning) return;
                    this.trackIndex = (this.options.infinite && this.realCount > 1) ? idx + 1 : idx;
                    this.setTrackPosition(true);
                    this.resetAutoplay();
                });
            });
        }

        if (this.options.pauseOnHover && this.container) {
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.resetAutoplay());
        }

        // Поддержка Touch-свайпов на мобильных устройствах
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isSwiping = false;

        this.track.addEventListener('touchstart', (e) => {
            if (this.isTransitioning) return;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchEndX = this.touchStartX;
            this.touchEndY = this.touchStartY;
            this.isSwiping = true;
            this.stopAutoplay();
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!this.isSwiping) return;
            this.touchEndX = e.touches[0].clientX;
            this.touchEndY = e.touches[0].clientY;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            if (!this.isSwiping) return;
            this.isSwiping = false;
            const diffX = this.touchStartX - this.touchEndX;
            const diffY = Math.abs(this.touchStartY - this.touchEndY);

            // Порог свайпа 40px с проверкой, что свайп горизонтальный, а не вертикальный скролл
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
                if (diffX > 0) {
                    this.next(); // Свайп влево -> следующий слайд
                } else {
                    this.prev(); // Свайп вправо -> предыдущий слайд
                }
            }
            this.resetAutoplay();
        });

        // Адаптивность при изменении размера окна
        window.addEventListener('resize', () => {
            this.applyResponsiveSettings();
        });
    }

    startAutoplay() {
        this.stopAutoplay();
        this.timer = setInterval(() => {
            this.next();
        }, this.options.interval);
    }

    stopAutoplay() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetAutoplay() {
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }
}

// Экспортируем класс глобально в окно
window.Carousel = Carousel;
