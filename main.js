'use strict';

(() => {
    let items = document.querySelectorAll('.item');
    let drop = document.querySelector('.drop');
    let isResize = false;
    /*----------  ----------*/

    function addItem(e) {
        const { type } = e.dataset;
        const { innerText, localName, src } = e;
        const container = document.createElement('div');
        const el = document.createElement(localName);

        if (type === 'style_1_item') {
            el.innerHTML = `<div class="editor" contenteditable="true">${innerText}</div>`;
        }

        if (type === 'style_2_item') {
            el.src = src;
        }

        /********** add style **********/
        container.classList.add(type, 'item_drop');
        container.innerHTML = `
        <div class="resize">
        </div>
        <div class="close">
        X
        </div>
        <svg 
        class="resize-button" 
        height="10" width="10"></svg>
        `;
        el.classList.add(type, 'item_main_drop');
        container.style.top = 0;
        container.style.let = 0;
        container.appendChild(el);
        drop.appendChild(container);
    }

    function handler() {
        items.forEach((el) =>
            el.addEventListener('click', function () {
                addItem(el);
                getItemDrop();
            })
        );
    }

    function getItemDrop() {
        const dropItems = document.querySelectorAll('.item_drop');
        dropItems.forEach((el) => {
            el.addEventListener('click', function (e) {
                if (e.target.matches('.close')) {
                    drop.removeChild(el);
                }
            });

            el.addEventListener('mousedown', function (e) {
                el.style.zIndex = '10';

                const maxX = drop.offsetWidth;
                const maxY = drop.offsetHeight;

                let resizeTarget;

                let left = el.offsetLeft;
                let top = el.offsetTop;
                /*---------- Vị trí hiện tại của con trỏ ----------*/
                let mouseX = e.clientX;
                let mouseY = e.clientY;

                if (e.target.matches('.resize-button')) {
                    isResize = true;
                    resizeTarget = e.target;
                } else {
                    isResize = false;
                    resizeTarget = null;
                }

                document.onmousemove = function (e) {
                    if (!isResize) {
                        /*---------- chiều rộng và chiều cao phần tử ----------*/
                        const { offsetHeight, offsetWidth } = el;

                        /*---------- Vị trí phần tử ----------*/
                        const dx = mouseX - e.clientX;
                        const dy = mouseY - e.clientY;
                        const px = left - dx;
                        const py = top - dy;

                        /********** Cập nhật style item **********/
                        /*===========> Trục X <==========*/
                        if (maxX - offsetWidth >= px && px >= 0) {
                            /*---------- Trong khoảng cho phép ----------*/
                            el.style.left = px + 'px';
                        } else {
                            if (px >= maxX - offsetWidth) {
                                /*---------- Khi lớn hơn chiều rộng vùng chứa ----------*/
                                el.style.left = maxX - offsetWidth + 'px';
                            } else {
                                /*---------- Khi nhỏ hơn chiều rộng vùng chứa ----------*/
                                el.style.left = 0 + 'px';
                            }
                        }

                        /*===========> Trục Y <==========*/
                        if (maxY - offsetHeight >= py && py >= 0) {
                            /*---------- Trong khoảng cho phép ----------*/
                            el.style.top = py + 'px';
                        } else {
                            if (py >= maxY - offsetHeight) {
                                /*---------- Khi lớn hơn chiều rộng vùng chứa ----------*/
                                el.style.top = maxY - offsetHeight + 'px';
                            } else {
                                /*---------- Khi nhỏ hơn chiều rộng vùng chứa ----------*/
                                el.style.top = 0 + 'px';
                            }
                        }
                    } else {
                        el.classList.add('show');
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = parseInt(
                            document.defaultView.getComputedStyle(el).width,
                            10
                        );
                        const startHeight = parseInt(
                            document.defaultView.getComputedStyle(el).height,
                            10
                        );
                        document.onmousemove = (e) => {
                            doDrag(
                                e,
                                { width: startWidth, height: startHeight },
                                { x: startX, y: startY }
                            );
                        };
                    }
                };

                /*---------- Hủy event ----------*/
                document.addEventListener('mouseup', function () {
                    el.style.zIndex = '0';
                    document.onmousemove = null;
                    if (el.matches('.show')) {
                        el.classList.remove('show');
                    }
                });
            });

            function doDrag(e, startSize, start) {
                el.style.width = startSize.width + e.clientX - start.x + 'px';
                el.style.height = startSize.height + e.clientY - start.y + 'px';
            }
        });
    }

    function start() {
        getItemDrop();
        handler();
    }
    start();
})();
